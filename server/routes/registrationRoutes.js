const express = require('express');
const router = express.Router();
const {
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration,
  transferRegistration,
  getEventRegistrations,
  exportEventRegistrations,
  checkInAttendee,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/mine', protect, getMyRegistrations);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventRegistrations);
router.get('/event/:eventId/export', protect, authorize('organizer', 'admin'), exportEventRegistrations);
router.put('/checkin/:ticketCode', protect, authorize('organizer', 'admin'), checkInAttendee);
router.get('/:id', protect, getRegistrationById);
router.put('/:id/cancel', protect, cancelRegistration);
router.put('/:id/transfer', protect, transferRegistration);

module.exports = router;
