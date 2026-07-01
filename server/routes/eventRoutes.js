const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  updateSchedule,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');

router.get('/', getEvents);
router.get('/organizer/mine', protect, authorize('organizer', 'admin'), getMyEvents);
router.get('/:id', getEventById);

router.post(
  '/',
  protect,
  authorize('organizer', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('location.venue').notEmpty().withMessage('Venue is required'),
    body('location.city').notEmpty().withMessage('City is required'),
    body('ticketTypes').isArray({ min: 1 }).withMessage('At least one ticket type is required'),
  ],
  validateRequest,
  createEvent
);

router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);
router.put('/:id/schedule', protect, authorize('organizer', 'admin'), updateSchedule);

module.exports = router;
