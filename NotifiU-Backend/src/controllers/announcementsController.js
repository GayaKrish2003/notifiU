export function getAnnouncements(req, res) {
    res.status(200).json("Here are the announcements");
}

export function getAnnouncementById(req, res) {
    const id = req.params.id;
    res.status(200).json(`Here is the announcement with id ${id}`);
}

export function createAnnouncement(req, res) {
    res.status(201).json("Announcement created");
}

export function updateAnnouncement(req, res) {
    const id = req.params.id;
    res.status(200).json(`Announcement with id ${id} updated`);
}

export function deleteAnnouncement(req, res) {
    const id = req.params.id;
    res.status(200).json(`Announcement with id ${id} deleted`);
}

export function deleteAnnouncementAttachment(req, res) {
    const id = req.params.id;
    const attachmentId = req.params.attachmentId;
    res.status(200).json(`Attachment with id ${attachmentId} deleted from announcement with id ${id}`);
}



// app.get("/api/tickets", (req, res) => {
//     res.status(200).json("Here are the tickets");
// })

// app.get("/api/tickets/:id", (req, res) => {
//     const id = req.params.id;
//     res.status(200).json(`Here is the ticket with id ${id}`);
// })

// app.post("/api/tickets", (req, res) => {
//     res.status(201).json("Ticket created");
// })

// app.patch("/api/tickets/:id", (req, res) => {
//     const id = req.params.id;
//     res.status(200).json(`Ticket with id ${id} updated`);
// })

// app.delete("/api/tickets/:id", (req, res) => {
//     const id = req.params.id;
//     res.status(200).json(`Ticket with id ${id} deleted`);
// })

// app.post("/api/tickets/:id/responses", (req, res) => {
//     const id = req.params.id;
//     res.status(201).json(`Response added to ticket with id ${id}`);
// })

// app.delete("/api/tickets/:id/responses/:responseId", (req, res) => {
//     const id = req.params.id;
//     const responseId = req.params.responseId;
//     res.status(200).json(`Response with id ${responseId} deleted from ticket with id ${id}`);
// })
