import os, uuid
from datetime import datetime, timezone

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def new_correlation_id() -> str:
    return str(uuid.uuid4())

def safe_get_env(name: str, default=None):
    v = os.getenv(name)
    return v if v not in (None, "") else default
