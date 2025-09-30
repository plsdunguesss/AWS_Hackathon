# Mental Health AI Assistant - Startup Guide

## Quick Fix for Chat Page Issues

The chat page was hanging due to infinite polling loops. This has been fixed with a simplified version.

## Prerequisites

### 1. Install Ollama (Local AI)
```bash
# Visit https://ollama.ai and download for your OS
# After installation, run:
ollama serve
ollama pull llama2:7b
```

### 2. Verify Ollama is Working
```bash
cd "Mental Health AI Assistant/backend"
node test-ollama-connection.js
```

## Starting the Application

### Method 1: Automatic Startup (Recommended)
```bash
cd "Mental Health AI Assistant"
node start-system.js
```

### Method 2: Manual Startup
Open **two separate terminals**:

**Terminal 1 - Backend:**
```bash
cd "Mental Health AI Assistant/backend"
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd "Mental Health AI Assistant"
npm install
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Testing the Chat Feature

1. Go to http://localhost:3000
2. Navigate to the Chat page
3. Try sending a message like "I'm feeling anxious"
4. The AI should respond using Ollama (local AI)

## Troubleshooting

### Chat Page Still Hanging?
- Clear your browser cache
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for errors

### Ollama Not Working?
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not working, restart Ollama
ollama serve
```

### Backend Connection Issues?
- Make sure backend is running on port 5000
- Check if any other service is using port 5000
- Look at backend terminal for error messages

### Frontend Issues?
- Make sure frontend is running on port 3000
- Check if any other service is using port 3000
- Try `npm install` again if there are dependency issues

## What's Fixed

1. ✅ **Chat page infinite polling** - Removed excessive polling intervals
2. ✅ **Ollama integration** - Backend now uses Ollama by default instead of Hugging Face
3. ✅ **Port mismatch** - Frontend now connects to correct backend port (5000)
4. ✅ **Simplified chat interface** - Cleaner, more stable chat component

## Current Features Working

- ✅ Session management
- ✅ Message sending/receiving
- ✅ Risk assessment
- ✅ Crisis detection
- ✅ Professional referrals
- ✅ Local AI responses (via Ollama)
- ✅ Safety monitoring

The application now uses **local AI (Ollama)** instead of external APIs, ensuring privacy and eliminating API key issues.