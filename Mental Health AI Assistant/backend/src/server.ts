import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();
import { Database } from './database/database';
import { SessionService } from './services/sessionService';
import { conversationRoutes } from './routes/conversation';
import { riskAssessmentRoutes } from './routes/riskAssessment';
import { sessionRoutes } from './routes/session';
import { healthRoutes } from './routes/health';
import { dashboardRoutes } from './routes/dashboard';
import { userRoutes } from './routes/user';
import { progressAnalyticsRoutes } from './routes/progressAnalytics';
import { safetyRoutes } from './routes/safety';
import { crisisRoutes } from './routes/crisis';
import { professionalsRoutes } from './routes/professionals';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/risk-assessment', riskAssessmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/progress-analytics', progressAnalyticsRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/crisis', crisisRoutes);
app.use('/api/professionals', professionalsRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    
    // Don't expose internal errors to client
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(500).json({
        error: 'Internal server error',
        message: isDevelopment ? err.message : 'Something went wrong',
        ...(isDevelopment && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Initialize database and start server
async function startServer() {
    try {
        console.log('Initializing database...');
        const db = Database.getInstance();
        await db.initialize();
        
        // Initialize session service and start automatic cleanup
        const sessionService = SessionService.getInstance();
        const cleanedUpCount = await sessionService.cleanupOldSessions(24);
        console.log(`Database initialized. Cleaned up ${cleanedUpCount} old sessions on startup.`);
        
        // Start automatic cleanup every 6 hours, removing sessions older than 24 hours
        sessionService.startAutomaticCleanup(6, 24);
        console.log('Automatic session cleanup started (every 6 hours, removing sessions older than 24 hours)');

        app.listen(PORT, () => {
            console.log(`Mental Health AI Assistant backend server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT. Graceful shutdown...');
    try {
        const db = Database.getInstance();
        await db.close();
        console.log('Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM. Graceful shutdown...');
    try {
        const db = Database.getInstance();
        await db.close();
        console.log('Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

startServer();