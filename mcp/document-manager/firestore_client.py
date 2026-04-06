import json
from datetime import datetime


def write_doc_record(payload):
    record = {
        "doc_id": payload.get("doc_id"),
        "category": payload.get("category"),
        "timestamp": datetime.utcnow().isoformat(),
    }

    print("[FIRESTORE MOCK]", json.dumps(record))
