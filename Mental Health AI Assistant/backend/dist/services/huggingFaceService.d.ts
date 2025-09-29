export interface HuggingFaceRequest {
    inputs: string;
    parameters?: {
        max_new_tokens?: number;
        temperature?: number;
        top_p?: number;
        do_sample?: boolean;
    };
}
export interface HuggingFaceResponse {
    generated_text: string;
}
export declare class HuggingFaceService {
    private apiKey;
    private baseUrl;
    private model;
    private timeout;
    constructor(apiKey?: string, model?: string, timeout?: number);
    generateResponse(prompt: string, options?: {
        temperature?: number;
        top_p?: number;
        max_tokens?: number;
    }): Promise<string>;
    checkHealth(): Promise<boolean>;
    private formatPromptForMentalHealth;
    private sanitizeResponse;
    private getFallbackResponse;
    setApiKey(apiKey: string): void;
    getModel(): string;
    setModel(model: string): void;
}
//# sourceMappingURL=huggingFaceService.d.ts.map