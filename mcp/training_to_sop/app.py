from fastapi import FastAPI, Request, Header
from typing import Any, Dict, Optional, List
from mcp.common.utils import now_iso, new_correlation_id
from mcp.common.auth import verify_firebase_token, enforce_org_match, require_approver
from mcp.common.firestore import get_firestore_client
from mcp.common.audit import write_audit_log, retention_until_iso
from mcp.common.slack import slack_notify, status_blocks

app = FastAPI(title="training-to-sop-mcp")

@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "training-to-sop-mcp", "ts": now_iso()}

def _audit(request: Request, claims: Dict[str, Any], orgId: str, action: str, entityType: str, entityId: str, status: str, correlationId: str):
    db = get_firestore_client()
    return write_audit_log(
        db,
        orgId=orgId,
        actorUid=claims.get("uid",""),
        actorEmail=claims.get("email",""),
        service="training-to-sop-mcp",
        action=action,
        entityType=entityType,
        entityId=entityId,
        status=status,
        correlationId=correlationId,
        requestMeta={"path": str(request.url.path), "ip": request.client.host if request.client else None},
        retentionUntilIso=retention_until_iso(5),
    )

# Endpoints (implemented as placeholder-safe logic):
    # - POST /sop/ingest
    # - POST /sop/generate
@app.post("/sop/ingest")
async def sop_ingest(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    sopId = payload.get("sopId") or f"sop-{correlationId}"
    _audit(request, claims, orgId, "sop_ingest", "training_sop", sopId, "ingested_stub", correlationId)
    return {"ok": True, "sopId": sopId, "status": "ingested_stub", "correlationId": correlationId}

@app.post("/sop/generate")
async def sop_generate(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    sopId = payload.get("sopId") or f"sop-{correlationId}"
    draft = {"title":"TODO SOP", "steps":["TODO: step 1","TODO: step 2"], "notes":"Placeholder draft"}
    _audit(request, claims, orgId, "sop_generate", "training_sop", sopId, "generated_stub", correlationId)
    return {"ok": True, "sopId": sopId, "draft": draft, "correlationId": correlationId}
