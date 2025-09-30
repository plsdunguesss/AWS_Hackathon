import { SafetyFlags } from '../types';

export class SafetyMonitorService {
    private crisisKeywords = [
        'suicide', 'kill myself', 'end it all', 'want to die', 'better off dead',
        'hurt myself', 'self harm', 'cut myself', 'overdose', 'jump off'
    ];

    private harmKeywords = [
        'hurt someone', 'kill someone', 'violence', 'weapon', 'attack'
    ];

    public async scanForHarmfulContent(message: string): Promise<SafetyFlags> {
        const lowerMessage = message.toLowerCase();
        const flaggedTerms: string[] = [];
        let riskLevel: 'low' | 'medium' | 'high' | 'crisis' = 'low';
        let containsHarmfulContent = false;

        // Check for crisis keywords
        const crisisMatches = this.crisisKeywords.filter(keyword => 
            lowerMessage.includes(keyword)
        );
        
        if (crisisMatches.length > 0) {
            flaggedTerms.push(...crisisMatches);
            riskLevel = 'crisis';
            containsHarmfulContent = true;
        }

        // Check for harm keywords
        const harmMatches = this.harmKeywords.filter(keyword => 
            lowerMessage.includes(keyword)
        );
        
        if (harmMatches.length > 0) {
            flaggedTerms.push(...harmMatches);
            riskLevel = riskLevel === 'crisis' ? 'crisis' : 'high';
            containsHarmfulContent = true;
        }

        // Check for concerning patterns
        const concerningPatterns = [
            'hopeless', 'worthless', 'can\'t go on', 'no point', 'give up'
        ];

        const concerningMatches = concerningPatterns.filter(pattern => 
            lowerMessage.includes(pattern)
        );

        if (concerningMatches.length > 0 && riskLevel === 'low') {
            flaggedTerms.push(...concerningMatches);
            riskLevel = 'medium';
        }

        return {
            containsHarmfulContent,
            riskLevel,
            flaggedTerms,
            requiresIntervention: riskLevel === 'crisis' || riskLevel === 'high'
        };
    }

    public async preventHarmfulSuggestions(aiResponse: string): Promise<string> {
        const lowerResponse = aiResponse.toLowerCase();
        
        // Check if AI response contains harmful suggestions
        const harmfulSuggestions = [
            'you should hurt', 'try harming', 'consider suicide', 'end your life',
            'give up', 'no hope', 'it\'s hopeless', 'you\'re worthless'
        ];

        const containsHarmful = harmfulSuggestions.some(suggestion => 
            lowerResponse.includes(suggestion)
        );

        if (containsHarmful) {
            // Return a safe, supportive response instead
            return "I'm here to support you through difficult times. Your feelings are valid, and there are people who want to help. If you're having thoughts of self-harm, please reach out to a mental health professional or call 988 for the Suicide & Crisis Lifeline.";
        }

        return aiResponse;
    }

    public async handleCrisisDetection(userId: string, riskLevel: number): Promise<any> {
        // In a real implementation, this would:
        // 1. Log the crisis event
        // 2. Potentially notify emergency contacts
        // 3. Provide immediate crisis resources
        
        console.log(`Crisis detected for user ${userId} with risk level ${riskLevel}`);
        
        return {
            crisisDetected: true,
            riskLevel,
            resources: [
                {
                    name: "988 Suicide & Crisis Lifeline",
                    phone: "988",
                    available: "24/7"
                },
                {
                    name: "Crisis Text Line",
                    text: "HOME to 741741",
                    available: "24/7"
                }
            ]
        };
    }
}