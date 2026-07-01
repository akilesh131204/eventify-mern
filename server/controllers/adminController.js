const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');

// @desc    Get platform-wide stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalOrganizers = await User.countDocuments({ role: 'organizer' });
  const totalEvents = await Event.countDocuments();
  const pendingEvents = await Event.countDocuments({ status: 'pending' });
  const approvedEvents = await Event.countDocuments({ status: 'approved' });

  const revenueAgg = await Payment.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const totalRegistrations = await Registration.countDocuments({ paymentStatus: 'paid' });

  res.json({
    success: true,
    data: {
      totalUsers,
      totalOrganizers,
      totalEvents,
      pendingEvents,
      approvedEvents,
      totalRevenue: revenueAgg[0]?.total || 0,
      totalRegistrations,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json({ success: true, count: users.length, data: users });
});

// @desc    Block/unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true, data: user, message: user.isBlocked ? 'User blocked' : 'User unblocked' });
});

// @desc    Get all events (any status) for moderation
// @route   GET /api/admin/events
// @access  Private/Admin
const getAllEventsAdmin = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const events = await Event.find(query).populate('organizer', 'name email organizationName').sort('-createdAt');
  res.json({ success: true, count: events.length, data: events });
});

// @desc    Approve an event
// @route   PUT /api/admin/events/:id/approve
// @access  Private/Admin
const approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  event.status = 'approved';
  await event.save();
  res.json({ success: true, data: event, message: 'Event approved' });
});

// @desc    Reject an event
// @route   PUT /api/admin/events/:id/reject
// @access  Private/Admin
const rejectEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  event.status = 'rejected';
  await event.save();
  res.json({ success: true, data: event, message: 'Event rejected' });
});

// @desc    Get all payment transactions
// @route   GET /api/admin/payments
// @access  Private/Admin
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().populate('user', 'name email').populate('event', 'title').sort('-createdAt');
  res.json({ success: true, count: payments.length, data: payments });
});

module.exports = {
  getPlatformStats,
  getAllUsers,
  toggleBlockUser,
  getAllEventsAdmin,
  approveEvent,
  rejectEvent,
  getAllPayments,
};
