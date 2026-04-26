const mongoose = require('mongoose');
const Notification = require('../models/Notification');

const announcementTargetRoles = ['superadmin', 'student', 'lecturer', 'jobprovider', 'clubpresident'];

const buildAnnouncementNotification = async ({ announcement, createdBy }) => {
    if (!announcement || announcement.status !== 'published') {
        return null;
    }

    return Notification.create({
        type: 'announcement',
        title: announcement.title,
        message: announcement.content,
        announcementId: announcement._id,
        createdBy: createdBy || null,
        targetRoles: announcementTargetRoles,
    });
};

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            targetRoles: req.user.role,
        })
            .populate('announcementId', 'title content status priority publish_date attachments')
            .sort({ createdAt: -1 })
            .limit(20);

        const currentUserId = String(req.user._id);
        const payload = notifications.map((notification) => {
            const readBy = Array.isArray(notification.readBy) ? notification.readBy.map(String) : [];

            return {
                _id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                createdAt: notification.createdAt,
                isRead: readBy.includes(currentUserId),
                announcement: notification.announcementId,
            };
        });

        res.status(200).json(payload);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid notification id' });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, targetRoles: req.user.role },
            { $addToSet: { readBy: req.user._id } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

const markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { targetRoles: req.user.role },
            { $addToSet: { readBy: req.user._id } }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
};

module.exports = {
    buildAnnouncementNotification,
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
};