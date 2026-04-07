import os
import json
from typing import Any, Dict, List, Optional

import requests
from fastapi import FastAPI, Request
from firestore_client import write_doc_record

SERVICE_NAME = os.getenv("MCP_SERVICE_NAME", os.getenv("SERVICE_NAME", os.getenv("SERVICE_SLUG", "document-manager")))
SERVICE_SLUG = os.getenv("SERVICE_SLUG", "document-manager")
MCP_GATEWAY_EXECUTE_URL_DEFAULT = "http://localhost:8090/mcp/execute"
REQUEST_TIMEOUT_SECONDS = int(os.getenv("MCP_REQUEST_TIMEOUT_SECONDS", "5"))

app = FastAPI(title=SERVICE_NAME)

_GATEWAY_URL_LOGGED = False


def get_gateway_execute_url() -> str:
    return os.getenv("MCP_GATEWAY_EXECUTE_URL", MCP_GATEWAY_EXECUTE_URL_DEFAULT)


def log_gateway_url_once(gateway_execute_url: str) -> None:
    global _GATEWAY_URL_LOGGED
    if not _GATEWAY_URL_LOGGED:
        print(f"[DOC-MANAGER] Gateway execute URL: {gateway_execute_url}")
        _GATEWAY_URL_LOGGED = True


def normalize_response_body(response: requests.Response) -> Any:
    try:
        return response.json()
    except Exception:
        return response.text


def call_mcp(
    tool: str,
    payload: Dict[str, Any],
    authorization: Optional[str] = None,
) -> Dict[str, Any]:
    gateway_execute_url = get_gateway_execute_url()
    log_gateway_url_once(gateway_execute_url)

    headers: Dict[str, str] = {}
    if authorization:
        headers["Authorization"] = authorization

    try:
        response = requests.post(
            gateway_execute_url,
            json={
                "toolId": tool,
                "tool": tool,
                "input": payload,
            },
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )

        body = normalize_response_body(response)

        print(f"[CHAIN MCP] {tool} -> {response.status_code}")

        return {
            "tool": tool,
            "ok": response.status_code < 400,
            "status_code": response.status_code,
            "response_body": body,
            "error": None,
        }

    except Exception as exc:
        print(f"[CHAIN ERROR] {tool} -> {exc}")
        return {
            "tool": tool,
            "ok": False,
            "status_code": None,
            "response_body": None,
            "error": str(exc),
        }


def resolve_route(category: str) -> str:
    route_map = {
        "engineering": "mcp-analytics",
        "operations": "project-manager-agent",
        "ai_agents": "ai-training-coordinator",
        "governance": "data-scrubbing-ai",
    }
    return route_map[category]


def validate_input(input_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    doc_id = input_data.get("doc_id")
    category = input_data.get("category")

    allowed_categories = {
        "engineering",
        "operations",
        "ai_agents",
        "governance",
    }

    if not isinstance(doc_id, str) or not doc_id.strip():
        return {
            "status": "error",
            "error": "Invalid doc_id",
            "detail": "doc_id must be a non-empty string",
        }

    if not isinstance(category, str) or category not in allowed_categories:
        return {
            "status": "error",
            "error": "Invalid category",
            "detail": "category must be one of: engineering, operations, ai_agents, governance",
        }

    return None


def error_response(error: str, detail: str, tool: str = "document.process") -> Dict[str, Any]:
    return {
        "ok": False,
        "status": "error",
        "service": SERVICE_SLUG,
        "tool": tool,
        "error": error,
        "detail": detail,
    }


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": SERVICE_SLUG}


@app.post("/execute")
async def execute(req: Request) -> Dict[str, Any]:
    authorization = req.headers.get("Authorization")
    try:
        data = await req.json()
    except Exception:
        return error_response("Invalid request", "Request body must be valid JSON")

    if not isinstance(data, dict):
        return error_response("Invalid request", "Request body must be a JSON object")

    tool = data.get("toolId") or data.get("tool")
    input_data = data.get("input", {})

    if not isinstance(input_data, dict):
        return error_response("Invalid input", "input must be a JSON object", str(tool))

    if tool == "document-manager.status":
        return {
            "ok": True,
            "status": "ready",
            "service": SERVICE_SLUG,
            "tool": str(tool),
            "supports": ["document.process"],
            "gateway_execute_url": get_gateway_execute_url(),
        }

    if tool != "document.process":
        return error_response("unsupported tool", f"Unsupported tool: {tool}", str(tool))

    validation_error = validate_input(input_data)
    if validation_error:
        return error_response(
            validation_error["error"],
            validation_error["detail"],
            str(tool),
        )

    doc_id = input_data["doc_id"]
    category = input_data["category"]
    actions = input_data.get("actions", {})
    repo_path = input_data.get("repo_path")
    mcp_owner = input_data.get("mcp_owner")
    file_path = input_data.get("file_path")

    payload: Dict[str, Any] = {
        "doc_id": doc_id,
        "category": category,
        "actions": actions,
        "repo_path": repo_path,
        "mcp_owner": mcp_owner,
        "file_path": file_path,
    }

    print("\n[DOC-MANAGER] Processing:")
    print(json.dumps(payload, indent=2))

    route = resolve_route(category)
    print(f"[ROUTE] {category} -> {route}")

    # Mock-only write hook for now.
    write_doc_record(payload)

    chained_results: List[Dict[str, Any]] = []

    if route == "mcp-analytics":
        chained_results.append(
            call_mcp("analytics.process", payload, authorization)
        )
    elif route == "project-manager-agent":
        chained_results.append(
            call_mcp("project.update", payload, authorization)
        )
    elif route == "ai-training-coordinator":
        chained_results.append(
            call_mcp("training.sync", payload, authorization)
        )
    elif route == "data-scrubbing-ai":
        chained_results.append(
            call_mcp("data.validate", payload, authorization)
        )

    return {
        "ok": True,
        "status": "processed",
        "service": SERVICE_SLUG,
        "tool": str(tool),
        "route": route,
        "doc_id": doc_id,
        "category": category,
        "chained": True,
        "chained_results": chained_results,
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
