# src/tools/web_search.py
import os
import requests
from langchain_core.tools import tool
from src.helpers.logger import get_logger

logger = get_logger()
SERPER_URL = "https://google.serper.dev/search"


@tool
def web_search(query: str) -> str:
    """Search the web (Google via Serper) for travel info: attractions,
    local tips, safety, weather, seasonal advice. Returns up to 8 results
    as 'title - snippet (link)' lines."""
    api_key = os.getenv("SERPER_API_KEY")
    if not api_key:
        logger.warning("SERPER_API_KEY not set")
        return "no results (SERPER_API_KEY missing)"

    logger.info(f"Serper search | query='{query}'")
    try:
        resp = requests.post(
            SERPER_URL,
            headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
            json={"q": query, "num": 8},
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
        logger.info(f"Serper raw response: {data}")
        organic = data.get("organic", [])[:8]
        if not organic:
            return "no results"
        return "\n".join(
            f"- {r.get('title','')} - {r.get('snippet','')} ({r.get('link','')})"
            for r in organic
        )
    except Exception as e:
        logger.error(f"Serper search failed: {e}")
        return f"search failed: {e}"
