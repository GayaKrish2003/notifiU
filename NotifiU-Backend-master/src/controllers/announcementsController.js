const crypto = require('crypto');
const path = require('path');
const Announcement = require('../models/announcement');
const { buildAnnouncementNotification } = require('./notificationsController');
const { deleteObjectFromR2, uploadBufferToR2 } = require('../utils/r2Storage');

const buildAnnouncementAttachmentKey = (announcementId, originalName) => {
    const extension = path.extname(originalName || '');
    return `announcements/${announcementId}/${Date.now()}-${crypto.randomUUID()}${extension}`;
};

const deleteAnnouncementFilesFromR2 = async (attachments = []) => {
    for (const attachment of attachments) {
        if (!attachment?.storage_key) {
            continue;
        }

        await deleteObjectFromR2(attachment.storage_key);
    }
};

function getAnnouncements(req, res) {
    try {
        const { module_id, status, priority } = req.query;
        const filter = {};
        if (module_id) filter.module_id = module_id;
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        Announcement.find(filter)
            .sort({ publish_date: -1 })
            .then(announcements => res.status(200).json(announcements))
            .catch(err => res.status(500).json({ error: 'Failed to fetch announcements' }));
    } catch (err) {
        console.error('Error fetching announcements:', err);
        res.status(500).json({ error: 'An error occurred while fetching announcements' });
    }
}

async function getAnnouncementById(req, res) {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }
        res.status(200).json(announcement);
    } catch (err) {
        console.error('Error fetching announcement by ID:', err);
        res.status(500).json({ error: 'An error occurred while fetching the announcement' });
    }
}

async function createAnnouncement(req, res) {
    try {
        const { title, content, priority, publish_date, expiry_date, module_id, status } = req.body;

        const newAnnouncement = new Announcement({
            title,
            content,
            priority,
            publish_date,
            expiry_date,
            module_id,
            status,
            attachments: [],
        });

        const uploadedAttachments = [];

        try {
            for (const file of req.files || []) {
                const storageKey = buildAnnouncementAttachmentKey(newAnnouncement._id, file.originalname);
                const fileUrl = await uploadBufferToR2({
                    key: storageKey,
                    buffer: file.buffer,
                    contentType: file.mimetype,
                });

                uploadedAttachments.push({
                    storage_key: storageKey,
                    file_path: fileUrl,
                    file_url: fileUrl,
                    original_name: file.originalname,
                    mime_type: file.mimetype,
                    size_bytes: file.size,
                });
            }
        } catch (uploadError) {
            await deleteAnnouncementFilesFromR2(uploadedAttachments);
            throw uploadError;
        }

        newAnnouncement.attachments = uploadedAttachments;

        let savedAnnouncement;
        try {
            savedAnnouncement = await newAnnouncement.save();
        } catch (saveError) {
            await deleteAnnouncementFilesFromR2(uploadedAttachments);
            throw saveError;
        }

        try {
            await buildAnnouncementNotification({
                announcement: savedAnnouncement,
                createdBy: req.user?._id || null,
            });
        } catch (notificationError) {
            console.error('Error creating announcement notification:', notificationError);
        }

        res.status(201).json(savedAnnouncement);
    } catch (err) {
        console.error('Error creating announcement:', err);
        res.status(500).json({ error: 'An error occurred while creating the announcement' });
    }
}

async function updateAnnouncement(req, res) {
    try {
        const { title, content, priority, status, expiry_date, module_id } = req.body;
        const updated = await Announcement.findByIdAndUpdate(
            req.params.id,
            { title, content, priority, status, expiry_date, module_id },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Announcement not found' });
        }
        res.status(200).json(updated);
    } catch (err) {
        console.error('Error updating announcement:', err);
        res.status(500).json({ error: 'An error occurred while updating the announcement' });
    }
}

async function deleteAnnouncement(req, res) {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        await deleteAnnouncementFilesFromR2(announcement.attachments);
        await announcement.deleteOne();

        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (err) {
        console.error('Error deleting announcement:', err);
        res.status(500).json({ error: 'An error occurred while deleting the announcement' });
    }
}

async function deleteAnnouncementAttachment(req, res) {
    try {
        const { id, attachmentId } = req.params;
        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        const attachmentIndex = announcement.attachments.findIndex(att => att._id.toString() === attachmentId);
        if (attachmentIndex === -1) {
            return res.status(404).json({ error: 'Attachment not found' });
        }

        const [attachment] = announcement.attachments.splice(attachmentIndex, 1);

        try {
            await deleteAnnouncementFilesFromR2([attachment]);
        } catch (deleteError) {
            announcement.attachments.splice(attachmentIndex, 0, attachment);
            throw deleteError;
        }

        const updatedAnnouncement = await announcement.save();
        res.status(200).json(updatedAnnouncement);
    } catch (err) {
        console.error('Error deleting announcement attachment:', err);
        res.status(500).json({ error: 'An error occurred while deleting the announcement attachment' });
    }
}

module.exports = {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    deleteAnnouncementAttachment,
};
