import os
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv('MCP_SERVICE_NAME', os.getenv('SERVICE_NAME', os.getenv('SERVICE_SLUG', 'data-scrubbing-ai')))
SERVICE_SLUG = os.getenv('SERVICE_SLUG', 'data-scrubbing-ai')

ALLOWED_CATEGORIES = {'engineering', 'operations', 'ai_agents', 'governance'}

app = FastAPI(title=SERVICE_NAME)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _first_non_empty(value: Any) -> str:
    if isinstance(value, str) and value.strip():
        return value.strip()
    return ''


def _error(tool: Any, error: str, detail: str) -> Dict[str, Any]:
    return {
        'ok': False,
        'status': 'error',
        'service': SERVICE_SLUG,
        'tool': str(tool) if tool is not None else None,
        'error': error,
        'detail': detail,
        'status_badge': {'level': 'error', 'label': error},
        'alerts': [{'severity': 'error', 'message': detail}],
    }


def _normalize_dict_values(input_data: Dict[str, Any]) -> Dict[str, Any]:
    normalized: Dict[str, Any] = {}
    for key, value in input_data.items():
        if isinstance(value, str):
            normalized[key] = value.strip()
        else:
            normalized[key] = value
    return normalized


def _validate_payload(input_data: Dict[str, Any]) -> Dict[str, Any]:
    findings: List[Dict[str, Any]] = []
    missing_fields: List[str] = []
    invalid_fields: List[str] = []

    normalized = _normalize_dict_values(input_data)

    doc_id = _first_non_empty(normalized.get('doc_id'))
    category = _first_non_empty(normalized.get('category'))
    source = _first_non_empty(normalized.get('source'))
    source_record = normalized.get('source_record') if isinstance(normalized.get('source_record'), dict) else {}

    if not doc_id and not _first_non_empty(source_record.get('record_id')):
        missing_fields.append('doc_id|source_record.record_id')

    if category and category not in ALLOWED_CATEGORIES:
        invalid_fields.append('category')

    if source in {'google_drive', 'notion'}:
        if not _first_non_empty(source_record.get('record_id')):
            missing_fields.append('source_record.record_id')
        if not _first_non_empty(source_record.get('title')):
            missing_fields.append('source_record.title')

    actions = normalized.get('actions')
    if actions is not None and not isinstance(actions, (dict, list, str)):
        invalid_fields.append('actions')

    if missing_fields:
        findings.append({'type': 'missing', 'fields': missing_fields})
    if invalid_fields:
        findings.append({'type': 'invalid', 'fields': invalid_fields})

    rejected = len(missing_fields) > 0 or len(invalid_fields) > 0

    return {
        'normalized_data': normalized,
        'missing_fields': missing_fields,
        'invalid_fields': invalid_fields,
        'findings': findings,
        'normalized': not rejected,
        'rejected': rejected,
        'validated_at': _now_iso(),
    }


@app.get('/health')
def health() -> Dict[str, Any]:
    return {
        'status': 'ok',
        'service': SERVICE_SLUG,
        'activation_level': 'tier1',
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

    if tool == 'data-scrubbing-ai.status':
        return {
            'ok': True,
            'status': 'ready',
            'service': SERVICE_SLUG,
            'tool': str(tool),
            'supports': ['data.validate'],
            'frontend_safe_output': True,
            'slack_trigger_ready': True,
        }

    if tool != 'data.validate':
        return _error(tool, 'unsupported tool', f'Unsupported tool: {tool}')

    validation = _validate_payload(input_data)

    status_label = 'validated' if validation['normalized'] else 'rejected'
    summary_card = {
        'title': 'Validation Result',
        'value': status_label,
        'subtitle': f"missing={len(validation['missing_fields'])} invalid={len(validation['invalid_fields'])}",
    }
    status_badge = {
        'level': 'success' if validation['normalized'] else 'error',
        'label': status_label,
    }
    data_table = {
        'columns': ['field', 'value'],
        'rows': [
            {'field': 'missing_fields', 'value': len(validation['missing_fields'])},
            {'field': 'invalid_fields', 'value': len(validation['invalid_fields'])},
            {'field': 'validated_at', 'value': validation['validated_at']},
        ],
    }
    timeline_event = {
        'time': validation['validated_at'],
        'event': 'payload_validated',
        'detail': f"Validation completed with status={status_label}",
    }

    alerts = []
    if validation['missing_fields']:
        alerts.append({'severity': 'warning', 'message': f"Missing fields: {', '.join(validation['missing_fields'])}"})
    if validation['invalid_fields']:
        alerts.append({'severity': 'warning', 'message': f"Invalid fields: {', '.join(validation['invalid_fields'])}"})

    return {
        'ok': True,
        'status': 'processed',
        'service': SERVICE_SLUG,
        'tool': str(tool),
        'validation_result': validation,
        'summary_card': summary_card,
        'status_badge': status_badge,
        'data_table': data_table,
        'timeline_event': timeline_event,
        'alerts': alerts,
        'action_list': [
            {'action': 'continue_pipeline' if validation['normalized'] else 'halt_and_fix'},
            {'action': 'send_to_analytics', 'toolId': 'analytics.process'},
        ],
    }


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', '8080'))
    uvicorn.run(app, host='0.0.0.0', port=port)
