const express = require('express');
const router = express.Router();
const {
  getPlatformStats, getAllUsers, toggleBlockUser, deleteUser, changeUserRole,
  getAllEventsAdmin, approveEvent, rejectEvent, getAllPayments,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', changeUserRole);
router.get('/events', getAllEventsAdmin);
router.put('/events/:id/approve', approveEvent);
router.put('/events/:id/reject', rejectEvent);
router.get('/payments', getAllPayments);

module.exports = router;
