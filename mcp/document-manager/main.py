import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

import requests
from fastapi import FastAPI, Request

from firestore_client import write_doc_record

SERVICE_NAME = os.getenv('MCP_SERVICE_NAME', os.getenv('SERVICE_NAME', os.getenv('SERVICE_SLUG', 'document-manager')))
SERVICE_SLUG = os.getenv('SERVICE_SLUG', 'document-manager')
MCP_GATEWAY_EXECUTE_URL_DEFAULT = 'http://localhost:8090/mcp/execute'
REQUEST_TIMEOUT_SECONDS = int(os.getenv('MCP_REQUEST_TIMEOUT_SECONDS', '5'))

ALLOWED_CATEGORIES = {'engineering', 'operations', 'ai_agents', 'governance'}
ROUTE_MAP = {
    'engineering': 'mcp-analytics',
    'operations': 'project-manager-agent',
    'ai_agents': 'ai-training-coordinator',
    'governance': 'data-scrubbing-ai',
}
ROUTE_TOOL_MAP = {
    'mcp-analytics': 'analytics.process',
    'project-manager-agent': 'project.update',
    'ai-training-coordinator': 'training.sync',
    'data-scrubbing-ai': 'data.validate',
}

app = FastAPI(title=SERVICE_NAME)

_GATEWAY_URL_LOGGED = False


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _first_non_empty(value: Any) -> Optional[str]:
    if not isinstance(value, str):
        return None
    value = value.strip()
    return value if value else None


def get_gateway_execute_url() -> str:
    return os.getenv('MCP_GATEWAY_EXECUTE_URL', MCP_GATEWAY_EXECUTE_URL_DEFAULT)


def log_gateway_url_once(gateway_execute_url: str) -> None:
    global _GATEWAY_URL_LOGGED
    if not _GATEWAY_URL_LOGGED:
        print(f'[DOC-MANAGER] Gateway execute URL: {gateway_execute_url}')
        _GATEWAY_URL_LOGGED = True


def normalize_response_body(response: requests.Response) -> Any:
    try:
        return response.json()
    except Exception:
        return response.text


def extract_trace_id(req: Request, data: Dict[str, Any]) -> str:
    candidate = (
        _first_non_empty(data.get('traceId'))
        or _first_non_empty(data.get('trace_id'))
        or _first_non_empty(req.headers.get('X-Trace-Id'))
        or _first_non_empty(req.headers.get('X-Request-Id'))
    )
    return candidate or str(uuid4())


def normalize_meta(data: Dict[str, Any]) -> Dict[str, Any]:
    meta = data.get('meta', {})
    if isinstance(meta, dict):
        return meta
    return {'raw_meta': meta}


def normalize_actions(raw_actions: Any) -> Dict[str, Any]:
    if raw_actions is None:
        return {}
    if isinstance(raw_actions, dict):
        return raw_actions
    if isinstance(raw_actions, list):
        return {'items': raw_actions}
    if isinstance(raw_actions, str):
        return {'note': raw_actions}
    return {'value': raw_actions}


