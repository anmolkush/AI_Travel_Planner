# src/helpers/feedback_router.py
"""LLM-based router that decides whether user feedback should re-run the
Research Agent or the Itinerary Planner Agent."""
from typing import Literal
from pydantic import BaseModel, Field
from src.helpers.llm import get_llm
from src.prompts.feedback_router_prompt import FEEDBACK_ROUTER_PROMPT
from src.helpers.logger import get_logger

logger = get_logger()


class FeedbackRoute(BaseModel):
    target: Literal["research", "planner"] = Field(
        ..., description="Which agent should handle the revision."
    )


def classify_feedback(feedback: str) -> str:
    """Return 'research' or 'planner' based on what the feedback is about.
    Empty feedback defaults to 'planner'."""
    if not (feedback or "").strip():
        return "planner"

    logger.info(f"Classifying feedback: {feedback[:100]}")
    llm = get_llm(temperature=0.0).with_structured_output(FeedbackRoute)
    result = llm.invoke(FEEDBACK_ROUTER_PROMPT.format(feedback=feedback))
    logger.info(f"Feedback routed to: {result.target}")
    return result.target
