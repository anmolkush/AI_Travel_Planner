# src/api/schemas/plan_schema.py
from typing import Literal, Optional
from pydantic import BaseModel, Field, ConfigDict


class TravelRequest(BaseModel):
    destination: str = Field(..., description="City or region, e.g. 'Goa, India'.")
    start_date: str = Field(..., description="ISO date, e.g. '2026-06-10'.")
    end_date: str = Field(..., description="ISO date, e.g. '2026-06-15'.")
    travelers: int = Field(1, ge=1)
    budget: float = Field(..., gt=0, description="Total trip budget in INR.")
    interests: list[str] = Field(default_factory=list)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "destination": "Goa, India",
                "start_date": "2026-06-10",
                "end_date": "2026-06-15",
                "travelers": 2,
                "budget": 80000,
                "interests": ["food", "history", "photography"],
            }
        }
    )


class ReviewRequest(BaseModel):
    action: Literal["approve", "reject", "modify"]
    feedback: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "action": "reject",
                "feedback": "Day 2 is too packed - please slow it down and add a tea ceremony.",
            }
        }
    )
