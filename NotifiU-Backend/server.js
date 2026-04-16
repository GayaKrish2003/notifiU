require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const lecturerRoutes = require('./routes/lecturerRoutes');
const authRoutes = require('./routes/authRoutes');
const announcementsRouter = require('./routes/announcementsRoutes');
const ticketsRouter = require('./routes/ticketsRoutes');
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
app.use('/api/auth', authRoutes);
app.use('/api', announcementsRouter);
app.use('/api', ticketsRouter);

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
    } catch (error) {
        console.error(`❌ ERROR: Could not start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
