import os
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv("MCP_SERVICE_NAME", os.getenv("SERVICE_NAME", os.getenv("SERVICE_SLUG", "training_to_sop")))
SERVICE_SLUG = os.getenv("SERVICE_SLUG", "training_to_sop")
RUNTIME_MODE = "transitional_domain_in_app_main_placeholder_active"
RUNTIME_NOTE = "main.py serves MCP contract endpoints; domain routes in app.py are present but not mounted by the active entrypoint."

app = FastAPI(title=SERVICE_NAME)


@app.get("/health")
def health() -> Dict[str, str]:
    return {
        "status": "ok",
        "service": SERVICE_SLUG,
        "time": datetime.now(timezone.utc).isoformat(),
        "runtime_mode": RUNTIME_MODE,
    }


@app.post("/execute")
async def execute(request: Request) -> Dict[str, Any]:
    try:
        data = await request.json()
    except Exception:
        return {
            "ok": False,
            "status": "error",
            "service": SERVICE_SLUG,
            "error": "invalid request",
            "detail": "Request body must be valid JSON",
            "runtime_mode": RUNTIME_MODE,
        }

    if not isinstance(data, dict):
        return {
            "ok": False,
            "status": "error",
            "service": SERVICE_SLUG,
            "error": "invalid request",
            "detail": "Request body must be a JSON object",
            "runtime_mode": RUNTIME_MODE,
        }

    tool = data.get("toolId") or data.get("tool")
    input_data = data.get("input", {})

    if not isinstance(input_data, dict):
        return {
            "ok": False,
            "status": "error",
            "service": SERVICE_SLUG,
            "tool": str(tool) if tool is not None else None,
            "error": "invalid input",
            "detail": "input must be a JSON object",
            "runtime_mode": RUNTIME_MODE,
        }

    return {
        "ok": True,
        "status": "placeholder",
        "service": SERVICE_SLUG,
        "tool": str(tool) if tool is not None else None,
        "input": input_data,
        "runtime_mode": RUNTIME_MODE,
        "note": RUNTIME_NOTE,
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
