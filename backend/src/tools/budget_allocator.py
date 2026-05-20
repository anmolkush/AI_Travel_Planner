# src/tools/budget_allocator.py
import json
from langchain_core.tools import tool
from src.helpers.logger import get_logger

logger = get_logger()

# Common, opinionated split. Sums to 1.0.
DEFAULT_SPLIT = {
    "accommodation": 0.35,
    "food":          0.25,
    "activities":    0.20,
    "transport":     0.15,
    "miscellaneous": 0.05,
}


def flat_split(total_budget: float) -> dict[str, float]:
    """{category: total_amount} - used by planner_node so the UI can render the
    same breakdown the LLM was told to follow."""
    return {k: round(total_budget * pct, 2) for k, pct in DEFAULT_SPLIT.items()}


@tool
def allocate_budget(total_budget: float, num_days: int, num_travelers: int = 1) -> str:
    """Split a trip budget across common categories (accommodation, food,
    activities, transport, miscellaneous). For each category returns the
    total, per-day amount, and per-person-per-day amount so the planner can
    price each activity / meal correctly for the group size.
    """
    logger.info(f"allocate_budget | total={total_budget}, days={num_days}, travelers={num_travelers}")
    if num_days <= 0:
        num_days = 1
    if num_travelers <= 0:
        num_travelers = 1

    by_category = {
        k: {
            "total":              round(total_budget * pct, 2),
            "per_day":            round(total_budget * pct / num_days, 2),
            "per_person_per_day": round(total_budget * pct / num_days / num_travelers, 2),
        }
        for k, pct in DEFAULT_SPLIT.items()
    }

    out = {
        "total_budget":  total_budget,
        "num_days":      num_days,
        "num_travelers": num_travelers,
        "per_day_total": round(total_budget / num_days, 2),
        "by_category":   by_category,
    }
    logger.info(f"allocate_budget raw response: {out}")
    return json.dumps(out)
