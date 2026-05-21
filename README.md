# AI Travel Planner

> **Live demo:** https://travel-planner.anmolkushwaha.in/ (no setup needed, just open and try)

A multi-agent travel planning system with **human-in-the-loop (HITL) approval**.

A user submits a travel request (destination, dates, budget, travelers, interests). A LangGraph orchestrator runs two specialised agents:

- a **Research Agent** that uses Serper (web search) and OpenWeather to gather destination intelligence
- an **Itinerary Planner Agent** that uses a budget allocator and a packing list generator to build a day-by-day plan

The workflow then **pauses** for the user to approve, reject with feedback, or modify the draft. On reject or modify, an LLM classifier inspects the feedback and routes back to either the Research Agent (for missing facts) or the Planner Agent (for pacing tweaks). Once approved, the final plan is produced.

The backend is **FastAPI + LangGraph**. The frontend is **Next.js (App Router) + Tailwind**. All monetary fields are in **INR**.

---

## Repo layout

```
ai_travel_planner/
├── backend/                          FastAPI + LangGraph
│   ├── main.py                       app entrypoint
│   ├── src/
│   │   ├── api/
│   │   │   ├── routers/plan_route.py        /plan endpoints (async workflow)
│   │   │   ├── schemas/plan_schema.py       Pydantic TravelRequest / ReviewRequest
│   │   │   └── session/session_manager.py   in-memory plan registry
│   │   ├── agents/
│   │   │   ├── research_agent.py            Agent 1: web_search + get_weather
│   │   │   └── itinerary_agent.py           Agent 2: allocate_budget + packing_list
│   │   ├── prompts/                         agent + classifier prompts
│   │   ├── tools/
│   │   │   ├── web_search.py                Serper.dev (mandatory)
│   │   │   ├── weather.py                   OpenWeather
│   │   │   ├── budget_allocator.py
│   │   │   └── packing_list.py
│   │   ├── graph/
│   │   │   ├── workflow.py                  StateGraph + MemorySaver
│   │   │   ├── state.py                     TravelState TypedDict
│   │   │   └── nodes/                       research, planner, hitl, finalize
│   │   ├── models/travel_models.py          Pydantic models for structured outputs
│   │   └── helpers/
│   │       ├── llm.py                       get_llm() reads OPENAI_MODEL from env
│   │       ├── feedback_router.py           LLM classifier for reject/modify
│   │       └── logger.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md                            detailed backend docs
│
└── frontend/                          Next.js 16 (App Router) + Tailwind 4
    ├── src/
    │   ├── app/
    │   │   ├── page.js                      home (travel-request form)
    │   │   └── plan/[id]/page.js            draft + HITL review + final
    │   ├── components/
    │   │   ├── home/                        HeroSection, TravelForm, InterestPicker
    │   │   ├── plan/                        ItineraryDisplay, DayCard, BudgetBreakdown,
    │   │   │                                PackingList, ReviewPanel, ProcessingState,
    │   │   │                                StatusBadge, FinalPlanView
    │   │   ├── layout/Navbar.js
    │   │   └── ui/                          Button, Input, ErrorAlert, LoadingSpinner
    │   └── lib/api.js                       fetch client + backend ↔ UI adapter
    ├── package.json
    └── .env.local.example
```

---

## Prerequisites

- **Python 3.12+**
- **Node 18+** (Next.js 16 will not run on older Node)
- API keys for **OpenAI**, **Serper.dev**, and **OpenWeather**

| Service | Where to get a key |
| --- | --- |
| OpenAI | https://platform.openai.com |
| Serper.dev (web search) | https://serper.dev - 2,500 free queries on signup |
| OpenWeather | https://openweathermap.org/api - free tier is enough |

If Serper or OpenWeather keys are missing the corresponding tool returns a fallback string and the workflow keeps running, so you can still try the end-to-end flow with just an OpenAI key.

---

## Setup and run

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# fill in OPENAI_API_KEY, SERPER_API_KEY, OPENWEATHER_API_KEY
# OPENAI_MODEL is optional (default gpt-4o-mini)

