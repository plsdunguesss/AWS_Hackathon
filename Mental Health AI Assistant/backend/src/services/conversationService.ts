import { OllamaService } from './ollamaService';
import { SafetyMonitorService } from './safetyMonitorService';
import { PromptTemplateService } from './promptTemplates';
import { AIResponse, ConversationContext, Message, RiskScore, SafetyFlags } from '../types';

export class ConversationService {
    private ollamaService: OllamaService;
    private safetyMonitor: SafetyMonitorService;
    private promptTemplates: PromptTemplateService;

    constructor(ollamaService?: OllamaService, safetyMonitor?: SafetyMonitorService) {
        this.ollamaService = ollamaService || new OllamaService();
        this.safetyMonitor = safetyMonitor || new SafetyMonitorService();
        this.promptTemplates = new PromptTemplateService();
    }

    /**
     * Process a user message and generate an AI response with safety monitoring
     */
    public async processMessage(userId: string, message: string, context: ConversationContext): Promise<AIResponse> {
        try {
            // First, check the user message for safety concerns
            const inputSafetyFlags = await this.safetyMonitor.scanForHarmfulContent(message);
            
            // If the input contains crisis-level content, handle immediately
            if (inputSafetyFlags.riskLevel === 'crisis') {
                return this.generateCrisisResponse(inputSafetyFlags);
            }

            // Generate empathetic response using counseling techniques
            const rawResponse = await this.generateEmpathicResponse(message, context);
            
            // Apply safety filtering to the AI response
            const safeResponse = await this.safetyMonitor.preventHarmfulSuggestions(rawResponse);
            
            // Calculate empathy score based on response content
            const empathyScore = this.calculateEmpathyScore(safeResponse);
            
            // Perform risk assessment on the conversation
            const riskAssessment = await this.assessConversationRisk(message, context);
            
            // Final safety check on the processed response
            const outputSafetyFlags = await this.safetyMonitor.scanForHarmfulContent(safeResponse);
            
            return {
                content: safeResponse,
                empathyScore,
                riskAssessment,
                safetyFlags: outputSafetyFlags,
                requiresReferral: riskAssessment.recommendsProfessionalHelp
            };

        } catch (error) {
            console.error('Error processing message:', error);
            // Return a safe fallback response
            return this.generateFallbackResponse();
        }
    }

    /**
     * Generate empathetic response using counseling techniques
     */
    public async generateEmpathicResponse(userInput: string, context: ConversationContext): Promise<string> {
        // Apply counseling techniques to enhance the prompt
        const enhancedPrompt = this.applyCounselingTechniques(userInput, context);
        
        // Generate response using local LLM
        const response = await this.callLocalLLM(enhancedPrompt);
        
        return response;
    }

    /**
     * Apply counseling techniques to create better prompts
     */
    public applyCounselingTechniques(message: string, context: ConversationContext): string {
        // Select appropriate template based on context
        const template = this.promptTemplates.selectTemplate({
            messageContent: message,
            riskLevel: context.currentRiskScore,
            sessionLength: context.messageHistory.length,
            userGoals: context.userGoals
        });

        // Build context from message history
        const conversationHistory = context.messageHistory
            .slice(-6) // Last 6 messages for context
            .map(msg => `${msg.sender}: ${msg.content}`)
            .join('\n');

        // Create enhanced prompt using selected template
        let enhancedPrompt = template.systemPrompt;

        // Add conversation context
        if (conversationHistory) {
            enhancedPrompt += `\n\nCONVERSATION CONTEXT:\n${conversationHistory}`;
        }

        // Add user goals if available
        if (context.userGoals && context.userGoals.length > 0) {
            enhancedPrompt += `\n\nUSER GOALS: ${context.userGoals.join(', ')}`;
        }

        // Add risk level context
        if (context.currentRiskScore > 0.5) {
            enhancedPrompt += `\n\nNOTE: User may need extra support and encouragement.`;
        }

        // Add the current user message
        enhancedPrompt += `\n\nUSER MESSAGE: "${message}"\n\nProvide a supportive response using the techniques: ${template.techniques.join(', ')}`;

        return enhancedPrompt;
    }

    /**
     * Call the local LLM service
     */
    public async callLocalLLM(prompt: string): Promise<string> {
        return await this.ollamaService.generateResponse(prompt, {
            temperature: 0.7,
            top_p: 0.9
        });
    }

