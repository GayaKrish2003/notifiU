import express from 'express';
import { getTickets, getTicketById, createTicket, updateTicket, deleteTicket, addResponseToTicket, deleteResponseFromTicket } from '../controllers/ticketsController.js';
import verifyToken from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get("/tickets", verifyToken, getTickets);
router.get("/tickets/:id", verifyToken, getTicketById);
router.post("/tickets", verifyToken, createTicket);
router.patch("/tickets/:id", verifyToken, updateTicket);
router.delete("/tickets/:id", verifyToken, authorizeRoles("admin"), deleteTicket);
router.post("/tickets/:id/responses", verifyToken, addResponseToTicket);
router.delete("/tickets/:id/responses/:responseId", verifyToken, deleteResponseFromTicket);

export default router;