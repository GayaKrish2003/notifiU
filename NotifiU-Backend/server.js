import express from 'express';
import announcementsRouter from './routes/announcementsRoutes.js';
import ticketsRouter from './routes/ticketsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(express.json());

app.use("/api/auth", authRoutes)

app.use("/api", announcementsRouter);
app.use("/api", ticketsRouter);

app.listen(PORT, () => {
    console.log('Server is running on port: ' + PORT);
})