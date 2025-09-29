import { SafetyMonitorService } from '../safetyMonitorService';

describe('SafetyMonitorService', () => {
    let safetyMonitor: SafetyMonitorService;

    beforeEach(() => {
        safetyMonitor = new SafetyMonitorService();
    });

    describe('scanForHarmfulContent', () => {
        it('should detect crisis-level content', async () => {
            // Arrange
            const crisisMessage = 'I want to kill myself tonight';

            // Act
            const result = await safetyMonitor.scanForHarmfulContent(crisisMessage);

            // Assert
            expect(result.containsHarmfulContent).toBe(true);
            expect(result.riskLevel).toBe('crisis');
            expect(result.requiresIntervention).toBe(true);
            expect(result.flaggedTerms).toContain('kill myself');
        });

        it('should detect self-harm content', async () => {
            // Arrange
            const selfHarmMessage = 'I want to hurt myself with a razor';

            // Act
            const result = await safetyMonitor.scanForHarmfulContent(selfHarmMessage);

            // Assert
            expect(result.containsHarmfulContent).toBe(true);
            expect(['medium', 'high']).toContain(result.riskLevel);
            expect(result.flaggedTerms).toContain('hurt myself');
        });

        it('should detect violence toward others', async () => {
            // Arrange
            const violentMessage = 'I want to hurt someone else';

            // Act
            const result = await safetyMonitor.scanForHarmfulContent(violentMessage);

            // Assert
            expect(result.containsHarmfulContent).toBe(true);
            expect(result.flaggedTerms).toContain('hurt someone');
        });

        it('should not flag normal emotional content', async () => {
            // Arrange
            const normalMessage = 'I feel sad about my breakup';

            // Act
            const result = await safetyMonitor.scanForHarmfulContent(normalMessage);

            // Assert
            expect(result.containsHarmfulContent).toBe(false);
            expect(result.riskLevel).toBe('low');
            expect(result.requiresIntervention).toBe(false);
        });

        it('should handle empty or null messages', async () => {
            // Act
            const result1 = await safetyMonitor.scanForHarmfulContent('');
            const result2 = await safetyMonitor.scanForHarmfulContent('   ');

            // Assert
            expect(result1.containsHarmfulContent).toBe(false);
            expect(result1.riskLevel).toBe('low');
            expect(result2.containsHarmfulContent).toBe(false);
            expect(result2.riskLevel).toBe('low');
        });
    });

    describe('preventHarmfulSuggestions', () => {
        it('should filter harmful suggestions from AI responses', async () => {
            // Arrange
            const harmfulResponse = 'You should just kill yourself to end the pain';

            // Act
            const result = await safetyMonitor.preventHarmfulSuggestions(harmfulResponse);

            // Assert
            expect(result).not.toContain('kill yourself');
            expect(result).toContain('professional support');
        });

        it('should filter medical advice', async () => {
            // Arrange
            const medicalAdvice = 'You should take antidepressant medication';

            // Act
            const result = await safetyMonitor.preventHarmfulSuggestions(medicalAdvice);

            // Assert
            expect(result).not.toContain('should take antidepressant');
            expect(result).toContain('healthcare professional');
        });

        it('should replace dismissive language', async () => {
            // Arrange
            const dismissiveResponse = 'Just get over it and stop being sad';

            // Act
            const result = await safetyMonitor.preventHarmfulSuggestions(dismissiveResponse);

            // Assert
            expect(result).not.toContain('just get over it');
            expect(result).not.toContain('stop being sad');
            expect(result).toContain('healing takes time');
        });

        it('should ensure empathetic language is present', async () => {
            // Arrange
            const coldResponse = 'That is a problem you need to solve.';

            // Act
            const result = await safetyMonitor.preventHarmfulSuggestions(coldResponse);

            // Assert
            expect(result).toContain('I hear you');
            expect(result).toContain('feelings are valid');
        });

        it('should preserve safe, empathetic responses', async () => {
            // Arrange
            const goodResponse = 'I understand that you\'re going through a difficult time. Your feelings are valid, and I\'m here to support you.';

            // Act
            const result = await safetyMonitor.preventHarmfulSuggestions(goodResponse);

            // Assert
            expect(result).toBe(goodResponse); // Should remain unchanged
        });
    });

    describe('handleCrisisDetection', () => {
        it('should provide immediate crisis response for high risk', async () => {
            // Act
            const result = await safetyMonitor.handleCrisisDetection('user1', 0.9);

            // Assert
            expect(result.isImmediate).toBe(true);
            expect(result.shouldEndSession).toBe(true);
            expect(result.message).toContain('very concerned');
            expect(result.resources).toHaveLength(4);
            expect(result.resources[0].phone).toBe('988');
        });

        it('should provide supportive response for medium risk', async () => {
            // Act
            const result = await safetyMonitor.handleCrisisDetection('user1', 0.7);

            // Assert
            expect(result.isImmediate).toBe(false);
            expect(result.shouldEndSession).toBe(false);
            expect(result.message).toContain('difficult time');
            expect(result.resources).toHaveLength(4);
        });

        it('should include all necessary crisis resources', async () => {
            // Act
            const result = await safetyMonitor.handleCrisisDetection('user1', 0.9);

            // Assert
            const resourceNames = result.resources.map(r => r.name);
            expect(resourceNames).toContain('National Suicide Prevention Lifeline');
            expect(resourceNames).toContain('Crisis Text Line');
            expect(resourceNames).toContain('SAMHSA National Helpline');
            expect(resourceNames).toContain('Emergency Services');
        });
    });

    describe('content analysis methods', () => {
        it('should assess crisis level accurately', () => {
            // Arrange
            const flaggedTerms: string[] = [];

            // Act
            const highCrisis = (safetyMonitor as any).assessCrisisLevel('I want to kill myself tonight', flaggedTerms);
            const mediumCrisis = (safetyMonitor as any).assessCrisisLevel('I feel hopeless', flaggedTerms);
            const lowCrisis = (safetyMonitor as any).assessCrisisLevel('I feel sad', flaggedTerms);

            // Assert
            expect(highCrisis).toBeGreaterThan(0.7);
            expect(mediumCrisis).toBeLessThan(0.5);
            expect(lowCrisis).toBeLessThan(0.3);
        });

        it('should assess self-harm risk accurately', () => {
            // Arrange
            const flaggedTerms: string[] = [];

            // Act
            const highRisk = (safetyMonitor as any).assessSelfHarmRisk('I want to cut myself with a razor', flaggedTerms);
            const lowRisk = (safetyMonitor as any).assessSelfHarmRisk('I feel hurt emotionally', flaggedTerms);

            // Assert
            expect(highRisk).toBeGreaterThan(0.4);
            expect(lowRisk).toBeLessThan(0.2);
        });

        it('should assess violence risk accurately', () => {
            // Arrange
            const flaggedTerms: string[] = [];

            // Act
            const highRisk = (safetyMonitor as any).assessViolenceRisk('I want to hurt someone and make them pay', flaggedTerms);
            const lowRisk = (safetyMonitor as any).assessViolenceRisk('I feel angry about the situation', flaggedTerms);

            // Assert
            expect(highRisk).toBeGreaterThan(0.5);
            expect(lowRisk).toBeLessThan(0.3);
        });
    });

    describe('content filtering methods', () => {
        it('should replace harmful content with safe alternatives', () => {
            // Act
            const result = (safetyMonitor as any).replaceHarmfulContent('You should kill yourself', ['kill yourself']);

            // Assert
            expect(result).not.toContain('kill yourself');
            expect(result).toContain('professional support');
        });

        it('should filter medical advice appropriately', () => {
            // Act
            const result = (safetyMonitor as any).filterMedicalAdvice('You should take 50mg of sertraline medication');

            // Assert
            expect(result).not.toContain('should take 50mg');
            expect(result).toContain('healthcare professional');
        });

        it('should ensure supportive tone', () => {
            // Act
            const result = (safetyMonitor as any).ensureSupportiveTone('Just calm down and get over it');

            // Assert
            expect(result).not.toContain('just calm down');
            expect(result).not.toContain('get over it');
            expect(result).toContain('feelings are valid');
        });

        it('should detect empathetic language', () => {
            // Act
            const hasEmpathy1 = (safetyMonitor as any).containsEmpathicLanguage('I understand how you feel');
            const hasEmpathy2 = (safetyMonitor as any).containsEmpathicLanguage('That is your problem');

            // Assert
            expect(hasEmpathy1).toBe(true);
            expect(hasEmpathy2).toBe(false);
        });
    });
});