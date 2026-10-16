from fastapi import FastAPI, Request, Header
from typing import Any, Dict, Optional, List
from mcp.common.utils import now_iso, new_correlation_id
from mcp.common.auth import verify_firebase_token, enforce_org_match, require_approver
from mcp.common.firestore import get_firestore_client
from mcp.common.audit import write_audit_log, retention_until_iso
from mcp.common.slack import slack_notify, status_blocks

app = FastAPI(title="investment-recommendation-mcp")

@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "investment-recommendation-mcp", "ts": now_iso()}

def _audit(request: Request, claims: Dict[str, Any], orgId: str, action: str, entityType: str, entityId: str, status: str, correlationId: str):
    db = get_firestore_client()
    return write_audit_log(
        db,
        orgId=orgId,
        actorUid=claims.get("uid",""),
        actorEmail=claims.get("email",""),
        service="investment-recommendation-mcp",
        action=action,
        entityType=entityType,
        entityId=entityId,
        status=status,
        correlationId=correlationId,
        requestMeta={"path": str(request.url.path), "ip": request.client.host if request.client else None},
        retentionUntilIso=retention_until_iso(5),
    )

# Endpoints (implemented as placeholder-safe logic):
    # - POST /invest/recommend
    # - POST /invest/universe/update
    # - POST /invest/rebalance/plan
@app.post("/invest/universe/update")
async def universe_update(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    tickers = payload.get("universeTickers") or []
    _audit(request, claims, orgId, "universe_update", "investment_universe", orgId, "updated_stub", correlationId)
    return {"ok": True, "orgId": orgId, "universeTickers": tickers, "correlationId": correlationId}

@app.post("/invest/recommend")
async def invest_recommend(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)

    cash = float(payload.get("cashAvailable") or 0.0)
    universe = payload.get("universeTickers") or []
    policy = payload.get("policyRules") or {}
    approvalThreshold = float(policy.get("approvalThreshold") or 250.0)

    # Placeholder scoring: first N tickers with decreasing confidence.
    ranked = []
    orders = []
    n = min(5, len(universe))
    for i in range(n):
        t = universe[i]
        conf = round(max(0.10, 0.85 - i*0.10), 2)
        ranked.append({"ticker": t, "score": conf})
        notional = round(min(cash, cash*0.10), 2) if cash > 0 else 0.0
        orders.append({"ticker": t, "assetType": "equity", "side": "buy", "notional": notional, "rationale": "TODO: real signals", "confidence": conf})

    approvalRequired = any([o["notional"] >= approvalThreshold for o in orders])
    warnings = ["No external market API used (placeholder logic).", "TODO: integrate pricing/signals feeds."]

    recId = f"rec-{correlationId}"
    _audit(request, claims, orgId, "invest_recommend", "investment_recommendation", recId, "created_stub", correlationId)

    slack_notify(
        channel="#investment-committee-agent",
        text=f"[invest] recommendation ready {recId}",
        blocks=status_blocks(entity_id=recId, status="created", next_action="review_and_approve", approval_needed=approvalRequired, extra={"top": ranked[:3]}),
        correlationId=correlationId
    )

    return {"ok": True, "recId": recId, "rankedCandidates": ranked, "recommendedOrders": orders, "warnings": warnings, "approvalRequired": approvalRequired, "correlationId": correlationId}

@app.post("/invest/rebalance/plan")
async def rebalance_plan(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    # TODO: implement rebalance math
    return {"ok": True, "orgId": orgId, "plan": {"todo": True}, "correlationId": correlationId}
