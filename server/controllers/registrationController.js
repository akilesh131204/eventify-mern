const asyncHandler = require('express-async-handler');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { Parser } = require('json2csv');

// @desc    Get logged-in user's registrations
// @route   GET /api/registrations/mine
// @access  Private
const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ attendee: req.user._id })
    .populate('event', 'title date time location coverImage status')
    .sort('-createdAt');
  res.json({ success: true, count: registrations.length, data: registrations });
});

// @desc    Get single registration
// @route   GET /api/registrations/:id
// @access  Private
const getRegistrationById = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id).populate('event');
  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }
  if (
    registration.attendee.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin' &&
    registration.event.organizer.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to view this registration');
  }
  res.json({ success: true, data: registration });
});

// @desc    Cancel a registration
// @route   PUT /api/registrations/:id/cancel
// @access  Private
const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }
  if (registration.attendee.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  registration.status = 'cancelled';
  registration.paymentStatus = 'refunded';
  await registration.save();

  // Send cancellation email
  const { sendEmail } = require('../utils/sendEmail');
  const event = await Event.findById(registration.event);
  sendEmail({
    to: registration.attendeeDetails.email,
    subject: `Registration Cancelled - ${event?.title}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <div style="background:#dc2626;padding:20px;border-radius:12px 12px 0 0;">
          <h2 style="color:white;margin:0;">❌ Registration Cancelled</h2>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
          <p>Hi ${registration.attendeeDetails.name},</p>
          <p>Your registration for <strong>${event?.title}</strong> has been cancelled.</p>
          <p>Ticket Code: <strong style="color:#4f46e5;font-family:monospace;">${registration.ticketCode}</strong></p>
          <p>If you paid for this ticket, a refund will be processed within 5-7 business days.</p>
          <p style="color:#64748b;font-size:14px;">If you have questions, contact our support team.</p>
        </div>
      </div>
    `,
  }).catch(() => {});

  const ticketType = event.ticketTypes.id(registration.ticketTypeId);
  if (ticketType) {
    ticketType.sold = Math.max(0, ticketType.sold - registration.quantity);
    await event.save();
  }

  res.json({ success: true, data: registration, message: 'Registration cancelled' });
});

// @desc    Transfer a ticket to another attendee
// @route   PUT /api/registrations/:id/transfer
// @access  Private
const transferRegistration = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const registration = await Registration.findById(req.params.id);
  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }
  if (registration.attendee.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  registration.status = 'transferred';
  registration.transferredTo = { name, email };
  await registration.save();
  res.json({ success: true, data: registration, message: 'Ticket transferred successfully' });
});

// @desc    Get attendee list for an event (organizer)
// @route   GET /api/registrations/event/:eventId
// @access  Private/Organizer
const getEventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  const registrations = await Registration.find({ event: req.params.eventId }).sort('-createdAt');
  res.json({ success: true, count: registrations.length, data: registrations });
});

// @desc    Export attendee list as CSV
// @route   GET /api/registrations/event/:eventId/export
// @access  Private/Organizer
const exportEventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  const registrations = await Registration.find({ event: req.params.eventId }).lean();

  const rows = registrations.map((r) => ({
    name: r.attendeeDetails.name,
    email: r.attendeeDetails.email,
    phone: r.attendeeDetails.phone,
    ticketType: r.ticketTypeName,
    quantity: r.quantity,
    amount: r.totalAmount,
    status: r.status,
    paymentStatus: r.paymentStatus,
    ticketCode: r.ticketCode,
    registeredAt: r.createdAt,
  }));

  const parser = new Parser();
  const csv = parser.parse(rows);

  res.header('Content-Type', 'text/csv');
  res.attachment(`attendees-${event.title.replace(/\s+/g, '-')}.csv`);
  res.send(csv);
});

// @desc    Check-in an attendee via ticket code
// @route   PUT /api/registrations/checkin/:ticketCode
// @access  Private/Organizer
const checkInAttendee = asyncHandler(async (req, res) => {
  const registration = await Registration.findOne({ ticketCode: req.params.ticketCode }).populate('event');
  if (!registration) {
    res.status(404);
    throw new Error('Invalid ticket code');
  }
  if (registration.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (registration.status === 'checked-in') {
    res.status(400);
    throw new Error('Ticket already checked in');
  }
  registration.status = 'checked-in';
  registration.checkedInAt = new Date();
  await registration.save();
  res.json({ success: true, data: registration, message: 'Attendee checked in' });
});

module.exports = {
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration,
  transferRegistration,
  getEventRegistrations,
  exportEventRegistrations,
  checkInAttendee,
};