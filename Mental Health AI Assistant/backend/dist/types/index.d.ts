export interface UserSession {
    id: string;
    startTime: Date;
    lastActivity: Date;
    riskScore: number;
    referralTriggered: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Message {
    id: string;
    sessionId: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    empathyScore: number;
}
export interface RiskScore {
    overallRisk: number;
    indicators: {
        depressionMarkers: number;
        anxietyMarkers: number;
        selfHarmRisk: number;
        suicidalIdeation: number;
        socialIsolation: number;
    };
    confidence: number;
    recommendsProfessionalHelp: boolean;
}
export interface RiskAssessment {
    id: string;
    sessionId: string;
    messageId?: string;
    overallRisk: number;
    depressionMarkers: number;
    anxietyMarkers: number;
    selfHarmRisk: number;
    suicidalIdeation: number;
    socialIsolation: number;
    confidence: number;
    recommendsProfessionalHelp: boolean;
    createdAt: Date;
}
export interface RiskIndicator {
    id: string;
    messageId: string;
    indicatorType: string;
    indicatorValue: string;
    severity: number;
    createdAt: Date;
}
export interface SafetyFlags {
    containsHarmfulContent: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'crisis';
    flaggedTerms: string[];
    requiresIntervention: boolean;
}
export interface SafetyFlag {
    id: string;
    messageId: string;
    containsHarmfulContent: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'crisis';
    flaggedTerms: string;
    requiresIntervention: boolean;
    createdAt: Date;
}
export interface AIResponse {
    content: string;
    empathyScore: number;
    riskAssessment: RiskScore;
    safetyFlags: SafetyFlags;
    requiresReferral: boolean;
}
export interface ConversationContext {
    sessionId: string;
    messageHistory: Message[];
    currentRiskScore: number;
    userGoals?: string[];
    assessmentResults?: any;
}
export interface CrisisResponse {
    isImmediate: boolean;
    resources: CrisisResource[];
    message: string;
    shouldEndSession: boolean;
}
export interface CrisisResource {
    name: string;
    phone: string;
    description: string;
    available24h: boolean;
}
export interface OllamaRequest {
    model: string;
    prompt: string;
    stream?: boolean;
    options?: {
        temperature?: number;
        top_p?: number;
        max_tokens?: number;
    };
}
export interface OllamaResponse {
    response: string;
    done: boolean;
    context?: number[];
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
}
//# sourceMappingURL=index.d.ts.map