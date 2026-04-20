const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['announcement'],
            default: 'announcement',
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        announcementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Announcement',
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        targetRoles: {
            type: [String],
            enum: ['superadmin', 'student', 'lecturer', 'jobprovider', 'clubpresident'],
            default: ['superadmin', 'student', 'lecturer', 'jobprovider', 'clubpresident'],
        },
        readBy: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({ targetRoles: 1, createdAt: -1 });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);