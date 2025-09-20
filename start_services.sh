#!/bin/bash

echo "🚀 Starting NeuroBoost Services (No Docker Required)"
echo "=================================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Please create one with your API keys."
    echo "   Required keys: ANTHROPIC_API_KEY, VAPI_API_KEY, GROQ_API_KEY"
    exit 1
fi

echo "✅ Environment file found"

# Function to start a service in background
start_service() {
    local service_name=$1
    local command=$2
    local port=$3
    
    echo "🔄 Starting $service_name on port $port..."
    cd "$service_name" && $command &
    echo "✅ $service_name started (PID: $!)"
    cd ..
}

# Start services
echo ""
echo "📦 Starting Services..."

# Frontend
start_service "frontend" "npm run dev" "5173"

# AI Agents
start_service "ai_agents" "python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload" "8000"

# Voice Service  
start_service "voice-service" "python3 -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload" "8002"

echo ""
echo "🎉 NeuroBoost is starting up!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend:        http://localhost:5173"
echo "   AI Agents:       http://localhost:8000/docs"
echo "   Voice Service:   http://localhost:8002/docs"
echo ""
echo "📝 Note: API Gateway requires Redis (optional for basic functionality)"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
