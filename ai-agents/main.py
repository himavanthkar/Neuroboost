from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="NeuroBoost AI Agents Service",
    description="Service to manage and interact with various AI agents.",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "AI Agents service is running"}

# You can add routes for different agents here
# For example: /chat, /summarize, /analyze-emotion 