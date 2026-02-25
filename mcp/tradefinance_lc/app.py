from fastapi import FastAPI, Request, Header
from typing import Any, Dict, Optional, List
from mcp.common.utils import now_iso, new_correlation_id
from mcp.common.auth import verify_firebase_token, enforce_org_match, require_approver
from mcp.common.firestore import get_firestore_client
from mcp.common.audit import write_audit_log, retention_until_iso
from mcp.common.slack import slack_notify, status_blocks

app = FastAPI(title="trade-finance-lc-mcp")

@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "trade-finance-lc-mcp", "ts": now_iso()}

def _audit(request: Request, claims: Dict[str, Any], orgId: str, action: str, entityType: str, entityId: str, status: str, correlationId: str):
    db = get_firestore_client()
    return write_audit_log(
        db,
        orgId=orgId,
        actorUid=claims.get("uid",""),
        actorEmail=claims.get("email",""),
        service="trade-finance-lc-mcp",
        action=action,
        entityType=entityType,
        entityId=entityId,
        status=status,
        correlationId=correlationId,
        requestMeta={"path": str(request.url.path), "ip": request.client.host if request.client else None},
        retentionUntilIso=retention_until_iso(5),
    )

# Endpoints (implemented as placeholder-safe logic):
    # - POST /lc/parse
    # - POST /lc/create-checklist (usance/deferred)
    # - POST /lc/doc-validate (discrepancies)
    # - POST /lc/presentment-pack (approval-gated)
    # - POST /lc/status
@app.post("/lc/parse")
async def lc_parse(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    lcId = payload.get("lcId") or correlationId
    terms = payload.get("terms") or {}

    _audit(request, claims, orgId, "lc_parse", "lc_case", lcId, "parsed", correlationId)
    return {"ok": True, "lcId": lcId, "normalizedTerms": terms, "correlationId": correlationId}

@app.post("/lc/create-checklist")
async def lc_checklist(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    lcId = payload.get("lcId") or correlationId
    terms = payload.get("terms") or {}
    usanceDays = int(terms.get("usanceDays") or 0)

    reqs = [
        {"name":"Commercial Invoice","due":"TODO"},
        {"name":"Bill of Lading","due":"TODO"},
        {"name":"Packing List","due":"TODO"},
    ]
    if usanceDays > 0:
        reqs.append({"name":f"Usance schedule ({usanceDays} days)","due":"TODO"})

    _audit(request, claims, orgId, "lc_create_checklist", "lc_case", lcId, "created", correlationId)

    slack_notify(
        channel="#trade-finance-agent",
        text=f"[lc] checklist created for {lcId}",
        blocks=status_blocks(entity_id=lcId, status="created", next_action="collect_docs", approval_needed=False, extra={"requirements": reqs}),
        correlationId=correlationId
    )
    return {"ok": True, "lcId": lcId, "requirements": reqs, "correlationId": correlationId}

@app.post("/lc/doc-validate")
async def lc_doc_validate(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    lcId = payload.get("lcId") or correlationId
    docs = payload.get("documents") or []

    discrepancies = []
    for d in docs:
        if isinstance(d, dict) and not d.get("storagePath"):
            discrepancies.append({"docType": d.get("type","unknown"), "issue": "missing storagePath"})

    status = "clean" if len(discrepancies) == 0 else "discrepancies_found"
    _audit(request, claims, orgId, "lc_doc_validate", "lc_case", lcId, status, correlationId)

    if discrepancies:
        slack_notify(
            channel="#doc-discrepancy-agent",
            text=f"[lc] discrepancies for {lcId}: {len(discrepancies)}",
            blocks=status_blocks(entity_id=lcId, status=status, next_action="fix_docs", approval_needed=False, extra={"discrepancies": discrepancies}),
            correlationId=correlationId
        )

    return {"ok": True, "lcId": lcId, "status": status, "discrepancies": discrepancies, "correlationId": correlationId}

@app.post("/lc/presentment-pack")
async def lc_presentment_pack(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    lcId = payload.get("lcId") or correlationId

    # Approval-gated: require approver claim
    require_approver(claims)

    _audit(request, claims, orgId, "lc_presentment_pack", "lc_case", lcId, "approved_packaged", correlationId)

    slack_notify(
        channel="#banking-liaison-agent",
        text=f"[lc] presentment pack approved for {lcId}",
        blocks=status_blocks(entity_id=lcId, status="approved_packaged", next_action="send_to_bank", approval_needed=False, extra={}),
        correlationId=correlationId
    )

    return {"ok": True, "lcId": lcId, "presentmentPackId": f"present-{lcId}", "correlationId": correlationId}

@app.post("/lc/status")
async def lc_status(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    lcId = payload.get("lcId") or correlationId
    # TODO: compute from Firestore events
    return {"ok": True, "lcId": lcId, "status": "TODO", "correlationId": correlationId}
