from fastapi import FastAPI, Request, Header
from typing import Any, Dict, Optional, List
from mcp.common.utils import now_iso, new_correlation_id
from mcp.common.auth import verify_firebase_token, enforce_org_match, require_approver
from mcp.common.firestore import get_firestore_client
from mcp.common.audit import write_audit_log, retention_until_iso
from mcp.common.slack import slack_notify, status_blocks

app = FastAPI(title="tradeops-compliance-mcp")

@app.get("/healthz")
def healthz():
    return {"ok": True, "service": "tradeops-compliance-mcp", "ts": now_iso()}

def _audit(request: Request, claims: Dict[str, Any], orgId: str, action: str, entityType: str, entityId: str, status: str, correlationId: str):
    db = get_firestore_client()
    return write_audit_log(
        db,
        orgId=orgId,
        actorUid=claims.get("uid",""),
        actorEmail=claims.get("email",""),
        service="tradeops-compliance-mcp",
        action=action,
        entityType=entityType,
        entityId=entityId,
        status=status,
        correlationId=correlationId,
        requestMeta={"path": str(request.url.path), "ip": request.client.host if request.client else None},
        retentionUntilIso=retention_until_iso(5),
    )

# Endpoints (implemented as placeholder-safe logic):
    # - POST /shipment/triage
    # - POST /shipment/docs/generate
    # - POST /shipment/screening/denied-party (stub)
    # - POST /shipment/audit/packet
    # - POST /policy/product/check
@app.post("/shipment/triage")
async def shipment_triage(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    shipmentId = payload.get("shipmentId") or correlationId

    docs = payload.get("documents") or []
    required = ["commercial_invoice","packing_list","bill_of_lading"]
    present = set([d.get("type") for d in docs if isinstance(d, dict)])
    missing = [r for r in required if r not in present]

    discrepancyCount = len(missing)
    status = "needs_docs" if missing else "ready"
    nextAction = "upload_missing_docs" if missing else "run_screening"

    _audit(request, claims, orgId, "shipment_triage", "trade_shipment", shipmentId, status, correlationId)

    slack_notify(
        channel="#trade-compliance-agent",
        text=f"[tradeops] triage {shipmentId} -> {status}",
        blocks=status_blocks(entity_id=shipmentId, status=status, next_action=nextAction, approval_needed=False, extra={"missingDocs": missing, "discrepancyCount": discrepancyCount}),
        correlationId=correlationId
    )

    return {"ok": True, "shipmentId": shipmentId, "status": status, "missingDocs": missing, "discrepancyCount": discrepancyCount, "nextAction": nextAction, "correlationId": correlationId}

@app.post("/shipment/docs/generate")
async def shipment_docs_generate(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    shipmentId = payload.get("shipmentId") or correlationId

    templates = [
        {"type":"commercial_invoice","storagePath":f"orgs/{orgId}/shipments/{shipmentId}/templates/commercial_invoice.docx"},
        {"type":"packing_list","storagePath":f"orgs/{orgId}/shipments/{shipmentId}/templates/packing_list.docx"},
    ]

    _audit(request, claims, orgId, "shipment_docs_generate", "trade_shipment", shipmentId, "generated", correlationId)

    slack_notify(
        channel="#customs-broker-liaison-agent",
        text=f"[tradeops] docs generated for {shipmentId}",
        blocks=status_blocks(entity_id=shipmentId, status="generated", next_action="review_and_upload_signed", approval_needed=False, extra={"templates": templates}),
        correlationId=correlationId
    )
    return {"ok": True, "shipmentId": shipmentId, "templates": templates, "correlationId": correlationId}

@app.post("/shipment/screening/denied-party")
async def denied_party_stub(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    shipmentId = payload.get("shipmentId") or correlationId

    _audit(request, claims, orgId, "denied_party_screening", "trade_shipment", shipmentId, "stub", correlationId)
    return {"ok": True, "shipmentId": shipmentId, "hit": False, "provider": "TODO", "correlationId": correlationId}

@app.post("/shipment/audit/packet")
async def audit_packet(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    shipmentId = payload.get("shipmentId") or correlationId
    packetId = f"packet-{shipmentId}"

    _audit(request, claims, orgId, "audit_packet", "trade_shipment", shipmentId, "created", correlationId)

    slack_notify(
        channel="#reconciliation-agent",
        text=f"[tradeops] audit packet created {packetId}",
        blocks=status_blocks(entity_id=packetId, status="created", next_action="archive", approval_needed=False, extra={"shipmentId": shipmentId}),
        correlationId=correlationId
    )
    return {"ok": True, "packetId": packetId, "shipmentId": shipmentId, "correlationId": correlationId}

@app.post("/policy/product/check")
async def product_policy_check(payload: Dict[str, Any], request: Request, authorization: Optional[str] = Header(default=None), x_correlation_id: Optional[str] = Header(default=None)):
    correlationId = x_correlation_id or new_correlation_id()
    claims = verify_firebase_token(authorization)
    orgId = payload.get("orgId"); enforce_org_match(claims, orgId)
    category = (payload.get("category") or "").lower()

    # Placeholder policy rules: TODO load from product_policies/{orgId}
    blocked = set(["weapons","drugs","controlled_substances"])
    allowed = set(["apparel","electronics_accessories","books"])
    decision = "conditional"
    if category in blocked: decision = "blocked"
    elif category in allowed: decision = "allowed"

    _audit(request, claims, orgId, "product_policy_check", "product_policy", orgId, decision, correlationId)
    return {"ok": True, "orgId": orgId, "category": category, "decision": decision, "warnings": ["TODO: load org policy from Firestore"], "correlationId": correlationId}
