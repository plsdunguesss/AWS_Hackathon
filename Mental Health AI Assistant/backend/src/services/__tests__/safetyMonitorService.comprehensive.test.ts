import { SafetyMonitorService } from '../safetyMonitorService';
import { SafetyFlags, CrisisResponse } from '../../types';

describe('SafetyMonitorService - Comprehensive Safety Tests', () => {
    let safetyMonitor: SafetyMonitorService;

    beforeEach(() => {
        safetyMonitor = new SafetyMonitorService();
    });

    describe('Crisis Detection - Edge Cases', () => {
        it('should detect subtle suicidal ideation', async () => {
            const subtleMessages = [
                'I just want the pain to stop forever',
                'Everyone would be better off without me',
                'I can\'t see any way out of this',
                'I\'ve been thinking about ending things',
                'What\'s the point of going on?'
            ];

            for (const message of subtleMessages) {
                const result = await safetyMonitor.scanForHarmfulContent(message);
                expect(result.containsHarmfulContent).toBe(true);
                expect(['medium', 'high', 'crisis']).toContain(result.riskLevel);
            }
        });

        it('should detect immediate danger phrases', async () => {
            const immediateMessages = [
                'I\'m going to kill myself tonight',
                'I have a plan to end it all today',
                'I can\'t wait any longer, I\'m ready to do it',
                'This is my final goodbye to everyone',
                'I\'m about to jump off this bridge'
            ];

            for (const message of immediateMessages) {
                const result = await safetyMonitor.scanForHarmfulContent(message);
                expect(result.riskLevel).toBe('crisis');
                expect(result.requiresIntervention).toBe(true);
            }
        });

        it('should detect method-specific threats', async () => {
            const methodMessages = [
                'I have pills and I know how many to take',
                'I\'ve been looking at the rope in my garage',
                'The bridge looks high enough to work',
                'I have my dad\'s gun and I know where he keeps it',
                'I\'ve been researching painless ways to die'
            ];

            for (const message of methodMessages) {
                const result = await safetyMonitor.scanForHarmfulContent(message);
                expect(result.riskLevel).toEqual(expect.stringMatching(/high|crisis/));
                expect(result.requiresIntervention).toBe(true);
            }
        });

        it('should handle false positives appropriately', async () => {
            const falsePositives = [
                'I could just die of embarrassment',
                'This homework is killing me',
                'I\'m dying to see that movie',
                'I\'d kill for a good pizza right now',
                'I\'m dead tired from work'
            ];

            for (const message of falsePositives) {
                const result = await safetyMonitor.scanForHarmfulContent(message);
                expect(result.riskLevel).toEqual(expect.stringMatching(/low|medium/));
                expect(result.requiresIntervention).toBe(false);
            }
        });
    });

    describe('Self-Harm Detection', () => {
        it('should detect various self-harm methods', async () => {
            const selfHarmMessages = [
                'I want to cut myself with a razor blade',
                'I\'ve been burning myself with cigarettes',
                'I hit myself when I get angry',
                'I scratch myself until I bleed',
                'I pull my hair out when I\'m stressed'
            ];

            for (const message of selfHarmMessages) {
                const result = await safetyMonitor.scanForHarmfulContent(message);
                expect(result.containsHarmfulContent).toBe(true);
                expect(['medium', 'high']).toContain(result.riskLevel);
                expect(result.flaggedTerms.length).toBeGreaterThan(0);
            }
        });

        it('should distinguish between self-harm and accidental injury', async () => {
            const accidentalMessages = [
                'I cut myself while cooking dinner',
                'I burned my hand on the stove',
                'I hit my head on the cabinet door',
                'I scratched myself on a tree branch'
            ];

            for (const message of accidentalMessages) {
                const result = await safetyMonitor.scanForHarmfulContent(message);
                expect(result.riskLevel).toEqual(expect.stringMatching(/low|medium/));
            }
        });
    });

    describe('Violence Detection', () => {
        it('should detect threats toward others', async () => {
            const violentMessages = [
                'I want to hurt my boss for firing me',
                'I\'m going to make them pay for what they did',
                'I have violent thoughts about my ex',
                'I want to kill the person who hurt my family',
                'They deserve to suffer like I have'
            ];

            for (const message of violentMessages) {
                const result = await safetyMonitor.scanForHarmfulContent(message);
                expect(result.containsHarmfulContent).toBe(true);
                expect(['medium', 'high']).toContain(result.riskLevel);
                expect(result.flaggedTerms.length).toBeGreaterThan(0);
            }
        });

        it('should handle anger without violence appropriately', async () => {
            const angerMessages = [
                'I\'m really angry about this situation',
                'I feel frustrated with my coworker',
                'I\'m mad at myself for making that mistake',
                'This makes me so upset and angry'
            ];

            for (const message of angerMessages) {
                const result = await safetyMonitor.scanForHarmfulContent(message);
                expect(result.riskLevel).toBe('low');
                expect(result.requiresIntervention).toBe(false);
            }
        });
    });

    describe('Content Filtering - Harmful Suggestions', () => {
        it('should filter direct harmful suggestions', async () => {
            const harmfulResponses = [
                'You should just kill yourself to end the pain',
                'Maybe you should hurt yourself to feel better',
                'Just give up, there\'s no hope for you',
                'You\'re worthless and should just die',
                'End your life, nobody will miss you'
            ];

            for (const response of harmfulResponses) {
                const filtered = await safetyMonitor.preventHarmfulSuggestions(response);
                expect(filtered).not.toContain('kill yourself');
                expect(filtered).not.toContain('hurt yourself');
                expect(filtered).not.toContain('just die');
                expect(filtered).toContain('professional support');
            }
        });

        it('should filter medical advice', async () => {
            const medicalAdvice = [
                'You should take 50mg of sertraline daily',
                'I recommend starting antidepressant medication',
                'You need cognitive behavioral therapy immediately',
                'You have major depressive disorder',
                'Take 2mg of lorazepam for anxiety'
            ];

            for (const advice of medicalAdvice) {
                const filtered = await safetyMonitor.preventHarmfulSuggestions(advice);
                expect(filtered).not.toMatch(/\d+mg/);
                expect(filtered).not.toContain('should take');
                expect(filtered).not.toContain('you have');
                expect(filtered).toContain('healthcare professional');
            }
        });

        it('should replace dismissive language', async () => {
            const dismissiveResponses = [
                'Just get over it and move on',
                'Stop being so dramatic about everything',
                'You\'re overreacting to this situation',
                'Calm down and think rationally',
                'Don\'t worry, it\'s not that bad'
            ];

            for (const response of dismissiveResponses) {
                const filtered = await safetyMonitor.preventHarmfulSuggestions(response);
                expect(filtered).not.toContain('just get over it');
                expect(filtered).not.toContain('stop being');
                expect(filtered).not.toContain('overreacting');
                expect(filtered).toContain('feelings are valid');
            }
        });

        it('should preserve helpful, empathetic responses', async () => {
            const goodResponses = [
                'I understand that you\'re going through a difficult time. Your feelings are valid.',
                'It sounds like you\'re dealing with a lot right now. I\'m here to support you.',
                'Thank you for sharing that with me. It takes courage to open up about these feelings.',
                'I hear that you\'re struggling. Would you like to talk about what\'s been most challenging?'
            ];

            for (const response of goodResponses) {
                const filtered = await safetyMonitor.preventHarmfulSuggestions(response);
                expect(filtered).toBe(response); // Should remain unchanged
            }
        });
    });

    describe('Crisis Response Generation', () => {
        it('should provide immediate crisis response for high risk', async () => {
            const response = await safetyMonitor.handleCrisisDetection('user1', 0.95);
            
            expect(response.isImmediate).toBe(true);
            expect(response.shouldEndSession).toBe(true);
            expect(response.message).toContain('very concerned');
            expect(response.message).toContain('911');
            expect(response.resources).toHaveLength(4);
            
            // Check that emergency services is first
            expect(response.resources[0].name).toBe('Emergency Services');
            expect(response.resources[0].phone).toBe('911');
        });

        it('should provide supportive response for medium risk', async () => {
            const response = await safetyMonitor.handleCrisisDetection('user1', 0.7);
            
            expect(response.isImmediate).toBe(false);
            expect(response.shouldEndSession).toBe(false);
            expect(response.message).toContain('difficult time');
            expect(response.resources).toHaveLength(4);
            
            // Emergency services should not be first for non-immediate
            expect(response.resources[0].name).not.toBe('Emergency Services');
        });

        it('should include all essential crisis resources', async () => {
            const response = await safetyMonitor.handleCrisisDetection('user1', 0.9);
            
            const resourceNames = response.resources.map(r => r.name);
            expect(resourceNames).toContain('National Suicide Prevention Lifeline');
            expect(resourceNames).toContain('Crisis Text Line');
            expect(resourceNames).toContain('SAMHSA National Helpline');
            expect(resourceNames).toContain('Emergency Services');
            
            // Check that all resources have required fields
            response.resources.forEach(resource => {
                expect(resource.name).toBeTruthy();
                expect(resource.phone).toBeTruthy();
                expect(resource.description).toBeTruthy();
                expect(typeof resource.available24h).toBe('boolean');
            });
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty or whitespace messages', async () => {
            const emptyMessages = ['', '   ', '\n\t', null, undefined];
            
            for (const message of emptyMessages) {
                const result = await safetyMonitor.scanForHarmfulContent(message as string);
                expect(result.containsHarmfulContent).toBe(false);
                expect(result.riskLevel).toBe('low');
                expect(result.flaggedTerms).toHaveLength(0);
            }
        });

        it('should handle very long messages', async () => {
            const longMessage = 'I feel sad '.repeat(1000) + 'and I want to hurt myself';
            
            const result = await safetyMonitor.scanForHarmfulContent(longMessage);
            expect(result.containsHarmfulContent).toBe(true);
            expect(result.flaggedTerms).toContain('hurt myself');
        });

        it('should handle special characters and encoding', async () => {
            const specialMessages = [
                'I want to k!ll myself',
                'I want to h*rt myself',
                'I want to d1e',
                'I want to end my l1fe'
            ];
            
            for (const message of specialMessages) {
                const result = await safetyMonitor.scanForHarmfulContent(message);
                // Should still detect some risk even with character substitution
                expect(result.riskLevel).not.toBe('low');
            }
        });

        it('should handle mixed case and punctuation', async () => {
            const mixedMessages = [
                'I WANT TO KILL MYSELF!!!',
                'i want to hurt myself...',
                'I Want To End My Life.',
                'I.WANT.TO.DIE.NOW'
            ];
            
            for (const message of mixedMessages) {
                const result = await safetyMonitor.scanForHarmfulContent(message);
                expect(result.containsHarmfulContent).toBe(true);
                expect(['high', 'crisis']).toContain(result.riskLevel);
            }
        });
    });

    describe('Risk Level Escalation', () => {
        it('should escalate risk level appropriately', () => {
            const service = safetyMonitor as any;
            
            expect(service.getHigherRiskLevel('low', 'medium')).toBe('medium');
            expect(service.getHigherRiskLevel('medium', 'high')).toBe('high');
            expect(service.getHigherRiskLevel('high', 'crisis')).toBe('crisis');
            expect(service.getHigherRiskLevel('crisis', 'low')).toBe('crisis');
            expect(service.getHigherRiskLevel('medium', 'low')).toBe('medium');
        });
    });

    describe('Performance and Reliability', () => {
        it('should process messages within reasonable time', async () => {
            const message = 'I feel very sad and hopeless about my situation';
            const startTime = Date.now();
            
            await safetyMonitor.scanForHarmfulContent(message);
            
            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
        });

        it('should handle concurrent requests', async () => {
            const messages = [
                'I feel sad',
                'I want to hurt myself',
                'I feel anxious',
                'I want to kill myself',
                'I feel overwhelmed'
            ];
            
            const promises = messages.map(msg => safetyMonitor.scanForHarmfulContent(msg));
            const results = await Promise.all(promises);
            
            expect(results).toHaveLength(5);
            results.forEach(result => {
                expect(result).toHaveProperty('containsHarmfulContent');
                expect(result).toHaveProperty('riskLevel');
                expect(result).toHaveProperty('flaggedTerms');
                expect(result).toHaveProperty('requiresIntervention');
            });
        });
    });
});