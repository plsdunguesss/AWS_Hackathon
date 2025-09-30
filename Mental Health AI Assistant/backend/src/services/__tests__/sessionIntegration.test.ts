import { SessionService } from '../sessionService';
import { Database } from '../../database/database';
import { RiskScore } from '../../types';
import fs from 'fs';
import path from 'path';

describe('SessionService Integration Tests', () => {
    let sessionService: SessionService;
    let db: Database;
    const testDbPath = path.join(__dirname, '../../../data/test_mental_health_assistant.db');

    beforeAll(async () => {
        // Create test database
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
        
        // Initialize database with test path
        db = Database.getInstance();
        await db.initialize();
        
        sessionService = SessionService.getInstance();
    });

    afterAll(async () => {
        await db.close();
        // Clean up test database
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    beforeEach(async () => {
        // Clean up any existing data
        await db.run('DELETE FROM sessions');
        await db.run('DELETE FROM messages');
        await db.run('DELETE FROM risk_assessments');
    });

    describe('Complete Session Workflow', () => {
        it('should handle complete session lifecycle', async () => {
            // 1. Create a new session
            const session = await sessionService.createSession();
            expect(session.id).toBeDefined();
            expect(session.riskScore).toBe(0.0);
            expect(session.referralTriggered).toBe(false);

            // 2. Store user message
            const userMessage = await sessionService.storeMessage(
                session.id,
                'I have been feeling really sad lately',
                'user'
            );
            expect(userMessage.content).toBe('I have been feeling really sad lately');
            expect(userMessage.sender).toBe('user');

            // 3. Store AI response
            const aiMessage = await sessionService.storeMessage(
                session.id,
                'I hear that you\'ve been feeling sad. That sounds really difficult. Can you tell me more about what\'s been going on?',
                'assistant',
                0.85
            );
            expect(aiMessage.empathyScore).toBe(0.85);

            // 4. Store risk assessment
            const riskScore: RiskScore = {
                overallRisk: 45,
                indicators: {
                    depressionMarkers: 0.6,
                    anxietyMarkers: 0.3,
                    selfHarmRisk: 0.1,
                    suicidalIdeation: 0.0,
                    socialIsolation: 0.4
                },
                confidence: 0.75,
                recommendsProfessionalHelp: false
            };

            await sessionService.storeRiskAssessment(session.id, riskScore, aiMessage.id);

            // 5. Update session risk score
            const updatedSession = await sessionService.updateRiskScore(session.id, 0.45, false);
            expect(updatedSession.riskScore).toBe(0.45);

            // 6. Get conversation history
            const history = await sessionService.getConversationHistory(session.id);
            expect(history).toHaveLength(2);
            expect(history[0].sender).toBe('user');
            expect(history[1].sender).toBe('assistant');

            // 7. Get conversation context
            const context = await sessionService.getConversationContext(session.id);
            expect(context.sessionId).toBe(session.id);
            expect(context.messageHistory).toHaveLength(2);
            expect(context.currentRiskScore).toBe(0.45);

            // 8. Get latest risk assessment
            const latestRisk = await sessionService.getLatestRiskAssessment(session.id);
            expect(latestRisk).toBeDefined();
            expect(latestRisk!.overallRisk).toBe(45);
            expect(latestRisk!.depressionMarkers).toBe(0.6);
        });

        it('should handle high-risk scenario with referral', async () => {
            // Create session
            const session = await sessionService.createSession();

            // Store concerning message
            const userMessage = await sessionService.storeMessage(
                session.id,
                'I don\'t want to live anymore and I\'ve been thinking about ending it all',
                'user'
            );

            // Store crisis response
            const aiMessage = await sessionService.storeMessage(
                session.id,
                'I\'m very concerned about what you\'ve shared. Your safety is important. Please reach out to a crisis helpline immediately.',
                'assistant',
                0.9
            );

            // Store high-risk assessment
            const highRiskScore: RiskScore = {
                overallRisk: 95,
                indicators: {
                    depressionMarkers: 0.9,
                    anxietyMarkers: 0.7,
                    selfHarmRisk: 0.8,
                    suicidalIdeation: 0.95,
                    socialIsolation: 0.6
                },
                confidence: 0.9,
                recommendsProfessionalHelp: true
            };

            await sessionService.storeRiskAssessment(session.id, highRiskScore, aiMessage.id);

            // Update session with high risk and referral
            const updatedSession = await sessionService.updateRiskScore(session.id, 0.95, true);
            expect(updatedSession.riskScore).toBe(0.95);
            expect(updatedSession.referralTriggered).toBe(true);

            // Verify risk assessment
            const latestRisk = await sessionService.getLatestRiskAssessment(session.id);
            expect(latestRisk!.recommendsProfessionalHelp).toBe(true);
            expect(latestRisk!.suicidalIdeation).toBe(0.95);
        });

        it('should handle session cleanup', async () => {
            // Create multiple sessions
            const session1 = await sessionService.createSession();
            const session2 = await sessionService.createSession();
            const session3 = await sessionService.createSession();

            // Add messages to sessions
            await sessionService.storeMessage(session1.id, 'Hello', 'user');
            await sessionService.storeMessage(session2.id, 'Hi there', 'user');
            await sessionService.storeMessage(session3.id, 'Good morning', 'user');

            // Manually update one session to be old (simulate old session)
            const oldTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago
            await db.run(
                'UPDATE sessions SET last_activity = ? WHERE id = ?',
                [oldTime, session1.id]
            );

            // Run cleanup (should remove sessions older than 24 hours)
            const cleanedCount = await sessionService.cleanupOldSessions(24);
            expect(cleanedCount).toBe(1);

            // Verify session1 is gone, but session2 and session3 remain
            const remainingSession1 = await sessionService.getSession(session1.id);
            const remainingSession2 = await sessionService.getSession(session2.id);
            const remainingSession3 = await sessionService.getSession(session3.id);

            expect(remainingSession1).toBeNull();
            expect(remainingSession2).toBeDefined();
            expect(remainingSession3).toBeDefined();
        });

        it('should provide accurate session statistics', async () => {
            // Create sessions with different risk levels
            const lowRiskSession = await sessionService.createSession();
            const mediumRiskSession = await sessionService.createSession();
            const highRiskSession = await sessionService.createSession();

            // Update risk scores
            await sessionService.updateRiskScore(lowRiskSession.id, 0.2, false);
            await sessionService.updateRiskScore(mediumRiskSession.id, 0.6, false);
            await sessionService.updateRiskScore(highRiskSession.id, 0.9, true);

            // Get statistics
            const stats = await sessionService.getSessionStats();

            expect(stats.totalSessions).toBe(3);
            expect(stats.highRiskSessions).toBe(1); // >= 0.85
            expect(stats.referralTriggeredSessions).toBe(1);
            expect(stats.averageRiskScore).toBeCloseTo(0.567, 2); // (0.2 + 0.6 + 0.9) / 3
        });
    });

    describe('Error Handling', () => {
        it('should handle non-existent session gracefully', async () => {
            const nonExistentId = 'non-existent-session-id';

            await expect(sessionService.getConversationHistory(nonExistentId))
                .rejects.toThrow('Session not found');

            await expect(sessionService.getConversationContext(nonExistentId))
                .rejects.toThrow('Session not found');

            const session = await sessionService.getSession(nonExistentId);
            expect(session).toBeNull();
        });

        it('should validate risk score bounds', async () => {
            const session = await sessionService.createSession();

            await expect(sessionService.updateRiskScore(session.id, -0.1))
                .rejects.toThrow('Risk score must be between 0 and 1');

            await expect(sessionService.updateRiskScore(session.id, 1.1))
                .rejects.toThrow('Risk score must be between 0 and 1');
        });
    });
});