uvicorn main:app --reload --port 8000
```

Swagger UI: <http://localhost:8000/docs>

### Frontend

```bash
cd frontend
npm install

cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

Open <http://localhost:3000>.

---

## How it works (end-to-end)

1. **User submits the form** at `/`. The frontend sends `POST /plan` and redirects to `/plan/{id}`.

2. **`POST /plan` returns immediately** with `stage: "research"`. The LangGraph workflow runs in a background thread, so the user gets fast feedback while the agents work.

3. **Research stage (~20s).** The Research Agent (`create_react_agent`) decides when to call `web_search` (Serper) and `get_weather` (OpenWeather), then returns a structured `ResearchOutput`: summary, top attractions, local tips, safety notes, best-time advice.

4. **Planning stage (~20s).** The Itinerary Planner Agent uses `allocate_budget` (per-category INR split with per-day and per-person-per-day amounts) and `generate_packing_list` (weather + interest aware), then returns a structured `Itinerary` with day-by-day morning/afternoon/evening activities, per-day costs, a packing list, and a budget breakdown.

5. **HITL pause.** The graph hits `interrupt()` inside `hitl_node`. State is checkpointed in `MemorySaver` keyed on `thread_id == plan_id`. The frontend polls `GET /plan/{id}` every 4 seconds; the `stage` field flows `research -> planning -> awaiting_review` and the UI's multi-step indicator updates accordingly.

6. **User reviews the draft.** Three options on the review panel:
   - **Approve** - finalize as-is.
   - **Reject** with feedback - the workflow resumes; an LLM classifier decides whether to re-research (facts/places-level feedback) or re-plan (pacing/swap-level feedback).
   - **Modify** with feedback - same classifier as reject. The UI label is different to signal "lighter tweak", but the routing is identical so a modify like *"add the most famous attraction"* still triggers research.

7. **Resume.** `POST /plan/{id}/review` returns immediately with `stage: "processing"`. The resumed workflow runs in a background thread, pauses again at HITL with a new draft. The user can keep iterating.

8. **`GET /plan/{id}/final`** returns the finalized itinerary once approved.

---

## Frontend pages

| Route | What it shows |
| --- | --- |
| `/` | Travel-request form (destination, dates, budget, travelers as number input, interests as multi-select chips). Submits and redirects to `/plan/{id}`. |
| `/plan/{id}` | While the agents run: a multi-step indicator (Validate → Research → Draft → Review) with a status pill. When the draft is ready: a header line "Destination · N travelers · ~₹X / person", a budget breakdown card (accommodation / food / activities / transport / miscellaneous + per-person total), day-by-day cards with morning/afternoon/evening, a packing list grouped by category, and the Approve / Reject / Modify review panel. After approve: the finalized plan inline. |

The UI never talks to the backend shape directly. [frontend/src/lib/api.js](frontend/src/lib/api.js) is the single adapter that translates between the API (`stage`, `days`, `research`, `final_itinerary`) and what UI components expect (`status`, `daily_plan`, `research_summary`, `final_plan.trip_overview`).

---

## API contract

