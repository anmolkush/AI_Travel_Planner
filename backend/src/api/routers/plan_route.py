# src/api/routers/plan_route.py
import threading
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from langgraph.types import Command

from src.api.schemas.plan_schema import TravelRequest, ReviewRequest
from src.api.session.session_manager import get_session_manager, SessionManager
from src.graph.workflow import get_workflow
from src.helpers.logger import get_logger

logger = get_logger()

plan_router = APIRouter(prefix="/plan", tags=["Travel Plan"])


def _num_days(start: str, end: str) -> int:
    return (date.fromisoformat(end) - date.fromisoformat(start)).days + 1


def _state_for(thread_id: str) -> dict:
    wf = get_workflow()
    snap = wf.get_state({"configurable": {"thread_id": thread_id}})
    return dict(snap.values or {})


def _interrupt_payload(thread_id: str):
    wf = get_workflow()
    snap = wf.get_state({"configurable": {"thread_id": thread_id}})
    for task in (snap.tasks or []):
        for itr in (getattr(task, "interrupts", None) or []):
            return getattr(itr, "value", None)
    return None


_REQUEST_FIELDS = ("destination", "start_date", "end_date", "travelers",
                   "budget", "interests",
                   "previous_stage", "revision_count")


def _request_fields(state: dict) -> dict:
    """Return the original request fields + revision metadata the UI needs."""
    return {k: state.get(k) for k in _REQUEST_FIELDS if state.get(k) is not None}


def _run_in_thread(thread_id: str, payload, config: dict, manager: SessionManager):
    """Run the workflow in a background thread so the API can return immediately.
    Updates the session manager on failure so the UI can show the error."""
    def runner():
        try:
            get_workflow().invoke(payload, config=config)
            state = _state_for(thread_id)
            manager.update(thread_id, {"stage": state.get("stage", "unknown")})
        except Exception as e:
            logger.error(f"Workflow thread failed: {e}", exc_info=True)
            manager.update(thread_id, {"stage": "error", "error": str(e)})

    threading.Thread(target=runner, name=f"plan-{thread_id[:8]}", daemon=True).start()


@plan_router.post("")
async def create_plan(
    request: TravelRequest,
    manager: SessionManager = Depends(get_session_manager),
):
    """Kick off a new travel plan. Returns immediately; the workflow runs in the
    background and progresses through research → planning → awaiting_review.
    Poll GET /plan/{id} to watch it."""
    try:
        num_days = _num_days(request.start_date, request.end_date)
        if num_days <= 0:
            raise HTTPException(status_code=400, detail="end_date must be on/after start_date")
    except ValueError:
        raise HTTPException(status_code=400, detail="dates must be ISO format YYYY-MM-DD")

    sid = manager.create(request.model_dump())
    config = {"configurable": {"thread_id": sid}}
    initial = {**request.model_dump(), "num_days": num_days, "stage": "research"}

    _run_in_thread(sid, initial, config, manager)

    return {
        "plan_id": sid,
        "stage": "research",
        "review_endpoint": f"/plan/{sid}/review",
        **request.model_dump(),
    }


@plan_router.get("/{plan_id}")
async def get_plan(plan_id: str, manager: SessionManager = Depends(get_session_manager)):
    """Get current plan status and draft."""
    if not manager.get(plan_id):
        raise HTTPException(status_code=404, detail="plan_id not found")

    state = _state_for(plan_id)
    if not state:
        # Workflow hasn't written its first checkpoint yet; surface what we know.
        meta = manager.get(plan_id) or {}
        return {
            "plan_id": plan_id,
            "stage": meta.get("stage", "research"),
            **(meta.get("request") or {}),
        }

    return {
        "plan_id": plan_id,
        "stage": state.get("stage"),
        "draft_itinerary": state.get("draft_itinerary"),
        "final_itinerary": state.get("final_itinerary"),
        "research": state.get("research"),
        "pending_review": _interrupt_payload(plan_id),
        **_request_fields(state),
    }


@plan_router.post("/{plan_id}/review")
async def submit_review(
    plan_id: str,
    review: ReviewRequest,
    manager: SessionManager = Depends(get_session_manager),
):
    """Submit HITL feedback - approve / reject / modify. Returns immediately;
    the resumed workflow runs in the background."""
    if not manager.get(plan_id):
        raise HTTPException(status_code=404, detail="plan_id not found")

    if _interrupt_payload(plan_id) is None:
        raise HTTPException(status_code=409, detail="plan is not awaiting review")

    wf = get_workflow()
    config = {"configurable": {"thread_id": plan_id}}

    # Optimistically flip stage in the LangGraph state itself so polling sees
    # "Revising plan" right away instead of staying on "awaiting_review" until
    # the first node finishes (~15s). Worst case the classifier picks research,
    # in which case polling will correct to "Re-researching" within 4s.
    if review.action != "approve":
        try:
            wf.update_state(config, {"stage": "planning", "previous_stage": "planning"})
        except Exception as e:
            logger.warning(f"optimistic update_state failed: {e}")

    _run_in_thread(plan_id, Command(resume=review.model_dump(exclude_none=True)), config, manager)

    return {
        "plan_id": plan_id,
        "stage": "processing",
        "review_endpoint": f"/plan/{plan_id}/review",
    }


@plan_router.get("/{plan_id}/final")
async def get_final(plan_id: str, manager: SessionManager = Depends(get_session_manager)):
    """Retrieve the finalized plan. Only available after approval."""
    if not manager.get(plan_id):
        raise HTTPException(status_code=404, detail="plan_id not found")

    state = _state_for(plan_id)
    if state.get("stage") != "final" or not state.get("final_itinerary"):
        raise HTTPException(status_code=409, detail="plan is not yet finalized")

    return {"plan_id": plan_id, "final_itinerary": state["final_itinerary"]}
