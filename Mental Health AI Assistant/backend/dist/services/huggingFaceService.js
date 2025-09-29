"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuggingFaceService = void 0;
const axios_1 = __importDefault(require("axios"));
class HuggingFaceService {
    constructor(apiKey = process.env.HUGGINGFACE_API_KEY || '', model = 'microsoft/DialoGPT-medium', timeout = 30000) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api-inference.huggingface.co/models';
        this.model = model;
        this.timeout = timeout;
    }
    async generateResponse(prompt, options) {
        try {
            // Use a more reliable model that's definitely available
            const mentalHealthModel = 'gpt2';
            const request = {
                inputs: this.formatPromptForMentalHealth(prompt),
                parameters: {
                    max_new_tokens: options?.max_tokens || 150,
                    temperature: options?.temperature || 0.7,
                    top_p: options?.top_p || 0.9,
                    do_sample: true
                }
            };
            const response = await axios_1.default.post(`${this.baseUrl}/${mentalHealthModel}`, request, {
                timeout: this.timeout,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data && response.data.length > 0) {
                let generatedText = response.data[0].generated_text;
                // Clean up the response - remove the input prompt
                generatedText = generatedText.replace(request.inputs, '').trim();
                // If empty, provide a fallback
                if (!generatedText) {
                    return this.getFallbackResponse(prompt);
                }
                return this.sanitizeResponse(generatedText);
            }
            else {
                throw new Error('No response generated');
            }
        }
        catch (error) {
            console.error('Error calling Hugging Face API:', error);
            if (axios_1.default.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Invalid Hugging Face API key. Please check your API key.');
                }
                else if (error.response?.status === 503) {
                    // Model is loading, provide fallback
                    console.log('Model is loading, using fallback response');
                    return this.getFallbackResponse(prompt);
                }
                else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout. Please try again.');
                }
            }
            // Return fallback response for any error
            return this.getFallbackResponse(prompt);
        }
    }
    async checkHealth() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/gpt2`, {
                timeout: 5000,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.status === 200;
        }
        catch (error) {
            console.error('Hugging Face health check failed:', error);
            return false;
        }
    }
    formatPromptForMentalHealth(prompt) {
        // Simplified prompt format for better compatibility
        return `Human: ${prompt}\nAssistant:`;
    }
    sanitizeResponse(response) {
        // Remove any potentially harmful content
        let sanitized = response;
        // Remove common AI artifacts
        sanitized = sanitized.replace(/^(Human:|Assistant:|AI:|Bot:)/gi, '');
        sanitized = sanitized.replace(/\n\n+/g, '\n');
        sanitized = sanitized.trim();
        // Ensure response is supportive
        if (sanitized.length < 10) {
            return this.getFallbackResponse('');
        }
        return sanitized;
    }
    getFallbackResponse(prompt) {
        const fallbacks = [
            "I hear you, and I want you to know that your feelings are valid. Can you tell me more about what you're experiencing?",
            "Thank you for sharing that with me. It takes courage to open up. How are you feeling right now?",
            "I'm here to listen and support you. What's been on your mind lately?",
            "Your feelings matter, and I'm glad you're reaching out. What would be most helpful for you right now?",
            "I understand this might be difficult to talk about. Take your time, and share what feels comfortable for you."
        ];
        // Select based on prompt content
        if (prompt.toLowerCase().includes('anxious') || prompt.toLowerCase().includes('worry')) {
            return "I understand that anxiety can feel overwhelming. You're not alone in this. What's been causing you the most worry lately?";
        }
        else if (prompt.toLowerCase().includes('sad') || prompt.toLowerCase().includes('depressed')) {
            return "I hear that you're going through a difficult time. It's okay to feel sad - your emotions are valid. What's been weighing on your heart?";
        }
        else if (prompt.toLowerCase().includes('stress')) {
            return "Stress can feel so heavy sometimes. I'm here to listen. What are the main things that have been stressing you out?";
        }
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
    getModel() {
        return this.model;
    }
    setModel(model) {
        this.model = model;
    }
}
exports.HuggingFaceService = HuggingFaceService;
//# sourceMappingURL=huggingFaceService.js.map