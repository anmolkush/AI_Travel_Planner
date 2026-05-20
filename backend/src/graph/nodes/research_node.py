# src/graph/nodes/research_node.py
from src.agents.research_agent import run_research_agent
from src.helpers.logger import get_logger

logger = get_logger()


def research_node(state: dict) -> dict:
    """Run the Research Agent. The agent decides which tools to call.
    If state['feedback'] is set (we're here from a reject loop), pass it through."""
    logger.info("Research node start")
    feedback = state.get("feedback") or ""
    is_revision = bool(feedback)

    research = run_research_agent(
        destination=state["destination"],
        start_date=state["start_date"],
        end_date=state["end_date"],
        travelers=state["travelers"],
        budget=f"{state['budget']} INR",
        interests=state.get("interests", []),
        feedback=feedback,
    )
    logger.info("Research node complete")
    return {
        "research": research.model_dump(),
        "stage": "planning",
        "previous_stage": "research" if is_revision else None,
        "feedback": None,
        "review_action": None,
        "revision_count": (state.get("revision_count") or 0) + (1 if is_revision else 0),
    }
