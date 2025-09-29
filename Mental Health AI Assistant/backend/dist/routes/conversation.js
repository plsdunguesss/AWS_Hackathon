"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const sessionService_1 = require("../services/sessionService");
const conversationService_1 = require("../services/conversationService");
const ollamaService_1 = require("../services/ollamaService");
const router = express_1.default.Router();
exports.conversationRoutes = router;
const sessionService = sessionService_1.SessionService.getInstance();
const conversationService = new conversationService_1.ConversationService();
// Validation middleware
const validateMessage = [
    (0, express_validator_1.body)('sessionId').isUUID().withMessage('Valid session ID is required'),
    (0, express_validator_1.body)('message').isString().isLength({ min: 1, max: 5000 }).withMessage('Message must be between 1 and 5000 characters'),
];
// Send message and get AI response
router.post('/message', validateMessage, async (req, res) => {
    try {
        // Check validation results
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { sessionId, message } = req.body;
        // Verify session exists and get conversation context
        const context = await sessionService.getConversationContext(sessionId);
        // Store user message
        const userMessage = await sessionService.storeMessage(sessionId, message, 'user');
        // Process message with AI and safety monitoring
        const aiResponse = await conversationService.processMessage(sessionId, message, context);
        // Store AI response with empathy score
        const assistantMessage = await sessionService.storeMessage(sessionId, aiResponse.content, 'assistant', aiResponse.empathyScore);
        // Store risk assessment
        await sessionService.storeRiskAssessment(sessionId, aiResponse.riskAssessment, assistantMessage.id);
        // Update session risk score if needed
        if (aiResponse.riskAssessment.overallRisk > context.currentRiskScore) {
            await sessionService.updateRiskScore(sessionId, aiResponse.riskAssessment.overallRisk / 100, // Convert to 0-1 scale
            aiResponse.requiresReferral);
        }
        // Return the conversation
        res.json({
            success: true,
            conversation: {
                userMessage: {
                    id: userMessage.id,
                    content: userMessage.content,
                    sender: userMessage.sender,
                    timestamp: userMessage.timestamp
                },
                aiResponse: {
                    id: assistantMessage.id,
                    content: assistantMessage.content,
                    sender: assistantMessage.sender,
                    timestamp: assistantMessage.timestamp,
                    empathyScore: assistantMessage.empathyScore
                }
            },
            riskAssessment: aiResponse.riskAssessment,
            safetyFlags: aiResponse.safetyFlags,
            requiresReferral: aiResponse.requiresReferral,
            sessionId
        });
    }
    catch (error) {
        console.error('Error processing message:', error);
        if (error instanceof Error && error.message === 'Session not found') {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to process message'
        });
    }
});
// Get conversation history
router.get('/:sessionId/history', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        const messages = await sessionService.getConversationHistory(sessionId, Number(limit), Number(offset));
        res.json({
            success: true,
            messages,
            sessionId,
            total: messages.length
        });
    }
    catch (error) {
        console.error('Error getting conversation history:', error);
        if (error instanceof Error && error.message === 'Session not found') {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to get conversation history'
        });
    }
});
// Test Ollama connection
router.get('/test-ollama', async (req, res) => {
    try {
        const ollamaService = new ollamaService_1.OllamaService();
        const isHealthy = await ollamaService.checkHealth();
        if (!isHealthy) {
            return res.status(503).json({
                success: false,
                error: 'Ollama service is not available'
            });
        }
        const models = await ollamaService.listModels();
        const testPrompt = "Hello, this is a test message.";
        let testResponse;
        try {
            testResponse = await ollamaService.generateResponse(testPrompt);
        }
        catch (error) {
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
    }
    catch (error) {
        console.error('Error testing Ollama:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test Ollama connection'
        });
    }
});
//# sourceMappingURL=conversation.js.map