# src/api/session/session_manager.py
import uuid
from threading import Lock
from src.helpers.logger import get_logger

logger = get_logger()


class SessionManager:
    """
    Tiny in-memory session store. The LangGraph checkpointer holds the actual
    graph state; this layer just keeps a registry of session_ids and metadata.
    Swap for Redis/Mongo in production.
    """

    def __init__(self):
        self._store: dict[str, dict] = {}
        self._lock = Lock()

    def create(self, request: dict) -> str:
        sid = str(uuid.uuid4())
        with self._lock:
            self._store[sid] = {"request": request, "stage": "research"}
        logger.info(f"Session created | id={sid}")
        return sid

    def get(self, sid: str) -> dict | None:
        return self._store.get(sid)

    def update(self, sid: str, patch: dict) -> None:
        with self._lock:
            if sid in self._store:
                self._store[sid].update(patch)


_manager: SessionManager | None = None


def get_session_manager() -> SessionManager:
    global _manager
    if _manager is None:
        _manager = SessionManager()
    return _manager
