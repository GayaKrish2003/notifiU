import Announcement from '../models/announcement.js';
import mongoose from 'mongoose';

export function getAnnouncements(req, res) {
    try {
        const { module_id, status, priority } = req.query;
        // Build a filter object based on query parameters
        const filter = {};
        if (module_id) filter.module_id = module_id;
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        Announcement.find(filter)
            .sort({ publish_date: -1 }) // Newest first
            .then(announcements => res.status(200).json(announcements))
            .catch(err => res.status(500).json({ error: 'Failed to fetch announcements' }));
    } catch (err) {
        console.error('Error fetching announcements:', err);
        res.status(500).json({ error: 'An error occurred while fetching announcements' });
    }
}

export async function getAnnouncementById(req, res) {
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

export async function createAnnouncement(req, res) {
    try {
        const { title, content, priority, publish_date, expiry_date, module_id, status } = req.body; //posted_by is not in the db for now
        const newAnnouncement = new Announcement({
            title,
            content,
            priority,
            publish_date,
            expiry_date,
            module_id, // add posted_by later when you add it in db
            status
        });

        const saveAnnouncment = await newAnnouncement.save()
        res.status(201).json(saveAnnouncment);

    } catch (err) {
        console.error('Error creating announcement:', err);
        res.status(500).json({ error: 'An error occurred while creating the announcement' });
    }
}

export async function updateAnnouncement(req, res) {
    try {
        const { title, content, priority, status, expiry_date, module_id } = req.body;
        const updateAnnouncement = await Announcement.findByIdAndUpdate(
            req.params.id,
            { title, content, priority, status, expiry_date, module_id },
            {
                new: true,
                runValidators: true // schema validations
            }
        )

        if (!updateAnnouncement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }
        res.status(200).json(updateAnnouncement);

    } catch (err) {
        console.error('Error updating announcement:', err);
        res.status(500).json({ error: 'An error occurred while updating the announcement' });
    }
}

export async function deleteAnnouncement(req, res) {
    try {
        const deleteAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
        if (!deleteAnnouncement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }
        res.status(200).json({ message: 'Announcement deleted successfully' });

    } catch (err) {
        console.error('Error deleting announcement:', err);
        res.status(500).json({ error: 'An error occurred while deleting the announcement' });
    }
}

export function deleteAnnouncementAttachment(req, res) {
    try {
        const { id, attachmentId } = req.params;
        Announcement.findById(id)
            .then(announcement => {
                if (!announcement) {
                    return res.status(404).json({ error: 'Announcement not found' });
                }
                const attachmentIndex = announcement.attachments.findIndex(att => att._id.toString() === attachmentId);
                if (attachmentIndex === -1) {
                    return res.status(404).json({ error: 'Attachment not found' });
                }
                announcement.attachments.splice(attachmentIndex, 1);
                return announcement.save();
            })
            .then(updatedAnnouncement => res.status(200).json(updatedAnnouncement))
            .catch(err => res.status(500).json({ error: 'Failed to delete announcement attachment', details: err }));
    } catch (err) {
        console.error('Error deleting announcement attachment:', err);
        res.status(500).json({ error: 'An error occurred while deleting the announcement attachment' });
    }
}

