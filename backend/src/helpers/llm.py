# src/helpers/llm.py
import os
from langchain_openai import ChatOpenAI
from src.helpers.logger import get_logger

logger = get_logger()


def get_llm(temperature: float = 0.3):
    """Return an OpenAI chat model. Reads OPENAI_MODEL and OPENAI_API_KEY from env."""
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    logger.info(f"Initializing LLM | model={model}, temp={temperature}")
    return ChatOpenAI(model=model, temperature=temperature, timeout=120)
