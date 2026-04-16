import { SupportTicket, TicketResponse } from '../models/supportTicket.js';

// GET /api/tickets
// Admins see all tickets; students only see their own
export async function getTickets(req, res) {
    try {
        const filter = req.user.role === 'student' ? { user_id: req.user.id } : {};
        const tickets = await SupportTicket.find(filter)
            .sort({ createdAt: -1 })
            .populate('user_id', 'username role');
        res.status(200).json(tickets);
    } catch (err) {
        console.error('Error fetching tickets:', err);
        res.status(500).json({ error: 'An error occurred while fetching tickets' });
    }
}

// GET /api/tickets/:id
export async function getTicketById(req, res) {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate('user_id', 'username role');

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Students can only view their own tickets
        if (req.user.role === 'student' && ticket.user_id._id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Fetch responses for this ticket
        const responses = await TicketResponse.find({ ticket_id: ticket._id })
            .sort({ createdAt: 1 })
            .populate('responded_by', 'username role');

        res.status(200).json({ ticket, responses });
    } catch (err) {
        console.error('Error fetching ticket:', err);
        res.status(500).json({ error: 'An error occurred while fetching the ticket' });
    }
}

// POST /api/tickets
// Any authenticated user can open a ticket
export async function createTicket(req, res) {
    try {
        const { subject, description } = req.body;

        const newTicket = new SupportTicket({
            user_id: req.user.id,
            subject,
            description,
            status: 'open',
        });

        const savedTicket = await newTicket.save();
        res.status(201).json(savedTicket);
    } catch (err) {
        console.error('Error creating ticket:', err);
        res.status(500).json({ error: 'An error occurred while creating the ticket' });
    }
}

// PATCH /api/tickets/:id
// Admins/lecturers can update status; students can only update subject/description on their own open tickets
export async function updateTicket(req, res) {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        if (req.user.role === 'student') {
            // Students can only edit their own tickets
            if (ticket.user_id.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Access denied' });
            }
            // Students cannot change status
            const { subject, description } = req.body;
            ticket.subject = subject ?? ticket.subject;
            ticket.description = description ?? ticket.description;
        } else {
            // Admins and lecturers can update anything
            const { subject, description, status } = req.body;
            ticket.subject = subject ?? ticket.subject;
            ticket.description = description ?? ticket.description;
            ticket.status = status ?? ticket.status;
        }

        const updatedTicket = await ticket.save();
        res.status(200).json(updatedTicket);
    } catch (err) {
        console.error('Error updating ticket:', err);
        res.status(500).json({ error: 'An error occurred while updating the ticket' });
    }
}

// DELETE /api/tickets/:id
// Only admins can delete tickets
export async function deleteTicket(req, res) {
    try {
        const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Clean up all responses for this ticket too
        await TicketResponse.deleteMany({ ticket_id: req.params.id });

        res.status(200).json({ message: 'Ticket and its responses deleted successfully' });
    } catch (err) {
        console.error('Error deleting ticket:', err);
        res.status(500).json({ error: 'An error occurred while deleting the ticket' });
    }
}

// POST /api/tickets/:id/responses
// Any authenticated user can reply to a ticket
export async function addResponseToTicket(req, res) {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        if (ticket.status === 'closed') {
            return res.status(400).json({ error: 'Cannot respond to a closed ticket' });
        }

        const { response_message } = req.body;
        const newResponse = new TicketResponse({
            ticket_id: ticket._id,
            responded_by: req.user.id,
            response_message,
        });

        const savedResponse = await newResponse.save();

        // Auto-update ticket status to in_progress when first response is added by staff
        if (ticket.status === 'open' && req.user.role !== 'student') {
            ticket.status = 'in_progress';
            await ticket.save();
        }

        res.status(201).json(savedResponse);
    } catch (err) {
        console.error('Error adding response:', err);
        res.status(500).json({ error: 'An error occurred while adding the response' });
    }
}

// DELETE /api/tickets/:id/responses/:responseId
// Admins can delete any response; users can delete their own
export async function deleteResponseFromTicket(req, res) {
    try {
        const response = await TicketResponse.findById(req.params.responseId);
        if (!response) {
            return res.status(404).json({ error: 'Response not found' });
        }

        // Verify the response belongs to this ticket
        if (response.ticket_id.toString() !== req.params.id) {
            return res.status(400).json({ error: 'Response does not belong to this ticket' });
        }

        // Only admins or the original responder can delete
        if (req.user.role !== 'admin' && response.responded_by.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await TicketResponse.findByIdAndDelete(req.params.responseId);
        res.status(200).json({ message: 'Response deleted successfully' });
    } catch (err) {
        console.error('Error deleting response:', err);
        res.status(500).json({ error: 'An error occurred while deleting the response' });
    }
}