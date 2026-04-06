import os
from typing import Any

import requests
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from firestore_client import write_doc_record


app = FastAPI()
MCP_GATEWAY_URL = os.getenv("MCP_GATEWAY_EXECUTE_URL", "http://localhost:8080/mcp/execute")


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

CHAIN_TOOL_BY_ROUTE = {
    "mcp-analytics": "analytics.process",
    "project-manager-agent": "project.update",
    "ai-training-coordinator": "training.sync",
    "data-scrubbing-ai": "data.validate",
}


def bad_request(error: str, field: str | None = None) -> JSONResponse:
    body: dict[str, Any] = {
        "status": "error",
        "error": error,
    }
    if field:
        body["field"] = field
    return JSONResponse(status_code=400, content=body)


def call_mcp(tool: str, payload: dict[str, Any]) -> dict[str, Any]:
    try:
        res = requests.post(
            MCP_GATEWAY_URL,
            json={
                "toolId": tool,
                "input": payload,
            },
            timeout=5,
        )
        print(f"[CHAIN MCP] {tool} -> {res.status_code}")
        try:
            response_body: Any = res.json()
        except ValueError:
            response_body = res.text
        return {
            "tool": tool,
            "ok": res.ok,
            "status_code": res.status_code,
            "response_body": response_body,
            "error": None,
        }
    except Exception as e:
        print(f"[CHAIN ERROR] {e}")
        return {
            "tool": tool,
            "ok": False,
            "status_code": None,
            "response_body": None,
            "error": str(e),
        }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/execute", response_model=None)
def execute(payload: ExecutePayload) -> Any:
    print({"event": "document_manager_payload", "payload": payload.model_dump()})
    input_payload = payload.input
    if input_payload is None:
        return bad_request("input is required", field="input")

    doc_id_value = input_payload.doc_id
    if not isinstance(doc_id_value, str) or not doc_id_value.strip():
        return bad_request("doc_id must be a non-empty string", field="doc_id")
    doc_id = doc_id_value.strip()

    category_value = input_payload.category
    if not isinstance(category_value, str) or not category_value.strip():
        return bad_request("category must be one of engineering, operations, ai_agents, governance", field="category")
    category = category_value.strip()
    if category not in ROUTE_MAP:
        return bad_request("category must be one of engineering, operations, ai_agents, governance", field="category")

    route = ROUTE_MAP[category]
    payload_dict = input_payload.model_dump(exclude_none=True)
    payload_dict["doc_id"] = doc_id
    payload_dict["category"] = category

    print(
        {
            "event": "document_manager_route_selected",
            "doc_id": doc_id,
            "category": category,
            "route": route,
        }
    )
    write_doc_record(payload_dict)

    chained_results: list[dict[str, Any]] = []
    chain_tool = CHAIN_TOOL_BY_ROUTE.get(route)
    if chain_tool:
        chained_results.append(call_mcp(chain_tool, payload_dict))

    return {
        "status": "processed",
        "route": route,
        "doc_id": doc_id,
        "category": category,
        "chained": True,
        "chained_results": chained_results,
    }
