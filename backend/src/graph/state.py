# src/graph/state.py
from typing import TypedDict, Optional


class TravelState(TypedDict, total=False):
    # Input
    destination: str
    start_date: str
    end_date: str
    num_days: int
    travelers: int
    budget: float
    interests: list[str]

    # Agent outputs
    research: dict          # ResearchOutput.model_dump()
    draft_itinerary: dict   # Itinerary.model_dump()

    # HITL
    stage: str              # research | planning | awaiting_review | final | error
    previous_stage: Optional[str]  # set on revision passes so the UI can show "revising_*"
    revision_count: int            # number of times planner re-ran after a review
    review_action: Optional[str]   # approve | reject | modify
    feedback: Optional[str]

    # Final
    final_itinerary: Optional[dict]
    error: Optional[str]
