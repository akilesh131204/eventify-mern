const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Create event (organizer)
// @route   POST /api/events
// @access  Private/Organizer
const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, organizer: req.user._id, status: 'pending' });
  res.status(201).json({ success: true, data: event });
});

// @desc    Get all events with search/filter/pagination
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    city,
    minPrice,
    maxPrice,
    startDate,
    endDate,
    page = 1,
    limit = 12,
    sort = '-createdAt',
  } = req.query;

  const query = { status: 'approved' };

  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  let events = await Event.find(query)
    .populate('organizer', 'name organizationName')
    .sort(sort)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  if (minPrice || maxPrice) {
    events = events.filter((e) => {
      const min = e.minPrice;
      if (minPrice && min < Number(minPrice)) return false;
      if (maxPrice && min > Number(maxPrice)) return false;
      return true;
    });
  }

  const total = await Event.countDocuments(query);

  res.json({
    success: true,
    count: events.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: events,
  });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name organizationName email');
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  event.views += 1;
  await event.save();
  res.json({ success: true, data: event });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Organizer (owner) or Admin
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this event');
  }

  Object.assign(event, req.body);
  // re-submit for approval if organizer edits core details after rejection
  if (req.user.role !== 'admin' && event.status === 'rejected') event.status = 'pending';

  const updated = await event.save();
  // If event is being cancelled, notify all attendees
if (req.body.status === 'cancelled') {
  const { sendEmail } = require('../utils/sendEmail');
  const registrations = await Registration.find({
    event: event._id,
    paymentStatus: 'paid',
    status: 'confirmed'
  });
  registrations.forEach(reg => {
    sendEmail({
      to: reg.attendeeDetails.email,
      subject: `Event Cancelled: ${event.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <div style="background:#dc2626;padding:20px;border-radius:12px 12px 0 0;">
            <h2 style="color:white;margin:0;">⚠️ Event Cancelled</h2>
          </div>
          <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
            <p>Hi ${reg.attendeeDetails.name},</p>
            <p>We regret to inform you that <strong>${event.title}</strong> has been cancelled by the organizer.</p>
            <p>Your ticket <strong style="color:#4f46e5;font-family:monospace;">${reg.ticketCode}</strong> has been invalidated.</p>
            <p>A refund will be processed within 5-7 business days.</p>
          </div>
        </div>
      `,
    }).catch(() => {});
  });
}
  res.json({ success: true, data: updated });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Organizer (owner) or Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this event');
  }
  await event.deleteOne();
  res.json({ success: true, message: 'Event deleted successfully' });
});

// @desc    Get events created by logged-in organizer
// @route   GET /api/events/organizer/mine
// @access  Private/Organizer
const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).sort('-createdAt');
  res.json({ success: true, count: events.length, data: events });
});

// @desc    Update event schedule (sessions)
// @route   PUT /api/events/:id/schedule
// @access  Private/Organizer (owner)
const updateSchedule = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  event.sessions = req.body.sessions || event.sessions;
  await event.save();

  // Notify all registered attendees about schedule change
  const registrations = await Registration.find({
    event: event._id,
    paymentStatus: 'paid',
    status: 'confirmed',
  });

  const { sendEmail } = require('../utils/sendEmail');

  registrations.forEach((reg) => {
    sendEmail({
      to: reg.attendeeDetails.email,
      subject: `Schedule Updated: ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color:#4f46e5;">📅 Event Schedule Updated</h2>
          <p>Hi ${reg.attendeeDetails.name},</p>
          <p>The schedule for <strong>${event.title}</strong> has been updated by the organizer.</p>
          <p>Please visit the event page to see the latest schedule.</p>
          <p>Your ticket code: <strong>${reg.ticketCode}</strong></p>
          <p>Thank you for registering!</p>
        </div>
      `,
    }).catch(() => {});
  });

  res.json({
    success: true,
    data: event,
    message: `Schedule updated. ${registrations.length} attendees notified.`,
  });
});

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  updateSchedule,
};
