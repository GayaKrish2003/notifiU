import express from 'express';
import { getAnnouncementById, getAnnouncements, deleteAnnouncement, deleteAnnouncementAttachment, createAnnouncement, updateAnnouncement } from '../controllers/announcementsController.js';

const router = express.Router();

router.get("/announcements", getAnnouncements);
router.get("/announcements/:id", getAnnouncementById);
router.delete("/announcements/:id", deleteAnnouncement);
router.delete("/announcements/:id/attachments/:attachmentId", deleteAnnouncementAttachment);
router.post("/announcements", createAnnouncement);
router.put("/announcements/:id", updateAnnouncement);
router.delete("/announcements/:id", deleteAnnouncement);
router.delete("/announcements/:id/attachments/:attachmentId", deleteAnnouncementAttachment);


export default router;

