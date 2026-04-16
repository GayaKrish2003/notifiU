import express from 'express';
import { getTickets, getTicketById, createTicket, updateTicket, deleteTicket, addResponseToTicket, deleteResponseFromTicket } from '../controllers/ticketsController.js';

const router = express.Router();

router.get("/tickets", getTickets);
router.get("/tickets/:id", getTicketById);
router.post("/tickets", createTicket);
router.patch("/tickets/:id", updateTicket);
router.delete("/tickets/:id", deleteTicket);
router.post("/tickets/:id/responses", addResponseToTicket);
router.delete("/tickets/:id/responses/:responseId", deleteResponseFromTicket);

export default router;