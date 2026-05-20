# src/agents/itinerary_agent.py
"""
Itinerary Planner Agent - builds a structured day-by-day trip plan.

Tools:
  1. allocate_budget        (budget split across categories + per day)
  2. generate_packing_list  (weather/interest-aware packing list)

The LLM  calls these tools, then produces a structured Itinerary.
"""
from langgraph.prebuilt import create_react_agent
from src.helpers.llm import get_llm
from src.tools.budget_allocator import allocate_budget
from src.tools.packing_list import generate_packing_list
from src.models.travel_models import Itinerary, ResearchOutput
from src.prompts.itinerary_prompt import ITINERARY_AGENT_PROMPT, ITINERARY_USER_TEMPLATE
from src.helpers.logger import get_logger

logger = get_logger()


_agent = None


def get_itinerary_agent():
    """Compile the itinerary planner agent once."""
    global _agent
    if _agent is None:
        logger.info("Building itinerary planner agent")
        _agent = create_react_agent(
            model=get_llm(temperature=0.4),
            tools=[allocate_budget, generate_packing_list],
            prompt=ITINERARY_AGENT_PROMPT,
            response_format=Itinerary,
        )
    return _agent


def run_itinerary_agent(
    destination: str,
    start_date: str,
    end_date: str,
    num_days: int,
    travelers: int,
    budget: float,
    currency: str,
    interests: list[str],
    research: ResearchOutput,
    feedback: str = "",
) -> Itinerary:
    user_msg = ITINERARY_USER_TEMPLATE.format(
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        num_days=num_days,
        travelers=travelers,
        budget=budget,
        currency=currency,
        interests=", ".join(interests) if interests else "general",
        research=research.model_dump_json(indent=2),
        feedback=feedback or "(none)",
    )
    logger.info("Invoking itinerary planner agent")
    result = get_itinerary_agent().invoke({"messages": [{"role": "user", "content": user_msg}]})
    return result["structured_response"]
