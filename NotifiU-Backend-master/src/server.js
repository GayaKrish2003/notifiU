require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const cron = require('node-cron');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const lecturerRoutes = require('./routes/lecturerRoutes');
const moduleRoutes = require("./routes/moduleRoutes");
const authRoutes = require('./routes/authRoutes');
const announcementsRouter = require('./routes/announcementsRoutes');
const notificationsRouter = require('./routes/notificationsRoutes');
const ticketsRouter = require('./routes/ticketsRoutes');
const chatRouter = require('./routes/chatRoutes');
const jobPostRoutes = require('./routes/jobPostRoutes');
const eventRoutes = require('./routes/eventRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Initialize Express
const app = express();

// 1. CORS Configuration
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);

// 2. Security & Parsing Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// 3. Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// 5. Routes
app.use('/api/users', userRoutes);
app.use('/api/lecturer', lecturerRoutes);
app.use("/api", moduleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', announcementsRouter);
app.use('/api', notificationsRouter);
app.use('/api', ticketsRouter);
app.use('/api', chatRouter);
app.use('/api/jobs', jobPostRoutes);
app.use('/api/events', eventRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.send('UniStay API is Running...');
});

// 6. Error Handling (Must be after routes)
app.use(notFound);
app.use(errorHandler);

// 7. Server Start Logic
const PORT = process.env.PORT || 5005;

const startServer = async () => {
    try {
        console.log('--- Initializing System ---');
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server listening in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });

        // ── 8. Auto-Archive Cron Job ──────────────────────────────────────────
        // Runs every minute. Finds 'Upcoming' events where startTime + 15 min
        // has already passed, and moves them to 'History' automatically.
        const Event = require('./models/Event');
        cron.schedule('* * * * *', async () => {
            try {
                const cutoff = new Date(Date.now() - 15 * 60 * 1000); // now - 15 min
                const result = await Event.updateMany(
                    { status: 'Upcoming', startTime: { $lte: cutoff } },
                    { $set: { status: 'History' } }
                );
                if (result.modifiedCount > 0) {
                    console.log(`⏰ [CRON] Auto-archived ${result.modifiedCount} event(s) to History.`);
                }
            } catch (err) {
                console.error('❌ [CRON] Auto-archive error:', err.message);
            }
        });
        console.log('⏰ Auto-archive cron job started (runs every minute).');
        // ─────────────────────────────────────────────────────────────────────

    } catch (error) {
        console.error(`❌ ERROR: Could not start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
