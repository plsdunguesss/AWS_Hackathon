import { SessionService } from '../sessionService';
import { Database } from '../../database/database';
import { UserSession, Message, RiskScore } from '../../types';

// Mock the Database
jest.mock('../../database/database');

describe('SessionService', () => {
    let sessionService: SessionService;
    let mockDb: jest.Mocked<Database>;

    beforeEach(() => {
        // Reset the singleton instance
        (SessionService as any).instance = undefined;
        sessionService = SessionService.getInstance();
        
        // Mock database instance
        mockDb = {
            run: jest.fn(),
            get: jest.fn(),
            all: jest.fn(),
        } as any;
        
        (Database.getInstance as jest.Mock).mockReturnValue(mockDb);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createSession', () => {
        it('should create a new session successfully', async () => {
            const mockSession = {
                id: 'test-session-id',
                start_time: '2023-01-01T00:00:00.000Z',
                last_activity: '2023-01-01T00:00:00.000Z',
                risk_score: 0.0,
                referral_triggered: false,
                created_at: '2023-01-01T00:00:00.000Z',
                updated_at: '2023-01-01T00:00:00.000Z'
            };

            mockDb.run.mockResolvedValue({ changes: 1 } as any);
            mockDb.get.mockResolvedValue(mockSession);

            const result = await sessionService.createSession();

            expect(mockDb.run).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO sessions'),
                expect.arrayContaining([
                    expect.any(String), // sessionId
                    expect.any(String), // now
                    expect.any(String), // now
                    0.0, // risk_score
                    false, // referral_triggered
                    expect.any(String), // created_at
                    expect.any(String)  // updated_at
                ])
            );

            expect(result).toEqual({
                id: 'test-session-id',
                startTime: new Date('2023-01-01T00:00:00.000Z'),
                lastActivity: new Date('2023-01-01T00:00:00.000Z'),
                riskScore: 0.0,
                referralTriggered: false,
                createdAt: new Date('2023-01-01T00:00:00.000Z'),
                updatedAt: new Date('2023-01-01T00:00:00.000Z')
            });
        });

        it('should throw error if session creation fails', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 } as any);
            mockDb.get.mockResolvedValue(undefined);

            await expect(sessionService.createSession()).rejects.toThrow('Failed to create session');
        });
    });

    describe('getSession', () => {
        it('should return session and update last activity', async () => {
            const mockSession = {
                id: 'test-session-id',
                start_time: '2023-01-01T00:00:00.000Z',
                last_activity: '2023-01-01T00:00:00.000Z',
                risk_score: 0.5,
                referral_triggered: false,
                created_at: '2023-01-01T00:00:00.000Z',
                updated_at: '2023-01-01T00:00:00.000Z'
            };

            mockDb.get.mockResolvedValue(mockSession);
            mockDb.run.mockResolvedValue({ changes: 1 } as any);

            const result = await sessionService.getSession('test-session-id');

            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT * FROM sessions WHERE id = ?',
                ['test-session-id']
            );

            expect(mockDb.run).toHaveBeenCalledWith(
                'UPDATE sessions SET last_activity = ?, updated_at = ? WHERE id = ?',
                expect.arrayContaining([
                    expect.any(String), // now
                    expect.any(String), // now
                    'test-session-id'
                ])
            );

            expect(result).toEqual({
                id: 'test-session-id',
                startTime: new Date('2023-01-01T00:00:00.000Z'),
                lastActivity: new Date('2023-01-01T00:00:00.000Z'),
                riskScore: 0.5,
                referralTriggered: false,
                createdAt: new Date('2023-01-01T00:00:00.000Z'),
                updatedAt: new Date('2023-01-01T00:00:00.000Z')
            });
        });

        it('should return null if session not found', async () => {
            mockDb.get.mockResolvedValue(undefined);

            const result = await sessionService.getSession('non-existent-id');

            expect(result).toBeNull();
        });
    });

    describe('updateRiskScore', () => {
        it('should update risk score successfully', async () => {
            const mockUpdatedSession = {
                id: 'test-session-id',
                start_time: '2023-01-01T00:00:00.000Z',
                last_activity: '2023-01-01T01:00:00.000Z',
                risk_score: 0.8,
                referral_triggered: true,
                created_at: '2023-01-01T00:00:00.000Z',
                updated_at: '2023-01-01T01:00:00.000Z'
            };

            mockDb.run.mockResolvedValue({ changes: 1 } as any);
            mockDb.get.mockResolvedValue(mockUpdatedSession);

            const result = await sessionService.updateRiskScore('test-session-id', 0.8, true);

            expect(mockDb.run).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE sessions'),
                expect.arrayContaining([0.8, true, expect.any(String), expect.any(String), 'test-session-id'])
            );

            expect(result.riskScore).toBe(0.8);
            expect(result.referralTriggered).toBe(true);
        });

        it('should throw error for invalid risk score', async () => {
            await expect(sessionService.updateRiskScore('test-id', -0.1)).rejects.toThrow('Risk score must be between 0 and 1');
            await expect(sessionService.updateRiskScore('test-id', 1.1)).rejects.toThrow('Risk score must be between 0 and 1');
        });

        it('should throw error if session not found', async () => {
            mockDb.run.mockResolvedValue({ changes: 1 } as any);
            mockDb.get.mockResolvedValue(undefined);

            await expect(sessionService.updateRiskScore('non-existent-id', 0.5)).rejects.toThrow('Session not found');
        });
    });

    describe('storeMessage', () => {
        it('should store message successfully', async () => {
            const mockMessage = {
                id: 'test-message-id',
                session_id: 'test-session-id',
                content: 'Hello, I need help',
                sender: 'user',
                timestamp: '2023-01-01T00:00:00.000Z',
                empathy_score: 0.0
            };

            mockDb.run.mockResolvedValueOnce({ changes: 1 } as any); // For message insert
            mockDb.get.mockResolvedValue(mockMessage);
            mockDb.run.mockResolvedValueOnce({ changes: 1 } as any); // For last activity update

            const result = await sessionService.storeMessage('test-session-id', 'Hello, I need help', 'user', 0.0);

            expect(mockDb.run).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO messages'),
                expect.arrayContaining([
                    expect.any(String), // messageId
                    'test-session-id',
                    'Hello, I need help',
                    'user',
                    expect.any(String), // timestamp
                    0.0
                ])
            );

            expect(result).toEqual({
                id: 'test-message-id',
                sessionId: 'test-session-id',
                content: 'Hello, I need help',
                sender: 'user',
                timestamp: new Date('2023-01-01T00:00:00.000Z'),
                empathyScore: 0.0
            });
        });
    });

    describe('getConversationHistory', () => {
        it('should return conversation history', async () => {
            const mockMessages = [
                {
                    id: 'msg-1',
                    session_id: 'test-session-id',
                    content: 'Hello',
                    sender: 'user',
                    timestamp: '2023-01-01T00:00:00.000Z',
                    empathy_score: 0.0
                },
                {
                    id: 'msg-2',
                    session_id: 'test-session-id',
                    content: 'Hi there, how can I help?',
                    sender: 'assistant',
                    timestamp: '2023-01-01T00:01:00.000Z',
                    empathy_score: 0.8
                }
            ];

            mockDb.get.mockResolvedValue({ id: 'test-session-id' }); // Session exists
            mockDb.all.mockResolvedValue(mockMessages);

            const result = await sessionService.getConversationHistory('test-session-id', 50, 0);

            expect(mockDb.all).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM messages'),
                ['test-session-id', 50, 0]
            );

            expect(result).toHaveLength(2);
            expect(result[0].content).toBe('Hello');
            expect(result[1].content).toBe('Hi there, how can I help?');
        });

        it('should throw error if session not found', async () => {
            mockDb.get.mockResolvedValue(undefined);

            await expect(sessionService.getConversationHistory('non-existent-id')).rejects.toThrow('Session not found');
        });
    });

    describe('cleanupOldSessions', () => {
        it('should cleanup old sessions and return count', async () => {
            mockDb.run.mockResolvedValue({ changes: 3 } as any);

            const result = await sessionService.cleanupOldSessions(24);

            expect(mockDb.run).toHaveBeenCalledWith(
                'DELETE FROM sessions WHERE last_activity < ?',
                [expect.any(String)]
            );

            expect(result).toBe(3);
        });

        it('should return 0 if no sessions were deleted', async () => {
            mockDb.run.mockResolvedValue({ changes: 0 } as any);

            const result = await sessionService.cleanupOldSessions(24);

            expect(result).toBe(0);
        });
    });

    describe('getSessionStats', () => {
        it('should return session statistics', async () => {
            mockDb.get
                .mockResolvedValueOnce({ count: 100 }) // total sessions
                .mockResolvedValueOnce({ avg: 0.3 }) // average risk score
                .mockResolvedValueOnce({ count: 5 }) // high risk sessions
                .mockResolvedValueOnce({ count: 3 }); // referral triggered sessions

            // Mock getActiveSessionsCount
            jest.spyOn(sessionService, 'getActiveSessionsCount').mockResolvedValue(25);

            const result = await sessionService.getSessionStats();

            expect(result).toEqual({
                totalSessions: 100,
                activeSessions: 25,
                averageRiskScore: 0.3,
                highRiskSessions: 5,
                referralTriggeredSessions: 3
            });
        });
    });

    describe('storeRiskAssessment', () => {
        it('should store risk assessment and update session if higher risk', async () => {
            const mockRiskScore: RiskScore = {
                overallRisk: 0.9,
                indicators: {
                    depressionMarkers: 0.8,
                    anxietyMarkers: 0.7,
                    selfHarmRisk: 0.9,
                    suicidalIdeation: 0.8,
                    socialIsolation: 0.6
                },
                confidence: 0.85,
                recommendsProfessionalHelp: true
            };

            const mockCurrentSession = {
                id: 'test-session-id',
                start_time: '2023-01-01T00:00:00.000Z',
                last_activity: '2023-01-01T00:00:00.000Z',
                risk_score: 0.5, // Lower than new assessment
                referral_triggered: false,
                created_at: '2023-01-01T00:00:00.000Z',
                updated_at: '2023-01-01T00:00:00.000Z'
            };

            mockDb.run.mockResolvedValue({ changes: 1 } as any);
            mockDb.get.mockResolvedValue(mockCurrentSession);

            await sessionService.storeRiskAssessment('test-session-id', mockRiskScore, 'test-message-id');

            expect(mockDb.run).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO risk_assessments'),
                expect.arrayContaining([
                    expect.any(String), // assessmentId
                    'test-session-id',
                    'test-message-id',
                    0.9, // overallRisk
                    0.8, // depressionMarkers
                    0.7, // anxietyMarkers
                    0.9, // selfHarmRisk
                    0.8, // suicidalIdeation
                    0.6, // socialIsolation
                    0.85, // confidence
                    true, // recommendsProfessionalHelp
                    expect.any(String) // timestamp
                ])
            );
        });
    });
});