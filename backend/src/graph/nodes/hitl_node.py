# src/graph/nodes/hitl_node.py
from langgraph.types import interrupt
from src.helpers.logger import get_logger

logger = get_logger()


def hitl_node(state: dict) -> dict:
    """
    Pause the graph and surface the draft itinerary for human review.
    The interrupt payload is what /plan/{id} will show; the value returned by
    Command(resume=...) is what /plan/{id}/review sends back.
    """
    logger.info("HITL node: pausing for review")

    decision = interrupt({
        "stage": "awaiting_review",
        "draft_itinerary": state.get("draft_itinerary"),
        "instructions": (
            "Reply with one of: "
            "{'action':'approve'} | "
            "{'action':'reject','feedback':'...'} | "
            "{'action':'modify','feedback':'...'}"
        ),
    })

    action = (decision or {}).get("action", "approve")
    feedback = ((decision or {}).get("feedback") or "").strip() or None

    logger.info(f"HITL resumed | action={action} feedback_len={len(feedback or '')}")

    return {
        "review_action": action,
        "feedback": feedback,
    }
