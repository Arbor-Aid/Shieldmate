from datetime import datetime, timezone, timedelta
from typing import Dict, Any

def retention_until_iso(years: int = 5) -> str:
    dt = datetime.now(timezone.utc) + timedelta(days=365*years)
    return dt.isoformat()

def write_audit_log(
    db,
    *,
    orgId: str,
    actorUid: str,
    actorEmail: str,
    service: str,
    action: str,
    entityType: str,
    entityId: str,
    status: str,
    correlationId: str,
    requestMeta: Dict[str, Any],
    retentionUntilIso: str,
):
    doc = {
        "orgId": orgId,
        "createdBy": actorUid,
        "actorEmail": actorEmail,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "status": status,
        "retentionUntil": retentionUntilIso,
        "accessScope": "org",
        "service": service,
        "action": action,
        "entityType": entityType,
        "entityId": entityId,
        "correlationId": correlationId,
        "requestMeta": requestMeta or {},
    }
    db.collection("audit_packets").add(doc)
    return doc
