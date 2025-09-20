import os
from typing import Dict, List, Optional

class MotivateAgent:
    def __init__(self):
        self.letta_api_key = os.getenv("LETTA_API_KEY")
    
    def get_personalized_motivation(self, user_id: str, current_mood: Optional[str] = None, recent_tasks: Optional[List] = None) -> Dict:
        """Get personalized ADHD motivation using Letta memory"""
        
        # ADHD-specific motivational messages
        motivation_by_mood = {
            "overwhelmed": "You've got this! Break it down into tiny steps. Each small win counts. 🌟",
            "tired": "It's okay to rest. Your brain needs fuel. Take care of yourself first. 💙",
            "frustrated": "This feeling is temporary. You've overcome challenges before. One step at a time. 💪",
            "focused": "You're in the zone! Ride this wave of focus and make the most of it! ⚡",
            "anxious": "Breathe. You are capable and strong. This anxiety doesn't define you. 🌸",
            "energetic": "Channel this energy! You can accomplish so much right now! 🚀"
        }
        
        default_motivation = "Every step forward is progress. You're doing better than you think! ✨"
        
        # Safely get the motivation message
        message = default_motivation
        if current_mood in motivation_by_mood:
            message = motivation_by_mood[current_mood]
            
        return {
            "message": message,
            "personalized": True,
            "adhd_tip": "Remember: Progress, not perfection!",
            "energy_boost": True
        }
    
    def process_general_query(self, query: str) -> str:
        """Process general voice queries with ADHD-friendly responses"""
        
        # Simple keyword-based responses for common queries
        query_lower = query.lower()
        
        if any(word in query_lower for word in ["help", "what can you do", "commands"]):
            return "I can help you add tasks, track your mood, and provide motivation! Try saying 'Add groceries to Monday' or tell me how you're feeling."
        
        elif any(word in query_lower for word in ["how are you", "status", "feeling"]):
            return "I'm here to support you! How are you feeling today? I can help adjust your workspace to match your mood."
        
        elif any(word in query_lower for word in ["task", "todo", "remind"]):
            return "I can help you add tasks! Just say 'Add [task name] to [day]' and I'll add it to your schedule."
        
        elif any(word in query_lower for word in ["mood", "feeling", "emotion"]):
            return "I can help track your mood and adjust your workspace colors! Tell me how you're feeling and I'll adapt the interface."
        
        elif any(word in query_lower for word in ["motivation", "encourage", "support"]):
            return "You're doing great! Every small step counts. Remember: progress, not perfection. What would you like to work on today?"
        
        else:
            return "I understand you're trying to communicate with me. You can ask me to add tasks, change your mood, or just tell me how you're feeling. I'm here to help!" 