def normalize_source_record(input_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    source_record = input_data.get('normalized_record')
    if not isinstance(source_record, dict):
        source_record = input_data.get('source_record')
    if not isinstance(source_record, dict):
        source_record = input_data.get('record')
    if not isinstance(source_record, dict):
        return None

    source = _first_non_empty(source_record.get('source')) or 'external'
    record_id = _first_non_empty(source_record.get('record_id'))
    title = _first_non_empty(source_record.get('title'))

    return {
        'source': source,
        'record_id': record_id,
        'title': title,
        'content_type': source_record.get('content_type'),
        'metadata': source_record.get('metadata', {}),
        'raw': source_record,
    }


def derive_category(raw_category: Any, source_record: Optional[Dict[str, Any]]) -> Optional[str]:
    category = _first_non_empty(raw_category)
    if category and category in ALLOWED_CATEGORIES:
        return category

    if source_record and source_record.get('source') in {'google_drive', 'notion'}:
        return 'operations'

    return None


def derive_doc_id(raw_doc_id: Any, source_record: Optional[Dict[str, Any]]) -> Optional[str]:
    doc_id = _first_non_empty(raw_doc_id)
    if doc_id:
        return doc_id

    if source_record and source_record.get('record_id'):
        source = source_record.get('source', 'external')
        return f"{source}:{source_record['record_id']}"

    return None


def validate_and_normalize_input(input_data: Dict[str, Any]) -> Dict[str, Any]:
    source_record = normalize_source_record(input_data)
    doc_id = derive_doc_id(input_data.get('doc_id'), source_record)
    category = derive_category(input_data.get('category'), source_record)

    if not doc_id:
        return {
            'ok': False,
            'error': 'Invalid doc_id',
            'detail': 'doc_id must be provided or derivable from source record',
        }

    if not category:
        return {
            'ok': False,
            'error': 'Invalid category',
            'detail': 'category must be one of engineering, operations, ai_agents, governance',
        }

    if source_record:
        if source_record.get('source') in {'google_drive', 'notion'} and not source_record.get('record_id'):
            return {
                'ok': False,
                'error': 'Invalid source record',
                'detail': 'normalized google_drive/notion records require record_id',
            }

    normalized_actions = normalize_actions(input_data.get('actions'))

    normalized_payload = {
        'doc_id': doc_id,
        'category': category,
        'actions': normalized_actions,
        'repo_path': input_data.get('repo_path'),
        'mcp_owner': input_data.get('mcp_owner'),
        'file_path': input_data.get('file_path'),
        'source': (source_record or {}).get('source', input_data.get('source', 'direct')),
        'source_record': source_record,
        'title': input_data.get('title') or (source_record or {}).get('title'),
        'ingested_at': input_data.get('ingested_at') or _now_iso(),
        'tags': input_data.get('tags', []),
    }

    return {'ok': True, 'payload': normalized_payload}


def call_mcp(
    tool: str,
    payload: Dict[str, Any],
    authorization: Optional[str] = None,
    trace_id: Optional[str] = None,
    meta: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    gateway_execute_url = get_gateway_execute_url()
    log_gateway_url_once(gateway_execute_url)

    headers: Dict[str, str] = {}
    if authorization:
        headers['Authorization'] = authorization
    if trace_id:
        headers['X-Trace-Id'] = trace_id
        headers['X-Request-Id'] = trace_id

    try:
        response = requests.post(
            gateway_execute_url,
            json={
                'toolId': tool,
                'tool': tool,
                'input': payload,
                'traceId': trace_id,
                'meta': meta or {},
            },
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )

        body = normalize_response_body(response)
        print(f'[CHAIN MCP] {tool} -> {response.status_code}')

        return {
            'tool': tool,
            'ok': response.status_code < 400,
            'status_code': response.status_code,
            'response_body': body,
            'error': None,
        }

    except Exception as exc:
        print(f'[CHAIN ERROR] {tool} -> {exc}')
        return {
            'tool': tool,
            'ok': False,
            'status_code': None,
            'response_body': None,
            'error': str(exc),
        }


def error_response(error: str, detail: str, tool: str = 'document.process', trace_id: Optional[str] = None) -> Dict[str, Any]:
    return {
        'ok': False,
        'status': 'error',
        'service': SERVICE_SLUG,
        'tool': tool,
        'error': error,
        'detail': detail,
        'trace_id': trace_id,
        'status_badge': {'level': 'error', 'label': error},
        'alerts': [{'severity': 'error', 'message': detail}],
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
async def execute(req: Request) -> Dict[str, Any]:
    authorization = req.headers.get('Authorization')

    try:
        data = await req.json()
    except Exception:
        return error_response('Invalid request', 'Request body must be valid JSON')

    if not isinstance(data, dict):
        return error_response('Invalid request', 'Request body must be a JSON object')

    tool = data.get('toolId') or data.get('tool')
    input_data = data.get('input', {})
    trace_id = extract_trace_id(req, data)
    meta = normalize_meta(data)

    if not isinstance(input_data, dict):
        return error_response('Invalid input', 'input must be a JSON object', str(tool), trace_id)

    if tool == 'document-manager.status':
        return {
            'ok': True,
            'status': 'ready',
            'service': SERVICE_SLUG,
            'tool': str(tool),
            'trace_id': trace_id,
            'supports': ['document.process'],
            'consumes_bootstrap_data': ['google_drive.normalized', 'notion.normalized', 'smoke_payloads'],
            'writes_structured_records': True,
            'frontend_safe_output': True,
            'slack_trigger_ready': True,
            'gateway_execute_url': get_gateway_execute_url(),
        }

    if tool != 'document.process':
        return error_response('unsupported tool', f'Unsupported tool: {tool}', str(tool), trace_id)

    normalized = validate_and_normalize_input(input_data)
    if not normalized.get('ok'):
        return error_response(
            str(normalized.get('error')),
            str(normalized.get('detail')),
            str(tool),
            trace_id,
        )

    payload = normalized['payload']
    payload['trace_id'] = trace_id
    payload['meta'] = meta

    category = payload['category']
    route = ROUTE_MAP[category]
    chained_tool = ROUTE_TOOL_MAP[route]

    print('\n[DOC-MANAGER] Processing:')
    print(json.dumps(payload, indent=2))
    print(f'[ROUTE] {category} -> {route}')

    record = write_doc_record(
        payload,
        trace_id=trace_id,
        meta=meta,
        route=route,
        chained_tools=[chained_tool],
        source_type=payload.get('source'),
    )

    chained_result = call_mcp(
        chained_tool,
        payload,
        authorization=authorization,
        trace_id=trace_id,
        meta=meta,
    )

    source_type = payload.get('source', 'direct')

    summary_card = {
        'title': 'Document Orchestration',
        'value': payload['doc_id'],
        'subtitle': f"{category} -> {route}",
    }
    status_badge = {
        'level': 'success' if chained_result.get('ok') else 'warning',
        'label': 'processed' if chained_result.get('ok') else 'processed_with_chain_issue',
    }
    data_table = {
        'columns': ['field', 'value'],
        'rows': [
            {'field': 'doc_id', 'value': payload['doc_id']},
            {'field': 'category', 'value': category},
            {'field': 'route', 'value': route},
            {'field': 'source', 'value': source_type},
            {'field': 'trace_id', 'value': trace_id},
        ],
    }
    timeline_event = {
        'time': _now_iso(),
        'event': 'document_orchestrated',
        'detail': f"Dispatched {payload['doc_id']} to {chained_tool}",
    }

    return {
        'ok': True,
        'status': 'processed',
        'service': SERVICE_SLUG,
        'tool': str(tool),
        'trace_id': trace_id,
        'route': route,
        'doc_id': payload['doc_id'],
        'category': category,
        'source_type': source_type,
        'chained': True,
        'chained_results': [chained_result],
        'orchestration_result': {
            'normalized_payload': payload,
            'record_write': {
                'event_type': record.get('event_type'),
                'recorded_at': record.get('recorded_at'),
                'route': record.get('route'),
                'source_record_id': record.get('source_record_id'),
            },
        },
        'summary_card': summary_card,
        'status_badge': status_badge,
        'data_table': data_table,
        'timeline_event': timeline_event,
        'action_list': [
            {'action': 'review_chain_result', 'tool': chained_tool},
            {'action': 'inspect_trace', 'trace_id': trace_id},
        ],
    }


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', '8080'))
    uvicorn.run(app, host='0.0.0.0', port=port)
