"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const dashboardService_1 = require("../services/dashboardService");
const router = express_1.default.Router();
exports.dashboardRoutes = router;
const dashboardService = dashboardService_1.DashboardService.getInstance();
// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};
// Get complete dashboard data
router.get('/:sessionId', (0, express_validator_1.param)('sessionId').isUUID().withMessage('Invalid session ID'), handleValidationErrors, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const dashboardData = await dashboardService.getDashboardData(sessionId);
        res.json({
            success: true,
            data: dashboardData
        });
    }
    catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data'
        });
    }
});
// Submit mood entry
router.post('/mood/entry', [
    (0, express_validator_1.body)('sessionId').isUUID().withMessage('Invalid session ID'),
    (0, express_validator_1.body)('mood').isInt({ min: 1, max: 10 }).withMessage('Mood must be between 1 and 10'),
    (0, express_validator_1.body)('energy').isInt({ min: 1, max: 10 }).withMessage('Energy must be between 1 and 10'),
    (0, express_validator_1.body)('stress').isInt({ min: 1, max: 10 }).withMessage('Stress must be between 1 and 10'),
    (0, express_validator_1.body)('anxiety').isInt({ min: 1, max: 10 }).withMessage('Anxiety must be between 1 and 10'),
    (0, express_validator_1.body)('sleep').isInt({ min: 1, max: 10 }).withMessage('Sleep must be between 1 and 10'),
    (0, express_validator_1.body)('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
], handleValidationErrors, async (req, res) => {
    try {
        const { sessionId, mood, energy, stress, anxiety, sleep, notes } = req.body;
        const entry = await dashboardService.submitMoodEntry(sessionId, {
            mood: parseInt(mood),
            energy: parseInt(energy),
            stress: parseInt(stress),
            anxiety: parseInt(anxiety),
            sleep: parseInt(sleep),
            notes
        });
        res.json({
            success: true,
            data: { entry }
        });
    }
    catch (error) {
        console.error('Error submitting mood entry:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit mood entry'
        });
    }
});
// Get mood history
router.get('/mood/history/:sessionId', [
    (0, express_validator_1.param)('sessionId').isUUID().withMessage('Invalid session ID'),
    (0, express_validator_1.query)('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
], handleValidationErrors, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const days = parseInt(req.query.days) || 30;
        const entries = await dashboardService.getMoodHistory(sessionId, days);
        res.json({
            success: true,
            data: { entries }
        });
    }
    catch (error) {
        console.error('Error fetching mood history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch mood history'
        });
    }
});
// Log activity
router.post('/activities', [
    (0, express_validator_1.body)('sessionId').isUUID().withMessage('Invalid session ID'),
    (0, express_validator_1.body)('type').isIn(['chat', 'assessment', 'resource', 'professional']).withMessage('Invalid activity type'),
    (0, express_validator_1.body)('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('description').isString().isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),
    (0, express_validator_1.body)('metadata').optional().isObject().withMessage('Metadata must be an object')
], handleValidationErrors, async (req, res) => {
    try {
        const { sessionId, type, title, description, metadata } = req.body;
        const activity = await dashboardService.logActivity(sessionId, {
            type,
            title,
            description,
            metadata
        });
        res.json({
            success: true,
            data: { activity }
        });
    }
    catch (error) {
        console.error('Error logging activity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log activity'
        });
    }
});
// Get activities
router.get('/activities/:sessionId', [
    (0, express_validator_1.param)('sessionId').isUUID().withMessage('Invalid session ID'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], handleValidationErrors, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const activities = await dashboardService.getAllActivities(sessionId, limit);
        res.json({
            success: true,
            data: { activities }
        });
    }
    catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch activities'
        });
    }
});
// Get achievements
router.get('/achievements/:sessionId', (0, express_validator_1.param)('sessionId').isUUID().withMessage('Invalid session ID'), handleValidationErrors, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const achievements = await dashboardService.getAchievements(sessionId);
        res.json({
            success: true,
            data: { achievements }
        });
    }
    catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch achievements'
        });
    }
});
// Create task
router.post('/tasks', [
    (0, express_validator_1.body)('sessionId').isUUID().withMessage('Invalid session ID'),
    (0, express_validator_1.body)('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('description').isString().isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),
    (0, express_validator_1.body)('dueDate').isISO8601().withMessage('Due date must be a valid date'),
    (0, express_validator_1.body)('priority').isIn(['high', 'medium', 'low']).withMessage('Priority must be high, medium, or low'),
    (0, express_validator_1.body)('type').isString().isLength({ min: 1, max: 50 }).withMessage('Type must be between 1 and 50 characters')
], handleValidationErrors, async (req, res) => {
    try {
        const { sessionId, title, description, dueDate, priority, type } = req.body;
        const task = await dashboardService.createTask(sessionId, {
            title,
            description,
            dueDate: new Date(dueDate).toISOString().split('T')[0], // Convert to YYYY-MM-DD
            priority,
            type
        });
        res.json({
            success: true,
            data: { task }
        });
    }
    catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task'
        });
    }
});
// Get upcoming tasks
router.get('/tasks/:sessionId', [
    (0, express_validator_1.param)('sessionId').isUUID().withMessage('Invalid session ID'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], handleValidationErrors, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const tasks = await dashboardService.getUpcomingTasks(sessionId, limit);
        res.json({
            success: true,
            data: { tasks }
        });
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tasks'
        });
    }
});
// Get progress analytics with time range support
router.get('/progress/:sessionId', [
    (0, express_validator_1.param)('sessionId').isUUID().withMessage('Invalid session ID'),
    (0, express_validator_1.query)('range').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Range must be 7d, 30d, 90d, or 1y')
], handleValidationErrors, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const range = req.query.range || '30d';
        const [analytics, metrics] = await Promise.all([
            dashboardService.getProgressAnalytics(sessionId, range),
            dashboardService.getProgressMetrics(sessionId)
        ]);
        res.json({
            success: true,
            data: {
                analytics,
                metrics
            }
        });
    }
    catch (error) {
        console.error('Error fetching progress analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch progress analytics'
        });
    }
});
//# sourceMappingURL=dashboard.js.map