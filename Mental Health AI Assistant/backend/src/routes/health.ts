import express from 'express';
import { OllamaService } from '../services/ollamaService';
import { Database } from '../database/database';

const router = express.Router();

// Health check endpoint
router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const db = Database.getInstance();
        const ollamaService = new OllamaService();
        
        // Check database connection
        await db.get('SELECT 1');
        
        // Check Ollama service (optional for demo)
        let ollamaHealthy = false;
        let availableModels: string[] = [];
        try {
            ollamaHealthy = await ollamaService.checkHealth();
            availableModels = await ollamaService.listModels();
        } catch (error) {
            console.log('Ollama not available (optional for demo)');
        }
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                ollama: ollamaHealthy ? 'connected' : 'disconnected',
                availableModels: availableModels
            }
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Detailed system status
router.get('/status', async (req: express.Request, res: express.Response) => {
    try {
        const db = Database.getInstance();
        const ollamaService = new OllamaService();
        
        // Get database stats
        const sessionCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM sessions');
        const messageCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM messages');
        const riskAssessmentCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM risk_assessments');
        
        // Check Ollama (optional for demo)
        let ollamaHealthy = false;
        let availableModels: string[] = [];
        let currentModel = 'Not available';
        try {
            ollamaHealthy = await ollamaService.checkHealth();
            availableModels = await ollamaService.listModels();
            currentModel = ollamaService.getModel();
        } catch (error) {
            console.log('Ollama not available (optional for demo)');
        }
        
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
    } catch (error) {
        console.error('Status check failed:', error);
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export { router as healthRoutes };