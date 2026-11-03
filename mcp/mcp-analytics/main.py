import os
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv('MCP_SERVICE_NAME', os.getenv('SERVICE_NAME', os.getenv('SERVICE_SLUG', 'mcp-analytics')))
SERVICE_SLUG = os.getenv('SERVICE_SLUG', 'mcp-analytics')

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


def _bool_flag(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {'1', 'true', 'yes'}
    return bool(value)


def _compute_analytics(input_data: Dict[str, Any]) -> Dict[str, Any]:
    doc_id = _first_non_empty(input_data.get('doc_id')) or _first_non_empty(input_data.get('record_id'))
    category = _first_non_empty(input_data.get('category')) or 'unknown'
    source_record = input_data.get('source_record') if isinstance(input_data.get('source_record'), dict) else {}
    source = _first_non_empty(input_data.get('source')) or _first_non_empty(source_record.get('source')) or 'direct'
    route = _first_non_empty(input_data.get('route')) or 'unspecified'

    actions = input_data.get('actions', {})
    action_keys: List[str] = []
    if isinstance(actions, dict):
        action_keys = sorted(actions.keys())
    elif isinstance(actions, list):
        action_keys = [str(item) for item in actions]

    validation_flags = {
        'has_doc_id': bool(doc_id),
        'has_category': category != 'unknown',
        'has_actions': len(action_keys) > 0,
        'has_source_record': bool(source_record),
        'has_repo_path': bool(_first_non_empty(input_data.get('repo_path'))),
    }

    health_indicators = {
        'input_object_valid': isinstance(input_data, dict),
        'required_fields_passed': validation_flags['has_doc_id'] and validation_flags['has_category'],
        'chain_ready': validation_flags['has_doc_id'] and validation_flags['has_actions'],
    }

    completeness_score = sum(1 for value in validation_flags.values() if value)

    return {
        'doc_id': doc_id,
        'category': category,
        'source': source,
        'route_summary': route,
        'file_source_summary': {
            'file_path': input_data.get('file_path'),
            'repo_path': input_data.get('repo_path'),
            'title': input_data.get('title') or source_record.get('title'),
        },
        'action_presence': {
            'count': len(action_keys),
            'keys': action_keys,
        },
        'category_counts': {category: 1},
        'validation_flags': validation_flags,
        'health_indicators': health_indicators,
        'completeness_score': completeness_score,
        'generated_at': _now_iso(),
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

    if tool == 'mcp-analytics.status':
        return {
            'ok': True,
            'status': 'ready',
            'service': SERVICE_SLUG,
            'tool': str(tool),
            'supports': ['analytics.process'],
            'learning_pipeline_role': 'analytics_feedback',
            'frontend_safe_output': True,
            'slack_trigger_ready': True,
        }

    if tool != 'analytics.process':
        return _error(tool, 'unsupported tool', f'Unsupported tool: {tool}')

    analytics = _compute_analytics(input_data)
    required_pass = analytics['health_indicators']['required_fields_passed']

    summary_card = {
        'title': 'Analytics Summary',
        'value': analytics['doc_id'] or 'no-doc-id',
        'subtitle': f"category={analytics['category']} source={analytics['source']}",
    }
    status_badge = {
        'level': 'success' if required_pass else 'warning',
        'label': 'analyzed' if required_pass else 'analyzed_with_gaps',
    }
    data_table = {
        'columns': ['metric', 'value'],
        'rows': [
            {'metric': 'category', 'value': analytics['category']},
            {'metric': 'source', 'value': analytics['source']},
            {'metric': 'action_count', 'value': analytics['action_presence']['count']},
            {'metric': 'completeness_score', 'value': analytics['completeness_score']},
        ],
    }
    timeline_event = {
        'time': analytics['generated_at'],
        'event': 'analytics_computed',
        'detail': f"Processed analytics for {analytics['doc_id'] or 'unknown-doc'}",
    }

    return {
        'ok': True,
        'status': 'processed',
        'service': SERVICE_SLUG,
        'tool': str(tool),
        'analytics_summary': analytics,
        'summary_card': summary_card,
        'status_badge': status_badge,
        'data_table': data_table,
        'timeline_event': timeline_event,
        'alerts': [] if required_pass else [{'severity': 'warning', 'message': 'Required analytics fields missing'}],
        'action_list': [
            {'action': 'publish_to_dashboard', 'target': 'reporting-dashboard-ai'},
            {'action': 'store_for_learning_feedback', 'target': 'ai-training-coordinator'},
        ],
    }


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', '8080'))
    uvicorn.run(app, host='0.0.0.0', port=port)