    /**
     * Select appropriate counseling techniques based on message content
     */
    private selectCounselingTechniques(message: string, context: ConversationContext): string[] {
        const techniques: string[] = [];
        const lowerMessage = message.toLowerCase();

        // Active listening techniques
        techniques.push('Active Listening: Reflect back what you hear to show understanding');
        
        // Emotional validation
        if (this.containsEmotionalContent(lowerMessage)) {
            techniques.push('Emotional Validation: Acknowledge and validate the user\'s feelings');
        }

        // Reflective responses
        if (this.containsPersonalSharing(lowerMessage)) {
            techniques.push('Reflection: Mirror back the user\'s thoughts and feelings');
        }

        // Open-ended questions for exploration
        if (this.shouldEncourageExploration(lowerMessage, context)) {
            techniques.push('Open-ended Questions: Ask questions that encourage self-exploration');
        }

        // Strength-based approach
        if (this.containsStrengthsOrProgress(lowerMessage)) {
            techniques.push('Strength-based: Highlight user strengths and positive coping strategies');
        }

        // Cognitive reframing for negative thoughts
        if (this.containsNegativeThinking(lowerMessage)) {
            techniques.push('Gentle Reframing: Help explore alternative perspectives without dismissing feelings');
        }

        // Coping strategies
        if (this.indicatesDistress(lowerMessage)) {
            techniques.push('Coping Support: Gently explore healthy coping strategies');
        }

        return techniques;
    }

    /**
     * Calculate empathy score based on response content
     */
    private calculateEmpathyScore(response: string): number {
        let score = 0.5; // Base score
        const lowerResponse = response.toLowerCase();

        // Positive indicators
        const empathyIndicators = [
            'understand', 'feel', 'sounds like', 'that must be', 'i hear',
            'validate', 'acknowledge', 'appreciate', 'thank you for sharing',
            'it\'s okay to', 'you\'re not alone', 'that sounds difficult'
        ];

        const supportiveLanguage = [
            'support', 'here for you', 'together', 'strength', 'courage',
            'proud of you', 'taking care', 'self-compassion'
        ];

        // Count empathy indicators
        empathyIndicators.forEach(indicator => {
            if (lowerResponse.includes(indicator)) {
                score += 0.05;
            }
        });

        // Count supportive language
        supportiveLanguage.forEach(phrase => {
            if (lowerResponse.includes(phrase)) {
                score += 0.03;
            }
        });

        // Penalize directive or dismissive language
        const negativeIndicators = [
            'you should', 'you must', 'just', 'simply', 'don\'t worry',
            'calm down', 'get over it', 'move on'
        ];

        negativeIndicators.forEach(indicator => {
            if (lowerResponse.includes(indicator)) {
                score -= 0.1;
            }
        });

        return Math.max(0, Math.min(1, score));
    }

    /**
     * Assess conversation risk based on current message and context
     */
    private async assessConversationRisk(message: string, context: ConversationContext): Promise<RiskScore> {
        // This is a simplified risk assessment - in a real implementation,
        // this would use more sophisticated algorithms
        const indicators = {
            depressionMarkers: this.assessDepressionMarkers(message),
            anxietyMarkers: this.assessAnxietyMarkers(message),
            selfHarmRisk: this.assessSelfHarmRisk(message),
            suicidalIdeation: this.assessSuicidalIdeation(message),
            socialIsolation: this.assessSocialIsolation(message)
        };

        const overallRisk = (
            indicators.depressionMarkers * 0.2 +
            indicators.anxietyMarkers * 0.15 +
            indicators.selfHarmRisk * 0.3 +
            indicators.suicidalIdeation * 0.3 +
            indicators.socialIsolation * 0.05
        );

        return {
            overallRisk: Math.min(100, overallRisk * 100),
            indicators,
            confidence: 0.7, // Simplified confidence score
            recommendsProfessionalHelp: overallRisk > 0.85
        };
    }

    // Helper methods for content analysis
    private containsEmotionalContent(message: string): boolean {
        const emotionalWords = ['feel', 'feeling', 'sad', 'angry', 'anxious', 'worried', 'scared', 'hurt', 'pain'];
        return emotionalWords.some(word => message.includes(word));
    }

    private containsPersonalSharing(message: string): boolean {
        const personalIndicators = ['i am', 'i have', 'my', 'me', 'i feel', 'i think'];
        return personalIndicators.some(indicator => message.includes(indicator));
    }

