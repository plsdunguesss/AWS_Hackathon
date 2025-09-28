"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const ollamaService_1 = require("../services/ollamaService");
const database_1 = require("../database/database");
const router = express_1.default.Router();
exports.healthRoutes = router;
// Health check endpoint
router.get('/', async (req, res) => {
    try {
        const db = database_1.Database.getInstance();
        const ollamaService = new ollamaService_1.OllamaService();
        // Check database connection
        await db.get('SELECT 1');
        // Check Ollama service
        const ollamaHealthy = await ollamaService.checkHealth();
        const availableModels = await ollamaService.listModels();
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                ollama: ollamaHealthy ? 'connected' : 'disconnected',
                availableModels: availableModels
            }
        });
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Detailed system status
router.get('/status', async (req, res) => {
    try {
        const db = database_1.Database.getInstance();
        const ollamaService = new ollamaService_1.OllamaService();
        // Get database stats
        const sessionCount = await db.get('SELECT COUNT(*) as count FROM sessions');
        const messageCount = await db.get('SELECT COUNT(*) as count FROM messages');
        const riskAssessmentCount = await db.get('SELECT COUNT(*) as count FROM risk_assessments');
        // Check Ollama
        const ollamaHealthy = await ollamaService.checkHealth();
        const availableModels = await ollamaService.listModels();
        const currentModel = ollamaService.getModel();
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: true,
                sessions: sessionCount?.count || 0,
                messages: messageCount?.count || 0,
                riskAssessments: riskAssessmentCount?.count || 0
            },
            ollama: {
                connected: ollamaHealthy,
                currentModel: currentModel,
                availableModels: availableModels
            },
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
            }
        });
    }
    catch (error) {
        console.error('Status check failed:', error);
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
//# sourceMappingURL=health.js.map