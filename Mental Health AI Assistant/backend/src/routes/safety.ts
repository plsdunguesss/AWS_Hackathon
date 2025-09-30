import express from 'express';
import { SafetyMonitorService } from '../services/safetyMonitorService';

const router = express.Router();
const safetyMonitor = new SafetyMonitorService();

// Test safety monitoring
router.post('/test', async (req: express.Request, res: express.Response) => {
    try {
        const testMessage = "I'm feeling really sad and hopeless today";
        const safetyFlags = await safetyMonitor.scanForHarmfulContent(testMessage);
        
        res.json({
            success: true,
            testMessage,
            safetyFlags,
            status: 'Safety monitoring is working'
        });
    } catch (error) {
        console.error('Safety test error:', error);
        res.status(500).json({
            success: false,
            error: 'Safety monitoring test failed'
        });
    }
});

// Scan content for safety
router.post('/scan', async (req: express.Request, res: express.Response) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        const safetyFlags = await safetyMonitor.scanForHarmfulContent(message);
        
        res.json({
            success: true,
            safetyFlags
        });
    } catch (error) {
        console.error('Safety scan error:', error);
        res.status(500).json({
            success: false,
            error: 'Safety scan failed'
        });
    }
});

export { router as safetyRoutes };