const { ConversationService } = require('./dist/services/conversationService');

async function testWithRealOllama() {
    console.log('🦙 Testing with Real Ollama Service\n');
    
    const conversationService = new ConversationService();
    
    // Test Ollama connection first
    try {
        const health = await conversationService.callLocalLLM("Hello, are you working?");
        console.log('✅ Ollama connection successful!');
        console.log(`Response: ${health}\n`);
    } catch (error) {
        console.log('❌ Ollama not available:', error.message);
        console.log('To test with Ollama:');
        console.log('1. Install Ollama from https://ollama.ai');
        console.log('2. Run: ollama pull llama2:7b');
        console.log('3. Start Ollama service');
        return;
    }
    
    // Test conversation
    const testMessage = "I feel anxious about my presentation tomorrow";
    const context = {
        sessionId: "real-test",
        messageHistory: [],
        currentRiskScore: 0.3,
        userGoals: ["manage anxiety"]
    };
    
    console.log(`💬 Testing message: "${testMessage}"`);
    
    try {
        const response = await conversationService.processMessage("user", testMessage, context);
        console.log(`🤖 AI Response: "${response.content}"`);
        console.log(`❤️  Empathy Score: ${response.empathyScore.toFixed(2)}`);
        console.log(`⚠️  Risk Level: ${response.riskAssessment.overallRisk.toFixed(1)}%`);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testWithRealOllama();