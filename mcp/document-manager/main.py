from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


app = FastAPI()


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

    print(
        {
            "event": "document_manager_route_selected",
            "doc_id": input_payload.doc_id,
            "category": input_payload.category,
            "route": route,
        }
    )

    return {
        "status": "processed",
        "route": route,
        "doc_id": input_payload.doc_id,
        "category": input_payload.category,
    }
