"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyMonitorService = void 0;
class SafetyMonitorService {
    constructor() {
        this.harmfulContentPatterns = [];
        this.crisisKeywords = [];
        this.selfHarmKeywords = [];
        this.violenceKeywords = [];
        this.suicidalKeywords = [];
        this.initializePatterns();
    }
    /**
     * Scan content for harmful patterns and safety concerns
     */
    async scanForHarmfulContent(message) {
        const lowerMessage = message.toLowerCase();
        const flaggedTerms = [];
        let containsHarmfulContent = false;
        let riskLevel = 'low';
        let requiresIntervention = false;
        // Check for crisis-level content
        const crisisScore = this.assessCrisisLevel(lowerMessage, flaggedTerms);
        if (crisisScore >= 0.7) {
            riskLevel = 'crisis';
            containsHarmfulContent = true;
            requiresIntervention = true;
        }
        else if (crisisScore >= 0.5) {
            riskLevel = 'high';
            containsHarmfulContent = true;
            requiresIntervention = true;
        }
        else if (crisisScore >= 0.3) {
            riskLevel = 'medium';
            containsHarmfulContent = true;
        }
        // Check for self-harm indicators
        const selfHarmScore = this.assessSelfHarmRisk(lowerMessage, flaggedTerms);
        if (selfHarmScore >= 0.25) {
            riskLevel = this.getHigherRiskLevel(riskLevel, 'medium');
            containsHarmfulContent = true;
        }
        if (selfHarmScore >= 0.5) {
            riskLevel = this.getHigherRiskLevel(riskLevel, 'high');
            requiresIntervention = true;
        }
        // Check for violence indicators
        const violenceScore = this.assessViolenceRisk(lowerMessage, flaggedTerms);
        if (violenceScore >= 0.2) {
            riskLevel = this.getHigherRiskLevel(riskLevel, 'medium');
            containsHarmfulContent = true;
        }
        if (violenceScore >= 0.4) {
            riskLevel = this.getHigherRiskLevel(riskLevel, 'high');
            requiresIntervention = true;
        }
        return {
            containsHarmfulContent,
            riskLevel,
            flaggedTerms: [...new Set(flaggedTerms)], // Remove duplicates
            requiresIntervention
        };
    }
    /**
     * Filter and modify AI responses to prevent harmful suggestions
     */
    async preventHarmfulSuggestions(aiResponse) {
        let filteredResponse = aiResponse;
        // First replace harmful content
        filteredResponse = this.replaceHarmfulContent(filteredResponse, []);
        // Check if the response still contains harmful suggestions
        const safetyFlags = await this.scanForHarmfulContent(filteredResponse);
        if (safetyFlags.containsHarmfulContent) {
            // If still harmful, provide safe generic response
            filteredResponse = `I understand you're going through a difficult time. It's important to reach out for professional support when dealing with these feelings. Would you like me to help you find mental health resources in your area?`;
        }
        // Ensure response doesn't provide medical advice
        filteredResponse = this.filterMedicalAdvice(filteredResponse);
        // Ensure response maintains supportive tone
        filteredResponse = this.ensureSupportiveTone(filteredResponse);
        return filteredResponse;
    }
    /**
     * Handle crisis detection and provide appropriate response
     */
    async handleCrisisDetection(userId, riskLevel) {
        const isImmediate = riskLevel >= 0.85;
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
            },
            {
                name: "Emergency Services",
                phone: "911",
                description: "For immediate life-threatening emergencies",
                available24h: true
            }
        ];
        let message;
        if (isImmediate) {
            message = `I'm very concerned about your safety right now. Please reach out for immediate help. You don't have to go through this alone, and there are people who want to help you.

If you're in immediate danger, please call 911 or go to your nearest emergency room.

For crisis support, you can also contact:`;
        }
        else {
            message = `I notice you might be going through a difficult time. It's important to have professional support when dealing with these feelings. Here are some resources that might help:`;
        }
        return {
            isImmediate,
            resources,
            message,
            shouldEndSession: isImmediate
        };
    }
    /**
     * Initialize harmful content patterns and keywords
     */
    initializePatterns() {
        // Crisis-level keywords that require immediate intervention
        this.crisisKeywords = [
            'kill myself', 'end my life', 'suicide', 'suicidal', 'want to die',
            'better off dead', 'end it all', 'can\'t go on', 'no point living',
            'planning to die', 'goodbye forever', 'final goodbye'
        ];
        // Self-harm related keywords
        this.selfHarmKeywords = [
            'hurt myself', 'self harm', 'self-harm', 'cut myself', 'cutting',
            'burn myself', 'punish myself', 'deserve pain', 'harm myself',
            'self injury', 'self-injury'
        ];
        // Violence-related keywords
        this.violenceKeywords = [
            'hurt others', 'hurt someone', 'kill someone', 'murder', 'violence', 'attack',
            'harm others', 'harm someone', 'revenge', 'get back at', 'make them pay',
            'violent thoughts'
        ];
        // Suicidal ideation keywords
        this.suicidalKeywords = [
            'suicide methods', 'how to kill', 'ways to die', 'painless death',
            'overdose', 'hanging', 'jumping', 'pills to die'
        ];
        // Compile harmful content patterns
        this.harmfulContentPatterns = [
            ...this.crisisKeywords,
            ...this.selfHarmKeywords,
            ...this.violenceKeywords,
            ...this.suicidalKeywords
        ].map(keyword => new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    }
    /**
     * Assess crisis level based on message content
     */
    assessCrisisLevel(message, flaggedTerms) {
        let score = 0;
        // Check for explicit crisis keywords
        this.crisisKeywords.forEach(keyword => {
            if (message.includes(keyword)) {
                score += 0.45;
                flaggedTerms.push(keyword);
            }
        });
        // Check for suicidal ideation
        this.suicidalKeywords.forEach(keyword => {
            if (message.includes(keyword)) {
                score += 0.5;
                flaggedTerms.push(keyword);
            }
        });
        // Check for immediate danger phrases
        const immediateDangerPhrases = [
            'right now', 'tonight', 'today', 'this moment', 'can\'t wait',
            'have a plan', 'ready to', 'going to do it'
        ];
        immediateDangerPhrases.forEach(phrase => {
            if (message.includes(phrase)) {
                score += 0.3;
                flaggedTerms.push(phrase);
            }
        });
        return Math.min(1, score);
    }
    /**
     * Assess self-harm risk level
     */
    assessSelfHarmRisk(message, flaggedTerms) {
        let score = 0;
        this.selfHarmKeywords.forEach(keyword => {
            if (message.includes(keyword)) {
                score += 0.25;
                flaggedTerms.push(keyword);
            }
        });
        // Check for self-harm methods or tools
        const selfHarmMethods = [
            'razor', 'blade', 'knife', 'scissors', 'glass', 'lighter',
            'matches', 'cigarette', 'burning'
        ];
        selfHarmMethods.forEach(method => {
            if (message.includes(method) && message.includes('myself')) {
                score += 0.3;
                flaggedTerms.push(method);
            }
        });
        return Math.min(1, score);
    }
    /**
     * Assess violence risk level
     */
    assessViolenceRisk(message, flaggedTerms) {
        let score = 0;
        this.violenceKeywords.forEach(keyword => {
            if (message.includes(keyword)) {
                score += 0.3;
                flaggedTerms.push(keyword);
            }
        });
        // Check for specific threats
        const threatPatterns = [
            'going to hurt', 'will kill', 'plan to attack', 'get revenge',
            'make them suffer', 'they deserve to die', 'make them pay'
        ];
        threatPatterns.forEach(pattern => {
            if (message.includes(pattern)) {
                score += 0.4;
                flaggedTerms.push(pattern);
            }
        });
        return Math.min(1, score);
    }
    /**
     * Replace harmful content with safe alternatives
     */
    replaceHarmfulContent(response, flaggedTerms) {
        let safeResponse = response;
        // Replace specific harmful suggestions with safe alternatives
        const harmfulReplacements = new Map([
            ['just kill yourself', 'seek professional support'],
            ['kill yourself', 'seek professional support'],
            ['end your life', 'seek professional support'],
            ['hurt yourself', 'practice self-care'],
            ['you should die', 'you deserve support'],
            ['give up', 'seek help'],
            ['it\'s hopeless', 'there is hope and help available'],
            ['no one cares', 'people do care about you'],
            ['you\'re worthless', 'you have value']
        ]);
        harmfulReplacements.forEach((replacement, harmful) => {
            const regex = new RegExp(harmful.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            safeResponse = safeResponse.replace(regex, replacement);
        });
        // Check if response still contains harmful content after replacements
        const harmfulPhrases = ['kill yourself', 'end your life', 'hurt yourself', 'you should die'];
        const stillContainsHarmful = harmfulPhrases.some(phrase => safeResponse.toLowerCase().includes(phrase));
        if (stillContainsHarmful) {
            safeResponse = `I understand you're going through a difficult time. It's important to reach out for professional support when dealing with these feelings. Would you like me to help you find mental health resources in your area?`;
        }
        return safeResponse;
    }
    /**
     * Filter out medical advice from responses
     */
    filterMedicalAdvice(response) {
        const medicalAdvicePatterns = [
            /you should take \w+ medication/gi,
            /should take \d+mg/gi,
            /i recommend \w+ pills/gi,
            /you need \w+ therapy/gi,
            /you have \w+ disorder/gi,
            /you are diagnosed with/gi,
            /take \d+ mg of/gi
        ];
        let filteredResponse = response;
        medicalAdvicePatterns.forEach(pattern => {
            filteredResponse = filteredResponse.replace(pattern, 'it might be helpful to discuss this with a healthcare professional');
        });
        // Replace diagnostic language
        const diagnosticReplacements = new Map([
            ['you have depression', 'you might be experiencing symptoms that could benefit from professional evaluation'],
            ['you are bipolar', 'these experiences might warrant professional assessment'],
            ['you have anxiety disorder', 'these feelings might benefit from professional support']
        ]);
        diagnosticReplacements.forEach((replacement, diagnostic) => {
            const regex = new RegExp(diagnostic, 'gi');
            filteredResponse = filteredResponse.replace(regex, replacement);
        });
        return filteredResponse;
    }
    /**
     * Ensure response maintains supportive and empathetic tone
     */
    ensureSupportiveTone(response) {
        let supportiveResponse = response;
        // Replace dismissive language
        const dismissiveReplacements = new Map([
            ['just get over it', 'healing takes time, and that\'s okay'],
            ['get over it', 'healing takes time, and that\'s okay'],
            ['stop being sad', 'it\'s natural to feel sad sometimes'],
            ['think positive', 'it\'s okay to acknowledge difficult feelings'],
            ['you\'re overreacting', 'your feelings are valid'],
            ['calm down', 'take your time to process these feelings'],
            ['just calm down', 'take your time to process these feelings'],
            ['don\'t worry', 'it\'s understandable to feel worried']
        ]);
        dismissiveReplacements.forEach((replacement, dismissive) => {
            const regex = new RegExp(dismissive, 'gi');
            supportiveResponse = supportiveResponse.replace(regex, replacement);
        });
        // Ensure empathetic language is present
        if (!this.containsEmpathicLanguage(supportiveResponse)) {
            supportiveResponse = `I hear you, and I want you to know that your feelings are valid. ${supportiveResponse}`;
        }
        return supportiveResponse;
    }
    /**
     * Check if response contains empathetic language
     */
    containsEmpathicLanguage(response) {
        const empathicPhrases = [
            'i understand', 'i hear you', 'that sounds', 'i can imagine',
            'it makes sense', 'you\'re not alone', 'that must be',
            'i appreciate you sharing', 'thank you for', 'it\'s okay to feel'
        ];
        const lowerResponse = response.toLowerCase();
        return empathicPhrases.some(phrase => lowerResponse.includes(phrase));
    }
    /**
     * Helper method to compare and return higher risk level
     */
    getHigherRiskLevel(current, candidate) {
        const riskLevels = { 'low': 0, 'medium': 1, 'high': 2, 'crisis': 3 };
        const currentLevel = riskLevels[current];
        const candidateLevel = riskLevels[candidate];
        if (candidateLevel > currentLevel) {
            return candidate;
        }
        return current;
    }
}
exports.SafetyMonitorService = SafetyMonitorService;
//# sourceMappingURL=safetyMonitorService.js.map