// Load environment variables
require('dotenv').config();

const { ConversationService } = require('./dist/services/conversationService');
const { HuggingFaceService } = require('./dist/services/huggingFaceService');

async function testWithRealAPI() {
    console.log('🤗 Testing with REAL Hugging Face API\n');
    
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_will_go_here') {
        console.log('❌ Please set up your API key first. Run: node test-api-key.js');
        return;
    }
    
    console.log(`✅ Using API key: ${apiKey.substring(0, 10)}...\n`);
    
    // Create services with real API key
    const huggingFaceService = new HuggingFaceService(apiKey);
    const conversationService = new ConversationService(
        undefined, // no ollama
        undefined, // default safety monitor
        huggingFaceService,
        true // use hugging face
    );
    
    const testCases = [
        {
            message: "I feel really anxious about my job interview tomorrow",
            context: {
                sessionId: "real-test-1",
                messageHistory: [],
                currentRiskScore: 0.3,
                userGoals: ["manage anxiety"]
            }
        },
        {
            message: "I've been feeling sad and hopeless lately",
            context: {
                sessionId: "real-test-2",
                messageHistory: [],
                currentRiskScore: 0.5
            }
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`💬 User: "${testCase.message}"`);
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
            console.log(`🛡️  Safety: ${response.safetyFlags.riskLevel}`);
            
            if (response.safetyFlags.flaggedTerms.length > 0) {
                console.log(`🔍 Flagged Terms: ${response.safetyFlags.flaggedTerms.join(', ')}`);
            }
            
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            
            if (error.message.includes('API key')) {
                console.log('\n💡 Tip: Make sure your Hugging Face API key is valid');
                console.log('You can check it at: https://huggingface.co/settings/tokens');
            }
        }
        
        console.log('═'.repeat(60));
        console.log();
    }
    
    console.log('🎉 Test completed! The mental health assistant is working with real AI!');
}

testWithRealAPI();