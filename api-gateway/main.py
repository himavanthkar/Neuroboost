from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from ai_agents.task_agent import TaskAgent
import json
import logging
from typing import Dict, Any

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Agents Service")

# Initialize the agent once at startup
task_agent = TaskAgent()

@app.get("/")
def read_root():
    return {"message": "AI Agents service is running"}

@app.post("/vapi-webhook")
async def handle_vapi_webhook(request: Request):
    """
    Enhanced endpoint to handle all types of VAPI webhooks.
    """
    try:
        body = await request.json()
        message = body.get('message', {})
        message_type = message.get('type')
        
        logger.info(f"Received webhook of type: {message_type}")
        
        if message_type == 'transcript-final':
            return await handle_transcript_final(message)
        elif message_type == 'tool-call':
            return await handle_function_call(message)
        elif message_type == 'end-of-call-report':
            return await handle_end_of_call(body)
        else:
            # Acknowledge other message types without processing them
            logger.info(f"Acknowledging and ignoring message type: {message_type}")
            return {"status": "ignored", "type": message_type}
            
    except json.JSONDecodeError:
        logger.error("Received invalid JSON in webhook body.")
        # Still return 200 to VAPI to prevent retries on malformed requests
        return JSONResponse(status_code=200, content={"status": "error", "message": "Invalid JSON received"})
    except Exception as e:
        logger.error(f"Error processing VAPI webhook: {e}", exc_info=True)
        # Return 200 to VAPI even on internal server error
        return JSONResponse(
            status_code=200,
            content={"status": "error", "message": f"An internal error occurred: {str(e)}"}
        )

async def handle_transcript_final(message: Dict[str, Any]):
    """
    Handle final transcript messages. This is where we extract tasks.
    """
    transcript = message.get('transcript', '').strip()
    role = message.get('role', 'unknown')
    
    # We only want to process transcripts from the user.
    if role != 'user' or not transcript:
        return {"status": "ignored", "reason": "Not a user transcript or empty"}
    
    logger.info(f"Processing final transcript from user: '{transcript}'")
    
    try:
        # Process the transcript using our agent
        extracted_data_str = task_agent.process_transcript(transcript)
        extracted_data = json.loads(extracted_data_str)
        logger.info(f"TaskAgent extracted: {extracted_data}")
        
        # Vapi doesn't require a specific response for this webhook,
        # but returning what we found is good for debugging.
        return {
            "status": "success",
            "extracted_data": extracted_data
        }
            
    except Exception as e:
        logger.error(f"Error processing final transcript: {e}", exc_info=True)
        return {"status": "error", "message": f"Failed to process transcript: {str(e)}"}


async def handle_function_call(message: Dict[str, Any]):
    """
    Handle tool_calls messages from VAPI.
    The assistant wants to execute a function.
    """
    tool_call = message.get('tool_call', {})
    function_name = tool_call.get('name')
    parameters = tool_call.get('parameters', {})
    
    logger.info(f"Function call received: {function_name} with parameters: {parameters}")
    
    # VAPI expects a `tool_response` message in response.
    return {
        "tool_response": {
            "name": function_name,
            "content": f"Function '{function_name}' is not implemented yet."
        }
    }


async def handle_end_of_call(body: Dict[str, Any]):
    """
    Handle end-of-call webhooks. Contains the full call summary.
    """
    logger.info(f"Call ended. Full report: {body}")
    
    # This is a good place for final cleanup, analytics, or saving the full call log.
    return {"status": "processed", "message": "End-of-call report received."}

@app.get("/health")
async def health_check():
    """Health check endpoint to verify the service is running."""
    return {
        "status": "healthy", 
        "service": "AI Agents Service"
    } 