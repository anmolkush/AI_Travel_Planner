"""AI Travel Planner - FastAPI entrypoint."""
import sys
sys.dont_write_bytecode = True

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.helpers.logger import get_logger
from src.api.routers.plan_route import plan_router

logger = get_logger()
load_dotenv()
logger.info("Environment variables loaded")

app = FastAPI(
    title="AI Travel Planner",
    description="Multi-agent travel planning with human-in-the-loop approval.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plan_router)
logger.info("Routers registered")


@app.get("/")
def home():
    return {"service": "ai-travel-planner", "status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}

# Run:
#   uvicorn main:app --reload --port 8000

