"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaService = void 0;
const axios_1 = __importDefault(require("axios"));
class OllamaService {
    constructor(baseUrl = 'http://localhost:11434', model = 'llama2:latest', timeout = 30000) {
        this.baseUrl = baseUrl;
        this.model = model;
        this.timeout = timeout;
    }
    async generateResponse(prompt, options) {
        try {
            const request = {
                model: this.model,
                prompt,
                stream: false,
                options: {
                    temperature: options?.temperature || 0.7,
                    top_p: options?.top_p || 0.9,
                    ...options
                }
            };
            const response = await axios_1.default.post(`${this.baseUrl}/api/generate`, request, {
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.data && response.data.response) {
                return response.data.response.trim();
            }
            else {
                throw new Error('Invalid response from Ollama');
            }
        }
        catch (error) {
            console.error('Error calling Ollama API:', error);
            if (axios_1.default.isAxiosError(error)) {
                if (error.code === 'ECONNREFUSED') {
                    throw new Error('Ollama service is not running. Please start Ollama first.');
                }
                else if (error.response?.status === 404) {
                    throw new Error(`Model ${this.model} not found. Please pull the model first.`);
                }
                else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout. The model might be too large or the system is overloaded.');
                }
            }
            throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async checkHealth() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/api/tags`, {
                timeout: 5000
            });
            return response.status === 200;
        }
        catch (error) {
            console.error('Ollama health check failed:', error);
            return false;
        }
    }
    async listModels() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/api/tags`, {
                timeout: 5000
            });
            if (response.data && response.data.models) {
                return response.data.models.map((model) => model.name);
            }
            return [];
        }
        catch (error) {
            console.error('Error listing models:', error);
            return [];
        }
    }
    setModel(model) {
        this.model = model;
    }
    getModel() {
        return this.model;
    }
    createMentalHealthPrompt(userMessage, context) {
        const systemPrompt = `You are a compassionate AI mental health assistant. Your role is to provide supportive, empathetic responses that help users explore their feelings and develop coping strategies. 

IMPORTANT SAFETY GUIDELINES:
- Never provide advice that could cause harm
- Never encourage self-harm or suicide
- If someone mentions self-harm or suicide, redirect to professional help
- Always validate the user's feelings
- Use active listening and reflection techniques
- Ask open-ended questions to encourage self-exploration
- Maintain professional boundaries

Your response should be:
- Empathetic and validating
- Supportive but not prescriptive
- Focused on helping the user understand their feelings
- Encouraging of professional help when appropriate

`;
        let contextInfo = '';
        if (context?.sessionHistory && context.sessionHistory.length > 0) {
            contextInfo += `Previous conversation context:\n${context.sessionHistory.slice(-3).join('\n')}\n\n`;
        }
        if (context?.userGoals && context.userGoals.length > 0) {
            contextInfo += `User's stated goals: ${context.userGoals.join(', ')}\n\n`;
        }
        if (context?.riskLevel && context.riskLevel > 0.5) {
            contextInfo += `Note: User may be experiencing elevated distress. Be extra supportive and consider suggesting professional resources.\n\n`;
        }
        return `${systemPrompt}${contextInfo}User message: "${userMessage}"\n\nPlease provide a supportive, empathetic response:`;
    }
}
exports.OllamaService = OllamaService;
//# sourceMappingURL=ollamaService.js.map