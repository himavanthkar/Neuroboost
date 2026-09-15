# NeuroBoost - AI-Powered ADHD Productivity Platform

NeuroBoost is a hackathon project that combines voice input, an AI "mood" detector, and a
gamified task manager into an ADHD-focused productivity app. It was built to target several
sponsor prize tracks (Anthropic, Google Gemini, Vapi, Groq, Letta, Orkes), which explains why
the codebase wires up more services and providers than are actually finished.

This document reflects a hands-on audit of the current branch: every claim below was checked
by reading the code and, where practical, by actually running the services and hitting their
endpoints (not just re-stating what an older README said).

## Screenshots

The landing page and login screen render correctly once the frontend has a valid `.env` file
(see [Known Issues](#known-issues-verified) below - by default it does not, and the app fails
to load at all).

| Landing page | Features section |
| --- | --- |
| ![Landing page](docs/screenshots/landing-page.png) | ![Features section](docs/screenshots/features-section.png) |

| Login page |
| --- |
| ![Login page](docs/screenshots/login-page.png) |

Note the "Quick Login" buttons on the login screen - they are leftovers from an earlier
Firebase-based demo user system and will fail against a real Supabase backend unless those
exact demo accounts are created there manually.

## What actually works today

| Area | Status | Notes |
| --- | --- | --- |
| Frontend UI (React/Vite/Tailwind) | Renders correctly | Requires a `frontend/.env` with real Supabase values - see bug below |
| Supabase auth + task storage | Works | Live path used by `Login.jsx`/`SignUp.jsx`/`MainApp.jsx` |
| Voice-to-task via VAPI webhook | Partially works | Endpoint and plumbing work; AI parsing silently falls back to keyword matching because the configured Anthropic key is rejected (401) |
| Mood detection | Partially works | Same Anthropic key problem - always returns a generic fallback mood, never a real Claude-derived one |
| Mood-based theming, gamification UI, CBT/Pomodoro views | UI implemented | Frontend components exist and render; not all are wired to real backend logic |
| API Gateway (Express + WebSocket) | Crashes on startup | Unhandled Redis connection error kills the process - see bug below |
| Analytics service | Not implemented | Directory only contains a `Dockerfile` and `requirements.txt`, no application code |
| Workflow engine | Not implemented | Same as above |

## Architecture

```
Frontend (React/Vite)  --->  Voice Service (FastAPI)  --->  AI Agents (FastAPI)  --->  Supabase
        |                                                         |
        +--------------------- Supabase (direct) --------------- +

API Gateway (Express + Redis pub/sub + WebSocket) - bridges Redis events to the frontend,
but is not on the critical path for voice-to-task (the frontend calls the Voice Service
directly) and currently crashes if Redis is unreachable.
```

| Service | Port | Tech | Real implementation? |
| --- | --- | --- | --- |
| `frontend/` | 5173 | React + Vite + Tailwind | Yes |
| `voice-service/` | 8002 | FastAPI | Yes (VAPI webhook, ADHD language processor) |
| `ai_agents/` | 8000 | FastAPI | Yes, but only 2 of 4 agents call a real model (see below) |
| `ai-agents/` (hyphen) | - | FastAPI | Orphaned stub, not used anywhere |
| `api-gateway/` | 3000 | Express + ws + Redis | Yes, but crashes without Redis |
| `analytics/` | 8001 | - | Empty (Dockerfile + requirements.txt only) |
| `workflow-engine/` | 8003 | - | Empty (Dockerfile + requirements.txt only) |

### AI agents - what's real vs. hardcoded

`ai_agents/agents/` has four agents. Only two actually call a model; the other two claim to
use Groq/Letta in their docstrings but never make an API call:

- `task_agent.py` (**real**): calls Anthropic Claude to turn a voice transcript into
  structured, ADHD-friendly tasks, with a keyword-based fallback if the call fails.
- `mood_agent.py` (**partially real**): calls Claude for text-based mood detection with a
  keyword fallback. The "audio mood" analysis claims to use Groq but is actually a hardcoded
  if/else on pace/pitch/energy labels - `self.groq_client` is initialized but never called.
- `focus_agent.py` (**stub**): initializes a Groq client but `analyze_focus_level()` always
  returns the same hardcoded score (`0.7`) and static suggestions regardless of input.
- `motivate_agent.py` (**stub**): stores a Letta API key but never calls Letta. Motivation
  messages are a hardcoded dictionary keyed by mood string.

## Known issues (verified)

These were reproduced directly, not just inferred from reading code:

1. **Frontend crashes to a blank white screen without `frontend/.env`.** There is no
   `frontend/.env` or `.env.example` in the repo. `services/supabase.js` calls
   `createClient()` with the placeholder string `'YOUR_SUPABASE_URL'` when the env var is
   missing, which throws `Invalid URL` at module load time and prevents React from mounting
   at all - no error is shown to the user, the page is just empty. Confirmed by running the
   dev server with and without a valid-format `VITE_SUPABASE_URL`.
2. **The configured `ANTHROPIC_API_KEY` is rejected by Anthropic** (`401 - API key is
   invalid`), confirmed by running `ai_agents` and `voice-service` live. Every "AI" endpoint
   (mood detection, voice-to-task, ADHD language analysis) silently swallows this error and
   returns its generic fallback response, so the app still "works" but never actually reasons
   about the input.
3. **The API Gateway crashes on startup whenever Redis is unreachable.** In `index.js`, the
   Redis subscriber is connected with `await subscriber.connect()` outside any try/catch,
   inside a fire-and-forget async block. A refused connection becomes an unhandled promise
   rejection, which Node treats as fatal. Confirmed by running `node index.js` without Redis -
   it prints "listening on port ..." and then immediately crashes.
4. **The hardcoded default `SUPABASE_URL` fallback in `ai_agents/main.py`
   (`https://hbarpylljytrdijjcmix.supabase.co`) is unreachable** (DNS resolution failure),
   confirmed via `/debug/tasks`.
5. **Two parallel, conflicting auth systems exist, and only one is reachable.** The routed
   pages (`Login.jsx`, `SignUp.jsx`) use Supabase auth via `AuthContext.jsx`. A second,
   completely separate implementation - `AuthModal.jsx` + `AuthPage.jsx` +
   `services/api.js` + `api-gateway/src/routes/auth.js` (a real bcrypt/JWT/Postgres login) -
   is fully implemented but **`AuthPage` is never imported or routed anywhere**, so it's dead
   code.
6. **Leftover Firebase integration.** `frontend/src/services/firebase.js` contains a full,
   working Firebase Auth/Firestore implementation with a hardcoded Firebase project config,
   from before the project migrated to Supabase (see git history: "Migrate from Firebase to
   Supabase"). It is only imported by the dead `AuthModal.jsx`, so it no longer runs, but it's
   still shipped in the bundle.
7. **Duplicate `ai-agents` directory.** Besides the real `ai_agents/` (underscore, used by
   `docker-compose.yml`), there is a second `ai-agents/` (hyphen) directory with a trivial
   stub FastAPI app (a single echo `/chat` endpoint). It isn't referenced by docker-compose or
   any other service - likely an early scaffold that was never deleted.
8. **Orphaned nested directory.** `NeuroBoost/workflow-engine/` (capitalized parent folder)
   exists at the repo root containing only a `requirements.txt`. It isn't referenced by
   docker-compose or any code path.
9. **Two disconnected database schemas.** `database/supabase_schema.sql` defines the tables
   actually used by the live Supabase path (`tasks`, `moods`, `users`, `voice_notes`,
   `focus_sessions`, `analytics_events`, `ai_conversations`, `user_goals`,
   `user_achievements`). `init-db/init.sql` is a separate Postgres bootstrap script for the
   dead api-gateway auth path. They are not the same database and are not kept in sync.
10. **Placeholder infrastructure credentials.** The root `.env` still has template values for
    `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, and `JWT_SECRET` (e.g. `your_secure_password`), so
    `docker-compose up` has not actually been run successfully end-to-end with this file.
11. **Stray `README` file (no extension)** at the repo root is not documentation - it's an
    old Docker Compose variant with a hackathon sponsor prize list. It's confusing to have
    both `README` and `README.md` side by side; left in place for now since removing it is
    outside the scope of this update, but it's a good cleanup candidate.

## Quick start

### Frontend only (UI preview, no backend required)

```bash
cd frontend
npm install
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF
npm run dev
# http://localhost:5173
```

Without a real Supabase project, the landing page and login/signup forms will render, but
authentication and task storage will not work.

### Full stack

```bash
# 1. Voice + AI services (Redis is optional for these two - they degrade gracefully)
cd ai_agents && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
cd voice-service && python3 -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload

# 2. API Gateway (requires Redis to be running, or it will crash - see Known Issues #3)
redis-server &
cd api-gateway && npm install && npm run dev

# 3. Frontend
cd frontend && npm install && npm run dev
```

### Required environment variables

| Variable | Used by | Required for |
| --- | --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | frontend | App to render at all (see bug #1) |
| `ANTHROPIC_API_KEY` | `ai_agents`, `voice-service` | Real mood detection / task parsing / ADHD language analysis |
| `GROQ_API_KEY`, `LETTA_API_KEY` | `ai_agents` | Currently unused at runtime despite being read (see agent breakdown above) |
| `VAPI_API_KEY`, `VAPI_PUBLIC_KEY` | voice widget, voice-service | Voice call integration |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | `api-gateway`, `ai_agents` | Real-time updates; gateway crashes without it, agents degrade gracefully |

## Testing commands

```bash
curl http://localhost:8000/health
curl http://localhost:8002/health
curl -X POST http://localhost:8000/mood/detect -H "Content-Type: application/json" \
  -d '{"text":"I am so overwhelmed with everything today"}'
```

## Recommended next steps

1. Add a `frontend/.env.example` and fail with a clear error message (instead of a blank
   screen) when Supabase env vars are missing.
2. Wrap the API Gateway's Redis `connect()` calls in try/catch so a missing Redis instance
   degrades gracefully instead of crashing the process, matching the Python services.
3. Replace or refresh the Anthropic API key, and add visible error surfacing (not silent
   fallback) so it's obvious when AI parsing isn't actually happening.
4. Remove dead code: `ai-agents/` (hyphen stub), `NeuroBoost/workflow-engine/`,
   `frontend/src/services/firebase.js`, `AuthModal.jsx`/`AuthPage.jsx`, and the api-gateway
   JWT/Postgres auth route - or finish and wire them up if they're still wanted.
5. Decide on one auth system and one database schema, and delete the other.
6. Implement or remove the `analytics` and `workflow-engine` services.
