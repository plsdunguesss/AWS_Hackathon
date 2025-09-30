import { v4 as uuidv4 } from 'uuid';
import { Database } from '../database/database';
import { UserSession, Message, RiskAssessment, RiskScore, ConversationContext } from '../types';
import { DashboardService } from './dashboardService';

export class SessionService {
    private db: Database;
    private static instance: SessionService;

    private constructor() {
        this.db = Database.getInstance();
    }

    public static getInstance(): SessionService {
        if (!SessionService.instance) {
            SessionService.instance = new SessionService();
        }
        return SessionService.instance;
    }

    /**
     * Create a new user session
     */
    public async createSession(): Promise<UserSession> {
        const sessionId = uuidv4();
        const now = new Date().toISOString();
        
        await this.db.run(
            `INSERT INTO sessions (id, start_time, last_activity, risk_score, referral_triggered, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [sessionId, now, now, 0.0, false, now, now]
        );
        
        const session = await this.db.get<UserSession>(
            'SELECT * FROM sessions WHERE id = ?',
            [sessionId]
        );
        
        if (!session) {
            throw new Error('Failed to create session');
        }

        // Initialize default tasks for the new session
        try {
            const dashboardService = DashboardService.getInstance();
            await dashboardService.initializeDefaultTasks(sessionId);
        } catch (error) {
            console.warn('Failed to initialize default tasks for session:', sessionId, error);
            // Don't fail session creation if task initialization fails
        }
        
        return this.mapSessionFromDb(session);
    }

    /**
     * Get session by ID and update last activity
     */
    public async getSession(sessionId: string): Promise<UserSession | null> {
        const session = await this.db.get<any>(
            'SELECT * FROM sessions WHERE id = ?',
            [sessionId]
        );
        
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
    public async updateLastActivity(sessionId: string): Promise<void> {
        const now = new Date().toISOString();
        await this.db.run(
            'UPDATE sessions SET last_activity = ?, updated_at = ? WHERE id = ?',
            [now, now, sessionId]
        );
    }

    /**
     * Update session risk score and referral status
     */
    public async updateRiskScore(
        sessionId: string, 
        riskScore: number, 
        referralTriggered: boolean = false
    ): Promise<UserSession> {
        if (riskScore < 0 || riskScore > 1) {
            throw new Error('Risk score must be between 0 and 1');
        }
        
        const now = new Date().toISOString();
        await this.db.run(
            `UPDATE sessions 
             SET risk_score = ?, referral_triggered = ?, last_activity = ?, updated_at = ?
             WHERE id = ?`,
            [riskScore, referralTriggered, now, now, sessionId]
        );
        
        const updatedSession = await this.db.get<any>(
            'SELECT * FROM sessions WHERE id = ?',
            [sessionId]
        );
        
        if (!updatedSession) {
            throw new Error('Session not found');
        }
        
        return this.mapSessionFromDb(updatedSession);
    }

    /**
     * Store a message in the conversation history
     */
    public async storeMessage(
        sessionId: string,
        content: string,
        sender: 'user' | 'assistant',
        empathyScore: number = 0.0
    ): Promise<Message> {
        const messageId = uuidv4();
        const now = new Date().toISOString();
        
        await this.db.run(
            `INSERT INTO messages (id, session_id, content, sender, timestamp, empathy_score)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [messageId, sessionId, content, sender, now, empathyScore]
        );
        
        const message = await this.db.get<any>(
            'SELECT * FROM messages WHERE id = ?',
            [messageId]
        );
        
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
    public async getConversationHistory(
        sessionId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<Message[]> {
        // Verify session exists
        const session = await this.db.get('SELECT id FROM sessions WHERE id = ?', [sessionId]);
        if (!session) {
            throw new Error('Session not found');
        }
        
        const messages = await this.db.all<any>(
            `SELECT * FROM messages 
             WHERE session_id = ? 
             ORDER BY timestamp ASC 
             LIMIT ? OFFSET ?`,
            [sessionId, limit, offset]
        );
        
        return messages.map(msg => this.mapMessageFromDb(msg));
    }

    /**
     * Get conversation context for AI processing
     */
    public async getConversationContext(sessionId: string): Promise<ConversationContext> {
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
    public async storeRiskAssessment(
        sessionId: string,
        riskScore: RiskScore,
        messageId?: string
    ): Promise<void> {
        const assessmentId = uuidv4();
        const now = new Date().toISOString();
        
        await this.db.run(
            `INSERT INTO risk_assessments (
                id, session_id, message_id, overall_risk, depression_markers,
                anxiety_markers, self_harm_risk, suicidal_ideation, social_isolation,
                confidence, recommends_professional_help, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                assessmentId, sessionId, messageId, riskScore.overallRisk,
                riskScore.indicators.depressionMarkers, riskScore.indicators.anxietyMarkers,
                riskScore.indicators.selfHarmRisk, riskScore.indicators.suicidalIdeation,
                riskScore.indicators.socialIsolation, riskScore.confidence,
                riskScore.recommendsProfessionalHelp, now
            ]
        );
        
        // Update session risk score if this is higher
        if (riskScore.overallRisk > 0) {
            const currentSession = await this.getSession(sessionId);
            const normalizedRiskScore = riskScore.overallRisk / 100; // Convert 0-100 to 0-1 scale
            if (currentSession && normalizedRiskScore > currentSession.riskScore) {
                await this.updateRiskScore(
                    sessionId, 
                    normalizedRiskScore, 
                    riskScore.recommendsProfessionalHelp
                );
            }
        }
    }

    /**
     * Get latest risk assessment for a session
     */
    public async getLatestRiskAssessment(sessionId: string): Promise<RiskAssessment | null> {
        const assessment = await this.db.get<any>(
            `SELECT * FROM risk_assessments 
             WHERE session_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [sessionId]
        );
        
        if (!assessment) {
            return null;
        }
        
        return this.mapRiskAssessmentFromDb(assessment);
    }

    /**
     * Delete a session and all associated data
     */
    public async deleteSession(sessionId: string): Promise<boolean> {
        const result = await this.db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
        return result.changes > 0;
    }

    /**
     * Clean up old sessions based on last activity
     */
    public async cleanupOldSessions(hoursOld: number = 24): Promise<number> {
        const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000).toISOString();
        const result = await this.db.run(
            'DELETE FROM sessions WHERE last_activity < ?',
            [cutoffTime]
        );
        return result.changes || 0;
    }

    /**
     * Get active sessions count
     */
    public async getActiveSessionsCount(hoursActive: number = 1): Promise<number> {
        const cutoffTime = new Date(Date.now() - hoursActive * 60 * 60 * 1000).toISOString();
        const result = await this.db.get<{ count: number }>(
            'SELECT COUNT(*) as count FROM sessions WHERE last_activity > ?',
            [cutoffTime]
        );
        return result?.count || 0;
    }

    /**
     * Get session statistics
     */
    public async getSessionStats(): Promise<{
        totalSessions: number;
        activeSessions: number;
        averageRiskScore: number;
        highRiskSessions: number;
        referralTriggeredSessions: number;
    }> {
        const [total, active, avgRisk, highRisk, referrals] = await Promise.all([
            this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM sessions'),
            this.getActiveSessionsCount(24), // Active in last 24 hours
            this.db.get<{ avg: number }>('SELECT AVG(risk_score) as avg FROM sessions'),
            this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM sessions WHERE risk_score >= 0.85'),
            this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM sessions WHERE referral_triggered = TRUE')
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
    public startAutomaticCleanup(intervalHours: number = 6, cleanupAfterHours: number = 24): void {
        setInterval(async () => {
            try {
                const deletedCount = await this.cleanupOldSessions(cleanupAfterHours);
                if (deletedCount > 0) {
                    console.log(`Cleaned up ${deletedCount} old sessions`);
                }
            } catch (error) {
                console.error('Error during automatic session cleanup:', error);
            }
        }, intervalHours * 60 * 60 * 1000);
    }

    // Helper methods for mapping database results to TypeScript interfaces
    private mapSessionFromDb(dbSession: any): UserSession {
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

    private mapMessageFromDb(dbMessage: any): Message {
        return {
            id: dbMessage.id,
            sessionId: dbMessage.session_id,
            content: dbMessage.content,
            sender: dbMessage.sender,
            timestamp: new Date(dbMessage.timestamp),
            empathyScore: dbMessage.empathy_score
        };
    }

    private mapRiskAssessmentFromDb(dbAssessment: any): RiskAssessment {
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

export default SessionService;