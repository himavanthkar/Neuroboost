from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
import logging
from datetime import datetime, timedelta

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="NeuroBoost Workflow Engine", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Task(BaseModel):
    id: str
    text: str
    done: bool
    date: str
    type: str = "personal"
    energy_required: str = "medium"
    difficulty: str = "medium"
    priority: int = 3

class WorkflowRequest(BaseModel):
    tasks: List[Task]
    current_mood: str = "neutral"
    energy_level: str = "medium"
    user_id: str = "demo"

class WorkflowStep(BaseModel):
    id: str
    name: str
    description: str
    estimated_time: int  # minutes
    energy_required: str
    priority: int

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "workflow-engine"}

@app.post("/workflow/optimize")
async def optimize_workflow(data: WorkflowRequest):
    """Optimize task workflow based on ADHD patterns and current state"""
    try:
        tasks = data.tasks
        current_mood = data.current_mood
        energy_level = data.energy_level
        
        # ADHD-friendly workflow optimization
        optimized_workflow = {
            "steps": [],
            "total_estimated_time": 0,
            "energy_plan": {},
            "recommendations": []
        }
        
        # Sort tasks by priority and energy requirements
        sorted_tasks = sorted(tasks, key=lambda x: (x.priority, x.energy_required))
        
        # Create workflow steps
        for i, task in enumerate(sorted_tasks):
            step = WorkflowStep(
                id=f"step_{i+1}",
                name=task.text,
                description=f"Complete: {task.text}",
                estimated_time=15 if task.difficulty == "easy" else 30 if task.difficulty == "medium" else 45,
                energy_required=task.energy_required,
                priority=task.priority
            )
            optimized_workflow["steps"].append(step)
            optimized_workflow["total_estimated_time"] += step.estimated_time
        
        # Generate energy plan
        if energy_level == "high":
            optimized_workflow["energy_plan"] = {
                "focus_blocks": "2-3 hours of deep work",
                "break_schedule": "15 min break every 45 minutes",
                "recommended_tasks": "High-energy, complex tasks"
            }
        elif energy_level == "medium":
            optimized_workflow["energy_plan"] = {
                "focus_blocks": "1-2 hours of focused work",
                "break_schedule": "10 min break every 30 minutes",
                "recommended_tasks": "Medium complexity tasks"
            }
        else:  # low energy
            optimized_workflow["energy_plan"] = {
                "focus_blocks": "30-45 minutes of light work",
                "break_schedule": "5 min break every 20 minutes",
                "recommended_tasks": "Simple, low-energy tasks"
            }
        
        # Generate ADHD-specific recommendations
        recommendations = []
        
        if current_mood == "overwhelmed":
            recommendations.extend([
                "🧘 Take a 5-minute breathing break before starting",
                "📝 Break large tasks into smaller, manageable steps",
                "⏰ Use the Pomodoro technique: 25 min work, 5 min break"
            ])
        elif current_mood == "focused":
            recommendations.extend([
                "⚡ You're in the zone! Tackle your most challenging task first",
                "🔇 Minimize distractions - close unnecessary tabs",
                "📱 Put phone in another room"
            ])
        elif current_mood == "tired":
            recommendations.extend([
                "☕ Consider a light snack or caffeine if appropriate",
                "🚶 Take a short walk to boost energy",
                "🎵 Try upbeat music to increase motivation"
            ])
        
        # Add general ADHD recommendations
        recommendations.extend([
            "🎯 Focus on one task at a time",
            "📋 Use visual reminders and checklists",
            "🏆 Celebrate small wins to maintain motivation"
        ])
        
        optimized_workflow["recommendations"] = recommendations
        
        return {
            "success": True,
            "workflow": optimized_workflow
        }
        
    except Exception as e:
        logger.error(f"Error optimizing workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/workflow/pomodoro")
async def create_pomodoro_workflow(data: WorkflowRequest):
    """Create a Pomodoro-based workflow for ADHD users"""
    try:
        tasks = data.tasks
        energy_level = data.energy_level
        
        # Pomodoro settings based on energy level
        if energy_level == "high":
            work_time = 25
            break_time = 5
            long_break = 15
        elif energy_level == "medium":
            work_time = 20
            break_time = 5
            long_break = 10
        else:  # low energy
            work_time = 15
            break_time = 5
            long_break = 10
        
        pomodoro_sessions = []
        total_pomodoros = 0
        
        for task in tasks:
            # Estimate pomodoros needed based on task complexity
            if task.difficulty == "easy":
                pomodoros_needed = 1
            elif task.difficulty == "medium":
                pomodoros_needed = 2
            else:  # hard
                pomodoros_needed = 3
            
            for i in range(pomodoros_needed):
                session = {
                    "id": f"pomodoro_{total_pomodoros + 1}",
                    "task": task.text,
                    "work_time": work_time,
                    "break_time": break_time if total_pomodoros < 3 else long_break,
                    "is_long_break": total_pomodoros >= 3,
                    "session_number": total_pomodoros + 1
                }
                pomodoro_sessions.append(session)
                total_pomodoros += 1
                
                # Reset counter after long break
                if total_pomodoros >= 4:
                    total_pomodoros = 0
        
        return {
            "success": True,
            "pomodoro_workflow": {
                "sessions": pomodoro_sessions,
                "total_sessions": len(pomodoro_sessions),
                "estimated_total_time": len(pomodoro_sessions) * (work_time + break_time),
                "settings": {
                    "work_time": work_time,
                    "break_time": break_time,
                    "long_break": long_break
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating pomodoro workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/workflow/demo")
async def get_demo_workflow():
    """Get demo workflow data for testing"""
    return {
        "success": True,
        "workflow": {
            "steps": [
                {
                    "id": "step_1",
                    "name": "Check emails",
                    "description": "Complete: Check emails",
                    "estimated_time": 15,
                    "energy_required": "low",
                    "priority": 1
                },
                {
                    "id": "step_2", 
                    "name": "Write report",
                    "description": "Complete: Write report",
                    "estimated_time": 45,
                    "energy_required": "high",
                    "priority": 2
                }
            ],
            "total_estimated_time": 60,
            "energy_plan": {
                "focus_blocks": "1-2 hours of focused work",
                "break_schedule": "10 min break every 30 minutes",
                "recommended_tasks": "Medium complexity tasks"
            },
            "recommendations": [
                "🎯 Focus on one task at a time",
                "📋 Use visual reminders and checklists",
                "🏆 Celebrate small wins to maintain motivation"
            ]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
