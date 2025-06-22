import os
from typing import Dict, List

class MotivateAgent:
    def __init__(self):
        self.letta_api_key = os.getenv("LETTA_API_KEY")
    
    def get_personalized_motivation(self, user_id: str, current_mood: str = None, recent_tasks: List = None) -> Dict:
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
        
        return {
            "message": motivation_by_mood.get(current_mood, default_motivation),
            "personalized": True,
            "adhd_tip": "Remember: Progress, not perfection!",
            "energy_boost": True
        } 