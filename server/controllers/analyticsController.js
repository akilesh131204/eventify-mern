const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get analytics for a specific event
// @route   GET /api/analytics/event/:eventId
// @access  Private/Organizer
const getEventAnalytics = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const eventId = new mongoose.Types.ObjectId(req.params.eventId);

  const totalRevenue = await Registration.aggregate([
    { $match: { event: eventId, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  const salesByTicketType = await Registration.aggregate([
    { $match: { event: eventId, paymentStatus: 'paid' } },
    { $group: { _id: '$ticketTypeName', quantity: { $sum: '$quantity' }, revenue: { $sum: '$totalAmount' } } },
  ]);

  const salesOverTime = await Registration.aggregate([
    { $match: { event: eventId, paymentStatus: 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: '$quantity' },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalTicketsSold = event.ticketTypes.reduce((sum, t) => sum + t.sold, 0);
  const totalCapacity = event.ticketTypes.reduce((sum, t) => sum + t.quantity, 0);
  const checkInCount = await Registration.countDocuments({ event: eventId, status: 'checked-in' });
  const cancelledCount = await Registration.countDocuments({ event: eventId, status: 'cancelled' });

  res.json({
    success: true,
    data: {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalTicketsSold,
      totalCapacity,
      attendanceRate: totalTicketsSold > 0 ? ((checkInCount / totalTicketsSold) * 100).toFixed(1) : 0,
      checkInCount,
      cancelledCount,
      views: event.views,
      salesByTicketType,
      salesOverTime,
    },
  });
});

// @desc    Get organizer-wide overview analytics (all events)
// @route   GET /api/analytics/organizer/overview
// @access  Private/Organizer
const getOrganizerOverview = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id });
  const eventIds = events.map((e) => e._id);

  const revenueAgg = await Registration.aggregate([
    { $match: { event: { $in: eventIds }, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  const ticketsSold = events.reduce((sum, e) => sum + e.ticketTypes.reduce((s, t) => s + t.sold, 0), 0);

  const revenueByEvent = await Registration.aggregate([
    { $match: { event: { $in: eventIds }, paymentStatus: 'paid' } },
    { $group: { _id: '$event', revenue: { $sum: '$totalAmount' }, tickets: { $sum: '$quantity' } } },
    { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'eventInfo' } },
    { $unwind: '$eventInfo' },
    { $project: { title: '$eventInfo.title', revenue: 1, tickets: 1 } },
    { $sort: { revenue: -1 } },
  ]);

  res.json({
    success: true,
    data: {
      totalEvents: events.length,
      totalRevenue: revenueAgg[0]?.total || 0,
      totalTicketsSold: ticketsSold,
      revenueByEvent,
    },
  });
});

module.exports = { getEventAnalytics, getOrganizerOverview };
