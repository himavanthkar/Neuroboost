from fastapi import FastAPI, Request
from task_agent import TaskAgent
import json

app = FastAPI()

# Initialize the agent
task_agent = TaskAgent()

@app.get("/")
def read_root():
    return {"message": "AI Agents service is running"}

@app.post("/vapi-webhook")
async def handle_vapi_webhook(request: Request):
    """
    Endpoint to handle Vapi 'transcript-final' webhooks.
    """
    body = await request.json()
    
    # Vapi sends different message types, we only care about the final transcript
    if body.get('message', {}).get('type') == 'transcript-final':
        transcript = body['message']['transcript']
        
        # Process the transcript using our agent
        extracted_data = task_agent.process_transcript(transcript)
        
        # The agent returns a JSON string, so we parse it
        if extracted_data:
            return json.loads(extracted_data)
        
        return {"status": "error", "message": "Agent returned no data"}
        
    return {"status": "ignored", "message": "Not a final transcript"} 