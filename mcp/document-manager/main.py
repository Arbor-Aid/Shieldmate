from typing import Any

import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from firestore_client import write_doc_record


app = FastAPI()
MCP_GATEWAY_URL = "http://localhost:8080/execute"


class DocumentInput(BaseModel):
    file_path: str | None = None
    doc_id: str | None = None
    category: str | None = None
    actions: list[str] | None = None
    repo_path: str | None = None
    mcp_owner: str | None = None


class ExecutePayload(BaseModel):
    tool: str | None = None
    input: DocumentInput | None = None


ROUTE_MAP = {
    "engineering": "mcp-analytics",
    "operations": "project-manager-agent",
    "ai_agents": "ai-training-coordinator",
    "governance": "data-scrubbing-ai",
}


def call_mcp(tool: str, payload: dict[str, Any]) -> Any:
    try:
        res = requests.post(
            MCP_GATEWAY_URL,
            json={
                "tool": tool,
                "input": payload,
            },
            timeout=5,
        )
        print(f"[CHAIN MCP] {tool} -> {res.status_code}")
        return res.json()
    except Exception as e:
        print(f"[CHAIN ERROR] {e}")
        return None


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/execute")
def execute(payload: ExecutePayload) -> dict[str, Any]:
    print({"event": "document_manager_payload", "payload": payload.model_dump()})
    input_payload = payload.input
    if input_payload is None:
        raise HTTPException(status_code=400, detail="input is required")
    if not input_payload.doc_id:
        raise HTTPException(status_code=400, detail="doc_id is required")
    if not input_payload.category:
        raise HTTPException(status_code=400, detail="category is required")

    route = ROUTE_MAP.get(input_payload.category)
    if route is None:
        raise HTTPException(status_code=400, detail="unsupported category")
    payload_dict = input_payload.model_dump(exclude_none=True)

    print(
        {
            "event": "document_manager_route_selected",
            "doc_id": input_payload.doc_id,
            "category": input_payload.category,
            "route": route,
        }
    )
    write_doc_record(payload_dict)
    if route == "mcp-analytics":
        call_mcp("analytics.process", payload_dict)
    if route == "project-manager-agent":
        call_mcp("project.update", payload_dict)
    if route == "ai-training-coordinator":
        call_mcp("training.sync", payload_dict)
    if route == "data-scrubbing-ai":
        call_mcp("data.validate", payload_dict)

    return {
        "status": "processed",
        "route": route,
        "doc_id": input_payload.doc_id,
        "category": input_payload.category,
        "chained": True,
    }
