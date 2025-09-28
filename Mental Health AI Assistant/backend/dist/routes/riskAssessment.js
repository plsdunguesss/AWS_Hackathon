"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskAssessmentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
const database_1 = require("../database/database");
const router = express_1.default.Router();
exports.riskAssessmentRoutes = router;
// Basic risk assessment based on message content
class BasicRiskAssessment {
    static assessMessage(content) {
        const lowerContent = content.toLowerCase();
        // Count keyword matches
        const depressionScore = this.countKeywords(lowerContent, this.DEPRESSION_KEYWORDS) / 10;
        const anxietyScore = this.countKeywords(lowerContent, this.ANXIETY_KEYWORDS) / 10;
        const selfHarmScore = this.countKeywords(lowerContent, this.SELF_HARM_KEYWORDS) / 5;
        const suicidalScore = this.countKeywords(lowerContent, this.SUICIDAL_KEYWORDS) / 5;
        const isolationScore = this.countKeywords(lowerContent, this.ISOLATION_KEYWORDS) / 10;
        // Calculate overall risk (weighted)
        const overallRisk = Math.min(1.0, (depressionScore * 0.2) +
            (anxietyScore * 0.15) +
            (selfHarmScore * 0.3) +
            (suicidalScore * 0.4) +
            (isolationScore * 0.1));
        // Convert to percentage
        const riskPercentage = Math.round(overallRisk * 100);
        return {
            overallRisk: riskPercentage,
            indicators: {
                depressionMarkers: Math.min(100, Math.round(depressionScore * 100)),
                anxietyMarkers: Math.min(100, Math.round(anxietyScore * 100)),
                selfHarmRisk: Math.min(100, Math.round(selfHarmScore * 100)),
                suicidalIdeation: Math.min(100, Math.round(suicidalScore * 100)),
                socialIsolation: Math.min(100, Math.round(isolationScore * 100))
            },
            confidence: Math.min(1.0, overallRisk + 0.3), // Higher confidence with higher risk
            recommendsProfessionalHelp: riskPercentage >= 85
        };
    }
    static countKeywords(content, keywords) {
        return keywords.reduce((count, keyword) => {
            return count + (content.includes(keyword) ? 1 : 0);
        }, 0);
    }
}
BasicRiskAssessment.DEPRESSION_KEYWORDS = [
    'depressed', 'sad', 'hopeless', 'worthless', 'empty', 'numb', 'crying',
    'tired', 'exhausted', 'sleep', 'insomnia', 'appetite', 'weight'
];
BasicRiskAssessment.ANXIETY_KEYWORDS = [
    'anxious', 'worried', 'panic', 'fear', 'nervous', 'stress', 'overwhelmed',
    'racing thoughts', 'heart racing', 'sweating', 'trembling', 'restless'
];
BasicRiskAssessment.SELF_HARM_KEYWORDS = [
    'hurt myself', 'self harm', 'cutting', 'burning', 'hitting myself',
    'punish myself', 'deserve pain', 'self injury'
];
BasicRiskAssessment.SUICIDAL_KEYWORDS = [
    'kill myself', 'suicide', 'end it all', 'better off dead', 'not worth living',
    'want to die', 'suicidal', 'ending my life', 'take my life'
];
BasicRiskAssessment.ISOLATION_KEYWORDS = [
    'alone', 'lonely', 'isolated', 'no friends', 'nobody cares', 'abandoned',
    'rejected', 'withdrawn', 'avoiding people', 'social anxiety'
];
// Validation middleware
const validateRiskAssessment = [
    (0, express_validator_1.body)('sessionId').isUUID().withMessage('Valid session ID is required'),
    (0, express_validator_1.body)('messageId').optional().isUUID().withMessage('Message ID must be a valid UUID'),
    (0, express_validator_1.body)('content').isString().isLength({ min: 1 }).withMessage('Content is required for assessment')
];
// Assess risk for a message
router.post('/assess', validateRiskAssessment, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { sessionId, messageId, content } = req.body;
        const db = database_1.Database.getInstance();
        // Verify session exists
        const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        // Perform risk assessment
        const riskScore = BasicRiskAssessment.assessMessage(content);
        // Store risk assessment
        const assessmentId = (0, uuid_1.v4)();
        const timestamp = new Date().toISOString();
        await db.run(`INSERT INTO risk_assessments (
                id, session_id, message_id, overall_risk, depression_markers, 
                anxiety_markers, self_harm_risk, suicidal_ideation, social_isolation,
                confidence, recommends_professional_help, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            assessmentId, sessionId, messageId, riskScore.overallRisk,
            riskScore.indicators.depressionMarkers, riskScore.indicators.anxietyMarkers,
            riskScore.indicators.selfHarmRisk, riskScore.indicators.suicidalIdeation,
            riskScore.indicators.socialIsolation, riskScore.confidence,
            riskScore.recommendsProfessionalHelp, timestamp
        ]);
        // Update session risk score if this is higher
        if (riskScore.overallRisk > (session.risk_score * 100)) {
            await db.run('UPDATE sessions SET risk_score = ?, referral_triggered = ?, updated_at = ? WHERE id = ?', [riskScore.overallRisk / 100, riskScore.recommendsProfessionalHelp, timestamp, sessionId]);
        }
        res.json({
            success: true,
            assessment: {
                id: assessmentId,
                riskScore,
                timestamp,
                requiresReferral: riskScore.recommendsProfessionalHelp
            }
        });
    }
    catch (error) {
        console.error('Error performing risk assessment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform risk assessment'
        });
    }
});
// Get risk assessment history for a session
router.get('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { limit = 20, offset = 0 } = req.query;
        const db = database_1.Database.getInstance();
        // Verify session exists
        const session = await db.get('SELECT id FROM sessions WHERE id = ?', [sessionId]);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        const assessments = await db.all(`SELECT * FROM risk_assessments 
             WHERE session_id = ? 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`, [sessionId, Number(limit), Number(offset)]);
        // Get current session risk level
        const currentSession = await db.get('SELECT risk_score, referral_triggered FROM sessions WHERE id = ?', [sessionId]);
        res.json({
            success: true,
            assessments,
            currentRiskLevel: currentSession?.risk_score || 0,
            referralTriggered: currentSession?.referral_triggered || false,
            sessionId
        });
    }
    catch (error) {
        console.error('Error getting risk assessment history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get risk assessment history'
        });
    }
});
// Get latest risk assessment for a session
router.get('/session/:sessionId/latest', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const db = database_1.Database.getInstance();
        // Verify session exists
        const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        const latestAssessment = await db.get(`SELECT * FROM risk_assessments 
             WHERE session_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1`, [sessionId]);
        res.json({
            success: true,
            assessment: latestAssessment,
            currentRiskLevel: session.risk_score,
            referralTriggered: session.referral_triggered,
            sessionId
        });
    }
    catch (error) {
        console.error('Error getting latest risk assessment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get latest risk assessment'
        });
    }
});
// Test risk assessment with sample content
router.post('/test', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || typeof content !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Content is required for testing'
            });
        }
        const riskScore = BasicRiskAssessment.assessMessage(content);
        res.json({
            success: true,
            testContent: content,
            riskScore,
            interpretation: {
                riskLevel: riskScore.overallRisk < 25 ? 'low' :
                    riskScore.overallRisk < 50 ? 'moderate' :
                        riskScore.overallRisk < 75 ? 'high' : 'critical',
                requiresReferral: riskScore.recommendsProfessionalHelp,
                confidence: riskScore.confidence > 0.7 ? 'high' :
                    riskScore.confidence > 0.4 ? 'medium' : 'low'
            }
        });
    }
    catch (error) {
        console.error('Error testing risk assessment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test risk assessment'
        });
    }
});
//# sourceMappingURL=riskAssessment.js.map