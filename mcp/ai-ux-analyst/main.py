import os
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv("MCP_SERVICE_NAME", os.getenv("SERVICE_NAME", os.getenv("SERVICE_SLUG", "ai-ux-analyst")))
SERVICE_SLUG = os.getenv("SERVICE_SLUG", "ai-ux-analyst")

app = FastAPI(title=SERVICE_NAME)


@app.get("/health")
def health() -> Dict[str, str]:
    return {
        "status": "ok",
        "service": SERVICE_SLUG,
        "time": datetime.now(timezone.utc).isoformat(),
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
        }

    if not isinstance(data, dict):
        return {
            "ok": False,
            "status": "error",
            "service": SERVICE_SLUG,
            "error": "invalid request",
            "detail": "Request body must be a JSON object",
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
        }

    return {
        "ok": True,
        "status": "placeholder",
        "service": SERVICE_SLUG,
        "tool": str(tool) if tool is not None else None,
        "input": input_data,
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
