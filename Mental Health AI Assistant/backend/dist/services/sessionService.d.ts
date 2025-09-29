import { UserSession, Message, RiskAssessment, RiskScore, ConversationContext } from '../types';
export declare class SessionService {
    private db;
    private static instance;
    private constructor();
    static getInstance(): SessionService;
    /**
     * Create a new user session
     */
    createSession(): Promise<UserSession>;
    /**
     * Get session by ID and update last activity
     */
    getSession(sessionId: string): Promise<UserSession | null>;
    /**
     * Update session's last activity timestamp
     */
    updateLastActivity(sessionId: string): Promise<void>;
    /**
     * Update session risk score and referral status
     */
    updateRiskScore(sessionId: string, riskScore: number, referralTriggered?: boolean): Promise<UserSession>;
    /**
     * Store a message in the conversation history
     */
    storeMessage(sessionId: string, content: string, sender: 'user' | 'assistant', empathyScore?: number): Promise<Message>;
    /**
     * Get conversation history for a session
     */
    getConversationHistory(sessionId: string, limit?: number, offset?: number): Promise<Message[]>;
    /**
     * Get conversation context for AI processing
     */
    getConversationContext(sessionId: string): Promise<ConversationContext>;
    /**
     * Store risk assessment for a session/message
     */
    storeRiskAssessment(sessionId: string, riskScore: RiskScore, messageId?: string): Promise<void>;
    /**
     * Get latest risk assessment for a session
     */
    getLatestRiskAssessment(sessionId: string): Promise<RiskAssessment | null>;
    /**
     * Delete a session and all associated data
     */
    deleteSession(sessionId: string): Promise<boolean>;
    /**
     * Clean up old sessions based on last activity
     */
    cleanupOldSessions(hoursOld?: number): Promise<number>;
    /**
     * Get active sessions count
     */
    getActiveSessionsCount(hoursActive?: number): Promise<number>;
    /**
     * Get session statistics
     */
    getSessionStats(): Promise<{
        totalSessions: number;
        activeSessions: number;
        averageRiskScore: number;
        highRiskSessions: number;
        referralTriggeredSessions: number;
    }>;
    /**
     * Schedule automatic cleanup (should be called periodically)
     */
    startAutomaticCleanup(intervalHours?: number, cleanupAfterHours?: number): void;
    private mapSessionFromDb;
    private mapMessageFromDb;
    private mapRiskAssessmentFromDb;
}
export default SessionService;
//# sourceMappingURL=sessionService.d.ts.map