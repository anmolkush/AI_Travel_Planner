# src/tools/packing_list.py
from langchain_core.tools import tool
from src.helpers.logger import get_logger

logger = get_logger()

BASE = [
    "passport / ID", "wallet, cards, local cash", "phone + charger",
    "universal adapter", "reusable water bottle", "basic toiletries",
    "small first-aid kit",
]

INTEREST_MAP = {
    "hiking": ["hiking shoes", "daypack"],
    "beach": ["swimwear", "beach towel"],
    "photography": ["camera + spare battery"],
    "food": ["antacids", "wet wipes"],
    "nightlife": ["smart-casual outfit"],
    "skiing": ["ski gloves", "thermal base layer"],
}


@tool
def generate_packing_list(temp_c: float, condition: str, interests: list[str]) -> list[str]:
    """Generate a packing list tailored to expected temperature (°C),
    weather condition (e.g. 'rain', 'clear sky'), and traveler interests."""
    logger.info(f"packing_list | temp={temp_c}, cond='{condition}', interests={interests}")
    items = list(BASE)
    cond = (condition or "").lower()

    if temp_c is not None:
        if temp_c <= 10:
            items += ["warm jacket", "thermal layers", "gloves", "beanie"]
        elif temp_c <= 20:
            items += ["light jacket", "long sleeves"]
        else:
            items += ["sunscreen", "sunglasses", "hat", "light clothing"]

    if any(k in cond for k in ("rain", "drizzle", "thunder")):
        items += ["compact umbrella", "waterproof shoes"]

    for tag in interests or []:
        items += INTEREST_MAP.get(tag.lower(), [])

    seen, out = set(), []
    for x in items:
        if x not in seen:
            seen.add(x)
            out.append(x)
    logger.info(f"generate_packing_list raw response: {out}")
    return out
