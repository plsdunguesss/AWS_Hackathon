/**
 * Prompt templates for empathetic counseling responses
 * These templates incorporate evidence-based counseling techniques
 */
export interface PromptTemplate {
    name: string;
    description: string;
    systemPrompt: string;
    techniques: string[];
}
export declare class PromptTemplateService {
    private templates;
    constructor();
    /**
     * Get a specific prompt template by name
     */
    getTemplate(name: string): PromptTemplate | undefined;
    /**
     * Get all available templates
     */
    getAllTemplates(): PromptTemplate[];
    /**
     * Select appropriate template based on conversation context
     */
    selectTemplate(context: {
        messageContent: string;
        riskLevel: number;
        sessionLength: number;
        userGoals?: string[];
    }): PromptTemplate;
    /**
     * Initialize all prompt templates
     */
    private initializeTemplates;
    private containsEmotionalContent;
    private containsAnxietyContent;
    private containsDepressionContent;
    private containsCopingContent;
    private containsRelationshipContent;
}
//# sourceMappingURL=promptTemplates.d.ts.map