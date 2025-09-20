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

app = FastAPI(title="NeuroBoost Analytics", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class TaskData(BaseModel):
    id: str
    text: str
    done: bool
    date: str
    completedAt: Optional[str] = None
    type: str = "personal"
    energy_required: str = "medium"
    difficulty: str = "medium"
    source: str = "manual"

class MoodData(BaseModel):
    mood: str
    confidence: float
    timestamp: str
    source: str = "ai_detection"

class AnalyticsRequest(BaseModel):
    tasks: List[TaskData]
    moods: List[MoodData]
    user_id: str = "demo"

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "analytics"}

@app.post("/analytics/productivity")
async def analyze_productivity(data: AnalyticsRequest):
    """Analyze productivity patterns from tasks and moods"""
    try:
        tasks = data.tasks
        moods = data.moods
        
        # Basic productivity metrics
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.done])
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Task completion by day of week
        completion_by_day = {}
        for task in tasks:
            if task.done and task.completedAt:
                try:
                    day = datetime.fromisoformat(task.completedAt.replace('Z', '+00:00')).strftime('%A')
                    completion_by_day[day] = completion_by_day.get(day, 0) + 1
                except:
                    pass
        
        # Mood analysis
        mood_counts = {}
        for mood in moods:
            mood_counts[mood.mood] = mood_counts.get(mood.mood, 0) + 1
        
        # Energy level analysis
        energy_breakdown = {}
        for task in tasks:
            energy_breakdown[task.energy_required] = energy_breakdown.get(task.energy_required, 0) + 1
        
        # Generate insights
        insights = []
        
        if completion_rate > 80:
            insights.append("🎉 Excellent productivity! You're completing most of your tasks.")
        elif completion_rate > 60:
            insights.append("👍 Good progress! You're staying on track with most tasks.")
        elif completion_rate > 40:
            insights.append("📈 Room for improvement. Try breaking tasks into smaller steps.")
        else:
            insights.append("💪 Don't give up! Consider adjusting your task planning approach.")
        
        # Mood insights
        if mood_counts:
            most_common_mood = max(mood_counts, key=mood_counts.get)
            if most_common_mood in ["focused", "energetic"]:
                insights.append("⚡ You're in a great mental state! Channel this energy into your tasks.")
            elif most_common_mood in ["overwhelmed", "stressed"]:
                insights.append("🧘 Consider taking breaks and breaking tasks into smaller pieces.")
        
        return {
            "success": True,
            "analytics": {
                "productivity_score": round(completion_rate, 1),
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "completion_rate": round(completion_rate, 1),
                "completion_by_day": completion_by_day,
                "mood_distribution": mood_counts,
                "energy_breakdown": energy_breakdown,
                "insights": insights
            }
        }
        
    except Exception as e:
        logger.error(f"Error analyzing productivity: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analytics/patterns")
async def analyze_patterns(data: AnalyticsRequest):
    """Analyze ADHD-specific patterns"""
    try:
        tasks = data.tasks
        moods = data.moods
        
        # ADHD-specific pattern analysis
        patterns = {
            "hyperfocus_indicators": [],
            "task_switching": 0,
            "energy_patterns": {},
            "mood_cycles": {},
            "recommendations": []
        }
        
        # Analyze task switching (ADHD indicator)
        if len(tasks) > 1:
            task_types = [t.type for t in tasks]
            unique_types = len(set(task_types))
            if unique_types > len(tasks) * 0.7:  # High task switching
                patterns["task_switching"] = "high"
                patterns["recommendations"].append("Consider grouping similar tasks together to reduce context switching.")
            else:
                patterns["task_switching"] = "low"
        
        # Energy pattern analysis
        energy_by_time = {}
        for task in tasks:
            if task.completedAt:
                try:
                    hour = datetime.fromisoformat(task.completedAt.replace('Z', '+00:00')).hour
                    energy_by_time[hour] = energy_by_time.get(hour, 0) + 1
                except:
                    pass
        
        if energy_by_time:
            peak_hours = sorted(energy_by_time.items(), key=lambda x: x[1], reverse=True)[:3]
            patterns["energy_patterns"] = {
                "peak_hours": [hour for hour, count in peak_hours],
                "recommendation": f"Schedule important tasks during your peak hours: {', '.join(map(str, [hour for hour, count in peak_hours]))}"
            }
        
        # Mood cycle analysis
        if len(moods) > 3:
            mood_sequence = [m.mood for m in sorted(moods, key=lambda x: x.timestamp)]
            mood_changes = sum(1 for i in range(1, len(mood_sequence)) if mood_sequence[i] != mood_sequence[i-1])
            if mood_changes > len(moods) * 0.5:
                patterns["mood_cycles"] = "frequent_changes"
                patterns["recommendations"].append("Consider mood tracking to identify triggers and patterns.")
        
        return {
            "success": True,
            "patterns": patterns
        }
        
    except Exception as e:
        logger.error(f"Error analyzing patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/demo")
async def get_demo_analytics():
    """Get demo analytics data for testing"""
    return {
        "success": True,
        "analytics": {
            "productivity_score": 75.5,
            "total_tasks": 12,
            "completed_tasks": 9,
            "completion_rate": 75.0,
            "completion_by_day": {
                "Monday": 3,
                "Tuesday": 2,
                "Wednesday": 4
            },
            "mood_distribution": {
                "focused": 5,
                "energetic": 3,
                "calm": 2
            },
            "energy_breakdown": {
                "high": 4,
                "medium": 6,
                "low": 2
            },
            "insights": [
                "🎉 Excellent productivity! You're completing most of your tasks.",
                "⚡ You're in a great mental state! Channel this energy into your tasks."
            ]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
