import os
from datetime import datetime, timezone
from typing import Any, Dict, List
from uuid import uuid4

from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv('MCP_SERVICE_NAME', os.getenv('SERVICE_NAME', os.getenv('SERVICE_SLUG', 'ai-training-coordinator')))
SERVICE_SLUG = os.getenv('SERVICE_SLUG', 'ai-training-coordinator')

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


def _normalize_lessons(input_data: Dict[str, Any]) -> List[str]:
    lessons = input_data.get('lessons')
    if isinstance(lessons, list):
        return [str(item) for item in lessons if str(item).strip()]

    actions = input_data.get('actions', {})
    if isinstance(actions, dict) and actions:
        return [f"lesson:{key}" for key in sorted(actions.keys())]

    title = _first_non_empty(input_data.get('title'))
    if title:
        return [title]

    return ['default_training_lesson']


def _normalize_training_payload(input_data: Dict[str, Any]) -> Dict[str, Any]:
    trace_id = _first_non_empty(input_data.get('trace_id')) or _first_non_empty(input_data.get('traceId')) or str(uuid4())
    source_record = input_data.get('source_record') if isinstance(input_data.get('source_record'), dict) else {}

    return {
        'training_event_id': _first_non_empty(input_data.get('training_event_id')) or f"training-{trace_id[:8]}",
        'doc_id': _first_non_empty(input_data.get('doc_id')),
        'category': _first_non_empty(input_data.get('category')) or 'ai_agents',
        'source': _first_non_empty(input_data.get('source')) or _first_non_empty(source_record.get('source')) or 'internal',
        'source_record_id': _first_non_empty(source_record.get('record_id')),
        'lessons': _normalize_lessons(input_data),
        'tags': input_data.get('tags', []) if isinstance(input_data.get('tags'), list) else [],
        'trace_id': trace_id,
        'synced_at': _now_iso(),
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

    if tool == 'ai-training-coordinator.status':
        return {
            'ok': True,
            'status': 'ready',
            'service': SERVICE_SLUG,
            'tool': str(tool),
            'supports': ['training.sync'],
            'frontend_safe_output': True,
            'slack_trigger_ready': True,
            'learning_pipeline_role': 'learning_synthesis',
        }

    if tool != 'training.sync':
        return _error(tool, 'unsupported tool', f'Unsupported tool: {tool}')

    sync = _normalize_training_payload(input_data)

    summary_card = {
        'title': 'Training Sync',
        'value': sync['training_event_id'],
        'subtitle': f"lessons={len(sync['lessons'])} source={sync['source']}",
    }
    status_badge = {'level': 'success', 'label': 'synced'}
    data_table = {
        'columns': ['field', 'value'],
        'rows': [
            {'field': 'training_event_id', 'value': sync['training_event_id']},
            {'field': 'doc_id', 'value': sync['doc_id']},
            {'field': 'source_record_id', 'value': sync['source_record_id']},
            {'field': 'trace_id', 'value': sync['trace_id']},
        ],
    }
    timeline_event = {
        'time': sync['synced_at'],
        'event': 'training_synced',
        'detail': f"Synced {len(sync['lessons'])} lesson entries",
    }

    return {
        'ok': True,
        'status': 'processed',
        'service': SERVICE_SLUG,
        'tool': str(tool),
        'training_sync_result': sync,
        'summary_card': summary_card,
        'status_badge': status_badge,
        'data_table': data_table,
        'timeline_event': timeline_event,
        'alerts': [],
        'action_list': [
            {'action': 'generate_sop', 'toolId': 'sop.generate'},
            {'action': 'generate_training_content', 'toolId': 'content.generate'},
        ],
    }


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', '8080'))
    uvicorn.run(app, host='0.0.0.0', port=port)
