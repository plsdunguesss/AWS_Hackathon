# Setting Environment Variables on Windows

## Method 1: PowerShell (Temporary - Current Session Only)
```powershell
$env:HUGGINGFACE_API_KEY="your_api_key_here"
```

## Method 2: Command Prompt (Temporary - Current Session Only)
```cmd
set HUGGINGFACE_API_KEY=your_api_key_here
```

## Method 3: Windows System Environment Variables (Permanent)
1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Click "Environment Variables" button
3. Under "User variables", click "New"
4. Variable name: `HUGGINGFACE_API_KEY`
5. Variable value: `your_api_key_here`
6. Click OK, OK, OK
7. Restart your terminal/IDE

## Method 4: .env File (Recommended - Already Set Up)
Edit the file: `Mental Health AI Assistant/backend/.env`
```
HUGGINGFACE_API_KEY=your_new_api_key_here
```

## ✅ Current Status
- .env file is already created and working
- dotenv package is installed
- System is loading environment variables correctly
- Just need a new API key with "Write" permissions

## 🔑 Get New API Key
1. Go to: https://huggingface.co/settings/tokens
2. Create new token with "Write" permissions
3. Enable "Inference API" scope
4. Copy token to .env file