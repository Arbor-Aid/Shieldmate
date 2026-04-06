import json
from datetime import datetime


def write_doc_record_real(payload):
    # Future integration point (env-gated): add real Firestore write logic here.
    # Example gate: DOCUMENT_MANAGER_ENABLE_FIRESTORE_WRITE=true
    raise NotImplementedError("Real Firestore integration is not enabled.")


def write_doc_record(payload):
    record = {
        "doc_id": payload.get("doc_id"),
        "category": payload.get("category"),
        "timestamp": datetime.utcnow().isoformat(),
    }

    print("[FIRESTORE MOCK]", json.dumps(record))
