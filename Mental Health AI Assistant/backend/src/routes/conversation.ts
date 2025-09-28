import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database/database';
import { OllamaService } from '../services/ollamaService';
import { Message, ConversationContext } from '../types';

const router = express.Router();

// Validation middleware
const validateMessage = [
    body('sessionId').isUUID().withMessage('Valid session ID is required'),
    body('message').isString().isLength({ min: 1, max: 5000 }).withMessage('Message must be between 1 and 5000 characters'),
];

// Send message and get AI response
router.post('/message', validateMessage, async (req: express.Request, res: express.Response) => {
    try {
        // Check validation results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { sessionId, message } = req.body;
        const db = Database.getInstance();
        const ollamaService = new OllamaService();

        // Verify session exists
        const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        // Get conversation history for context
        const messageHistory = await db.all<Message>(
            `SELECT * FROM messages 
             WHERE session_id = ? 
             ORDER BY timestamp ASC 
             LIMIT 10`,
            [sessionId]
        );

        // Store user message
        const userMessageId = uuidv4();
        const timestamp = new Date().toISOString();
        
        await db.run(
            `INSERT INTO messages (id, session_id, content, sender, timestamp, empathy_score)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userMessageId, sessionId, message, 'user', timestamp, 0.0]
        );

        // Prepare context for AI
        const context: ConversationContext = {
            sessionId,
            messageHistory,
            currentRiskScore: session.risk_score || 0,
        };

        // Generate AI response
        const conversationHistory = messageHistory.map(msg => 
            `${msg.sender}: ${msg.content}`
        );

        const prompt = ollamaService.createMentalHealthPrompt(message, {
            sessionHistory: conversationHistory,
            riskLevel: context.currentRiskScore
        });

        let aiResponse: string;
        try {
            aiResponse = await ollamaService.generateResponse(prompt, {
                temperature: 0.7,
                top_p: 0.9
            });
        } catch (ollamaError) {
            console.error('Ollama service error:', ollamaError);
            // Fallback response if Ollama is unavailable
            aiResponse = "I understand you're reaching out, and I want you to know that your feelings are valid. While I'm having some technical difficulties right now, I encourage you to speak with a mental health professional who can provide you with the support you deserve. If you're in crisis, please contact a crisis hotline or emergency services immediately.";
        }

        // Store AI response
        const aiMessageId = uuidv4();
        const aiTimestamp = new Date().toISOString();
        
        await db.run(
            `INSERT INTO messages (id, session_id, content, sender, timestamp, empathy_score)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [aiMessageId, sessionId, aiResponse, 'assistant', aiTimestamp, 0.8] // Default empathy score
        );

        // Update session last activity
        await db.run(
            'UPDATE sessions SET last_activity = ?, updated_at = ? WHERE id = ?',
            [aiTimestamp, aiTimestamp, sessionId]
        );

        // Return the conversation
        res.json({
            success: true,
            conversation: {
                userMessage: {
                    id: userMessageId,
                    content: message,
                    sender: 'user',
                    timestamp: timestamp
                },
                aiResponse: {
                    id: aiMessageId,
                    content: aiResponse,
                    sender: 'assistant',
                    timestamp: aiTimestamp
                }
            },
            sessionId
        });

    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process message'
        });
    }
});

// Get conversation history
router.get('/:sessionId/history', async (req: express.Request, res: express.Response) => {
    try {
        const { sessionId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        const db = Database.getInstance();

        // Verify session exists
        const session = await db.get('SELECT id FROM sessions WHERE id = ?', [sessionId]);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        const messages = await db.all<Message>(
            `SELECT * FROM messages 
             WHERE session_id = ? 
             ORDER BY timestamp ASC 
             LIMIT ? OFFSET ?`,
            [sessionId, Number(limit), Number(offset)]
        );

        res.json({
            success: true,
            messages,
            sessionId,
            total: messages.length
        });

    } catch (error) {
        console.error('Error getting conversation history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get conversation history'
        });
    }
});

// Test Ollama connection
router.get('/test-ollama', async (req: express.Request, res: express.Response) => {
    try {
        const ollamaService = new OllamaService();
        
        const isHealthy = await ollamaService.checkHealth();
        if (!isHealthy) {
            return res.status(503).json({
                success: false,
                error: 'Ollama service is not available'
            });
        }

        const models = await ollamaService.listModels();
        const testPrompt = "Hello, this is a test message.";
        
        let testResponse: string;
        try {
            testResponse = await ollamaService.generateResponse(testPrompt);
        } catch (error) {
            return res.status(503).json({
                success: false,
                error: 'Failed to generate test response',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }

        res.json({
            success: true,
            ollama: {
                healthy: true,
                currentModel: ollamaService.getModel(),
                availableModels: models,
                testResponse: testResponse
            }
        });

    } catch (error) {
        console.error('Error testing Ollama:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test Ollama connection'
        });
    }
});

export { router as conversationRoutes };