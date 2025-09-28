import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database/database';
import { UserSession } from '../types';

const router = express.Router();

// Create a new session
router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const db = Database.getInstance();
        const sessionId = uuidv4();
        const now = new Date().toISOString();
        
        await db.run(
            `INSERT INTO sessions (id, start_time, last_activity, risk_score, referral_triggered, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [sessionId, now, now, 0.0, false, now, now]
        );
        
        const session = await db.get<UserSession>(
            'SELECT * FROM sessions WHERE id = ?',
            [sessionId]
        );
        
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
        const db = Database.getInstance();
        
        const session = await db.get<UserSession>(
            'SELECT * FROM sessions WHERE id = ?',
            [sessionId]
        );
        
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        
        // Update last activity
        await db.run(
            'UPDATE sessions SET last_activity = ?, updated_at = ? WHERE id = ?',
            [new Date().toISOString(), new Date().toISOString(), sessionId]
        );
        
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
        const db = Database.getInstance();
        
        if (typeof riskScore !== 'number' || riskScore < 0 || riskScore > 1) {
            return res.status(400).json({
                success: false,
                error: 'Risk score must be a number between 0 and 1'
            });
        }
        
        await db.run(
            `UPDATE sessions 
             SET risk_score = ?, referral_triggered = ?, last_activity = ?, updated_at = ?
             WHERE id = ?`,
            [riskScore, referralTriggered || false, new Date().toISOString(), new Date().toISOString(), sessionId]
        );
        
        const updatedSession = await db.get<UserSession>(
            'SELECT * FROM sessions WHERE id = ?',
            [sessionId]
        );
        
        if (!updatedSession) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        
        res.json({
            success: true,
            session: updatedSession
        });
    } catch (error) {
        console.error('Error updating session risk score:', error);
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
        const db = Database.getInstance();
        
        // Check if session exists
        const session = await db.get('SELECT id FROM sessions WHERE id = ?', [sessionId]);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        
        const messages = await db.all(
            `SELECT * FROM messages 
             WHERE session_id = ? 
             ORDER BY timestamp DESC 
             LIMIT ? OFFSET ?`,
            [sessionId, Number(limit), Number(offset)]
        );
        
        res.json({
            success: true,
            messages: messages.reverse(), // Return in chronological order
            sessionId: sessionId
        });
    } catch (error) {
        console.error('Error getting session messages:', error);
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
        const db = Database.getInstance();
        
        const result = await db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
        
        if (result.changes === 0) {
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

export { router as sessionRoutes };