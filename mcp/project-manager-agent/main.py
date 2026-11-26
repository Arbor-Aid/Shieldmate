import os
from datetime import datetime, timezone
from typing import Any, Dict, List
from uuid import uuid4

from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv('MCP_SERVICE_NAME', os.getenv('SERVICE_NAME', os.getenv('SERVICE_SLUG', 'project-manager-agent')))
SERVICE_SLUG = os.getenv('SERVICE_SLUG', 'project-manager-agent')
RUNTIME_MODE = 'activated_transitional_main_active'
RUNTIME_NOTE = 'main.py is activated for project.update; app.py domain routes remain unmounted in this pass.'

ALLOWED_STATUSES = {'planned', 'in_progress', 'blocked', 'completed', 'needs_review'}

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
        'runtime_mode': RUNTIME_MODE,
        'status_badge': {'level': 'error', 'label': error},
        'alerts': [{'severity': 'error', 'message': detail}],
    }


def _normalize_project_payload(input_data: Dict[str, Any]) -> Dict[str, Any]:
    doc_id = _first_non_empty(input_data.get('doc_id'))
    project_id = _first_non_empty(input_data.get('project_id')) or (f'project-{doc_id}' if doc_id else f'project-{uuid4()}')

    requested_status = _first_non_empty(input_data.get('status')) or 'in_progress'
    normalized_status = requested_status if requested_status in ALLOWED_STATUSES else 'needs_review'

    actions = input_data.get('actions', {})
    reminders: List[str] = []
    if isinstance(actions, dict):
        reminders = [f"review:{key}" for key in sorted(actions.keys())]
    elif isinstance(actions, list):
        reminders = [str(item) for item in actions]

    owner = _first_non_empty(input_data.get('mcp_owner')) or 'project-manager-agent'
    category = _first_non_empty(input_data.get('category')) or 'operations'
    trace_id = _first_non_empty(input_data.get('trace_id')) or _first_non_empty(input_data.get('traceId')) or str(uuid4())

    return {
        'project_id': project_id,
        'doc_id': doc_id,
        'status': normalized_status,
        'requested_status': requested_status,
        'category': category,
        'owner': owner,
        'summary': _first_non_empty(input_data.get('summary')) or f'Update for {project_id}',
        'reminders': reminders,
        'next_check_at': _first_non_empty(input_data.get('next_check_at')),
        'trace_id': trace_id,
        'updated_at': _now_iso(),
    }


@app.get('/health')
def health() -> Dict[str, Any]:
    return {
        'status': 'ok',
        'service': SERVICE_SLUG,
        'runtime_mode': RUNTIME_MODE,
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

    if tool == 'project-manager-agent.status':
        return {
            'ok': True,
            'status': 'ready',
            'service': SERVICE_SLUG,
            'tool': str(tool),
            'runtime_mode': RUNTIME_MODE,
            'supports': ['project.update'],
            'frontend_safe_output': True,
            'slack_trigger_ready': True,
        }

    if tool != 'project.update':
        return _error(tool, 'unsupported tool', f'Unsupported tool: {tool}')

    update = _normalize_project_payload(input_data)

    summary_card = {
        'title': 'Project Update',
        'value': update['project_id'],
        'subtitle': f"status={update['status']} owner={update['owner']}",
    }
    status_badge = {
        'level': 'success' if update['status'] in {'in_progress', 'completed'} else 'warning',
        'label': update['status'],
    }
    data_table = {
        'columns': ['field', 'value'],
        'rows': [
            {'field': 'project_id', 'value': update['project_id']},
            {'field': 'doc_id', 'value': update['doc_id']},
            {'field': 'category', 'value': update['category']},
            {'field': 'trace_id', 'value': update['trace_id']},
        ],
    }
    timeline_event = {
        'time': update['updated_at'],
        'event': 'project_update_normalized',
        'detail': f"{update['project_id']} -> {update['status']}",
    }

    alerts = []
    if update['requested_status'] not in ALLOWED_STATUSES:
        alerts.append({'severity': 'warning', 'message': f"Requested status '{update['requested_status']}' normalized to '{update['status']}'"})

    return {
        'ok': True,
        'status': 'processed',
        'service': SERVICE_SLUG,
        'tool': str(tool),
        'runtime_mode': RUNTIME_MODE,
        'note': RUNTIME_NOTE,
        'project_state_update': update,
        'summary_card': summary_card,
        'status_badge': status_badge,
        'data_table': data_table,
        'timeline_event': timeline_event,
        'alerts': alerts,
        'action_list': [
            {'action': 'notify_slack', 'channel': '#mcp-project-manager-agent'},
            {'action': 'persist_project_update', 'target': 'future_notional_store'},
        ],
    }


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', '8080'))
    uvicorn.run(app, host='0.0.0.0', port=port)
