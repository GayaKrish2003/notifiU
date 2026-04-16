import express from 'express';
import announcementsRouter from './routes/announcementsRoutes.js';
import faqsRouter from './routes/faqsRoutes.js';
import ticketsRouter from './routes/ticketsRoutes.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use("/api", announcementsRouter);
app.use("/api", faqsRouter);
app.use("/api", ticketsRouter);

app.listen(PORT, () => {
    console.log('Server is running on port: ' + PORT);
})