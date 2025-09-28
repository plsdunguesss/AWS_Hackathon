# Running the Mental Health AI Assistant

## Overview
The application consists of two parts:
- **Frontend**: React app running on `http://localhost:3000`
- **Backend**: Express.js API server running on `http://localhost:5000`

## Quick Start

### 1. Start the Backend Server
```bash
# Navigate to backend directory
cd "Mental Health AI Assistant/backend"

# Install dependencies (if not done already)
npm install

# Build the project
npm run build:win

# Start the development server
npm run dev
```

The backend will be available at: `http://localhost:5000`

### 2. Start the Frontend Server
Open a **new terminal/command prompt** and run:

```bash
# Navigate to the main project directory
cd "Mental Health AI Assistant"

# Install dependencies (if not done already)
npm install

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## Accessing the Application

1. **Frontend (User Interface)**: Open your browser and go to `http://localhost:3000`
2. **Backend API**: The backend API is available at `http://localhost:5000/api/`

### API Endpoints You Can Test:
- Health check: `http://localhost:5000/api/health`
- System status: `http://localhost:5000/api/health/status`

## Current Status

✅ **Backend**: Fully implemented and working
- Express.js server with TypeScript
- SQLite database with mental health data models
- Ollama integration for local LLM
- Risk assessment algorithms
- Session management
- API endpoints for conversation and risk assessment

✅ **Frontend**: Basic React app running
- Vite + React + TypeScript setup
- UI components for mental health assessment
- Ready for integration with backend API

## Next Steps

The backend is complete and ready. The frontend currently shows a mental health assessment interface but needs to be connected to the backend API to enable:

1. **Real-time conversations** with the AI assistant
2. **Risk assessment** and monitoring
3. **Session management** and history
4. **Professional referral system**

## Troubleshooting

### Backend Issues:
- Make sure you're in the `backend` directory when running backend commands
- Check that port 5000 is not in use by another application
- For Ollama integration, ensure Ollama is installed and running (`ollama serve`)

### Frontend Issues:
- Make sure you're in the main project directory (not backend) when running frontend commands
- Check that port 3000 is not in use by another application
- If you see TypeScript errors, try running `npm install` again

### Both Servers Running:
You should have **two terminal windows open**:
1. One running the backend (`npm run dev` in backend directory)
2. One running the frontend (`npm run dev` in main directory)

## Development Workflow

1. Keep both servers running during development
2. The frontend will automatically reload when you make changes
3. The backend will automatically restart when you make changes (thanks to ts-node-dev)
4. Access the app through the frontend URL: `http://localhost:3000`

## Architecture

```
Mental Health AI Assistant/
├── backend/                 # Express.js API server (Port 5000)
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic (Ollama, etc.)
│   │   ├── database/       # SQLite database
│   │   └── types/          # TypeScript definitions
│   └── data/               # SQLite database file
├── src/                    # React frontend (Port 3000)
│   ├── components/         # React components
│   └── styles/            # CSS styles
└── package.json           # Frontend dependencies
```

The backend provides the AI conversation capabilities, risk assessment, and data storage, while the frontend provides the user interface.