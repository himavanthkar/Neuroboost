from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import redis
import json
import logging
from agents.mood_agent import MoodAgent
from agents.task_agent import TaskAgent
from agents.focus_agent import FocusAgent
from agents.motivate_agent import MotivateAgent
from datetime import datetime

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="NeuroBoost AI Agents", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis for real-time mood updates
redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = int(os.getenv("REDIS_PORT", 6379))
redis_password = os.getenv("REDIS_PASSWORD")
redis_client = redis.Redis(host=redis_host, port=redis_port, password=redis_password, decode_responses=True)

# Initialize AI Agents
mood_agent = MoodAgent()
task_agent = TaskAgent()
focus_agent = FocusAgent()
motivate_agent = MotivateAgent()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-agents"}

@app.post("/mood/detect")
async def detect_mood(data: dict):
    """Detect mood from voice/text and update theme in real-time"""
    try:
        mood_data = mood_agent.detect_mood(
            text=data.get("text"),
            audio_features=data.get("audio_features")
        )
        
        # Broadcast mood change to frontend via Redis
        redis_client.publish("mood_updates", json.dumps(mood_data))
        
        return {"mood": mood_data, "theme_updated": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tasks/from-voice")
async def voice_to_tasks(data: dict):
    """Convert voice transcript to structured tasks"""
    try:
        tasks = task_agent.voice_to_task(data["transcript"])

        # After creating tasks, publish an event to notify the frontend
        redis_client.publish("task_updates", json.dumps({"event": "tasks_updated", "tasks": tasks}))
        
        return {"tasks": tasks, "source": "voice"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tasks/add")
async def add_task(data: dict):
    """
    Adds a new task based on structured data and notifies frontend.
    """
    try:
        day = data.get("day")
        task_text = data.get("task")
        
        if not day or not task_text:
            raise HTTPException(status_code=400, detail="Missing task or day")

        # Create a new task object matching the frontend structure
        # NOTE: This logic should ideally be in the TaskAgent
        new_task = {
            "id": f"task_{datetime.now().timestamp()}",
            "text": task_text,
            "done": False,
            # This is a simplification; a real app would need robust date mapping
            "date": task_agent.map_day_to_date(day), 
            "completedAt": None,
            "source": "vapi"
        }

        # We need to wrap it in the format App.jsx expects
        task_update_payload = {
            "tasks": [new_task]
        }
        
        # Publish the update to Redis
        redis_client.publish("task_updates", json.dumps({"event": "task_added", "tasks": task_update_payload}))
        
        return {"success": True, "message": f"Successfully added '{task_text}' to {day}", "task": new_task}
    except Exception as e:
        logger.error(f"Error adding task: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tasks/remove")
async def remove_task(data: dict):
    """
    Removes a task. Note: This is a conceptual implementation.
    A real implementation would require a way to identify the task to remove (e.g., by ID).
    """
    try:
        # For this to work, VAPI would need to know the task ID.
        # This would require a more complex conversational flow.
        task_id_to_remove = data.get("taskId")
        
        # Here you would delete the task from the database
        
        # Then notify the frontend
        redis_client.publish("task_updates", json.dumps({"event": "task_removed", "taskId": task_id_to_remove}))
        
        return {"success": True, "message": "Task removal processed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/focus/analyze")
async def analyze_focus(data: dict):
    """Analyze focus level using Groq for real-time processing"""
    try:
        focus_data = focus_agent.analyze_focus_level(data)
        return {"focus_level": focus_data, "suggestions": focus_agent.get_adhd_suggestions()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/motivate")
async def get_motivation(data: dict):
    """Get personalized ADHD motivation using Letta memory"""
    try:
        motivation = motivate_agent.get_personalized_motivation(
            user_id=data["user_id"],
            current_mood=data.get("mood"),
            recent_tasks=data.get("tasks", [])
        )
        return {"motivation": motivation, "personalized": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
