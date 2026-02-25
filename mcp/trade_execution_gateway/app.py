from fastapi import FastAPI, Request, Header
from typing import Any, Dict, Optional, List
from mcp.common.utils import now_iso, new_correlation_id
from mcp.common.auth import verify_firebase_token, enforce_org_match, require_approver
from mcp.common.firestore import get_firestore_client
from mcp.common.audit import write_audit_log, retention_until_iso
from mcp.common.slack import slack_notify, status_blocks

app = FastAPI(title="trade-execution-gateway-mcp")

@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "trade-execution-gateway-mcp", "ts": now_iso()}

def _audit(request: Request, claims: Dict[str, Any], orgId: str, action: str, entityType: str, entityId: str, status: str, correlationId: str):
    db = get_firestore_client()
    return write_audit_log(
        db,
        orgId=orgId,
        actorUid=claims.get("uid",""),
        actorEmail=claims.get("email",""),
        service="trade-execution-gateway-mcp",
        action=action,
        entityType=entityType,
        entityId=entityId,
        status=status,
        correlationId=correlationId,
        requestMeta={"path": str(request.url.path), "ip": request.client.host if request.client else None},
        retentionUntilIso=retention_until_iso(5),
    )

# Endpoints (implemented as placeholder-safe logic):
    # - POST /trade/propose
    # - POST /trade/approve
    # - POST /trade/execute
    # - POST /trade/cancel
# NOTE: This gateway is policy-gated + approval-gated.
# TODO: replace local risk-check with calls to treasury service or shared risk library.

_KILL_SWITCH = {}  # orgId -> bool (TODO: load from treasury policy doc)

@app.post("/trade/propose")
async def trade_propose(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)

    order = payload.get("order") or {}
    orderId = order.get("orderId") or f"order-{correlationId}"
    notional = float(order.get("notional") or 0.0)
    approvalThreshold = float((payload.get("policyRules") or {}).get("approvalThreshold") or 250.0)
    approvalNeeded = notional >= approvalThreshold

    status = "pending_approval" if approvalNeeded else "approved"  # still requires explicit approve step for safety
    _audit(request, claims, orgId, "trade_propose", "trade_order", orderId, status, correlationId)

    slack_notify(
        channel="#robinhood-ai-agent",
        text=f"[trade] proposed {orderId} ({status})",
        blocks=status_blocks(entity_id=orderId, status=status, next_action="approve" if approvalNeeded else "approve_then_execute", approval_needed=True, extra={"notional": notional}),
        correlationId=correlationId
    )

    return {"ok": True, "orderId": orderId, "status": status, "approvalRequired": True, "correlationId": correlationId}

@app.post("/trade/approve")
async def trade_approve(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization); require_approver(claims)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    orderId = payload.get("orderId") or ""

    _audit(request, claims, orgId, "trade_approve", "trade_order", orderId, "approved", correlationId)

    slack_notify(
        channel="#investment-committee-agent",
        text=f"[trade] approved {orderId}",
        blocks=status_blocks(entity_id=orderId, status="approved", next_action="execute", approval_needed=False, extra={"approver": claims.get("email","")}),
        correlationId=correlationId
    )
    return {"ok": True, "orderId": orderId, "status": "approved", "correlationId": correlationId}

@app.post("/trade/execute")
async def trade_execute(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization); require_approver(claims)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    orderId = payload.get("orderId") or ""

    if _KILL_SWITCH.get(orgId, False):
        _audit(request, claims, orgId, "trade_execute", "trade_order", orderId, "blocked_kill_switch", correlationId)
        return {"ok": False, "orderId": orderId, "status": "blocked_kill_switch", "correlationId": correlationId}

    # TODO: broker integration
    _audit(request, claims, orgId, "trade_execute", "trade_order", orderId, "executed_stub", correlationId)
    return {"ok": True, "orderId": orderId, "status": "executed_stub", "correlationId": correlationId, "todo": "Integrate broker API connector"}

@app.post("/trade/cancel")
async def trade_cancel(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    orderId = payload.get("orderId") or ""

    _audit(request, claims, orgId, "trade_cancel", "trade_order", orderId, "cancelled", correlationId)
    return {"ok": True, "orderId": orderId, "status": "cancelled", "correlationId": correlationId}
