import express from 'express';
import { SessionService } from '../services/sessionService';
import { UserSession } from '../types';

const router = express.Router();
const sessionService = SessionService.getInstance();

// Create a new session
router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const session = await sessionService.createSession();
        
        res.status(201).json({
            success: true,
            session: session
        });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create session'
        });
    }
});

// Get session by ID
router.get('/:sessionId', async (req: express.Request, res: express.Response) => {
    try {
        const { sessionId } = req.params;
        
        const session = await sessionService.getSession(sessionId);
        
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        
        res.json({
            success: true,
            session: session
        });
    } catch (error) {
        console.error('Error getting session:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get session'
        });
    }
});

// Update session risk score
router.patch('/:sessionId/risk-score', async (req: express.Request, res: express.Response) => {
    try {
        const { sessionId } = req.params;
        const { riskScore, referralTriggered } = req.body;
        
        if (typeof riskScore !== 'number' || riskScore < 0 || riskScore > 1) {
            return res.status(400).json({
                success: false,
                error: 'Risk score must be a number between 0 and 1'
            });
        }
        
        const updatedSession = await sessionService.updateRiskScore(
            sessionId, 
            riskScore, 
            referralTriggered || false
        );
        
        res.json({
            success: true,
            session: updatedSession
        });
    } catch (error) {
        console.error('Error updating session risk score:', error);
        if (error instanceof Error && error.message === 'Session not found') {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to update session risk score'
        });
    }
});

// Get session conversation history
router.get('/:sessionId/messages', async (req: express.Request, res: express.Response) => {
    try {
        const { sessionId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        
        const messages = await sessionService.getConversationHistory(
            sessionId,
            Number(limit),
            Number(offset)
        );
        
        res.json({
            success: true,
            messages: messages,
            sessionId: sessionId
        });
    } catch (error) {
        console.error('Error getting session messages:', error);
        if (error instanceof Error && error.message === 'Session not found') {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to get session messages'
        });
    }
});

// Delete session (for privacy)
router.delete('/:sessionId', async (req: express.Request, res: express.Response) => {
    try {
        const { sessionId } = req.params;
        
        const deleted = await sessionService.deleteSession(sessionId);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Session deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete session'
        });
    }
});

// Store a message in conversation history
router.post('/:sessionId/messages', async (req: express.Request, res: express.Response) => {
    try {
        const { sessionId } = req.params;
        const { content, sender, empathyScore = 0.0 } = req.body;
        
        if (!content || !sender) {
            return res.status(400).json({
                success: false,
                error: 'Content and sender are required'
            });
        }
        
        if (sender !== 'user' && sender !== 'assistant') {
            return res.status(400).json({
                success: false,
                error: 'Sender must be either "user" or "assistant"'
            });
        }
        
        const message = await sessionService.storeMessage(
            sessionId,
            content,
            sender,
            empathyScore
        );
        
        res.status(201).json({
            success: true,
            message: message
        });
    } catch (error) {
        console.error('Error storing message:', error);
        if (error instanceof Error && error.message === 'Session not found') {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to store message'
        });
    }
});

// Get conversation context for AI processing
router.get('/:sessionId/context', async (req: express.Request, res: express.Response) => {
    try {
        const { sessionId } = req.params;
        
        const context = await sessionService.getConversationContext(sessionId);
        
        res.json({
            success: true,
            context: context
        });
    } catch (error) {
        console.error('Error getting conversation context:', error);
        if (error instanceof Error && error.message === 'Session not found') {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to get conversation context'
        });
    }
});

// Get latest risk assessment for a session
router.get('/:sessionId/risk-assessment', async (req: express.Request, res: express.Response) => {
    try {
        const { sessionId } = req.params;
        
        const riskAssessment = await sessionService.getLatestRiskAssessment(sessionId);
        
        res.json({
            success: true,
            riskAssessment: riskAssessment
        });
    } catch (error) {
        console.error('Error getting risk assessment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get risk assessment'
        });
    }
});

// Get session statistics (admin endpoint)
router.get('/admin/stats', async (req: express.Request, res: express.Response) => {
    try {
        const stats = await sessionService.getSessionStats();
        
        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Error getting session stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get session statistics'
        });
    }
});

// Manual cleanup of old sessions (admin endpoint)
router.post('/admin/cleanup', async (req: express.Request, res: express.Response) => {
    try {
        const { hoursOld = 24 } = req.body;
        
        const deletedCount = await sessionService.cleanupOldSessions(hoursOld);
        
        res.json({
            success: true,
            message: `Cleaned up ${deletedCount} old sessions`,
            deletedCount: deletedCount
        });
    } catch (error) {
        console.error('Error cleaning up sessions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cleanup sessions'
        });
    }
});

export { router as sessionRoutes };