"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Load environment variables
dotenv_1.default.config();
const database_1 = require("./database/database");
const sessionService_1 = require("./services/sessionService");
const conversation_1 = require("./routes/conversation");
const riskAssessment_1 = require("./routes/riskAssessment");
const session_1 = require("./routes/session");
const health_1 = require("./routes/health");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Routes
app.use('/api/health', health_1.healthRoutes);
app.use('/api/sessions', session_1.sessionRoutes);
app.use('/api/conversation', conversation_1.conversationRoutes);
app.use('/api/risk-assessment', riskAssessment_1.riskAssessmentRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
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
        const db = database_1.Database.getInstance();
        await db.initialize();
        // Initialize session service and start automatic cleanup
        const sessionService = sessionService_1.SessionService.getInstance();
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
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT. Graceful shutdown...');
    try {
        const db = database_1.Database.getInstance();
        await db.close();
        console.log('Database connection closed.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});
process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM. Graceful shutdown...');
    try {
        const db = database_1.Database.getInstance();
        await db.close();
        console.log('Database connection closed.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});
startServer();
//# sourceMappingURL=server.js.map