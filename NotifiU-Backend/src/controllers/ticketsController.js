export function getTickets(req, res) {
    res.status(200).json("Here are the tickets");
}

export function getTicketById(req, res) {
    const id = req.params.id;
    res.status(200).json(`Here is the ticket with id ${id}`);
}

export function createTicket(req, res) {
    res.status(201).json("Ticket created");
}

export function updateTicket(req, res) {
    const id = req.params.id;
    res.status(200).json(`Ticket with id ${id} updated`);
}

export function deleteTicket(req, res) {
    const id = req.params.id;
    res.status(200).json(`Ticket with id ${id} deleted`);
}

export function addResponseToTicket(req, res) {
    const id = req.params.id;
    res.status(201).json(`Response added to ticket with id ${id}`);
}

export function deleteResponseFromTicket(req, res) {
    const id = req.params.id;
    const responseId = req.params.responseId;
    res.status(200).json(`Response with id ${responseId} deleted from ticket with id ${id}`);
}   