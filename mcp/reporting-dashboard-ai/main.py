import os
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv('MCP_SERVICE_NAME', os.getenv('SERVICE_NAME', os.getenv('SERVICE_SLUG', 'reporting-dashboard-ai')))
SERVICE_SLUG = os.getenv('SERVICE_SLUG', 'reporting-dashboard-ai')

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
        'status_badge': {'level': 'error', 'label': error},
        'alerts': [{'severity': 'error', 'message': detail}],
    }


def _as_list(value: Any) -> List[Any]:
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        return [value]
    return []


def _extract_from_chained(input_data: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    buckets = {
        'analytics': [],
        'project': [],
        'training': [],
        'validation': [],
    }

    chained_results = _as_list(input_data.get('chained_results'))
    for entry in chained_results:
        if not isinstance(entry, dict):
            continue
        tool = str(entry.get('tool'))
        body = entry.get('response_body') if isinstance(entry.get('response_body'), dict) else {}
        if tool == 'analytics.process':
            buckets['analytics'].append(body)
        elif tool == 'project.update':
            buckets['project'].append(body)
        elif tool == 'training.sync':
            buckets['training'].append(body)
        elif tool == 'data.validate':
            buckets['validation'].append(body)

    return buckets


def _collect_timeline_events(*collections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    events: List[Dict[str, Any]] = []
    for collection in collections:
        for item in collection:
            if isinstance(item, dict) and isinstance(item.get('timeline_event'), dict):
                events.append(item['timeline_event'])
    if not events:
        events.append({'time': _now_iso(), 'event': 'dashboard_generated', 'detail': 'No timeline inputs were provided'})
    return events


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

    if tool == 'reporting-dashboard-ai.status':
        return {
            'ok': True,
            'status': 'ready',
            'service': SERVICE_SLUG,
            'tool': str(tool),
            'supports': ['reporting.aggregate'],
            'frontend_safe_output': True,
            'slack_trigger_ready': True,
        }

    if tool != 'reporting.aggregate':
        return _error(tool, 'unsupported tool', f'Unsupported tool: {tool}')

    analytics_outputs = _as_list(input_data.get('analytics_outputs'))
    project_updates = _as_list(input_data.get('project_updates'))
    training_syncs = _as_list(input_data.get('training_syncs'))
    validation_results = _as_list(input_data.get('validation_results'))
    retrieval_results = _as_list(input_data.get('retrieval_results'))

    chained_buckets = _extract_from_chained(input_data)
    analytics_outputs.extend(chained_buckets['analytics'])
    project_updates.extend(chained_buckets['project'])
    training_syncs.extend(chained_buckets['training'])
    validation_results.extend(chained_buckets['validation'])

    status_counts = {
        'analytics_entries': len(analytics_outputs),
        'project_updates': len(project_updates),
        'training_syncs': len(training_syncs),
        'validation_entries': len(validation_results),
        'retrieval_entries': len(retrieval_results),
    }

    alerts: List[Dict[str, Any]] = []
    rejected_count = 0
    for validation in validation_results:
        if isinstance(validation, dict):
            validation_body = validation.get('validation_result') if isinstance(validation.get('validation_result'), dict) else validation
            if bool(validation_body.get('rejected')):
                rejected_count += 1

    if rejected_count > 0:
        alerts.append({'severity': 'warning', 'message': f'{rejected_count} validation payload(s) were rejected'})

    summary_cards = [
        {'title': 'Analytics', 'value': status_counts['analytics_entries'], 'subtitle': 'Processed analytics payloads'},
        {'title': 'Project Updates', 'value': status_counts['project_updates'], 'subtitle': 'Normalized project updates'},
        {'title': 'Training Syncs', 'value': status_counts['training_syncs'], 'subtitle': 'Synchronized training events'},
        {'title': 'Validation', 'value': status_counts['validation_entries'], 'subtitle': f"Rejected={rejected_count}"},
    ]

    timeline_events = _collect_timeline_events(
        analytics_outputs,
        project_updates,
        training_syncs,
        validation_results,
        retrieval_results,
    )

    data_table = {
        'columns': ['metric', 'value'],
        'rows': [{'metric': key, 'value': value} for key, value in status_counts.items()],
    }

    return {
        'ok': True,
        'status': 'processed',
        'service': SERVICE_SLUG,
        'tool': str(tool),
        'summary_cards': summary_cards,
        'status_counts': status_counts,
        'alerts': alerts,
        'timeline_events': timeline_events,
        'data_table': data_table,
        'status_badge': {'level': 'success', 'label': 'dashboard_ready'},
        'action_list': [
            {'action': 'publish_backend_snapshot'},
            {'action': 'post_slack_digest', 'channel': '#mcp-reporting-dashboard-ai'},
        ],
    }


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', '8080'))
    uvicorn.run(app, host='0.0.0.0', port=port)
