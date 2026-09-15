# Project status (internal notes)

This is not the public-facing readme, it's a working record of what's actually solid versus
what's held together with fallbacks or not built yet. Based on reading the code and running
each service locally. Useful for whoever is picking this project back up.

## What's solid

- Frontend renders and the full UI/UX is there (React + Vite + Tailwind), as long as it has a
  valid `frontend/.env`.
- Task management (create/edit/delete, daily/weekly/calendar views) is fully wired to Supabase.
- The voice-to-task pipeline works end to end mechanically: VAPI webhook -> voice-service ->
  ai_agents -> Supabase.
- Mood-based theming renders correctly based on whatever mood value it gets back.
- Gamification UI (XP, cat companion, achievements) is implemented in the frontend.

## What's held together by fallback logic

The `ANTHROPIC_API_KEY` currently sitting in `.env` gets rejected by Anthropic (401
Unauthorized, "API key is invalid"). This hits `ai_agents/agents/mood_agent.py`,
`ai_agents/agents/task_agent.py`, and `voice-service/adhd_language_processor.py` - all three
catch the failure and quietly return a generic or keyword-based fallback result. Nothing
visibly errors, but there's no real Claude reasoning happening until the key gets replaced.

Of the four agents in `ai_agents/agents/`, only two make real model calls:

- `task_agent.py` - real Claude call, keyword fallback if it fails
- `mood_agent.py` - real Claude call for text mood detection; the "audio mood" path claims to
  use Groq but is actually a hardcoded if/else on pace/pitch/energy, `self.groq_client` is
  initialized but never called
- `focus_agent.py` - stub. Initializes a Groq client but `analyze_focus_level()` always
  returns a hardcoded `{"focus_score": 0.7, ...}` no matter the input
- `motivate_agent.py` - stub. Stores a Letta API key but never calls Letta; motivation
  messages are a hardcoded dictionary keyed by mood string

## Known bugs

1. **Blank white screen without `frontend/.env`.** `services/supabase.js` calls
   `createClient()` with the literal placeholder `'YOUR_SUPABASE_URL'` when the env var isn't
   set, which throws `Invalid URL` at module load time and prevents React from mounting at
   all. No error shown, the page is just empty.
2. **API Gateway crashes on startup without Redis.** In `api-gateway/index.js`,
   `await subscriber.connect()` runs with no try/catch inside a fire-and-forget async block,
   so a refused connection becomes an unhandled promise rejection, which is fatal in Node. It
   prints "listening on port ..." and then dies immediately. Not on the critical path for
   voice-to-task (the frontend talks to voice-service directly), so it's safe to skip in local
   dev.
3. The hardcoded fallback `SUPABASE_URL` in `ai_agents/main.py` is unreachable (DNS failure) -
   only matters if the real env var is also unset.
4. The "Quick Login" buttons on the login page are leftovers from the old Firebase demo
   accounts and won't work against a real Supabase backend unless matching users are created
   there manually.

## Dead code / leftovers

- `frontend/src/services/firebase.js` - a full Firebase Auth/Firestore setup from before the
  project moved to Supabase (see git history: "Migrate from Firebase to Supabase"). Only
  imported by `AuthModal.jsx`, which is itself dead.
- `AuthModal.jsx` + `AuthPage.jsx` + `frontend/src/services/api.js` +
  `api-gateway/src/routes/auth.js` - a second, fully implemented bcrypt/JWT/Postgres login
  system. Nothing in `App.jsx` routes to it, so it never runs. The live auth path is Supabase
  via `AuthContext.jsx` / `Login.jsx` / `SignUp.jsx`.
- `ai-agents/` (hyphen) - an orphaned stub FastAPI service (one echo `/chat` endpoint). Not
  referenced by `docker-compose.yml`, which uses `ai_agents/` (underscore).
- `NeuroBoost/workflow-engine/` - a stray nested folder containing only a `requirements.txt`.
  Not referenced anywhere.
- Two disconnected DB schemas: `database/supabase_schema.sql` (the live one) and
  `init-db/init.sql` (backs the dead Postgres/JWT auth path).
- Root `.env` still has placeholder values for `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, and
  `JWT_SECRET`.
- The plain `README` file (no extension) at the repo root is an old Docker Compose variant
  with a hackathon sponsor prize list, not documentation - kept for history, see
  `ORIGINAL_README.md` for the earlier project readme too.

## Not built yet

- `analytics/` - only a Dockerfile and requirements.txt, no application code
- `workflow-engine/` - same, empty scaffolding

## Suggested next steps

1. Replace the Anthropic API key and add visible error surfacing instead of a silent
   fallback.
2. Wrap the API Gateway's Redis `connect()` calls in try/catch so it degrades gracefully
   instead of crashing.
3. Pick one auth system (Supabase) and one DB schema, and remove the other.
4. Remove or finish `ai-agents/` (hyphen), `NeuroBoost/workflow-engine/`, `firebase.js`, and
   `AuthModal.jsx`/`AuthPage.jsx`.
5. Build out `analytics/` and `workflow-engine/`, or drop them from the project.
