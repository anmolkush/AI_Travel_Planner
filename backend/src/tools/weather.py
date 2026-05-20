# src/tools/weather.py
import os
import requests
from langchain_core.tools import tool
from src.helpers.logger import get_logger

logger = get_logger()
OWM_URL = "https://api.openweathermap.org/data/2.5/weather"


@tool
def get_weather(city: str) -> str:
    """Get current weather for a city (OpenWeather). Returns one line:
    'condition, temp_c=X, feels_like_c=Y, humidity=Z%, wind_mps=W'."""
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        logger.warning("OPENWEATHER_API_KEY not set")
        return "no weather data (OPENWEATHER_API_KEY missing)"

    logger.info(f"OpenWeather lookup | city='{city}'")
    try:
        resp = requests.get(
            OWM_URL,
            params={"q": city, "appid": api_key, "units": "metric"},
            timeout=15,
        )
        resp.raise_for_status()
        d = resp.json()
        logger.info(f"OpenWeather raw response: {d}")
        cond = (d.get("weather") or [{}])[0].get("description", "")
        main = d.get("main", {})
        wind = d.get("wind", {})
        return (
            f"{cond}, temp_c={main.get('temp')}, "
            f"feels_like_c={main.get('feels_like')}, "
            f"humidity={main.get('humidity')}%, "
            f"wind_mps={wind.get('speed')}"
        )
    except Exception as e:
        logger.error(f"OpenWeather lookup failed: {e}")
        return f"weather lookup failed: {e}"
