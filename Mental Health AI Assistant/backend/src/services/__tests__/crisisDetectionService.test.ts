import { CrisisDetectionService } from '../crisisDetectionService';
import { SafetyMonitorService } from '../safetyMonitorService';
import { SafetyFlags, CrisisResponse } from '../../types';

// Mock the SafetyMonitorService
jest.mock('../safetyMonitorService');

describe('CrisisDetectionService', () => {
    let crisisDetectionService: CrisisDetectionService;
    let mockSafetyMonitor: jest.Mocked<SafetyMonitorService>;

    beforeEach(() => {
        mockSafetyMonitor = new SafetyMonitorService() as jest.Mocked<SafetyMonitorService>;
        crisisDetectionService = new CrisisDetectionService(mockSafetyMonitor);
    });

    describe('detectCrisis', () => {
        it('should detect immediate crisis correctly', async () => {
            // Arrange
            const crisisMessage = 'I\'m going to kill myself tonight';
            const mockSafetyFlags: SafetyFlags = {
                containsHarmfulContent: true,
                riskLevel: 'crisis',
                flaggedTerms: ['kill myself', 'tonight'],
                requiresIntervention: true
            };
            mockSafetyMonitor.scanForHarmfulContent.mockResolvedValue(mockSafetyFlags);

            // Act
            const result = await crisisDetectionService.detectCrisis(crisisMessage);

            // Assert
            expect(result.isCrisis).toBe(true);
            expect(result.isImmediate).toBe(true);
            expect(result.riskScore).toBeGreaterThan(0.85);
            expect(result.crisisResponse).toBeDefined();
            expect(result.crisisResponse?.isImmediate).toBe(true);
            expect(result.crisisResponse?.shouldEndSession).toBe(true);
        });

        it('should detect non-immediate crisis correctly', async () => {
            // Arrange
            const crisisMessage = 'I feel hopeless and don\'t want to live anymore';
            const mockSafetyFlags: SafetyFlags = {
                containsHarmfulContent: true,
                riskLevel: 'high',
                flaggedTerms: ['hopeless', 'don\'t want to live'],
                requiresIntervention: true
            };
            mockSafetyMonitor.scanForHarmfulContent.mockResolvedValue(mockSafetyFlags);

            // Act
            const result = await crisisDetectionService.detectCrisis(crisisMessage);

            // Assert
            expect(result.isCrisis).toBe(true);
            expect(result.isImmediate).toBe(false);
            expect(result.riskScore).toBeGreaterThan(0.7);
            expect(result.crisisResponse).toBeDefined();
            expect(result.crisisResponse?.isImmediate).toBe(false);
            expect(result.crisisResponse?.shouldEndSession).toBe(false);
        });

        it('should not detect crisis for normal emotional content', async () => {
            // Arrange
            const normalMessage = 'I feel sad about my breakup';
            const mockSafetyFlags: SafetyFlags = {
                containsHarmfulContent: false,
                riskLevel: 'low',
                flaggedTerms: [],
                requiresIntervention: false
            };
            mockSafetyMonitor.scanForHarmfulContent.mockResolvedValue(mockSafetyFlags);

            // Act
            const result = await crisisDetectionService.detectCrisis(normalMessage);

            // Assert
            expect(result.isCrisis).toBe(false);
            expect(result.isImmediate).toBe(false);
            expect(result.riskScore).toBeLessThan(0.85);
            expect(result.crisisResponse).toBeUndefined();
        });

        it('should handle conversation history context', async () => {
            // Arrange
            const currentMessage = 'I can\'t take it anymore';
            const conversationHistory = [
                'I\'ve been feeling really depressed lately',
                'Nothing seems to help anymore',
                'I feel like giving up'
            ];
            const mockSafetyFlags: SafetyFlags = {
                containsHarmfulContent: true,
                riskLevel: 'medium',
                flaggedTerms: ['can\'t take it'],
                requiresIntervention: false
            };
            mockSafetyMonitor.scanForHarmfulContent.mockResolvedValue(mockSafetyFlags);

            // Act
            const result = await crisisDetectionService.detectCrisis(currentMessage, conversationHistory);

            // Assert
            expect(result.riskScore).toBeGreaterThan(0.4); // Should be elevated due to history
            expect(mockSafetyMonitor.scanForHarmfulContent).toHaveBeenCalledWith(currentMessage);
        });

        it('should handle service errors gracefully', async () => {
            // Arrange
            const message = 'I feel terrible';
            mockSafetyMonitor.scanForHarmfulContent.mockRejectedValue(new Error('Service error'));

            // Act
            const result = await crisisDetectionService.detectCrisis(message);

            // Assert
            expect(result.isCrisis).toBe(true); // Err on side of caution
            expect(result.isImmediate).toBe(false);
            expect(result.crisisResponse).toBeDefined();
            expect(result.riskScore).toBe(0.5);
        });
    });

    describe('shouldTriggerReferral', () => {
        it('should trigger referral for high risk score', () => {
            const safetyFlags: SafetyFlags = {
                containsHarmfulContent: false,
                riskLevel: 'low',
                flaggedTerms: [],
                requiresIntervention: false
            };

            const result = crisisDetectionService.shouldTriggerReferral(0.9, safetyFlags);
            expect(result).toBe(true);
        });

        it('should trigger referral for crisis-level safety flags', () => {
            const safetyFlags: SafetyFlags = {
                containsHarmfulContent: true,
                riskLevel: 'crisis',
                flaggedTerms: ['kill myself'],
                requiresIntervention: true
            };

            const result = crisisDetectionService.shouldTriggerReferral(0.5, safetyFlags);
            expect(result).toBe(true);
        });

        it('should not trigger referral for low risk', () => {
            const safetyFlags: SafetyFlags = {
                containsHarmfulContent: false,
                riskLevel: 'low',
                flaggedTerms: [],
                requiresIntervention: false
            };

            const result = crisisDetectionService.shouldTriggerReferral(0.3, safetyFlags);
            expect(result).toBe(false);
        });
    });

    describe('generateCrisisResponse', () => {
        it('should generate immediate crisis response', async () => {
            // Arrange
            const safetyFlags: SafetyFlags = {
                containsHarmfulContent: true,
                riskLevel: 'crisis',
                flaggedTerms: ['kill myself'],
                requiresIntervention: true
            };

            // Act
            const response = await crisisDetectionService.generateCrisisResponse(0.95, true, safetyFlags);

            // Assert
            expect(response.isImmediate).toBe(true);
            expect(response.shouldEndSession).toBe(true);
            expect(response.message).toContain('very concerned');
            expect(response.message).toContain('911');
            expect(response.resources).toHaveLength(8); // Should include emergency services
            expect(response.resources[0].name).toBe('Emergency Services');
        });

        it('should generate non-immediate crisis response', async () => {
            // Arrange
            const safetyFlags: SafetyFlags = {
                containsHarmfulContent: true,
                riskLevel: 'high',
                flaggedTerms: ['hopeless'],
                requiresIntervention: true
            };

            // Act
            const response = await crisisDetectionService.generateCrisisResponse(0.7, false, safetyFlags);

            // Assert
            expect(response.isImmediate).toBe(false);
            expect(response.shouldEndSession).toBe(false);
            expect(response.message).toContain('difficult time');
            expect(response.resources).toHaveLength(7); // Should not include emergency services at top
            expect(response.resources[0].name).not.toBe('Emergency Services');
        });
    });

    describe('getCrisisResources', () => {
        it('should return immediate crisis resources', () => {
            const resources = crisisDetectionService.getCrisisResources(true);

            expect(resources).toHaveLength(8);
            expect(resources[0].name).toBe('Emergency Services');
            expect(resources[0].phone).toBe('911');

            // Check for essential resources
            const resourceNames = resources.map(r => r.name);
            expect(resourceNames).toContain('National Suicide Prevention Lifeline');
            expect(resourceNames).toContain('Crisis Text Line');
            expect(resourceNames).toContain('SAMHSA National Helpline');
        });

        it('should return non-immediate crisis resources', () => {
            const resources = crisisDetectionService.getCrisisResources(false);

            expect(resources).toHaveLength(7);
            expect(resources[0].name).not.toBe('Emergency Services');

            // Check for essential resources
            const resourceNames = resources.map(r => r.name);
            expect(resourceNames).toContain('National Suicide Prevention Lifeline');
            expect(resourceNames).toContain('Crisis Text Line');
            expect(resourceNames).toContain('SAMHSA National Helpline');
        });

        it('should include specialized resources', () => {
            const resources = crisisDetectionService.getCrisisResources(false);
            const resourceNames = resources.map(r => r.name);

            expect(resourceNames).toContain('National Domestic Violence Hotline');
            expect(resourceNames).toContain('Trans Lifeline');
            expect(resourceNames).toContain('LGBT National Hotline');
            expect(resourceNames).toContain('Veterans Crisis Line');
        });

        it('should have valid resource data', () => {
            const resources = crisisDetectionService.getCrisisResources(true);

            resources.forEach(resource => {
                expect(resource.name).toBeTruthy();
                expect(resource.phone).toBeTruthy();
                expect(resource.description).toBeTruthy();
                expect(typeof resource.available24h).toBe('boolean');
            });
        });
    });

    describe('calculateCrisisRisk', () => {
        it('should calculate high risk for explicit suicidal content', () => {
            const message = 'I want to kill myself tonight with pills';
            const history: string[] = [];
            const safetyFlags: SafetyFlags = {
                containsHarmfulContent: true,
                riskLevel: 'crisis',
                flaggedTerms: ['kill myself', 'tonight', 'pills'],
                requiresIntervention: true
            };

            const riskScore = (crisisDetectionService as any).calculateCrisisRisk(message, history, safetyFlags);
            expect(riskScore).toBeGreaterThan(0.9);
        });

        it('should calculate medium risk for hopelessness', () => {
            const message = 'I feel hopeless and trapped with no way out';
            const history: string[] = [];
            const safetyFlags: SafetyFlags = {
                containsHarmfulContent: true,
                riskLevel: 'medium',
                flaggedTerms: ['hopeless', 'trapped', 'no way out'],
                requiresIntervention: false
            };

            const riskScore = (crisisDetectionService as any).calculateCrisisRisk(message, history, safetyFlags);
            expect(riskScore).toBeGreaterThan(0.4);
            expect(riskScore).toBeLessThan(0.8);
        });

        it('should factor in conversation history', () => {
            const message = 'I can\'t take it anymore';
            const history = [
                'I\'ve been feeling suicidal',
                'Nothing helps anymore',
                'I feel like giving up'
            ];
            const safetyFlags: SafetyFlags = {
                containsHarmfulContent: true,
                riskLevel: 'medium',
                flaggedTerms: ['can\'t take it'],
                requiresIntervention: false
            };

            const riskScore = (crisisDetectionService as any).calculateCrisisRisk(message, history, safetyFlags);
            expect(riskScore).toBeGreaterThan(0.5); // Should be elevated due to history
        });

        it('should cap risk score at 1.0', () => {
            const message = 'I want to kill myself tonight I have a plan I\'m ready to do it I have pills and rope and I\'m going to jump';
            const history = ['suicide', 'die', 'hurt', 'end', 'hopeless'];
            const safetyFlags: SafetyFlags = {
                containsHarmfulContent: true,
                riskLevel: 'crisis',
                flaggedTerms: ['kill myself', 'tonight', 'plan', 'ready', 'pills', 'rope', 'jump'],
                requiresIntervention: true
            };

            const riskScore = (crisisDetectionService as any).calculateCrisisRisk(message, history, safetyFlags);
            expect(riskScore).toBeLessThanOrEqual(1.0);
        });
    });

    describe('formatCrisisMessage', () => {
        it('should format immediate crisis message correctly', () => {
            const crisisResponse: CrisisResponse = {
                isImmediate: true,
                resources: [
                    {
                        name: 'Emergency Services',
                        phone: '911',
                        description: 'For immediate life-threatening emergencies',
                        available24h: true
                    },
                    {
                        name: 'National Suicide Prevention Lifeline',
                        phone: '988',
                        description: '24/7 crisis support and suicide prevention',
                        available24h: true
                    }
                ],
                message: 'I\'m very concerned about your safety right now.',
                shouldEndSession: true
            };

            const formatted = crisisDetectionService.formatCrisisMessage(crisisResponse);

            expect(formatted).toContain('I\'m very concerned');
            expect(formatted).toContain('Emergency Services');
            expect(formatted).toContain('911');
            expect(formatted).toContain('National Suicide Prevention Lifeline');
            expect(formatted).toContain('988');
            expect(formatted).toContain('Available: 24/7');
            expect(formatted).toContain('immediate danger');
            expect(formatted).toContain('Your life has value');
        });

        it('should format non-immediate crisis message correctly', () => {
            const crisisResponse: CrisisResponse = {
                isImmediate: false,
                resources: [
                    {
                        name: 'Crisis Text Line',
                        phone: '741741',
                        description: 'Text HOME for 24/7 crisis support via text',
                        available24h: true
                    }
                ],
                message: 'I notice you might be going through a difficult time.',
                shouldEndSession: false
            };

            const formatted = crisisDetectionService.formatCrisisMessage(crisisResponse);

            expect(formatted).toContain('difficult time');
            expect(formatted).toContain('Crisis Text Line');
            expect(formatted).toContain('741741');
            expect(formatted).toContain('don\'t have to face this alone');
            expect(formatted).toContain('sign of strength');
        });
    });

    describe('logCrisisEvent', () => {
        it('should log crisis event without throwing errors', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const safetyFlags: SafetyFlags = {
                containsHarmfulContent: true,
                riskLevel: 'crisis',
                flaggedTerms: ['kill myself'],
                requiresIntervention: true
            };

            await expect(
                crisisDetectionService.logCrisisEvent('session1', 'msg1', 0.9, safetyFlags, true)
            ).resolves.not.toThrow();

            expect(consoleSpy).toHaveBeenCalledWith(
                'CRISIS EVENT DETECTED:',
                expect.objectContaining({
                    sessionId: 'session1',
                    messageId: 'msg1',
                    riskScore: 0.9,
                    riskLevel: 'crisis',
                    responseGenerated: true
                })
            );

            consoleSpy.mockRestore();
        });

        it('should handle logging errors gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
                throw new Error('Logging failed');
            });
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            const safetyFlags: SafetyFlags = {
                containsHarmfulContent: true,
                riskLevel: 'high',
                flaggedTerms: ['hurt myself'],
                requiresIntervention: true
            };

            await expect(
                crisisDetectionService.logCrisisEvent('session1', 'msg1', 0.8, safetyFlags, true)
            ).resolves.not.toThrow();

            expect(consoleErrorSpy).toHaveBeenCalledWith('Error logging crisis event:', expect.any(Error));

            consoleSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty conversation history', async () => {
            const message = 'I feel sad';
            const mockSafetyFlags: SafetyFlags = {
                containsHarmfulContent: false,
                riskLevel: 'low',
                flaggedTerms: [],
                requiresIntervention: false
            };
            mockSafetyMonitor.scanForHarmfulContent.mockResolvedValue(mockSafetyFlags);

            const result = await crisisDetectionService.detectCrisis(message, []);

            expect(result).toBeDefined();
            expect(result.riskScore).toBeGreaterThanOrEqual(0);
        });

        it('should handle null or undefined messages', async () => {
            mockSafetyMonitor.scanForHarmfulContent.mockResolvedValue({
                containsHarmfulContent: false,
                riskLevel: 'low',
                flaggedTerms: [],
                requiresIntervention: false
            });

            const result1 = await crisisDetectionService.detectCrisis(null as any);
            const result2 = await crisisDetectionService.detectCrisis(undefined as any);

            expect(result1.isCrisis).toBe(false);
            expect(result2.isCrisis).toBe(false);
        });

        it('should maintain consistent thresholds', () => {
            const service = crisisDetectionService as any;
            expect(service.crisisThreshold).toBe(0.85);
            expect(service.immediateThreshold).toBe(0.95);
        });
    });
});