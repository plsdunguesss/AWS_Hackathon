import { ConversationService } from '../conversationService';
import { SafetyMonitorService } from '../safetyMonitorService';
import { OllamaService } from '../ollamaService';
import { ConversationContext, Message } from '../../types';

// Mock the dependencies
jest.mock('../ollamaService');
jest.mock('../safetyMonitorService');

describe('ConversationService', () => {
    let conversationService: ConversationService;
    let mockOllamaService: jest.Mocked<OllamaService>;
    let mockSafetyMonitor: jest.Mocked<SafetyMonitorService>;

    beforeEach(() => {
        mockOllamaService = new OllamaService() as jest.Mocked<OllamaService>;
        mockSafetyMonitor = new SafetyMonitorService() as jest.Mocked<SafetyMonitorService>;
        
        conversationService = new ConversationService(mockOllamaService, mockSafetyMonitor);
    });

    describe('processMessage', () => {
        const mockContext: ConversationContext = {
            sessionId: 'test-session',
            messageHistory: [],
            currentRiskScore: 0.2,
            userGoals: ['reduce anxiety']
        };

        it('should process a normal message successfully', async () => {
            // Arrange
            const userMessage = 'I feel anxious about work';
            mockSafetyMonitor.scanForHarmfulContent.mockResolvedValue({
                containsHarmfulContent: false,
                riskLevel: 'low',
                flaggedTerms: [],
                requiresIntervention: false
            });
            mockOllamaService.generateResponse.mockResolvedValue('I understand that work can be stressful. Can you tell me more about what specifically is making you feel anxious?');
            mockSafetyMonitor.preventHarmfulSuggestions.mockResolvedValue('I understand that work can be stressful. Can you tell me more about what specifically is making you feel anxious?');

            // Act
            const result = await conversationService.processMessage('user1', userMessage, mockContext);

            // Assert
            expect(result).toBeDefined();
            expect(result.content).toContain('understand');
            expect(result.empathyScore).toBeGreaterThan(0);
            expect(result.riskAssessment).toBeDefined();
            expect(result.safetyFlags).toBeDefined();
            expect(mockSafetyMonitor.scanForHarmfulContent).toHaveBeenCalledWith(userMessage);
            expect(mockSafetyMonitor.preventHarmfulSuggestions).toHaveBeenCalled();
        });

        it('should handle crisis-level content appropriately', async () => {
            // Arrange
            const crisisMessage = 'I want to kill myself';
            mockSafetyMonitor.scanForHarmfulContent.mockResolvedValue({
                containsHarmfulContent: true,
                riskLevel: 'crisis',
                flaggedTerms: ['kill myself'],
                requiresIntervention: true
            });

            // Act
            const result = await conversationService.processMessage('user1', crisisMessage, mockContext);

            // Assert
            expect(result.content).toContain('concerned');
            expect(result.content).toContain('988');
            expect(result.requiresReferral).toBe(true);
            expect(result.riskAssessment.recommendsProfessionalHelp).toBe(true);
        });

        it('should return fallback response on error', async () => {
            // Arrange
            const userMessage = 'I feel sad';
            mockSafetyMonitor.scanForHarmfulContent.mockRejectedValue(new Error('Service error'));

            // Act
            const result = await conversationService.processMessage('user1', userMessage, mockContext);

            // Assert
            expect(result.content).toContain('here to listen');
            expect(result.empathyScore).toBe(0.7);
        });
    });

    describe('generateEmpathicResponse', () => {
        it('should generate empathetic response using counseling techniques', async () => {
            // Arrange
            const userMessage = 'I feel overwhelmed';
            const context: ConversationContext = {
                sessionId: 'test-session',
                messageHistory: [],
                currentRiskScore: 0.3
            };
            mockOllamaService.generateResponse.mockResolvedValue('I hear that you\'re feeling overwhelmed. That sounds really difficult. Can you tell me more about what\'s contributing to these feelings?');

            // Act
            const result = await conversationService.generateEmpathicResponse(userMessage, context);

            // Assert
            expect(result).toContain('overwhelmed');
            expect(mockOllamaService.generateResponse).toHaveBeenCalled();
        });
    });

    describe('applyCounselingTechniques', () => {
        it('should create appropriate prompt for anxiety content', () => {
            // Arrange
            const message = 'I feel anxious all the time';
            const context: ConversationContext = {
                sessionId: 'test-session',
                messageHistory: [],
                currentRiskScore: 0.4,
                userGoals: ['manage anxiety']
            };

            // Act
            const prompt = conversationService.applyCounselingTechniques(message, context);

            // Assert
            expect(prompt).toContain('anxiety');
            expect(prompt).toContain('USER MESSAGE');
            expect(prompt).toContain('manage anxiety');
        });

        it('should include conversation history in prompt', () => {
            // Arrange
            const message = 'How can I cope better?';
            const previousMessages: Message[] = [
                {
                    id: '1',
                    sessionId: 'test-session',
                    content: 'I feel stressed',
                    sender: 'user',
                    timestamp: new Date(),
                    empathyScore: 0
                },
                {
                    id: '2',
                    sessionId: 'test-session',
                    content: 'I understand that stress can be overwhelming',
                    sender: 'assistant',
                    timestamp: new Date(),
                    empathyScore: 0.8
                }
            ];
            const context: ConversationContext = {
                sessionId: 'test-session',
                messageHistory: previousMessages,
                currentRiskScore: 0.3
            };

            // Act
            const prompt = conversationService.applyCounselingTechniques(message, context);

            // Assert
            expect(prompt).toContain('CONVERSATION CONTEXT');
            expect(prompt).toContain('I feel stressed');
        });
    });

    describe('calculateEmpathyScore', () => {
        it('should give high score for empathetic language', () => {
            // Arrange
            const empathicResponse = 'I understand how you feel. That sounds really difficult. You\'re not alone in this.';

            // Act
            const score = (conversationService as any).calculateEmpathyScore(empathicResponse);

            // Assert
            expect(score).toBeGreaterThan(0.7);
        });

        it('should give low score for directive language', () => {
            // Arrange
            const directiveResponse = 'You should just get over it and move on.';

            // Act
            const score = (conversationService as any).calculateEmpathyScore(directiveResponse);

            // Assert
            expect(score).toBeLessThan(0.5);
        });
    });

    describe('risk assessment methods', () => {
        it('should detect depression markers', () => {
            // Arrange
            const depressiveMessage = 'I feel hopeless and worthless all the time';

            // Act
            const score = (conversationService as any).assessDepressionMarkers(depressiveMessage);

            // Assert
            expect(score).toBeGreaterThan(0);
        });

        it('should detect anxiety markers', () => {
            // Arrange
            const anxiousMessage = 'I\'m constantly worried and panicking about everything';

            // Act
            const score = (conversationService as any).assessAnxietyMarkers(anxiousMessage);

            // Assert
            expect(score).toBeGreaterThan(0);
        });

        it('should detect self-harm risk', () => {
            // Arrange
            const selfHarmMessage = 'I want to hurt myself';

            // Act
            const score = (conversationService as any).assessSelfHarmRisk(selfHarmMessage);

            // Assert
            expect(score).toBeGreaterThan(0);
        });

        it('should detect suicidal ideation', () => {
            // Arrange
            const suicidalMessage = 'I want to kill myself';

            // Act
            const score = (conversationService as any).assessSuicidalIdeation(suicidalMessage);

            // Assert
            expect(score).toBeGreaterThan(0);
        });
    });
});