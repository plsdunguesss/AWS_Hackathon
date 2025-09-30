"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database/database");
class SessionService {
    constructor() {
        this.db = database_1.Database.getInstance();
    }
    static getInstance() {
        if (!SessionService.instance) {
            SessionService.instance = new SessionService();
        }
        return SessionService.instance;
    }
    /**
     * Create a new user session
     */
    async createSession() {
        const sessionId = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        await this.db.run(`INSERT INTO sessions (id, start_time, last_activity, risk_score, referral_triggered, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`, [sessionId, now, now, 0.0, false, now, now]);
        const session = await this.db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
        if (!session) {
            throw new Error('Failed to create session');
        }
        return this.mapSessionFromDb(session);
    }
    /**
     * Get session by ID and update last activity
     */
    async getSession(sessionId) {
        const session = await this.db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
        if (!session) {
            return null;
        }
        // Update last activity
        await this.updateLastActivity(sessionId);
        return this.mapSessionFromDb(session);
    }
    /**
     * Update session's last activity timestamp
     */
    async updateLastActivity(sessionId) {
        const now = new Date().toISOString();
        await this.db.run('UPDATE sessions SET last_activity = ?, updated_at = ? WHERE id = ?', [now, now, sessionId]);
    }
    /**
     * Update session risk score and referral status
     */
    async updateRiskScore(sessionId, riskScore, referralTriggered = false) {
        if (riskScore < 0 || riskScore > 1) {
            throw new Error('Risk score must be between 0 and 1');
        }
        const now = new Date().toISOString();
        await this.db.run(`UPDATE sessions 
             SET risk_score = ?, referral_triggered = ?, last_activity = ?, updated_at = ?
             WHERE id = ?`, [riskScore, referralTriggered, now, now, sessionId]);
        const updatedSession = await this.db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
        if (!updatedSession) {
            throw new Error('Session not found');
        }
        return this.mapSessionFromDb(updatedSession);
    }
    /**
     * Store a message in the conversation history
     */
    async storeMessage(sessionId, content, sender, empathyScore = 0.0) {
        const messageId = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        await this.db.run(`INSERT INTO messages (id, session_id, content, sender, timestamp, empathy_score)
             VALUES (?, ?, ?, ?, ?, ?)`, [messageId, sessionId, content, sender, now, empathyScore]);
        const message = await this.db.get('SELECT * FROM messages WHERE id = ?', [messageId]);
        if (!message) {
            throw new Error('Failed to store message');
        }
        // Update session last activity
        await this.updateLastActivity(sessionId);
        return this.mapMessageFromDb(message);
    }
    /**
     * Get conversation history for a session
     */
    async getConversationHistory(sessionId, limit = 50, offset = 0) {
        // Verify session exists
        const session = await this.db.get('SELECT id FROM sessions WHERE id = ?', [sessionId]);
        if (!session) {
            throw new Error('Session not found');
        }
        const messages = await this.db.all(`SELECT * FROM messages 
             WHERE session_id = ? 
             ORDER BY timestamp ASC 
             LIMIT ? OFFSET ?`, [sessionId, limit, offset]);
        return messages.map(msg => this.mapMessageFromDb(msg));
    }
    /**
     * Get conversation context for AI processing
     */
    async getConversationContext(sessionId) {
        const session = await this.getSession(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        const messageHistory = await this.getConversationHistory(sessionId);
        return {
            sessionId,
            messageHistory,
            currentRiskScore: session.riskScore
        };
    }
    /**
     * Store risk assessment for a session/message
     */
    async storeRiskAssessment(sessionId, riskScore, messageId) {
        const assessmentId = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        await this.db.run(`INSERT INTO risk_assessments (
                id, session_id, message_id, overall_risk, depression_markers,
                anxiety_markers, self_harm_risk, suicidal_ideation, social_isolation,
                confidence, recommends_professional_help, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            assessmentId, sessionId, messageId, riskScore.overallRisk,
            riskScore.indicators.depressionMarkers, riskScore.indicators.anxietyMarkers,
            riskScore.indicators.selfHarmRisk, riskScore.indicators.suicidalIdeation,
            riskScore.indicators.socialIsolation, riskScore.confidence,
            riskScore.recommendsProfessionalHelp, now
        ]);
        // Update session risk score if this is higher
        if (riskScore.overallRisk > 0) {
            const currentSession = await this.getSession(sessionId);
            const normalizedRiskScore = riskScore.overallRisk / 100; // Convert 0-100 to 0-1 scale
            if (currentSession && normalizedRiskScore > currentSession.riskScore) {
                await this.updateRiskScore(sessionId, normalizedRiskScore, riskScore.recommendsProfessionalHelp);
            }
        }
    }
    /**
     * Get latest risk assessment for a session
     */
    async getLatestRiskAssessment(sessionId) {
        const assessment = await this.db.get(`SELECT * FROM risk_assessments 
             WHERE session_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1`, [sessionId]);
        if (!assessment) {
            return null;
        }
        return this.mapRiskAssessmentFromDb(assessment);
    }
    /**
     * Delete a session and all associated data
     */
    async deleteSession(sessionId) {
        const result = await this.db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
        return result.changes > 0;
    }
    /**
     * Clean up old sessions based on last activity
     */
    async cleanupOldSessions(hoursOld = 24) {
        const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000).toISOString();
        const result = await this.db.run('DELETE FROM sessions WHERE last_activity < ?', [cutoffTime]);
        return result.changes || 0;
    }
    /**
     * Get active sessions count
     */
    async getActiveSessionsCount(hoursActive = 1) {
        const cutoffTime = new Date(Date.now() - hoursActive * 60 * 60 * 1000).toISOString();
        const result = await this.db.get('SELECT COUNT(*) as count FROM sessions WHERE last_activity > ?', [cutoffTime]);
        return result?.count || 0;
    }
    /**
     * Get session statistics
     */
    async getSessionStats() {
        const [total, active, avgRisk, highRisk, referrals] = await Promise.all([
            this.db.get('SELECT COUNT(*) as count FROM sessions'),
            this.getActiveSessionsCount(24), // Active in last 24 hours
            this.db.get('SELECT AVG(risk_score) as avg FROM sessions'),
            this.db.get('SELECT COUNT(*) as count FROM sessions WHERE risk_score >= 0.85'),
            this.db.get('SELECT COUNT(*) as count FROM sessions WHERE referral_triggered = TRUE')
        ]);
        return {
            totalSessions: total?.count || 0,
            activeSessions: active,
            averageRiskScore: avgRisk?.avg || 0,
            highRiskSessions: highRisk?.count || 0,
            referralTriggeredSessions: referrals?.count || 0
        };
    }
    /**
     * Schedule automatic cleanup (should be called periodically)
     */
    startAutomaticCleanup(intervalHours = 6, cleanupAfterHours = 24) {
        setInterval(async () => {
            try {
                const deletedCount = await this.cleanupOldSessions(cleanupAfterHours);
                if (deletedCount > 0) {
                    console.log(`Cleaned up ${deletedCount} old sessions`);
                }
            }
            catch (error) {
                console.error('Error during automatic session cleanup:', error);
            }
        }, intervalHours * 60 * 60 * 1000);
    }
    // Helper methods for mapping database results to TypeScript interfaces
    mapSessionFromDb(dbSession) {
        return {
            id: dbSession.id,
            startTime: new Date(dbSession.start_time),
            lastActivity: new Date(dbSession.last_activity),
            riskScore: dbSession.risk_score,
            referralTriggered: Boolean(dbSession.referral_triggered),
            createdAt: new Date(dbSession.created_at),
            updatedAt: new Date(dbSession.updated_at)
        };
    }
    mapMessageFromDb(dbMessage) {
        return {
            id: dbMessage.id,
            sessionId: dbMessage.session_id,
            content: dbMessage.content,
            sender: dbMessage.sender,
            timestamp: new Date(dbMessage.timestamp),
            empathyScore: dbMessage.empathy_score
        };
    }
    mapRiskAssessmentFromDb(dbAssessment) {
        return {
            id: dbAssessment.id,
            sessionId: dbAssessment.session_id,
            messageId: dbAssessment.message_id,
            overallRisk: dbAssessment.overall_risk,
            depressionMarkers: dbAssessment.depression_markers,
            anxietyMarkers: dbAssessment.anxiety_markers,
            selfHarmRisk: dbAssessment.self_harm_risk,
            suicidalIdeation: dbAssessment.suicidal_ideation,
            socialIsolation: dbAssessment.social_isolation,
            confidence: dbAssessment.confidence,
            recommendsProfessionalHelp: Boolean(dbAssessment.recommends_professional_help),
            createdAt: new Date(dbAssessment.created_at)
        };
    }
}
exports.SessionService = SessionService;
exports.default = SessionService;
//# sourceMappingURL=sessionService.js.map