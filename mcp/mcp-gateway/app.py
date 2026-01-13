import os
from datetime import datetime, timezone
from fastapi import FastAPI

SERVICE_NAME = os.getenv("SERVICE_NAME", "mcp-gateway")
SERVICE_VERSION = (
    os.getenv("SERVICE_VERSION")
    or os.getenv("GIT_SHA")
    or os.getenv("K_REVISION")
    or "1.0.0"
)
PORT = os.getenv("PORT", "8080")
LOG_LEVEL = os.getenv("LOG_LEVEL", "info")

CAPABILITIES = [
    "gateway_proxy",
    "rbac_enforced",
    "mcp_registry_routing",
]
INPUTS = ["toolId", "orgId", "input", "meta"]
OUTPUTS = ["upstream_response"]

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
    return {
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