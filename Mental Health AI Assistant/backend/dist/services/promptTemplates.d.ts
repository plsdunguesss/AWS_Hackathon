interface PromptTemplate {
    systemPrompt: string;
    techniques: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'crisis';
}
interface TemplateContext {
    messageContent: string;
    riskLevel: number;
    sessionLength: number;
    userGoals?: string[];
}
export declare class PromptTemplateService {
    private templates;
    selectTemplate(context: TemplateContext): PromptTemplate;
    getWelcomePrompt(): string;
    getCrisisPrompt(): string;
}
export {};
//# sourceMappingURL=promptTemplates.d.ts.map