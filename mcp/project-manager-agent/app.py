from fastapi import FastAPI, Request, Header
from typing import Any, Dict, Optional
from mcp.common.utils import now_iso, new_correlation_id
from mcp.common.auth import verify_firebase_token, enforce_org_match
from mcp.common.firestore import get_firestore_client
from mcp.common.audit import write_audit_log, retention_until_iso
from mcp.common.slack import slack_notify, status_blocks

app = FastAPI(title="project_manager_agent")

@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "project_manager_agent", "ts": now_iso()}

@app.post("/run")
async def run(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId")
    enforce_org_match(claims, orgId)

    db = get_firestore_client()
    entityId = payload.get("entityId") or payload.get("id") or correlationId
    write_audit_log(
        db,
        orgId=orgId,
        actorUid=claims.get("uid",""),
        actorEmail=claims.get("email",""),
        service="project_manager_agent",
        action="run",
        entityType="legacy_job",
        entityId=entityId,
        status="received",
        correlationId=correlationId,
        requestMeta={"path": str(request.url.path), "ip": request.client.host if request.client else None},
        retentionUntilIso=retention_until_iso(5),
    )

    slack_notify(
        channel="#project-manager-agent",
        text=f"[project_manager_agent] /run received: {entityId}",
        blocks=status_blocks(entityId=entityId, status="received", next_action="TODO: implement", approval_needed=False, extra={"orgId": orgId}),
        correlationId=correlationId,
    )

    return {"ok": True, "service": "project_manager_agent", "status": "received", "entityId": entityId, "correlationId": correlationId}
