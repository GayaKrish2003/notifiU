import express from 'express';

const app = express();

app.get("/api/", (req, res) => {
    res.send("Hello World");
})

app.get("/api/announcements", (req, res) => {
    res.status(200).send("Here are the announcements");
})

app.get("/api/announcements/:id", (req, res) => {
    const id = req.params.id;
    res.status(200).send(`Here is the announcement with id ${id}`);
})

app.post("/api/announcements", (req, res) => {
    res.status(201).json("Announcement created");
})

app.put("/api/announcements/:id", (req, res) => {
    const id = req.params.id;
    res.status(200).json(`Announcement with id ${id} updated`);
})

app.delete("/api/announcements/:id", (req, res) => {
    const id = req.params.id;
    res.status(200).json(`Announcement with id ${id} deleted`);
})

app.delete("/api/announcements/:id/attachments/:attachmentId", (req, res) => {
    const id = req.params.id;
    const attachmentId = req.params.attachmentId;
    res.status(200).json(`Attachment with id ${attachmentId} deleted from announcement with id ${id}`);
})



app.listen(5001, () => {
    console.log('Server is running on port 5001');
})