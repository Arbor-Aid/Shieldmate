import os
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv('MCP_SERVICE_NAME', os.getenv('SERVICE_NAME', os.getenv('SERVICE_SLUG', 'content-generation-ai')))
SERVICE_SLUG = os.getenv('SERVICE_SLUG', 'content-generation-ai')

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
    }


def _normalize_keywords(input_data: Dict[str, Any]) -> List[str]:
    keywords = input_data.get('keywords')
    if isinstance(keywords, list):
        return [str(item) for item in keywords if str(item).strip()]
    actions = input_data.get('actions', {})
    if isinstance(actions, dict):
        return sorted(actions.keys())
    return []


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

    if tool == 'content-generation-ai.status':
        return {
            'ok': True,
            'status': 'ready',
            'service': SERVICE_SLUG,
            'tool': str(tool),
            'supports': ['content.generate'],
            'activation_level': 'tier2',
        }

    if tool != 'content.generate':
        return _error(tool, 'unsupported tool', f'Unsupported tool: {tool}')

    topic = _first_non_empty(input_data.get('topic')) or _first_non_empty(input_data.get('title')) or 'Untitled Topic'
    context = _first_non_empty(input_data.get('context')) or 'No additional context provided.'
    keywords = _normalize_keywords(input_data)

    generated = {
        'headline': f'{topic} - Operational Draft',
        'summary': f'{topic}: {context}',
        'bullet_points': [
            f'Focus area: {topic}',
            f'Context: {context}',
            f'Keywords: {", ".join(keywords) if keywords else "none"}',
        ],
        'generated_at': _now_iso(),
    }

    return {
        'ok': True,
        'status': 'processed',
        'service': SERVICE_SLUG,
        'tool': str(tool),
        'content_output': generated,
        'summary_card': {'title': 'Content Draft', 'value': topic, 'subtitle': 'Tier2 generated output'},
        'status_badge': {'level': 'success', 'label': 'generated'},
        'action_list': [
            {'action': 'send_to_training', 'toolId': 'training.sync'},
            {'action': 'send_to_sop', 'toolId': 'sop.generate'},
        ],
    }


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', '8080'))
    uvicorn.run(app, host='0.0.0.0', port=port)
