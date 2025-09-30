"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrisisDetectionService = void 0;
const safetyMonitorService_1 = require("./safetyMonitorService");
class CrisisDetectionService {
    constructor(safetyMonitor) {
        this.crisisThreshold = 0.85; // 85% risk threshold for professional referral
        this.immediateThreshold = 0.95; // 95% for immediate crisis intervention
        this.safetyMonitor = safetyMonitor || new safetyMonitorService_1.SafetyMonitorService();
    }
    /**
     * Perform real-time crisis detection on user message
     */
    async detectCrisis(message, conversationHistory = []) {
        try {
            // Scan message for harmful content and safety concerns
            const safetyFlags = await this.safetyMonitor.scanForHarmfulContent(message);
            // Calculate crisis risk score based on current message and context
            const riskScore = this.calculateCrisisRisk(message, conversationHistory, safetyFlags);
            const isCrisis = riskScore >= this.crisisThreshold;
            const isImmediate = riskScore >= this.immediateThreshold || safetyFlags.riskLevel === 'crisis';
            let crisisResponse;
            if (isCrisis) {
                crisisResponse = await this.generateCrisisResponse(riskScore, isImmediate, safetyFlags);
            }
            return {
                isCrisis,
                isImmediate,
                safetyFlags,
                crisisResponse,
                riskScore
            };
        }
        catch (error) {
            console.error('Error in crisis detection:', error);
            // In case of error, err on the side of caution
            return {
                isCrisis: true,
                isImmediate: false,
                safetyFlags: {
                    containsHarmfulContent: false,
                    riskLevel: 'medium',
                    flaggedTerms: [],
                    requiresIntervention: true
                },
                crisisResponse: await this.generateFallbackCrisisResponse(),
                riskScore: 0.5
            };
        }
    }
    /**
     * Check if conversation should trigger professional referral
     */
    shouldTriggerReferral(riskScore, safetyFlags) {
        return riskScore >= this.crisisThreshold ||
            safetyFlags.riskLevel === 'crisis' ||
            safetyFlags.riskLevel === 'high';
    }
    /**
     * Generate crisis response with appropriate resources
     */
    async generateCrisisResponse(riskScore, isImmediate, safetyFlags) {
        const resources = this.getCrisisResources(isImmediate);
        let message;
        if (isImmediate || safetyFlags.riskLevel === 'crisis') {
            message = `I'm very concerned about your safety right now. Your wellbeing is important, and you don't have to go through this alone.

**If you're in immediate danger, please:**
- Call 911 or go to your nearest emergency room
- Contact the National Suicide Prevention Lifeline: 988
- Reach out to a trusted friend, family member, or mental health professional

**Crisis support is available 24/7:**`;
        }
        else {
            message = `I notice you might be going through a particularly difficult time. It's important to have professional support when dealing with these feelings.

**Here are some resources that can help:**`;
        }
        return {
            isImmediate,
            resources,
            message,
            shouldEndSession: isImmediate
        };
    }
    /**
     * Get crisis resources based on urgency level
     */
    getCrisisResources(isImmediate = false) {
        const resources = [
            {
                name: "National Suicide Prevention Lifeline",
                phone: "988",
                description: "24/7 crisis support and suicide prevention",
                available24h: true
            },
            {
                name: "Crisis Text Line",
                phone: "741741",
                description: "Text HOME for 24/7 crisis support via text",
                available24h: true
            },
            {
                name: "SAMHSA National Helpline",
                phone: "1-800-662-4357",
                description: "Treatment referral and information service",
                available24h: true
            }
        ];
        if (isImmediate) {
            // Add emergency services at the top for immediate crises
            resources.unshift({
                name: "Emergency Services",
                phone: "911",
                description: "For immediate life-threatening emergencies",
                available24h: true
            });
        }
        // Add additional specialized resources
        resources.push({
            name: "National Domestic Violence Hotline",
            phone: "1-800-799-7233",
            description: "Support for domestic violence situations",
            available24h: true
        }, {
            name: "Trans Lifeline",
            phone: "877-565-8860",
            description: "Crisis support for transgender individuals",
            available24h: true
        }, {
            name: "LGBT National Hotline",
            phone: "1-888-843-4564",
            description: "Support for LGBTQ+ individuals",
            available24h: false
        }, {
            name: "Veterans Crisis Line",
            phone: "1-800-273-8255",
            description: "Crisis support specifically for veterans",
            available24h: true
        });
        return resources;
    }
    /**
     * Calculate crisis risk score based on message content and context
     */
    calculateCrisisRisk(message, conversationHistory, safetyFlags) {
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
            'have a plan', 'ready to', 'going to do it', 'about to',
            'final goodbye', 'goodbye forever', 'this is it'
        ];
        immediateDangerPhrases.forEach(phrase => {
            if (lowerMessage.includes(phrase)) {
                riskScore += 0.15;
            }
        });
        // Suicidal ideation indicators
        const suicidalPhrases = [
            'kill myself', 'end my life', 'suicide', 'suicidal', 'want to die',
            'better off dead', 'end it all', 'can\'t go on', 'no point living',
            'planning to die', 'how to die', 'ways to die'
        ];
        suicidalPhrases.forEach(phrase => {
            if (lowerMessage.includes(phrase)) {
                riskScore += 0.2;
            }
        });
        // Self-harm indicators
        const selfHarmPhrases = [
            'hurt myself', 'self harm', 'self-harm', 'cut myself', 'cutting',
            'burn myself', 'punish myself', 'deserve pain', 'harm myself'
        ];
        selfHarmPhrases.forEach(phrase => {
            if (lowerMessage.includes(phrase)) {
                riskScore += 0.15;
            }
        });
        // Hopelessness indicators
        const hopelessnessPhrases = [
            'no hope', 'hopeless', 'nothing left', 'no way out', 'trapped',
            'can\'t escape', 'no future', 'pointless', 'meaningless'
        ];
        hopelessnessPhrases.forEach(phrase => {
            if (lowerMessage.includes(phrase)) {
                riskScore += 0.1;
            }
        });
        // Social isolation indicators
        const isolationPhrases = [
            'no one cares', 'all alone', 'nobody understands', 'isolated',
            'no friends', 'no family', 'abandoned', 'rejected'
        ];
        isolationPhrases.forEach(phrase => {
            if (lowerMessage.includes(phrase)) {
                riskScore += 0.08;
            }
        });
        // Context from conversation history
        if (conversationHistory.length > 0) {
            const recentHistory = conversationHistory.slice(-3).join(' ').toLowerCase();
            // Escalating pattern
            if (recentHistory.includes('getting worse') || recentHistory.includes('can\'t take it')) {
                riskScore += 0.1;
            }
            // Repeated crisis themes
            const crisisThemes = ['suicide', 'die', 'hurt', 'end', 'hopeless'];
            const themeCount = crisisThemes.filter(theme => recentHistory.includes(theme)).length;
            riskScore += themeCount * 0.05;
        }
        // Specific method mentions (very high risk)
        const methodPhrases = [
            'pills', 'overdose', 'hanging', 'jumping', 'bridge', 'gun',
            'knife', 'razor', 'rope', 'poison', 'carbon monoxide'
        ];
        methodPhrases.forEach(method => {
            if (lowerMessage.includes(method) &&
                (lowerMessage.includes('myself') || lowerMessage.includes('me'))) {
                riskScore += 0.25;
            }
        });
        // Cap the risk score at 1.0
        return Math.min(1.0, riskScore);
    }
    /**
     * Generate fallback crisis response for error situations
     */
    async generateFallbackCrisisResponse() {
        return {
            isImmediate: false,
            resources: this.getCrisisResources(false),
            message: `I want to make sure you have access to support when you need it. If you're experiencing thoughts of self-harm or suicide, please reach out for help immediately.

**Crisis support is available 24/7:**`,
            shouldEndSession: false
        };
    }
    /**
     * Format crisis response for display
     */
    formatCrisisMessage(crisisResponse) {
        let formattedMessage = crisisResponse.message + '\n\n';
        crisisResponse.resources.forEach(resource => {
            formattedMessage += `**${resource.name}**\n`;
            formattedMessage += `Phone: ${resource.phone}\n`;
            formattedMessage += `${resource.description}\n`;
            if (resource.available24h) {
                formattedMessage += `Available: 24/7\n`;
            }
            formattedMessage += '\n';
        });
        if (crisisResponse.isImmediate) {
            formattedMessage += `\n**Remember:** If you're in immediate danger, don't hesitate to call 911 or go to your nearest emergency room. Your life has value, and help is available.`;
        }
        else {
            formattedMessage += `\n**Remember:** You don't have to face this alone. Professional help is available, and reaching out is a sign of strength.`;
        }
        return formattedMessage;
    }
    /**
     * Log crisis detection event for monitoring
     */
    async logCrisisEvent(sessionId, messageId, riskScore, safetyFlags, responseGenerated) {
        try {
            // In a production system, this would log to a secure monitoring system
            console.log(`CRISIS EVENT DETECTED:`, {
                sessionId,
                messageId,
                riskScore,
                riskLevel: safetyFlags.riskLevel,
                flaggedTerms: safetyFlags.flaggedTerms,
                responseGenerated,
                timestamp: new Date().toISOString()
            });
            // TODO: Implement secure logging to database or monitoring service
            // This should be anonymized and comply with privacy regulations
        }
        catch (error) {
            console.error('Error logging crisis event:', error);
            // Don't throw error as this shouldn't interrupt crisis response
        }
    }
}
exports.CrisisDetectionService = CrisisDetectionService;
//# sourceMappingURL=crisisDetectionService.js.map