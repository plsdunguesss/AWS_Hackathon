const { ConversationService } = require('./dist/services/conversationService');
const { SafetyMonitorService } = require('./dist/services/safetyMonitorService');
const { OllamaService } = require('./dist/services/ollamaService');

// Mock Ollama service for testing without requiring actual Ollama installation
class MockOllamaService {
    async generateResponse(prompt) {
        // Simulate different responses based on prompt content
        if (prompt.toLowerCase().includes('anxious')) {
            return "I understand that feeling anxious can be really overwhelming. It sounds like you're going through a difficult time right now. Can you tell me more about what's been making you feel this way? Sometimes talking through these feelings can help us understand them better.";
        } else if (prompt.toLowerCase().includes('sad')) {
            return "I hear that you're feeling sad, and I want you to know that it's completely okay to feel this way. Sadness is a natural human emotion, and acknowledging it takes courage. What's been weighing on your heart lately?";
        } else if (prompt.toLowerCase().includes('stressed')) {
            return "Stress can feel so heavy sometimes. I appreciate you sharing this with me. It sounds like you're carrying a lot right now. What are some of the main things that have been causing you stress?";
        } else {
            return "I'm here to listen and support you. Thank you for sharing with me. Your feelings are valid, and I want to understand what you're going through. Can you tell me more about how you've been feeling?";
        }
    }

    async checkHealth() {
        return true;
    }
}

async function testConversationService() {
    console.log('🧠 Testing Mental Health AI Assistant Conversation Service\n');
    
    // Initialize services
    const mockOllama = new MockOllamaService();
    const safetyMonitor = new SafetyMonitorService();
    const conversationService = new ConversationService(mockOllama, safetyMonitor);

    // Test scenarios
    const testCases = [
        {
            name: "Normal Anxiety Message",
            message: "I feel really anxious about my job interview tomorrow",
            context: {
                sessionId: "test-session-1",
                messageHistory: [],
                currentRiskScore: 0.2,
                userGoals: ["manage anxiety"]
            }
        },
        {
            name: "Depression Indicators",
            message: "I feel so sad and hopeless lately, nothing seems to matter",
            context: {
                sessionId: "test-session-2", 
                messageHistory: [],
                currentRiskScore: 0.4
            }
        },
        {
            name: "Crisis Situation",
            message: "I want to kill myself, I can't take this anymore",
            context: {
                sessionId: "test-session-3",
                messageHistory: [],
                currentRiskScore: 0.8
            }
        },
        {
            name: "Self-Harm Mention",
            message: "I want to hurt myself with a razor blade",
            context: {
                sessionId: "test-session-4",
                messageHistory: [],
                currentRiskScore: 0.6
            }
        },
        {
            name: "Positive Coping",
            message: "I've been trying meditation and it's helping me feel better",
            context: {
                sessionId: "test-session-5",
                messageHistory: [],
                currentRiskScore: 0.1,
                userGoals: ["stress management", "mindfulness"]
            }
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n📝 Testing: ${testCase.name}`);
        console.log(`💬 User Message: "${testCase.message}"`);
        console.log('─'.repeat(60));
        
        try {
            const response = await conversationService.processMessage(
                "test-user", 
                testCase.message, 
                testCase.context
            );
            
            console.log(`🤖 AI Response: "${response.content}"`);
            console.log(`❤️  Empathy Score: ${response.empathyScore.toFixed(2)}`);
            console.log(`⚠️  Risk Level: ${response.riskAssessment.overallRisk.toFixed(1)}%`);
            console.log(`🚨 Safety Flags: ${response.safetyFlags.riskLevel} (${response.safetyFlags.containsHarmfulContent ? 'Harmful content detected' : 'Safe'})`);
            console.log(`🏥 Requires Referral: ${response.requiresReferral ? 'YES' : 'NO'}`);
            
            if (response.safetyFlags.flaggedTerms.length > 0) {
                console.log(`🔍 Flagged Terms: ${response.safetyFlags.flaggedTerms.join(', ')}`);
            }
            
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
        }
        
        console.log('═'.repeat(60));
    }
}

async function testSafetyMonitoring() {
    console.log('\n\n🛡️  Testing Safety Monitor Service\n');
    
    const safetyMonitor = new SafetyMonitorService();
    
    const safetyTests = [
        "I feel sad about my breakup",
        "I want to hurt myself",
        "I'm going to kill myself tonight", 
        "I want to hurt someone else",
        "You should just kill yourself to end the pain"
    ];
    
    for (const message of safetyTests) {
        console.log(`\n🔍 Analyzing: "${message}"`);
        
        const safetyFlags = await safetyMonitor.scanForHarmfulContent(message);
        console.log(`   Risk Level: ${safetyFlags.riskLevel}`);
        console.log(`   Harmful Content: ${safetyFlags.containsHarmfulContent}`);
        console.log(`   Requires Intervention: ${safetyFlags.requiresIntervention}`);
        
        if (safetyFlags.flaggedTerms.length > 0) {
            console.log(`   Flagged Terms: ${safetyFlags.flaggedTerms.join(', ')}`);
        }
        
        // Test harmful content filtering
        if (message.includes('kill yourself')) {
            const filtered = await safetyMonitor.preventHarmfulSuggestions(message);
            console.log(`   Filtered Response: "${filtered}"`);
        }
    }
}

// Run the tests
async function runAllTests() {
    try {
        await testConversationService();
        await testSafetyMonitoring();
        console.log('\n✅ All tests completed successfully!');
    } catch (error) {
        console.error('\n❌ Test failed:', error);
    }
}

runAllTests();