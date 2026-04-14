import os
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv('MCP_SERVICE_NAME', os.getenv('SERVICE_NAME', os.getenv('SERVICE_SLUG', 'coder-agent')))
SERVICE_SLUG = os.getenv('SERVICE_SLUG', 'coder-agent')

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


def _collector_summary(input_data: Dict[str, Any]) -> Dict[str, Any]:
    collector = input_data.get('collector') if isinstance(input_data.get('collector'), str) else 'unknown'
    records = input_data.get('records') if isinstance(input_data.get('records'), list) else []

    recommendations: List[str] = []
    if collector == 'ports' and records:
        recommendations.append('Review exposed listening ports and verify least-privilege firewall rules.')
    if collector == 'services' and records:
        recommendations.append('Confirm critical services are running with intended start modes.')
    if collector == 'event_logs' and records:
        recommendations.append('Filter recent high-severity event log entries for incident triage.')
    if collector == 'network' and records:
        recommendations.append('Validate interface/gateway consistency across environments.')

    if not recommendations:
        recommendations.append('No collector-specific recommendation generated; perform manual review.')

    return {
        'collector': collector,
        'record_count': len(records),
        'recommendations': recommendations,
        'analyzed_at': _now_iso(),
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

    if tool == 'coder-agent.status':
        return {
            'ok': True,
            'status': 'ready',
            'service': SERVICE_SLUG,
            'tool': str(tool),
            'supports': ['coder.analyze'],
        }

    if tool != 'coder.analyze':
        return _error(tool, 'unsupported tool', f'Unsupported tool: {tool}')

    analysis = _collector_summary(input_data)

    return {
        'ok': True,
        'status': 'processed',
        'service': SERVICE_SLUG,
        'tool': str(tool),
        'coder_analysis': analysis,
        'summary_card': {'title': 'Coder Analysis', 'value': analysis['collector'], 'subtitle': f"records={analysis['record_count']}"},
        'status_badge': {'level': 'success', 'label': 'analyzed'},
        'action_list': [{'action': 'open_follow_up_ticket', 'priority': 'medium'}],
    }


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', '8080'))
    uvicorn.run(app, host='0.0.0.0', port=port)
