const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { sendEmail, ticketConfirmationTemplate } = require('../utils/sendEmail');

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { eventId, ticketTypeId, quantity } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const ticketType = event.ticketTypes.id(ticketTypeId);
  if (!ticketType) {
    res.status(404);
    throw new Error('Ticket type not found');
  }

  const available = ticketType.quantity - ticketType.sold;
  if (available < quantity) {
    res.status(400);
    throw new Error(`Only ${available} tickets left for ${ticketType.name}`);
  }

  const amount = ticketType.price * quantity * 100; // paise

  const options = {
    amount,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

const order = await razorpayInstance.orders.create(options);

  const payment = await Payment.create({
    user: req.user._id,
    event: eventId,
    razorpayOrderId: order.id,
    amount: amount / 100,
    status: 'created',
  });

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentDbId: payment._id,
    },
  });
});

// @desc    Verify payment and create registration
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    eventId,
    ticketTypeId,
    quantity,
    attendeeDetails,
  } = req.body;

  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest('hex');

  if (expectedSign !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed: invalid signature');
  }

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = 'paid';
  await payment.save();

  const event = await Event.findById(eventId);
  const ticketType = event.ticketTypes.id(ticketTypeId);
  ticketType.sold += Number(quantity);
  await event.save();

  const registration = await Registration.create({
    event: eventId,
    attendee: req.user._id,
    ticketTypeId,
    ticketTypeName: ticketType.name,
    quantity,
    pricePerTicket: ticketType.price,
    totalAmount: ticketType.price * quantity,
    attendeeDetails,
    paymentStatus: 'paid',
    payment: payment._id,
  });

  // Fire-and-forget confirmation email
  sendEmail({
    to: attendeeDetails.email,
    subject: `Ticket Confirmed: ${event.title}`,
    html: ticketConfirmationTemplate(registration, event),
  }).catch(() => {});

  res.status(201).json({ success: true, data: registration, message: 'Payment verified and ticket booked' });
});

module.exports = { createOrder, verifyPayment };
