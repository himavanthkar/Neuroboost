import os
import json
import anthropic
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class ADHDLanguageProcessor:
    """
    🧠 ADHD Language Understanding Processor
    
    Uses Claude 4 to understand fragmented thoughts and detect emotional context
    for Rejection Sensitive Dysphoria (RSD) and other ADHD-specific patterns.
    """
    
    def __init__(self):
        self.anthropic_client = None
        
        # Try multiple ways to get the API key
        api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY")
        
        if api_key:
            try:
                self.anthropic_client = anthropic.Anthropic(api_key=api_key)
                logger.info("✅ Claude 4 client initialized for ADHD language processing")
                # Test the connection
                self._test_claude_connection()
            except Exception as e:
                logger.error(f"Failed to initialize Claude 4 client: {e}")
                self.anthropic_client = None
        else:
            logger.warning("ANTHROPIC_API_KEY not found - using fallback processing")
            logger.info("Available env vars: " + str([k for k in os.environ.keys() if 'API' in k or 'KEY' in k]))
    
    def _test_claude_connection(self):
        """Test Claude 4 connection with a simple prompt"""
        try:
            response = self.anthropic_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=10,
                messages=[{"role": "user", "content": "Say 'Hello'"}]
            )
            logger.info("✅ Claude 4 connection test successful")
        except Exception as e:
            logger.error(f"❌ Claude 4 connection test failed: {e}")
            self.anthropic_client = None
    
    def process_adhd_speech(self, transcript: str) -> Dict:
        """
        🎤 Process ADHD speech patterns and fragmented thoughts
        
        Handles:
        - Fragmented thoughts: "That email thing... doctor... insurance stuff"
        - Emotional context detection for RSD
        - Task extraction from scattered speech
        - Urgency and priority detection
        """
        try:
            if not self.anthropic_client:
                return self._fallback_processing(transcript)
            
            prompt = f"""
            You are an ADHD language understanding specialist. Analyze this speech input from someone with ADHD:
            
            "{transcript}"
            
            ADHD Speech Patterns to Detect:
            1. **Fragmented Thoughts**: Incomplete sentences, scattered ideas, context switching
            2. **RSD (Rejection Sensitive Dysphoria)**: Emotional sensitivity, fear of rejection, overthinking
            3. **Executive Function Challenges**: Difficulty organizing thoughts, time blindness, task overwhelm
            4. **Hyperfocus Indicators**: Intense focus on specific topics, detailed explanations
            5. **Emotional Dysregulation**: Rapid mood changes, emotional intensity
            
            Return JSON with this structure:
            {{
                "processed_text": "Cleaned and structured version of the input",
                "extracted_tasks": [
                    {{
                        "task": "Clear task description",
                        "priority": "high/medium/low",
                        "urgency": "immediate/soon/later",
                        "emotional_context": "RSD indicators, stress level, etc.",
                        "confidence": 0.0-1.0
                    }}
                ],
                "emotional_state": {{
                    "primary_emotion": "frustrated/anxious/overwhelmed/excited/focused/etc.",
                    "rsd_indicators": ["list of RSD-related patterns"],
                    "stress_level": "low/medium/high",
                    "confidence": 0.0-1.0
                }},
                "adhd_patterns": {{
                    "fragmentation_level": "low/medium/high",
                    "context_switches": ["list of topic changes"],
                    "executive_function_challenges": ["list of EF issues"],
                    "hyperfocus_indicators": ["list of hyperfocus signs"]
                }},
                "recommendations": [
                    "ADHD-friendly suggestions based on the analysis"
                ],
                "processing_confidence": 0.0-1.0
            }}
            
            Focus on understanding the underlying intent and emotional state, not just the literal words.
            """
            
            response = self.anthropic_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # Extract text content
            text_content = ""
            for block in response.content:
                if block.type == "text":
                    text_content += block.text
            
            if not text_content:
                raise ValueError("No text content found in Claude response")
            
            result = json.loads(text_content)
            result["timestamp"] = datetime.now().isoformat()
            result["original_transcript"] = transcript
            
            logger.info(f"ADHD language processing completed: {len(result.get('extracted_tasks', []))} tasks extracted")
            return result
            
        except Exception as e:
            logger.error(f"Error in ADHD language processing: {e}")
            return self._fallback_processing(transcript)
    
    def _fallback_processing(self, transcript: str) -> Dict:
        """
        Fallback processing when Claude 4 is not available
        """
        # Simple keyword-based processing
        transcript_lower = transcript.lower()
        
        # Basic task extraction
        tasks = []
        if any(word in transcript_lower for word in ["email", "call", "meeting", "appointment"]):
            tasks.append({
                "task": "Handle communication task",
                "priority": "medium",
                "urgency": "soon",
                "emotional_context": "neutral",
                "confidence": 0.6
            })
        
        # Basic emotional detection
        emotional_state = {
            "primary_emotion": "neutral",
            "rsd_indicators": [],
            "stress_level": "low",
            "confidence": 0.5
        }
        
        if any(word in transcript_lower for word in ["worried", "anxious", "scared", "nervous"]):
            emotional_state["primary_emotion"] = "anxious"
            emotional_state["stress_level"] = "high"
            emotional_state["rsd_indicators"].append("anxiety about tasks")
        
        if any(word in transcript_lower for word in ["frustrated", "angry", "annoyed"]):
            emotional_state["primary_emotion"] = "frustrated"
            emotional_state["stress_level"] = "medium"
        
        return {
            "processed_text": transcript,
            "extracted_tasks": tasks,
            "emotional_state": emotional_state,
            "adhd_patterns": {
                "fragmentation_level": "medium",
                "context_switches": [],
                "executive_function_challenges": [],
                "hyperfocus_indicators": []
            },
            "recommendations": ["Consider breaking tasks into smaller steps"],
            "processing_confidence": 0.4,
            "timestamp": datetime.now().isoformat(),
            "original_transcript": transcript
        }
    
    def detect_rsd_patterns(self, text: str) -> List[Dict]:
        """
        🔍 Specific RSD (Rejection Sensitive Dysphoria) pattern detection
        """
        rsd_patterns = []
        
        if not self.anthropic_client:
            return self._simple_rsd_detection(text)
        
        try:
            prompt = f"""
            Analyze this text for Rejection Sensitive Dysphoria (RSD) patterns in ADHD:
            
            "{text}"
            
            RSD Patterns to Detect:
            1. **Fear of Rejection**: "What if they think I'm stupid?", "I hope they don't judge me"
            2. **Overthinking Social Interactions**: "Did I say something wrong?", "They probably hate me now"
            3. **Emotional Sensitivity**: "I'm so sensitive", "Everything hurts my feelings"
            4. **Perfectionism**: "It has to be perfect", "I can't make any mistakes"
            5. **Avoidance**: "I don't want to try because I might fail"
            6. **Emotional Dysregulation**: Rapid mood changes, intense emotional responses
            
            Return JSON array of detected patterns:
            [
                {{
                    "pattern_type": "fear_of_rejection/overthinking/perfectionism/etc.",
                    "confidence": 0.0-1.0,
                    "text_evidence": "specific phrase or context",
                    "severity": "mild/moderate/severe",
                    "recommendation": "coping strategy or support suggestion"
                }}
            ]
            """
            
            response = self.anthropic_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=800,
                messages=[{"role": "user", "content": prompt}]
            )
            
            text_content = ""
            for block in response.content:
                if block.type == "text":
                    text_content += block.text
            
            if text_content:
                return json.loads(text_content)
            
        except Exception as e:
            logger.error(f"Error in RSD pattern detection: {e}")
        
        return self._simple_rsd_detection(text)
    
    def _simple_rsd_detection(self, text: str) -> List[Dict]:
        """
        Simple keyword-based RSD detection
        """
        text_lower = text.lower()
        patterns = []
        
        # Fear of rejection
        if any(phrase in text_lower for phrase in ["what if", "hope they don't", "think i'm", "judge me"]):
            patterns.append({
                "pattern_type": "fear_of_rejection",
                "confidence": 0.7,
                "text_evidence": "fear of judgment or rejection",
                "severity": "moderate",
                "recommendation": "Practice self-compassion and remember that others' opinions don't define your worth"
            })
        
        # Perfectionism
        if any(word in text_lower for word in ["perfect", "mistake", "wrong", "failure"]):
            patterns.append({
                "pattern_type": "perfectionism",
                "confidence": 0.6,
                "text_evidence": "perfectionist tendencies",
                "severity": "moderate",
                "recommendation": "Remember that progress is more important than perfection"
            })
        
        return patterns
    
    def extract_tasks_from_fragments(self, fragments: List[str]) -> List[Dict]:
        """
        🔧 Extract structured tasks from fragmented thoughts
        """
        if not fragments:
            return []
        
        combined_text = " ".join(fragments)
        return self.process_adhd_speech(combined_text).get("extracted_tasks", [])
    
    def get_emotional_support_response(self, emotional_state: Dict) -> str:
        """
        💝 Generate supportive responses based on emotional state
        """
        emotion = emotional_state.get("primary_emotion", "neutral")
        stress_level = emotional_state.get("stress_level", "low")
        
        support_responses = {
            "anxious": {
                "low": "I understand you're feeling a bit anxious. Let's take this one step at a time.",
                "medium": "It's okay to feel anxious. Would you like to break this down into smaller, more manageable pieces?",
                "high": "I can see you're really anxious right now. Let's pause and take a few deep breaths together. You're doing great."
            },
            "frustrated": {
                "low": "I hear your frustration. Let's work through this together.",
                "medium": "Frustration is totally normal. Sometimes taking a short break helps clear the mind.",
                "high": "I can feel your frustration, and it's completely valid. Let's step back and approach this differently."
            },
            "overwhelmed": {
                "low": "It sounds like you have a lot on your plate. Let's organize this together.",
                "medium": "Being overwhelmed is really tough. Let's prioritize what's most important right now.",
                "high": "I can see you're feeling really overwhelmed. Let's take a moment to breathe and tackle this one thing at a time."
            },
            "neutral": {
                "low": "I'm here to help you organize your thoughts and tasks.",
                "medium": "Let's work together to make this more manageable.",
                "high": "Even when things feel chaotic, we can find a way through this together."
            }
        }
        
        return support_responses.get(emotion, {}).get(stress_level, "I'm here to support you.") 