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

async def forward_function_call_to_ai_agent(function_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Forwards a function call to the appropriate endpoint on the AI Agents service.
    """
    endpoint_map = {
        "addTask": "/tasks/add",
        "removeTask": "/tasks/remove"
    }
    
    endpoint = endpoint_map.get(function_name)
    if not endpoint:
        logger.warning(f"No endpoint mapping for function: {function_name}")
        return {"success": False, "message": f"Unknown function '{function_name}'"}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{AI_AGENTS_URL}{endpoint}",
                json=parameters
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error calling AI agent for {function_name}: {e.response.text}")
        return {"success": False, "message": f"Error processing {function_name}: {e.response.text}"}
    except Exception as e:
        logger.error(f"Error forwarding function call '{function_name}': {e}", exc_info=True)
        return {"success": False, "message": "An internal error occurred."}

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
        
        logger.info(f"Executing function: {function_name} with params: {parameters}")
        
        # Forward to AI agent and get result
        result = await forward_function_call_to_ai_agent(function_name, parameters)
        
        # Return result to VAPI so it can be spoken to the user
        return {"result": result.get("message", "Action completed.")}

    elif message.type == "transcript" and message.transcript:
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
        
        # This part of the test endpoint is now outdated as we don't process raw transcripts this way.
        # It could be adapted to test the function call forwarding if needed.
        return {"status": "success", "message": "Test endpoint needs update for function calls."}
        
    except Exception as e:
        logger.error(f"Error in test endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) 