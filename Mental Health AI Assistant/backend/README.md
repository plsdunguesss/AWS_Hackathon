# Mental Health AI Assistant Backend

This is the backend server for the Mental Health AI Assistant, providing API endpoints for conversation handling, risk assessment, and local LLM integration.

## Prerequisites

Before running the backend, ensure you have the following installed:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Ollama** for local LLM integration

### Installing Ollama

1. Visit [Ollama's website](https://ollama.ai/) and download the installer for your operating system
2. Install Ollama following the platform-specific instructions
3. Pull a suitable model (recommended: llama2:7b for most systems):
   ```bash
   ollama pull llama2:7b
   ```
4. Start the Ollama service:
   ```bash
   ollama serve
   ```

The Ollama API will be available at `http://localhost:11434`

## Installation

1. Navigate to the backend directory:
   ```bash
   cd "Mental Health AI Assistant/backend"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```
This starts the server with hot-reloading using ts-node-dev.

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000` by default.

## Environment Variables

Create a `.env` file in the backend directory with the following variables (optional):

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2:7b
```

## API Endpoints

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/status` - Detailed system status

### Sessions
- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:sessionId` - Get session details
- `PATCH /api/sessions/:sessionId/risk-score` - Update session risk score
- `GET /api/sessions/:sessionId/messages` - Get session message history
- `DELETE /api/sessions/:sessionId` - Delete session

### Conversation
- `POST /api/conversation/message` - Send message and get AI response
- `GET /api/conversation/:sessionId/history` - Get conversation history
- `GET /api/conversation/test-ollama` - Test Ollama connection

### Risk Assessment
- `POST /api/risk-assessment/assess` - Assess risk for a message
- `GET /api/risk-assessment/session/:sessionId` - Get risk assessment history
- `GET /api/risk-assessment/session/:sessionId/latest` - Get latest risk assessment
- `POST /api/risk-assessment/test` - Test risk assessment with sample content

## Database

The backend uses SQLite for local data storage. The database file is created automatically at `backend/data/mental_health_assistant.db`.

### Database Schema

- **sessions** - User session information
- **messages** - Conversation messages
- **risk_assessments** - Risk assessment results
- **risk_indicators** - Detailed risk indicators
- **safety_flags** - Content safety flags

## Testing the Setup

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:5000/api/health
   ```

3. Test Ollama integration:
   ```bash
   curl http://localhost:5000/api/conversation/test-ollama
   ```

## Troubleshooting

### Ollama Connection Issues

1. Ensure Ollama is running:
   ```bash
   ollama serve
   ```

2. Check if the model is available:
   ```bash
   ollama list
   ```

3. Pull the model if not available:
   ```bash
   ollama pull llama2:7b
   ```

### Database Issues

The SQLite database is created automatically. If you encounter issues:

1. Delete the database file: `backend/data/mental_health_assistant.db`
2. Restart the server to recreate the database

### Port Conflicts

If port 5000 is in use, set a different port:
```bash
PORT=3001 npm run dev
```

## Security Features

- CORS protection
- Helmet security headers
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation and sanitization
- Automatic session cleanup (24 hours)
- Local data storage (no external data transmission)

## Development

### Project Structure
```
backend/
├── src/
│   ├── database/          # Database schema and connection
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic services
│   ├── types/           # TypeScript type definitions
│   └── server.ts        # Main server file
├── data/                # SQLite database storage
├── dist/               # Compiled JavaScript (after build)
└── package.json
```

### Adding New Features

1. Define types in `src/types/index.ts`
2. Create service classes in `src/services/`
3. Add route handlers in `src/routes/`
4. Update database schema if needed in `src/database/schema.sql`

## License

This project is part of the Mental Health AI Assistant application.