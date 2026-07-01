const express = require('express');
const router = express.Router();
const { getEventAnalytics, getOrganizerOverview } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/organizer/overview', protect, authorize('organizer', 'admin'), getOrganizerOverview);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventAnalytics);

module.exports = router;
