import { SafetyFlags, CrisisResponse, CrisisResource, RiskScore } from '../types';
import { SafetyMonitorService } from './safetyMonitorService';

export class CrisisDetectionService {
    private static instance: CrisisDetectionService;
    private safetyMonitor: SafetyMonitorService;
    private crisisThreshold: number = 0.85; // 85% risk threshold for professional referral
    private immediateThreshold: number = 0.95; // 95% for immediate crisis intervention

    constructor(safetyMonitor?: SafetyMonitorService) {
        this.safetyMonitor = safetyMonitor || new SafetyMonitorService();
    }

    public static getInstance(): CrisisDetectionService {
        if (!CrisisDetectionService.instance) {
            CrisisDetectionService.instance = new CrisisDetectionService();
        }
        return CrisisDetectionService.instance;
    }

    /**
     * Perform real-time crisis detection on user message
     */
    public async detectCrisis(message: string, conversationHistory: string[] = []): Promise<{
        isCrisis: boolean;
        isImmediate: boolean;
        safetyFlags: SafetyFlags;
        crisisResponse?: CrisisResponse;
        riskScore: number;
    }> {
        try {
            // Scan message for harmful content and safety concerns
            const safetyFlags = await this.safetyMonitor.scanForHarmfulContent(message);
            
            // Calculate crisis risk score based on current message and context
            const riskScore = this.calculateCrisisRisk(message, conversationHistory, safetyFlags);
            
            const isCrisis = riskScore >= this.crisisThreshold;
            const isImmediate = riskScore >= this.immediateThreshold;

            let crisisResponse: CrisisResponse | undefined;

            if (isCrisis) {
                crisisResponse = {
                    isImmediate,
                    resources: await this.getCrisisResources(safetyFlags),
                    message: isImmediate 
                        ? "I'm extremely concerned about your safety right now. Please reach out for immediate help."
                        : "I'm concerned about your wellbeing. Please consider reaching out to a mental health professional.",
                    shouldEndSession: isImmediate
                };
            }

            return {
                isCrisis,
                isImmediate,
                safetyFlags,
                crisisResponse,
                riskScore
            };

        } catch (error) {
            console.error('Crisis detection error:', error);
            
            // Return safe defaults on error
            return {
                isCrisis: false,
                isImmediate: false,
                safetyFlags: {
                    containsHarmfulContent: false,
                    riskLevel: 'low',
                    flaggedTerms: [],
                    requiresIntervention: false
                },
                riskScore: 0
            };
        }
    }

    /**
     * Get appropriate crisis resources based on safety flags
     */
    private async getCrisisResources(safetyFlags: SafetyFlags): Promise<CrisisResource[]> {
        const resources: CrisisResource[] = [
            {
                name: "988 Suicide & Crisis Lifeline",
                phone: "988",
                description: "24/7 crisis support and suicide prevention",
                available24h: true
            },
            {
                name: "Crisis Text Line",
                phone: "741741",
                description: "Text HOME for crisis support",
                available24h: true
            }
        ];

        // Add specialized resources based on flagged content
        if (safetyFlags.flaggedTerms.some(term => 
            ['domestic', 'abuse', 'violence'].some(keyword => term.includes(keyword))
        )) {
            resources.push({
                name: "National Domestic Violence Hotline",
                phone: "1-800-799-7233",
                description: "Support for domestic violence situations",
                available24h: true
            });
        }

        return resources;
    }

    /**
     * Calculate crisis risk score based on message content and context
     */
    private calculateCrisisRisk(
        message: string, 
        conversationHistory: string[], 
        safetyFlags: SafetyFlags
    ): number {
        let riskScore = 0;
        const lowerMessage = message.toLowerCase();

        // Base risk from safety flags
        switch (safetyFlags.riskLevel) {
            case 'crisis':
                riskScore += 0.9;
                break;
            case 'high':
                riskScore += 0.7;
                break;
            case 'medium':
                riskScore += 0.4;
                break;
            case 'low':
                riskScore += 0.1;
                break;
        }

        // Immediate danger indicators
        const immediateDangerPhrases = [
            'right now', 'tonight', 'today', 'this moment', 'can\'t wait',
            'have a plan', 'ready to', 'going to do it', 'about to'
        ];

        immediateDangerPhrases.forEach(phrase => {
            if (lowerMessage.includes(phrase)) {
                riskScore += 0.15;
            }
        });

        // Suicidal ideation indicators
        const suicidalPhrases = [
            'kill myself', 'end my life', 'suicide', 'suicidal', 'want to die',
            'better off dead', 'end it all', 'can\'t go on', 'no point living'
        ];

        suicidalPhrases.forEach(phrase => {
            if (lowerMessage.includes(phrase)) {
                riskScore += 0.2;
            }
        });

        // Self-harm indicators
        const selfHarmPhrases = [
            'hurt myself', 'self harm', 'self-harm', 'cut myself', 'cutting'
        ];

        selfHarmPhrases.forEach(phrase => {
            if (lowerMessage.includes(phrase)) {
                riskScore += 0.15;
            }
        });

        return Math.min(1.0, riskScore);
    }

    /**
     * Assess crisis level for a message (simplified method for API)
     */
    public async assessCrisisLevel(sessionId: string, message: string): Promise<{
        riskLevel: number;
        isCrisis: boolean;
        isImmediate: boolean;
        recommendations: string[];
    }> {
        try {
            const result = await this.detectCrisis(message);
            
            return {
                riskLevel: result.riskScore,
                isCrisis: result.isCrisis,
                isImmediate: result.isImmediate,
                recommendations: result.isCrisis ? [
                    "Consider reaching out to a mental health professional",
                    "Contact crisis support services if needed",
                    "Ensure you have a safety plan in place"
                ] : [
                    "Continue monitoring your mental health",
                    "Practice self-care strategies",
                    "Reach out for support when needed"
                ]
            };
        } catch (error) {
            console.error('Crisis assessment error:', error);
            return {
                riskLevel: 0,
                isCrisis: false,
                isImmediate: false,
                recommendations: ["Unable to assess risk at this time"]
            };
        }
    }
}