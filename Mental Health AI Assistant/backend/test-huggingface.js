const { ConversationService } = require('./dist/services/conversationService');
const { HuggingFaceService } = require('./dist/services/huggingFaceService');

async function testHuggingFace() {
    console.log('🤗 Testing Hugging Face Integration\n');
    
    // Test without API key first (will use fallbacks)
    console.log('📝 Testing without API key (fallback responses)...\n');
    
    const huggingFaceService = new HuggingFaceService(''); // No API key
    const conversationService = new ConversationService(
        undefined, // no ollama
        undefined, // default safety monitor
        huggingFaceService,
        true // use hugging face
    );
    
    const testCases = [
        {
            message: "I feel really anxious about my presentation tomorrow",
            context: {
                sessionId: "hf-test-1",
                messageHistory: [],
                currentRiskScore: 0.3,
                userGoals: ["manage anxiety"]
            }
        },
        {
            message: "I've been feeling sad and lonely lately",
            context: {
                sessionId: "hf-test-2",
                messageHistory: [],
                currentRiskScore: 0.4
            }
        },
        {
            message: "Work stress is overwhelming me",
            context: {
                sessionId: "hf-test-3",
                messageHistory: [],
                currentRiskScore: 0.5
            }
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`💬 User: "${testCase.message}"`);
        console.log('─'.repeat(50));
        
        try {
            const response = await conversationService.processMessage(
                "test-user",
                testCase.message,
                testCase.context
            );
            
            console.log(`🤖 AI: "${response.content}"`);
            console.log(`❤️  Empathy Score: ${response.empathyScore.toFixed(2)}`);
            console.log(`⚠️  Risk Level: ${response.riskAssessment.overallRisk.toFixed(1)}%`);
            console.log(`🛡️  Safety: ${response.safetyFlags.riskLevel}`);
            
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
        }
        
        console.log('═'.repeat(50));
        console.log();
    }
    
    console.log('\n📋 How to get a FREE Hugging Face API key:');
    console.log('1. Go to https://huggingface.co/');
    console.log('2. Sign up for a free account');
    console.log('3. Go to Settings > Access Tokens');
    console.log('4. Create a new token');
    console.log('5. Set HUGGINGFACE_API_KEY environment variable');
    console.log('\nWith an API key, you\'ll get actual AI-generated responses!');
}

testHuggingFace();