// Simple test to verify Ollama connection
const axios = require('axios');

async function testOllamaConnection() {
    console.log('🦙 Testing Ollama Connection...\n');
    
    const ollamaUrl = 'http://localhost:11434';
    
    try {
        // Test 1: Check if Ollama is running
        console.log('1. Checking if Ollama service is running...');
        const healthResponse = await axios.get(`${ollamaUrl}/api/tags`, { timeout: 5000 });
        console.log('✅ Ollama service is running!');
        
        // Test 2: List available models
        console.log('\n2. Available models:');
        if (healthResponse.data && healthResponse.data.models) {
            healthResponse.data.models.forEach(model => {
                console.log(`   - ${model.name} (${model.size})`);
            });
        } else {
            console.log('   No models found');
        }
        
        // Test 3: Try to generate a simple response
        console.log('\n3. Testing text generation...');
        const testPrompt = "Hello, how are you?";
        
        const generateResponse = await axios.post(`${ollamaUrl}/api/generate`, {
            model: 'llama2:latest',
            prompt: testPrompt,
            stream: false
        }, { timeout: 30000 });
        
        if (generateResponse.data && generateResponse.data.response) {
            console.log('✅ Text generation successful!');
            console.log(`   Prompt: "${testPrompt}"`);
            console.log(`   Response: "${generateResponse.data.response.trim()}"`);
        } else {
            console.log('❌ Text generation failed - no response');
        }
        
        console.log('\n🎉 Ollama is working correctly!');
        console.log('\nNext steps:');
        console.log('1. Start the backend: cd backend && npm run dev');
        console.log('2. Start the frontend: npm run dev');
        console.log('3. Open http://localhost:3000 and try the chat');
        
    } catch (error) {
        console.log('❌ Ollama connection failed');
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 Ollama is not running. To fix this:');
            console.log('1. Install Ollama from https://ollama.ai');
            console.log('2. Start Ollama service: ollama serve');
            console.log('3. Pull a model: ollama pull llama2:7b');
            console.log('4. Run this test again');
        } else if (error.response?.status === 404) {
            console.log('\n🔧 Model not found. To fix this:');
            console.log('1. Pull the llama2 model: ollama pull llama2:7b');
            console.log('2. Or try a different model: ollama pull llama2:13b');
            console.log('3. Run this test again');
        } else {
            console.log('\n❌ Error:', error.message);
        }
    }
}

// Run the test
testOllamaConnection();