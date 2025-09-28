export declare class OllamaService {
    private baseUrl;
    private model;
    private timeout;
    constructor(baseUrl?: string, model?: string, timeout?: number);
    generateResponse(prompt: string, options?: {
        temperature?: number;
        top_p?: number;
        max_tokens?: number;
    }): Promise<string>;
    checkHealth(): Promise<boolean>;
    listModels(): Promise<string[]>;
    setModel(model: string): void;
    getModel(): string;
    createMentalHealthPrompt(userMessage: string, context?: {
        sessionHistory?: string[];
        riskLevel?: number;
        userGoals?: string[];
    }): string;
}
//# sourceMappingURL=ollamaService.d.ts.map