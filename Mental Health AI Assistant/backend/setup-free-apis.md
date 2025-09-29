# Free AI API Setup Guide

## 🤗 Hugging Face (Recommended - Already Implemented)

**Why Choose:** Completely free, no credit card required, good for development

1. Go to https://huggingface.co/
2. Sign up for free account
3. Navigate to Settings → Access Tokens
4. Create new token (read access is sufficient)
5. Set environment variable: `HUGGINGFACE_API_KEY=your_token_here`

**Usage Limits:** 
- 1000 requests/hour for free tier
- Perfect for development and demos

## 🚀 Groq (Very Fast, Free Tier)

**Why Choose:** Extremely fast inference, generous free tier

1. Go to https://console.groq.com/
2. Sign up with email
3. Go to API Keys section
4. Create new API key
5. Set environment variable: `GROQ_API_KEY=your_key_here`

**Usage Limits:**
- 14,400 requests/day free
- Very fast responses

## 🧠 Google Gemini (High Quality)

**Why Choose:** High quality responses, good safety features

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create API key
4. Set environment variable: `GEMINI_API_KEY=your_key_here`

**Usage Limits:**
- 60 requests/minute free
- High quality responses

## 🔄 Current Implementation Status

✅ **Hugging Face** - Fully implemented and tested
⏳ **Groq** - Can be added next
⏳ **Gemini** - Can be added as backup option

## 🛡️ Safety Features (All APIs)

- Crisis detection and intervention
- Harmful content filtering  
- Professional referral system
- Empathy scoring
- Risk assessment

## 🎯 Recommendation

**Start with Hugging Face** - it's the easiest to set up and completely free. The system works great with fallback responses even without any API key!