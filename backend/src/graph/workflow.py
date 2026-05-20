# src/graph/workflow.py
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from src.graph.state import TravelState
from src.graph.nodes.research_node import research_node
from src.graph.nodes.planner_node import planner_node
from src.graph.nodes.hitl_node import hitl_node
from src.graph.nodes.finalize_node import finalize_node
from src.helpers.feedback_router import classify_feedback
from src.helpers.logger import get_logger

logger = get_logger()


def _route_after_review(state: dict) -> str:
    """Decide what to do after the human-in-the-loop returns.

    - approve         → finalize
    - reject / modify → classifier picks 'research' or 'planner' based on the
                         feedback text. Reject and modify use the same logic;
                         the UI distinction is just a label.
    """
    action = state.get("review_action") or "approve"
    if action == "approve":
        return "finalize"
    return classify_feedback(state.get("feedback") or "")


# Module-level singleton - compiled once, reused across requests.
_compiled = None


def get_workflow():
    """Compile the LangGraph workflow with an in-memory checkpointer for HITL."""
    global _compiled
    if _compiled is not None:
        return _compiled

    logger.info("Compiling travel planner workflow")
    graph = StateGraph(TravelState)
    graph.add_node("research", research_node)
    graph.add_node("planner", planner_node)
    graph.add_node("hitl", hitl_node)
    graph.add_node("finalize", finalize_node)

    graph.add_edge(START, "research")
    graph.add_edge("research", "planner")
    graph.add_edge("planner", "hitl")
    graph.add_conditional_edges(
        "hitl",
        _route_after_review,
        {"research": "research", "planner": "planner", "finalize": "finalize"},
    )
    graph.add_edge("finalize", END)

    # MemorySaver = in-process checkpointer. Swap for SqliteSaver / Postgres in prod.
    _compiled = graph.compile(checkpointer=MemorySaver())
    return _compiled
