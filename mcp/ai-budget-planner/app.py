import os
import platform
from datetime import datetime, timezone

from fastapi import FastAPI

SERVICE_NAME = os.getenv("SERVICE_NAME", "Ai Budget Planner")
SERVICE_SLUG = os.getenv("SERVICE_SLUG", "ai-budget-planner")
SERVICE_DESCRIPTION = os.getenv("SERVICE_DESCRIPTION", "Contract-first skeleton service for ai-budget-planner.")
SERVICE_VERSION = (
    os.getenv("SERVICE_VERSION")
    or os.getenv("GIT_SHA")
    or os.getenv("K_REVISION")
    or "1.0.0"
)
PORT = os.getenv("PORT", "8080")
LOG_LEVEL = os.getenv("LOG_LEVEL", "info")
ENV_VARS_REQUIRED = [
    "PORT",
    "SERVICE_NAME",
    "SERVICE_SLUG",
    "SERVICE_VERSION",
    "SERVICE_DESCRIPTION",
    "LOG_LEVEL",
    "GIT_SHA",
    "K_REVISION",
]

CAPABILITIES = []
INPUTS = []
OUTPUTS = []

app = FastAPI(title=SERVICE_NAME, version=SERVICE_VERSION)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "time": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/meta")
def meta():
    routes = sorted({route.path for route in app.routes if hasattr(route, "path")})
    return {
        "name": SERVICE_NAME,
        "slug": SERVICE_SLUG,
        "description": SERVICE_DESCRIPTION,
        "routes": routes,
        "env_vars_required": ENV_VARS_REQUIRED,
        "supports": {
            "tools": CAPABILITIES,
            "data": [],
        },
        "build": {
            "python": platform.python_version(),
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "capabilities": CAPABILITIES,
        "inputs": INPUTS,
        "outputs": OUTPUTS,
        "runtime": {
            "port": PORT,
            "log_level": LOG_LEVEL,
        },
    }