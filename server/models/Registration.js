const mongoose = require('mongoose');
const crypto = require('crypto');

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticketTypeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    ticketTypeName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    pricePerTicket: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    attendeeDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    ticketCode: { type: String, unique: true },
    qrCode: { type: String, default: '' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'transferred', 'checked-in'],
      default: 'confirmed',
    },
    checkedInAt: { type: Date },
    transferredTo: {
      name: String,
      email: String,
    },
  },
  { timestamps: true }
);

registrationSchema.pre('save', function (next) {
  if (!this.ticketCode) {
    this.ticketCode = 'TKT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Registration', registrationSchema);
