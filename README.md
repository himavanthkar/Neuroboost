# NeuroBoost - AI-Powered Productivity Platform

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Git

### 1. Setup Environment Variables
Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
# Edit .env with your actual API keys
```

### 2. Start All Services
```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 3. Access Points
- **Frontend**: http://localhost:8080
- **API Gateway**: http://localhost:3000
- **AI Agents**: http://localhost:8000
- **Voice Service**: http://localhost:8002
- **Workflow Engine**: http://localhost:8003
- **Analytics**: http://localhost:8001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🏗️ Architecture

### Services
- **API Gateway** (Node.js/Express) - Authentication, routing, rate limiting
- **AI Agents** (Python/FastAPI) - Anthropic, Gemini, Groq, Letta integration
- **Voice Service** (Python/FastAPI) - VAPI integration for voice interactions
- **Workflow Engine** (Python/FastAPI) - Orkes Conductor workflow management
- **Analytics** (Python/FastAPI) - Data analysis and insights
- **Frontend** (React) - User interface

### Infrastructure
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management

## 📋 API Keys Required

Get these from your hackathon sponsor dashboard:
- `ANTHROPIC_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `VAPI_API_KEY` & `VAPI_PUBLIC_KEY`
- `GROQ_API_KEY`
- `LETTA_API_KEY`
- `ORKES_API_KEY`

## 🛠️ Development

### Individual Service Development
```bash
# API Gateway
cd api-gateway && npm install && npm run dev

# AI Agents
cd ai-agents && pip install -r requirements.txt && python -m uvicorn main:app --reload --port 8000

# And so on for other services...
```

### Docker Commands
```bash
# View logs
docker-compose logs -f [service-name]

# Rebuild specific service
docker-compose up --build [service-name]

# Stop all services
docker-compose down

# Remove volumes (database reset)
docker-compose down -v
```

## 🎯 Team Workflow

1. One person sets up the repository structure
2. Everyone clones and creates their `.env` file
3. Run `docker-compose up --build`
4. Start coding in your service directory
5. Changes auto-reload in development mode

## 🔧 Troubleshooting

- **Port conflicts**: Change ports in `.env` file
- **Database issues**: Run `docker-compose down -v` to reset volumes
- **Build failures**: Check service-specific Dockerfile and requirements
- **Permission issues**: Ensure Docker has proper permissions

Built with ❤️ for the hackathon! 