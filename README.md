# NeuroBoost

NeuroBoost is a productivity app built for ADHD brains. Talk to it and it turns what you say into tasks, tell it how you're feeling and the whole interface shifts color and layout to match, and it wraps the whole thing in a bit of gamification so tracking your day doesn't feel like a chore.

It started as a hackathon project built around a handful of sponsor APIs (Claude, Gemini, Groq, Vapi, Letta, Orkes).

## Features

**Task management**
- Add, edit, complete, and delete tasks from the UI or by voice
- Daily view, weekly view, and a calendar view
- Tasks are saved per user in Supabase, so nothing disappears when you close the tab

**Voice input**
- Say something like "add groceries to Monday" and it shows up in your task list, no typing needed
- A dedicated ADHD language processor tries to make sense of scattered, rambling speech ("that email thing... doctor... insurance stuff, ugh") and pull the actual task out of it
- Also picks up on emotional patterns common in ADHD, like rejection sensitivity, and responds with something supportive instead of just logging a task

**Mood detection and theming**
- Reads what you type or say and shifts the app's colors and layout to match your headspace
- Calm blues when you're overwhelmed, energetic oranges when you're wired, soft grays when you're wiped out, and a few more in between

**Focus tools**
- CBT-style Pomodoro flow for focus sessions
- Analytics view with productivity and mood trend charts

**Gamification**
- XP and a leveling system
- A cat companion that grows as you knock out tasks
- Unlockable achievements

**Accounts**
- Sign up and log in through Supabase
- An admin dashboard for looking at all users and their activity

**Extras**
- Settings page, dark mode, sound notification when a task comes in

## Screenshots

| Landing page | Features section |
| --- | --- |
| ![Landing page](docs/screenshots/landing-page.png) | ![Features section](docs/screenshots/features-section.png) |

| Login page |
| --- |
| ![Login page](docs/screenshots/login-page.png) |

## Tech stack

- Frontend: React, Vite, Tailwind CSS
- Voice and AI services: Python, FastAPI
- API Gateway: Node.js, Express, WebSocket, Redis
- Database and auth: Supabase (Postgres)
- AI: Anthropic Claude
- Voice calls: Vapi

## Getting started

### Just the frontend

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then run it:

```bash
npm run dev
```

Open http://localhost:5173. Without real Supabase credentials the landing page still loads, but login and signup won't work.

### The whole app

```bash
# AI + voice services
cd ai_agents && python3 -m uvicorn main:app --port 8000 --reload
cd voice-service && python3 -m uvicorn main:app --port 8002 --reload

# API gateway (needs Redis running first)
redis-server &
cd api-gateway && npm install && npm run dev

# frontend
cd frontend && npm install && npm run dev
```

### Environment variables

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` - frontend, needed just to get the app to load at all
- `ANTHROPIC_API_KEY` - powers real mood detection and voice-to-task parsing
- `VAPI_API_KEY` and `VAPI_PUBLIC_KEY` - voice calling
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - only needed if you're running the API gateway

## Project layout

```
frontend/         React app - UI, pages, voice widget, all the views
ai_agents/        FastAPI service with the mood, task, focus, and motivation agents
voice-service/    FastAPI service that handles the Vapi webhook and ADHD language processing
api-gateway/      Express + WebSocket service for real-time updates
analytics/        analytics dashboard service (in progress)
workflow-engine/  automation/workflow service (in progress)
database/         Supabase schema
```

## Roadmap

- Build out the analytics dashboard with deeper productivity and mood trend insights
- Bring the workflow engine online for automating recurring routines
- Expand voice command coverage and natural language understanding
- More gamification: streaks, badges, and social/sharing features
- Polish real-time sync across devices
