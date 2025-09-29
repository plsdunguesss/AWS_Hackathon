import { OllamaService } from './ollamaService';
import { SafetyMonitorService } from './safetyMonitorService';
import { AIResponse, ConversationContext } from '../types';
export declare class ConversationService {
    private ollamaService;
    private safetyMonitor;
    private promptTemplates;
    constructor(ollamaService?: OllamaService, safetyMonitor?: SafetyMonitorService);
    /**
     * Process a user message and generate an AI response with safety monitoring
     */
    processMessage(userId: string, message: string, context: ConversationContext): Promise<AIResponse>;
    /**
     * Generate empathetic response using counseling techniques
     */
    generateEmpathicResponse(userInput: string, context: ConversationContext): Promise<string>;
    /**
     * Apply counseling techniques to create better prompts
     */
    applyCounselingTechniques(message: string, context: ConversationContext): string;
    /**
     * Call the local LLM service
     */
    callLocalLLM(prompt: string): Promise<string>;
    /**
     * Select appropriate counseling techniques based on message content
     */
    private selectCounselingTechniques;
    /**
     * Calculate empathy score based on response content
     */
    private calculateEmpathyScore;
    /**
     * Assess conversation risk based on current message and context
     */
    private assessConversationRisk;
    private containsEmotionalContent;
    private containsPersonalSharing;
    private shouldEncourageExploration;
    private containsStrengthsOrProgress;
    private containsNegativeThinking;
    private indicatesDistress;
    private assessDepressionMarkers;
    private assessAnxietyMarkers;
    private assessSelfHarmRisk;
    private assessSuicidalIdeation;
    private assessSocialIsolation;
    /**
     * Generate crisis response for high-risk situations
     */
    private generateCrisisResponse;
    /**
     * Generate fallback response for error situations
     */
    private generateFallbackResponse;
}
//# sourceMappingURL=conversationService.d.ts.map