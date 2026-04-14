import os
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv('MCP_SERVICE_NAME', os.getenv('SERVICE_NAME', os.getenv('SERVICE_SLUG', 'training_to_sop')))
SERVICE_SLUG = os.getenv('SERVICE_SLUG', 'training_to_sop')
RUNTIME_MODE = 'activated_transitional_main_active'
RUNTIME_NOTE = 'main.py is activated for sop.generate; app.py domain routes remain unmounted by active entrypoint.'

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
        'runtime_mode': RUNTIME_MODE,
    }


def _as_lessons(input_data: Dict[str, Any]) -> List[str]:
    lessons = input_data.get('lessons')
    if isinstance(lessons, list):
        return [str(item) for item in lessons if str(item).strip()]

    actions = input_data.get('actions', {})
    if isinstance(actions, dict):
        return [f"Handle {key}" for key in sorted(actions.keys())]

    title = input_data.get('title')
    if isinstance(title, str) and title.strip():
        return [title.strip()]

    return ['Review source material']


@app.get('/health')
def health() -> Dict[str, Any]:
    return {
        'status': 'ok',
        'service': SERVICE_SLUG,
        'runtime_mode': RUNTIME_MODE,
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

    if tool == 'training_to_sop.status':
        return {
            'ok': True,
            'status': 'ready',
            'service': SERVICE_SLUG,
            'tool': str(tool),
            'runtime_mode': RUNTIME_MODE,
            'supports': ['sop.generate'],
        }

    if tool != 'sop.generate':
        return _error(tool, 'unsupported tool', f'Unsupported tool: {tool}')

    lessons = _as_lessons(input_data)
    sop_steps = [
        {'step': idx + 1, 'instruction': lesson, 'owner': 'ops-team'}
        for idx, lesson in enumerate(lessons)
    ]

    sop = {
        'sop_id': f"sop-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
        'source_doc_id': input_data.get('doc_id'),
        'title': input_data.get('title') or 'Generated SOP',
        'steps': sop_steps,
        'generated_at': _now_iso(),
    }

    return {
        'ok': True,
        'status': 'processed',
        'service': SERVICE_SLUG,
        'tool': str(tool),
        'runtime_mode': RUNTIME_MODE,
        'note': RUNTIME_NOTE,
        'sop_output': sop,
        'summary_card': {'title': 'SOP Generated', 'value': sop['sop_id'], 'subtitle': f"steps={len(sop_steps)}"},
        'status_badge': {'level': 'success', 'label': 'generated'},
        'timeline_event': {'time': sop['generated_at'], 'event': 'sop_generated', 'detail': sop['title']},
        'action_list': [
            {'action': 'sync_training', 'toolId': 'training.sync'},
            {'action': 'share_content', 'toolId': 'content.generate'},
        ],
    }


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', '8080'))
    uvicorn.run(app, host='0.0.0.0', port=port)
