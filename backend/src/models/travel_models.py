# src/models/travel_models.py
from pydantic import BaseModel, Field


class ResearchOutput(BaseModel):
    """Structured destination research."""
    summary: str = Field(..., description="Short overview of the destination.")
    attractions: list[str] = Field(..., description="Top attractions to visit.")
    local_tips: list[str] = Field(..., description="Practical local tips.")
    safety: list[str] = Field(default_factory=list, description="Safety notes.")
    best_time: str = Field("", description="Best time / seasonal note.")


class DayPlan(BaseModel):
    day: int
    date: str
    theme: str = Field("", description="Theme of the day, e.g. 'food & old town'.")
    morning: str
    afternoon: str
    evening: str
    estimated_cost: float = Field(0.0, description="Estimated cost for the day in INR.")


class Itinerary(BaseModel):
    """Structured day-by-day itinerary."""
    destination: str
    travelers: int
    total_estimated_cost: float
    currency: str = "INR"
    days: list[DayPlan]
    packing_list: list[str] = Field(default_factory=list)
    notes: str = ""
