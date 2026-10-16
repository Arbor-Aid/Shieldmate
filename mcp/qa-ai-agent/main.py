import os
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv('MCP_SERVICE_NAME', os.getenv('SERVICE_NAME', os.getenv('SERVICE_SLUG', 'qa-ai-agent')))
SERVICE_SLUG = os.getenv('SERVICE_SLUG', 'qa-ai-agent')

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


def _evaluate(input_data: Dict[str, Any]) -> Dict[str, Any]:
    checks: List[Dict[str, Any]] = []

    required_pairs = {
        'doc_id': input_data.get('doc_id'),
        'category': input_data.get('category'),
        'actions': input_data.get('actions'),
    }

    for field, value in required_pairs.items():
        present = value not in (None, '', [])
        checks.append({'check': f'{field}_present', 'passed': present})

    malformed = []
    if 'actions' in input_data and not isinstance(input_data.get('actions'), (dict, list, str, type(None))):
        malformed.append('actions')
    if 'source_record' in input_data and not isinstance(input_data.get('source_record'), (dict, type(None))):
        malformed.append('source_record')

    checks.append({'check': 'malformed_fields', 'passed': len(malformed) == 0, 'details': malformed})

    passed_count = sum(1 for check in checks if check.get('passed'))
    total_count = len(checks)

    return {
        'checks': checks,
        'passed_count': passed_count,
        'total_count': total_count,
        'score': round((passed_count / total_count) * 100, 2) if total_count else 0.0,
        'evaluated_at': _now_iso(),
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

    if tool == 'qa-ai-agent.status':
        return {
            'ok': True,
            'status': 'ready',
            'service': SERVICE_SLUG,
            'tool': str(tool),
            'supports': ['qa.evaluate'],
        }

    if tool != 'qa.evaluate':
        return _error(tool, 'unsupported tool', f'Unsupported tool: {tool}')

    qa = _evaluate(input_data)

    return {
        'ok': True,
        'status': 'processed',
        'service': SERVICE_SLUG,
        'tool': str(tool),
        'qa_result': qa,
        'summary_card': {'title': 'QA Evaluation', 'value': qa['score'], 'subtitle': f"{qa['passed_count']}/{qa['total_count']} checks passed"},
        'status_badge': {'level': 'success' if qa['score'] >= 75 else 'warning', 'label': 'qa_complete'},
        'alerts': [] if qa['score'] >= 75 else [{'severity': 'warning', 'message': 'QA score below target threshold'}],
        'action_list': [{'action': 'fix_failed_checks'}, {'action': 'rerun_validation', 'toolId': 'data.validate'}],
    }


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', '8080'))
    uvicorn.run(app, host='0.0.0.0', port=port)
