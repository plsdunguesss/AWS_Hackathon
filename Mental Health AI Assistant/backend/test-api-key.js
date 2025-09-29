// Load environment variables
require('dotenv').config();

console.log('🔑 API Key Configuration Test\n');

// Check if API key is loaded
const apiKey = process.env.HUGGINGFACE_API_KEY;

if (!apiKey || apiKey === 'your_api_key_will_go_here') {
    console.log('❌ No API key found or placeholder detected');
    console.log('\n📋 Steps to set up your FREE Hugging Face API key:');
    console.log('1. Go to https://huggingface.co/');
    console.log('2. Sign up for a free account (no credit card needed)');
    console.log('3. Go to Settings → Access Tokens');
    console.log('4. Click "New token"');
    console.log('5. Give it a name like "mental-health-assistant"');
    console.log('6. Select "Read" permissions');
    console.log('7. Copy the generated token');
    console.log('8. Open the file: Mental Health AI Assistant/backend/.env');
    console.log('9. Replace "your_api_key_will_go_here" with your actual token');
    console.log('10. Save the file and run this test again');
    console.log('\n💡 The .env file should look like:');
    console.log('HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
} else {
    console.log('✅ API key found!');
    console.log(`Key starts with: ${apiKey.substring(0, 10)}...`);
    console.log('\n🚀 Ready to test with real AI responses!');
    console.log('Run: node test-huggingface-with-key.js');
}

console.log('\n📁 Current .env file location:');
console.log('Mental Health AI Assistant/backend/.env');
console.log('\n🔒 Security Note: Never commit your .env file to git!');