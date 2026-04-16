import express from 'express';
import { getAnnouncementById, getAnnouncements, deleteAnnouncement, deleteAnnouncementAttachment, createAnnouncement, updateAnnouncement } from '../controllers/announcementsController.js';
import verifyToken from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get("/announcements", verifyToken, getAnnouncements);
router.get("/announcements/:id", verifyToken, getAnnouncementById);
router.post("/announcements", verifyToken, authorizeRoles("admin", "lecturer"), createAnnouncement);
router.put("/announcements/:id", verifyToken, authorizeRoles("admin", "lecturer"), updateAnnouncement);
router.delete("/announcements/:id", verifyToken, authorizeRoles("admin", "lecturer"), deleteAnnouncement);
router.delete("/announcements/:id/attachments/:attachmentId", verifyToken, authorizeRoles("admin", "lecturer"), deleteAnnouncementAttachment);




export default router;

