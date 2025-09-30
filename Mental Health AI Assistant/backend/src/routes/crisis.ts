import express from 'express';
import { CrisisDetectionService } from '../services/crisisDetectionService';

const router = express.Router();
const crisisService = CrisisDetectionService.getInstance();

// Test crisis detection
router.post('/test', async (req: express.Request, res: express.Response) => {
    try {
        const testMessage = "I want to end it all";
        const crisisLevel = await crisisService.assessCrisisLevel("test-session", testMessage);
        
        res.json({
            success: true,
            testMessage,
            crisisLevel,
            status: 'Crisis detection is working'
        });
    } catch (error) {
        console.error('Crisis test error:', error);
        res.status(500).json({
            success: false,
            error: 'Crisis detection test failed'
        });
    }
});

// Assess crisis level
router.post('/assess', async (req: express.Request, res: express.Response) => {
    try {
        const { sessionId, message } = req.body;
        
        if (!sessionId || !message) {
            return res.status(400).json({
                success: false,
                error: 'Session ID and message are required'
            });
        }

        const crisisLevel = await crisisService.assessCrisisLevel(sessionId, message);
        
        res.json({
            success: true,
            crisisLevel
        });
    } catch (error) {
        console.error('Crisis assessment error:', error);
        res.status(500).json({
            success: false,
            error: 'Crisis assessment failed'
        });
    }
});

export { router as crisisRoutes };