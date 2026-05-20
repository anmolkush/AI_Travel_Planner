# src/graph/nodes/planner_node.py
from src.agents.itinerary_agent import run_itinerary_agent
from src.models.travel_models import ResearchOutput
from src.tools.budget_allocator import flat_split
from src.helpers.logger import get_logger

logger = get_logger()


def planner_node(state: dict) -> dict:
    """Run the Itinerary Planner Agent. The agent decides which tools to call."""
    logger.info("Planner node start")
    research = ResearchOutput(**state["research"])

    feedback = (state.get("feedback") or "").strip()
    is_revision = bool(feedback)
    if is_revision:
        logger.info(f"Planner revision | feedback_len={len(feedback)}")

    draft = run_itinerary_agent(
        destination=state["destination"],
        start_date=state["start_date"],
        end_date=state["end_date"],
        num_days=state["num_days"],
        travelers=state["travelers"],
        budget=state["budget"],
        currency="INR",
        interests=state.get("interests", []),
        research=research,
        feedback=feedback,
    )

    # Lock the itinerary currency to INR - the LLM occasionally falls back to the
    # Pydantic default if it forgets the field.
    draft_dict = draft.model_dump()
    draft_dict["currency"] = "INR"
    draft_dict["budget_breakdown"] = {
        **flat_split(state["budget"]),
        "per_person_total": round(state["budget"] / max(state["travelers"], 1), 2),
    }

    logger.info("Planner node complete")
    return {
        "draft_itinerary": draft_dict,
        "stage": "awaiting_review",
        "previous_stage": "planning" if is_revision else None,
        "feedback": None,
        "review_action": None,
        "revision_count": (state.get("revision_count") or 0) + (1 if is_revision else 0),
    }
