import os, json, urllib.request
from typing import Optional, List, Dict, Any

def slack_notify(channel: str, text: str, blocks: Optional[List[Dict[str, Any]]] = None, correlationId: Optional[str] = None):
    url = os.getenv("SLACK_WEBHOOK_URL", "")
    if not url:
        # no-op
        return {"ok": False, "reason": "SLACK_WEBHOOK_URL not set"}
    payload = {
        "text": text,
        "channel": channel,
    }
    if blocks:
        payload["blocks"] = blocks
    if correlationId:
        payload["text"] = f"{text}\ncorrelationId: {correlationId}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return {"ok": True, "status": resp.status}

def status_blocks(entity_id: str, status: str, next_action: str, approval_needed: bool, extra: Dict[str, Any]):
    fields = [
        {"type":"mrkdwn","text":f"*Entity*\n{entity_id}"},
        {"type":"mrkdwn","text":f"*Status*\n{status}"},
        {"type":"mrkdwn","text":f"*Next*\n{next_action}"},
        {"type":"mrkdwn","text":f"*Approval*\n{'YES' if approval_needed else 'NO'}"},
    ]
    if extra:
        fields.append({"type":"mrkdwn","text":"*Details*\n" + json.dumps(extra)[:900]})
    return [
        {"type":"section","fields":fields}
    ]
