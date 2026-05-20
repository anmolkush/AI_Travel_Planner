# src/agents/research_agent.py
"""
Research Agent - gathers destination intelligence.

Tools:
  1. web_search   (Serper.dev - mandatory)
  2. get_weather  (OpenWeather)

The LLM ) decides when to call each tool, then produces a
structured ResearchOutput. Built on langgraph.prebuilt.create_react_agent.
"""
from langgraph.prebuilt import create_react_agent
from src.helpers.llm import get_llm
from src.tools.web_search import web_search
from src.tools.weather import get_weather
from src.models.travel_models import ResearchOutput
from src.prompts.research_prompt import RESEARCH_AGENT_PROMPT, RESEARCH_USER_TEMPLATE
from src.helpers.logger import get_logger

logger = get_logger()


_agent = None


def get_research_agent():
    """Compile the research agent once."""
    global _agent
    if _agent is None:
        logger.info("Building research agent")
        _agent = create_react_agent(
            model=get_llm(),
            tools=[web_search, get_weather],
            prompt=RESEARCH_AGENT_PROMPT,
            response_format=ResearchOutput,
        )
    return _agent


def run_research_agent(
    destination: str,
    start_date: str,
    end_date: str,
    travelers: int,
    budget: str,
    interests: list[str],
    feedback: str = "",
) -> ResearchOutput:
    user_msg = RESEARCH_USER_TEMPLATE.format(
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        travelers=travelers,
        budget=budget,
        interests=", ".join(interests) if interests else "general",
        feedback=feedback or "(none)",
    )
    logger.info("Invoking research agent")
    result = get_research_agent().invoke({"messages": [{"role": "user", "content": user_msg}]})
    return result["structured_response"]
