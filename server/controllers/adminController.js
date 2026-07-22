const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');

const getPlatformStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalOrganizers = await User.countDocuments({ role: 'organizer' });
  const totalEvents = await Event.countDocuments();
  const pendingEvents = await Event.countDocuments({ status: 'pending' });
  const approvedEvents = await Event.countDocuments({ status: 'approved' });
  const revenueAgg = await Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
  const totalRegistrations = await Registration.countDocuments({ paymentStatus: 'paid' });

  res.json({ success: true, data: { totalUsers, totalOrganizers, totalEvents, pendingEvents, approvedEvents, totalRevenue: revenueAgg[0]?.total || 0, totalRegistrations } });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json({ success: true, count: users.length, data: users });
});

const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true, data: user, message: user.isBlocked ? 'User blocked' : 'User unblocked' });
});

// NEW: Delete user
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(400); throw new Error('Cannot delete admin user'); }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted successfully' });
});

// NEW: Change user role
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['attendee', 'organizer'].includes(role)) { res.status(400); throw new Error('Invalid role'); }
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(400); throw new Error('Cannot change admin role'); }
  user.role = role;
  await user.save();
  res.json({ success: true, data: user, message: `Role changed to ${role}` });
});

const getAllEventsAdmin = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const events = await Event.find(query).populate('organizer', 'name email organizationName').sort('-createdAt');
  res.json({ success: true, count: events.length, data: events });
});

const approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email');
  if (!event) { res.status(404); throw new Error('Event not found'); }
  event.status = 'approved';
  await event.save();

  // Send approval email to organizer
  const { sendEmail } = require('../utils/sendEmail');
  sendEmail({
    to: event.organizer.email,
    subject: `🎉 Your event "${event.title}" has been approved!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <div style="background:#16a34a;padding:20px;border-radius:12px 12px 0 0;">
          <h2 style="color:white;margin:0;">✅ Event Approved!</h2>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
          <p>Hi ${event.organizer.name},</p>
          <p>Great news! Your event <strong style="color:#4f46e5;">"${event.title}"</strong> has been approved and is now live on Eventify!</p>
          <p>Attendees can now discover and book tickets for your event.</p>
          <p style="color:#64748b;font-size:14px;">Login to your organizer dashboard to manage attendees and view analytics.</p>
        </div>
      </div>
    `,
  }).catch(() => {});

  res.json({ success: true, data: event, message: 'Event approved and organizer notified' });
});

const rejectEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email');
  if (!event) { res.status(404); throw new Error('Event not found'); }
  event.status = 'rejected';
  await event.save();

  // Send rejection email
  const { sendEmail } = require('../utils/sendEmail');
  sendEmail({
    to: event.organizer.email,
    subject: `Event "${event.title}" - Review Required`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <div style="background:#dc2626;padding:20px;border-radius:12px 12px 0 0;">
          <h2 style="color:white;margin:0;">⚠️ Event Needs Review</h2>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
          <p>Hi ${event.organizer.name},</p>
          <p>Your event <strong>"${event.title}"</strong> requires some changes before it can be published.</p>
          <p>Please login to your dashboard, edit your event with the required improvements, and resubmit for approval.</p>
          <p style="color:#64748b;font-size:14px;">If you have questions, please contact our support team.</p>
        </div>
      </div>
    `,
  }).catch(() => {});

  res.json({ success: true, data: event, message: 'Event rejected and organizer notified' });
});

const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().populate('user', 'name email').populate('event', 'title').sort('-createdAt');
  res.json({ success: true, count: payments.length, data: payments });
});

module.exports = {
  getPlatformStats, getAllUsers, toggleBlockUser, deleteUser, changeUserRole,
  getAllEventsAdmin, approveEvent, rejectEvent, getAllPayments,
};