    private shouldEncourageExploration(message: string, context: ConversationContext): boolean {
        return message.length > 20 && context.messageHistory.length > 2;
    }

    private containsStrengthsOrProgress(message: string): boolean {
        const strengthWords = ['better', 'improved', 'progress', 'accomplished', 'proud', 'managed', 'coped'];
        return strengthWords.some(word => message.includes(word));
    }

    private containsNegativeThinking(message: string): boolean {
        const negativePatterns = ['always', 'never', 'can\'t', 'impossible', 'hopeless', 'worthless', 'failure'];
        return negativePatterns.some(pattern => message.includes(pattern));
    }

    private indicatesDistress(message: string): boolean {
        const distressWords = ['stressed', 'overwhelmed', 'can\'t cope', 'too much', 'breaking down'];
        return distressWords.some(word => message.includes(word));
    }

    // Risk assessment helper methods
    private assessDepressionMarkers(message: string): number {
        const depressionKeywords = ['depressed', 'sad', 'hopeless', 'empty', 'worthless', 'tired', 'sleep'];
        const count = depressionKeywords.filter(keyword => message.toLowerCase().includes(keyword)).length;
        return Math.min(1, count * 0.2);
    }

    private assessAnxietyMarkers(message: string): number {
        const anxietyKeywords = ['anxious', 'worried', 'panic', 'nervous', 'scared', 'fear', 'stress'];
        const count = anxietyKeywords.filter(keyword => message.toLowerCase().includes(keyword)).length;
        return Math.min(1, count * 0.2);
    }

    private assessSelfHarmRisk(message: string): number {
        const selfHarmKeywords = ['hurt myself', 'self harm', 'cut', 'harm', 'pain', 'punish myself'];
        const count = selfHarmKeywords.filter(keyword => message.toLowerCase().includes(keyword)).length;
        return Math.min(1, count * 0.4);
    }

    private assessSuicidalIdeation(message: string): number {
        const suicidalKeywords = ['suicide', 'kill myself', 'end it all', 'don\'t want to live', 'better off dead'];
        const count = suicidalKeywords.filter(keyword => message.toLowerCase().includes(keyword)).length;
        return Math.min(1, count * 0.5);
    }

    private assessSocialIsolation(message: string): number {
        const isolationKeywords = ['alone', 'lonely', 'no friends', 'isolated', 'nobody cares'];
        const count = isolationKeywords.filter(keyword => message.toLowerCase().includes(keyword)).length;
        return Math.min(1, count * 0.3);
    }

    /**
     * Generate crisis response for high-risk situations
     */
    private generateCrisisResponse(safetyFlags: SafetyFlags): AIResponse {
        const crisisMessage = `I'm concerned about what you've shared. Your safety and wellbeing are important. Please consider reaching out to a mental health professional or crisis helpline right away. 

If you're in immediate danger, please contact:
- Emergency Services: 911
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741

Would you like help finding local mental health resources?`;

        return {
            content: crisisMessage,
            empathyScore: 0.9,
            riskAssessment: {
                overallRisk: 95,
                indicators: {
                    depressionMarkers: 0.8,
                    anxietyMarkers: 0.7,
                    selfHarmRisk: 0.9,
                    suicidalIdeation: 0.9,
                    socialIsolation: 0.6
                },
                confidence: 0.9,
                recommendsProfessionalHelp: true
            },
            safetyFlags,
            requiresReferral: true
        };
    }

    /**
     * Generate fallback response for error situations
     */
    private generateFallbackResponse(): AIResponse {
        return {
            content: "I'm here to listen and support you. Sometimes I may have technical difficulties, but your wellbeing is important to me. If you're experiencing a crisis, please reach out to a mental health professional or call 988 for the Suicide & Crisis Lifeline.",
            empathyScore: 0.7,
            riskAssessment: {
                overallRisk: 0,
                indicators: {
                    depressionMarkers: 0,
                    anxietyMarkers: 0,
                    selfHarmRisk: 0,
                    suicidalIdeation: 0,
                    socialIsolation: 0
                },
                confidence: 0.5,
                recommendsProfessionalHelp: false
            },
            safetyFlags: {
                containsHarmfulContent: false,
                riskLevel: 'low',
                flaggedTerms: [],
                requiresIntervention: false
            },
            requiresReferral: false
        };
    }
}