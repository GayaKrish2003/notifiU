const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} = require('../controllers/notificationsController');

const router = express.Router();

router.get('/notifications', protect, getNotifications);
router.patch('/notifications/read-all', protect, markAllNotificationsRead);
router.patch('/notifications/:id/read', protect, markNotificationRead);

module.exports = router;