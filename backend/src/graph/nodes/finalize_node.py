# src/graph/nodes/finalize_node.py
from src.helpers.logger import get_logger

logger = get_logger()


def finalize_node(state: dict) -> dict:
    """Lock the approved draft as the final itinerary."""
    logger.info("Finalize node start")
    final = dict(state.get("draft_itinerary") or {})
    logger.info("Finalize node complete")
    return {
        "final_itinerary": final,
        "stage": "final",
    }
