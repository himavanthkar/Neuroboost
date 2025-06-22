import os
import json
import hmac
import hashlib
from typing import Dict, Any, Optional

from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx

# Load environment variables from .env file
load_dotenv()

import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Voice Service")

AI_AGENTS_URL = os.getenv("AI_AGENTS_URL", "http://ai-agents:8000")
VAPI_WEBHOOK_SECRET = os.getenv("VAPI_WEBHOOK_SECRET", "your_webhook_secret_here")

# --- VAPI Webhook Models ---

class VAPIFunctionCall(BaseModel):
    name: str
    parameters: Dict[str, Any]

class VAPIMessage(BaseModel):
    type: str
    call: Optional[Dict] = None
    transcript: Optional[str] = None
    functionCall: Optional[VAPIFunctionCall] = None

class VAPIWebhookRequest(BaseModel):
    message: VAPIMessage

# --- Security ---

def verify_vapi_signature(payload: bytes, signature: str, secret: str) -> bool:
    """
    Verify VAPI webhook signature for security.
    """
    if not signature or not secret:
        # In development, you might allow this, but it's a risk.
        logger.warning("Signature or secret not provided. Skipping verification.")
        return True # Be permissive in dev if you don't have a secret yet.
    
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(f"sha256={expected_signature}", signature)

# --- Task Processing Logic ---

async def process_voice_to_tasks(transcript: str) -> Dict[str, Any]:
    """
    Calls the AI Agents service and enhances the response for voice output.
    """
    if not transcript:
        return {
            "summary": "It seems I didn't catch that.",
            "tasks": [],
            "encouragement": "Could you please try telling me again?",
        }
    
    try:
        # Call your existing AI Agents service
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AI_AGENTS_URL}/tasks/from-voice",
                json={"transcript": transcript}
            )
            response.raise_for_status()
            raw_response = response.json()
        
        # The ai-agents service returns a dict with a 'tasks' list inside it.
        tasks_list = raw_response.get("tasks", [])
        
        # Enhance for ADHD-friendly voice response
        if not tasks_list:
            return {
                "summary": "I didn't find any specific tasks in what you said.",
                "tasks": [],
                "encouragement": "That's perfectly okay! Is there anything else on your mind?",
            }
        
        enhanced_tasks = {
            "summary": f"Great! I found {len(tasks_list)} things for you to work on.",
            "tasks": tasks_list,
            "encouragement": "You got this! We can tackle them one step at a time.",
            "next_action": "Which one feels most manageable to start with?"
        }
        
        return enhanced_tasks
        
    except Exception as e:
        logger.error(f"Error processing transcript with AI Agent: {e}", exc_info=True)
        return {
            "summary": "I had a bit of trouble organizing that.",
            "tasks": [],
            "encouragement": "No worries though! Want to try telling me again?",
            "error": str(e)
        }

def format_tasks_for_speech(structured_tasks: Dict) -> str:
    """
    Format structured tasks for ADHD-friendly speech output.
    """
    if not structured_tasks.get("tasks"):
        return structured_tasks.get("encouragement", "Let's try that again!")
    
    speech_parts = []
    
    # Opening
    speech_parts.append(structured_tasks.get("summary", "Here's what I organized for you:"))
    
    # Tasks (limit to avoid overwhelming)
    tasks = structured_tasks["tasks"][:5]  # Limit to 5 for voice
    
    for i, task in enumerate(tasks, 1):
        # The structure from task_agent is a dict of dicts.
        task_title = task.get("title", "An un-named task")
        speech_parts.append(f"{i}. {task_title}")
    
    # Closing encouragement
    speech_parts.append(structured_tasks.get("encouragement", "You've got this!"))
    
    if structured_tasks.get("next_action"):
        speech_parts.append(structured_tasks["next_action"])
    
    return " ".join(speech_parts)

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Voice service is running"}

@app.post("/vapi-webhook")
async def vapi_webhook(request: Request, payload: VAPIWebhookRequest):
    """
    Enhanced webhook handler for VAPI web widget integration.
    """
    # Verify signature for production security
    # signature = request.headers.get("x-vapi-signature")
    # request_body = await request.body()
    # if not verify_vapi_signature(request_body, signature, VAPI_WEBHOOK_SECRET):
    #     raise HTTPException(status_code=401, detail="Invalid signature")

    message = payload.message
    logger.info(f"Received webhook of type: {message.type}")
    
    if message.type == "function-call" and message.functionCall:
        function_name = message.functionCall.name
        parameters = message.functionCall.parameters
        
        if function_name == "processTaskInput":
            # The transcript from the function call is the most reliable source.
            transcript = parameters.get("transcript", "")
            
            try:
                structured_tasks = await process_voice_to_tasks(transcript)
                
                # Return response for VAPI to speak
                return {
                    "result": format_tasks_for_speech(structured_tasks)
                }
            except Exception as e:
                logger.error(f"Error handling function call: {e}", exc_info=True)
                return {
                    "result": "I had trouble processing that. Could you try telling me again?"
                }

    elif message.type == "transcript" and message.transcript:
        # This can be used as a fallback or for logging purposes.
        logger.info(f"Processed transcript directly: {message.transcript}")
        return {"status": "transcript_received"}
    
    elif message.type == "end-of-call-report":
        call_data = message.call or {}
        logger.info(f"Call ended. Duration: {call_data.get('duration', 'unknown')}")
        return {"status": "end_of_call_logged"}
    
    return {"status": "acknowledged"}

@app.get("/health")
async def health_check():
    """Health check endpoint to verify the service is running."""
    return {
        "status": "healthy", 
        "service": "Voice Service"
    }

# This test endpoint can be removed or kept for debugging.
@app.post("/test-agent")
async def test_agent(request: Request):
    try:
        body = await request.json()
        transcript = body.get('transcript', '')
        
        if not transcript:
            raise HTTPException(status_code=400, detail="No transcript provided")
        
        structured_tasks = await process_voice_to_tasks(transcript)
        
        return {
            "status": "success",
            "input": transcript,
            "output": structured_tasks
        }
        
    except Exception as e:
        logger.error(f"Error in test endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) 