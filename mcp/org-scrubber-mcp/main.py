import os
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv('MCP_SERVICE_NAME', os.getenv('SERVICE_NAME', os.getenv('SERVICE_SLUG', 'org-scrubber-mcp')))
SERVICE_SLUG = os.getenv('SERVICE_SLUG', 'org-scrubber-mcp')

SENSITIVE_KEYS = {'email', 'phone', 'token', 'secret', 'ssn', 'password'}

app = FastAPI(title=SERVICE_NAME)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _error(tool: Any, error: str, detail: str) -> Dict[str, Any]:
    return {
        'ok': False,
        'status': 'error',
        'service': SERVICE_SLUG,
        'tool': str(tool) if tool is not None else None,
        'error': error,
        'detail': detail,
    }


def _should_redact(key: str) -> bool:
    lowered = key.lower()
    return any(token in lowered for token in SENSITIVE_KEYS)


def _scrub_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    scrubbed: Dict[str, Any] = {}
    redacted_fields: List[str] = []

    for key, value in payload.items():
        if _should_redact(key):
            scrubbed[key] = '[REDACTED]'
            redacted_fields.append(key)
        else:
            scrubbed[key] = value

    return {
        'scrubbed_payload': scrubbed,
        'redacted_fields': sorted(redacted_fields),
        'scrubbed_at': _now_iso(),
    }


@app.get('/health')
def health() -> Dict[str, Any]:
    return {
        'status': 'ok',
        'service': SERVICE_SLUG,
        'activation_level': 'tier2',
        'live_behavior_present': True,
        'time': _now_iso(),
    }


@app.post('/execute')
async def execute(request: Request) -> Dict[str, Any]:
    try:
        data = await request.json()
    except Exception:
        return _error(None, 'invalid request', 'Request body must be valid JSON')

    if not isinstance(data, dict):
        return _error(None, 'invalid request', 'Request body must be a JSON object')

    tool = data.get('toolId') or data.get('tool')
    input_data = data.get('input', {})

    if not isinstance(input_data, dict):
        return _error(tool, 'invalid input', 'input must be a JSON object')

    if tool == 'org-scrubber-mcp.status':
        return {
            'ok': True,
            'status': 'ready',
            'service': SERVICE_SLUG,
            'tool': str(tool),
            'supports': ['org.scrub'],
        }

    if tool != 'org.scrub':
        return _error(tool, 'unsupported tool', f'Unsupported tool: {tool}')

    result = _scrub_payload(input_data)

    return {
        'ok': True,
        'status': 'processed',
        'service': SERVICE_SLUG,
        'tool': str(tool),
        'scrub_result': result,
        'summary_card': {'title': 'Org Scrub', 'value': len(result['redacted_fields']), 'subtitle': 'fields redacted'},
        'status_badge': {'level': 'success', 'label': 'scrubbed'},
        'action_list': [{'action': 'send_to_validation', 'toolId': 'data.validate'}],
    }


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', '8080'))
    uvicorn.run(app, host='0.0.0.0', port=port)