Backend endpoints (full Pydantic schemas at `/docs`):

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/plan` | Submit a travel request. Returns `plan_id` and `stage: "research"` immediately. |
| `GET`  | `/plan/{id}` | Current stage, draft itinerary, research output, pending review payload. Poll this. |
| `POST` | `/plan/{id}/review` | `{action: "approve" \| "reject" \| "modify", feedback?: string}`. Returns immediately. |
| `GET`  | `/plan/{id}/final` | Final itinerary. `409` until approved. |
| `GET`  | `/health` | Liveness probe. |

### POST /plan - example body

```json
{
  "destination": "Goa, India",
  "start_date": "2026-06-10",
  "end_date": "2026-06-13",
  "travelers": 2,
  "budget": 80000,
  "interests": ["beach", "food"]
}
```

### POST /plan - example response (immediate)

```json
{
  "plan_id": "3fdd812c-bd02-4077-9aa6-e9ac2c997e17",
  "stage": "research",
  "review_endpoint": "/plan/3fdd812c-.../review",
  "destination": "Goa, India",
  "start_date": "2026-06-10",
  "end_date": "2026-06-13",
  "travelers": 2,
  "budget": 80000.0,
  "interests": ["beach", "food"]
}
```

### POST /plan/{id}/review - example bodies

```json
{ "action": "approve" }
```

```json
{ "action": "reject", "feedback": "You missed Fushimi Inari, please add it" }
```

```json
{ "action": "modify", "feedback": "Swap Day 3 temple for a cooking class" }
```

### GET /plan/{id}/final - what comes back

```json
{
  "plan_id": "3fdd812c-...",
  "final_itinerary": {
    "destination": "Goa, India",
    "travelers": 2,
    "total_estimated_cost": 80000,
    "currency": "INR",
    "days": [
      { "day": 1, "date": "2026-06-10", "theme": "...",
        "morning": "...", "afternoon": "...", "evening": "...",
        "estimated_cost": 20000 },
      ...
    ],
    "packing_list": ["passport / ID", "swimwear", "sunscreen", ...],
    "budget_breakdown": {
      "accommodation": 28000,
      "food": 20000,
      "activities": 16000,
      "transport": 12000,
      "miscellaneous": 4000,
      "per_person_total": 40000
    },
    "notes": "..."
  }
}
```

---

## Design decisions

- **Real agents, not chains.** Both `research_agent` and `itinerary_agent` are `create_react_agent` with their own tool lists. The LLM picks which tool to call and how many times.
- **Structured Pydantic outputs.** Each agent finishes with `response_format=ResearchOutput` / `response_format=Itinerary`. The backend never parses free-form text from the LLM.
- **LangGraph `interrupt` + `MemorySaver` for HITL.** The graph pauses inside `hitl_node`; resume with `Command(resume=...)`. State naturally survives the pause because LangGraph checkpoints around the interrupt.
- **Async workflow.** Agent runs take ~30 seconds. Route handlers spawn a daemon thread and return immediately so the client can poll and render a live multi-step progress indicator.
- **One classifier for reject and modify.** Both feed their feedback string into `feedback_router.classify_feedback`, which returns either `research` or `planner`. The UI distinction is purely a label.
- **INR-only.** The PDF asked for a budget range; we collapsed to a single ceiling in INR. The planner prompt and `Itinerary.currency` are locked to INR; the LLM is explicitly told not to silently convert.
- **Tools degrade gracefully.** Missing API keys or upstream errors return a short fallback string. The workflow keeps running.
- **Raw tool responses logged.** Each tool prints its full response (Serper JSON, OpenWeather JSON, budget split, packing list) to `backend/logs/app.log` for debugging and audit.
- **Configurable model.** `OPENAI_MODEL` is read from `.env` (default `gpt-4o-mini`). Swap to a stronger model for better itineraries at higher cost.

---

## What I would improve with more time

- Persistent checkpointer (SQLite / Postgres) so plans survive process restarts.
- Real flight / hotel price tools (Skyscanner, Amadeus) instead of LLM-described prices.
- Server-sent events / WebSocket for live stage updates instead of 4-second polling.
- Per-day `PATCH /plan/{id}/day/{n}` for surgical edits.
- Auth, rate limiting, per-user session isolation.
- Unit tests on each tool with mocked HTTP, plus an integration test that walks approve / reject / modify.
- LangSmith tracing for token cost and latency per agent step.
- Tighter prompt tuning for budget honoring - the planner sometimes prices low.

## Assumptions

- One user per session; no auth (take-home scope).
- The budget is a single ceiling in INR. The spec asked for a range; collapsed for simplicity.
- Current weather is a reasonable proxy for the travel window. A forecast API would be more accurate for trips far in the future.
- `gpt-4o-mini` is good enough for the structured outputs; no validator retry loop.
- LangGraph checkpointer semantics for `interrupt` and `Command(resume=...)` are as documented at the time of writing.

---

For backend-only details (orchestrator internals, node-by-node flow, full tool docstrings, granular design tradeoffs), see [backend/README.md](backend/README.md).
