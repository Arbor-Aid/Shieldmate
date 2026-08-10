from fastapi import FastAPI, Request, Header
from typing import Any, Dict, Optional, List
from mcp.common.utils import now_iso, new_correlation_id
from mcp.common.auth import verify_firebase_token, enforce_org_match, require_approver
from mcp.common.firestore import get_firestore_client
from mcp.common.audit import write_audit_log, retention_until_iso
from mcp.common.slack import slack_notify, status_blocks

app = FastAPI(title="treasury-allocation-mcp")

@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "treasury-allocation-mcp", "ts": now_iso()}

def _audit(request: Request, claims: Dict[str, Any], orgId: str, action: str, entityType: str, entityId: str, status: str, correlationId: str):
    db = get_firestore_client()
    return write_audit_log(
        db,
        orgId=orgId,
        actorUid=claims.get("uid",""),
        actorEmail=claims.get("email",""),
        service="treasury-allocation-mcp",
        action=action,
        entityType=entityType,
        entityId=entityId,
        status=status,
        correlationId=correlationId,
        requestMeta={"path": str(request.url.path), "ip": request.client.host if request.client else None},
        retentionUntilIso=retention_until_iso(5),
    )

# Endpoints (implemented as placeholder-safe logic):
    # - POST /profit/classify
    # - POST /risk/policy
    # - POST /risk/check
    # - POST /risk/drawdown/check
    # - POST /risk/kill-switch
    # - POST /report/monthly
_KILL_SWITCH = {}  # orgId -> bool (TODO: persist in Firestore)

@app.post("/profit/classify")
async def profit_classify(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)

    profit = float(payload.get("profit") or 0.0)
    policy = payload.get("policy") or {"investing":0.50,"ops":0.30,"reserve":0.20}

    allocations = {
        "investing": profit * float(policy.get("investing",0.50)),
        "ops": profit * float(policy.get("ops",0.30)),
        "reserve": profit * float(policy.get("reserve",0.20)),
    }

    _audit(request, claims, orgId, "profit_classify", "treasury_batch", orgId, "classified", correlationId)

    slack_notify(
        channel="#treasury-controller-agent",
        text=f"[treasury] profit classified for {orgId}",
        blocks=status_blocks(entity_id=orgId, status="classified", next_action="review_allocations", approval_needed=False, extra={"allocations": allocations}),
        correlationId=correlationId
    )
    return {"ok": True, "orgId": orgId, "allocations": allocations, "correlationId": correlationId}

@app.post("/risk/policy")
async def risk_policy(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    # TODO: store/retrieve treasury_policies/{orgId}
    policyRules = payload.get("policyRules") or {}
    _audit(request, claims, orgId, "risk_policy", "treasury_policy", orgId, "stored_stub", correlationId)
    return {"ok": True, "orgId": orgId, "policyRules": policyRules, "correlationId": correlationId}

@app.post("/risk/kill-switch")
async def kill_switch(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization); require_approver(claims)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    action = payload.get("action") or "pause"
    _KILL_SWITCH[orgId] = (action == "pause")
    _audit(request, claims, orgId, "kill_switch", "treasury_policy", orgId, action, correlationId)
    return {"ok": True, "orgId": orgId, "paused": bool(_KILL_SWITCH[orgId]), "correlationId": correlationId}

@app.post("/risk/check")
async def risk_check(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)

    proposed = payload.get("proposedOrder") or {}
    notional = float(proposed.get("notional") or 0.0)
    approvalThreshold = float((payload.get("policyRules") or {}).get("approvalThreshold") or 250.0)

    ok = not _KILL_SWITCH.get(orgId, False)
    approvalRequired = notional >= approvalThreshold
    warnings = []
    if _KILL_SWITCH.get(orgId, False):
        warnings.append("Kill-switch is active (trading paused).")

    _audit(request, claims, orgId, "risk_check", "trade_order", proposed.get("orderId","(none)"), "pass" if ok else "blocked", correlationId)
    return {"ok": True, "pass": ok, "approvalRequired": approvalRequired, "warnings": warnings, "correlationId": correlationId}

@app.post("/risk/drawdown/check")
async def drawdown_check(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    # TODO: real equity curve calc
    maxDrawdownPct = float(payload.get("maxDrawdownPct") or 10.0)
    currentDrawdownPct = float(payload.get("currentDrawdownPct") or 0.0)
    stop = currentDrawdownPct >= maxDrawdownPct
    _audit(request, claims, orgId, "drawdown_check", "treasury_policy", orgId, "stop" if stop else "ok", correlationId)
    return {"ok": True, "stop": stop, "currentDrawdownPct": currentDrawdownPct, "maxDrawdownPct": maxDrawdownPct, "correlationId": correlationId}

@app.post("/report/monthly")
async def report_monthly(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    # TODO: aggregate Firestore collections
    return {"ok": True, "orgId": orgId, "report": {"todo": True}, "correlationId": correlationId}
