import { SafetyFlags, CrisisResponse } from '../types';
export declare class SafetyMonitorService {
    private harmfulContentPatterns;
    private crisisKeywords;
    private selfHarmKeywords;
    private violenceKeywords;
    private suicidalKeywords;
    constructor();
    /**
     * Scan content for harmful patterns and safety concerns
     */
    scanForHarmfulContent(message: string): Promise<SafetyFlags>;
    /**
     * Filter and modify AI responses to prevent harmful suggestions
     */
    preventHarmfulSuggestions(aiResponse: string): Promise<string>;
    /**
     * Handle crisis detection and provide appropriate response
     */
    handleCrisisDetection(userId: string, riskLevel: number): Promise<CrisisResponse>;
    /**
     * Initialize harmful content patterns and keywords
     */
    private initializePatterns;
    /**
     * Assess crisis level based on message content
     */
    private assessCrisisLevel;
    /**
     * Assess self-harm risk level
     */
    private assessSelfHarmRisk;
    /**
     * Assess violence risk level
     */
    private assessViolenceRisk;
    /**
     * Replace harmful content with safe alternatives
     */
    private replaceHarmfulContent;
    /**
     * Filter out medical advice from responses
     */
    private filterMedicalAdvice;
    /**
     * Ensure response maintains supportive and empathetic tone
     */
    private ensureSupportiveTone;
    /**
     * Check if response contains empathetic language
     */
    private containsEmpathicLanguage;
}
//# sourceMappingURL=safetyMonitorService.d.ts.map