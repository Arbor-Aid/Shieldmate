import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI, Request

SERVICE_NAME = os.getenv('MCP_SERVICE_NAME', os.getenv('SERVICE_NAME', os.getenv('SERVICE_SLUG', 'information-retrieval-ai')))
SERVICE_SLUG = os.getenv('SERVICE_SLUG', 'information-retrieval-ai')

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


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _bootstrap_root() -> Path:
    configured = os.getenv('PLATFORM_BOOTSTRAP_ROOT', '').strip()
    if configured:
        return Path(configured)
    return _repo_root() / 'platform_bootstrap'


def _candidate_dirs() -> List[Path]:
    root = _bootstrap_root()
    return [
        root / 'integrations' / 'google_drive' / 'normalized',
        root / 'integrations' / 'notion' / 'normalized',
        root / 'integrations' / 'windows_admin_tools' / 'outputs' / 'normalized_json',
        root / 'shared' / 'google_ads' / 'normalized',
        root / 'shared' / 'geography' / 'samples',
        root / 'shared' / 'demographics' / 'samples',
        root / 'shared' / 'org_profiles' / 'samples',
    ]


def _safe_load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except Exception:
        return None


def _normalize_record(source: str, path: Path, record: Any) -> Dict[str, Any]:
    if isinstance(record, dict):
        record_id = _first_non_empty(record.get('record_id')) or _first_non_empty(record.get('id')) or path.stem
        title = _first_non_empty(record.get('title')) or _first_non_empty(record.get('name')) or path.stem
    else:
        record_id = path.stem
        title = path.stem

    return {
        'source': source,
        'record_id': record_id,
        'title': title,
        'path': str(path),
        'record': record,
    }


def _load_records(max_files: int = 200) -> List[Dict[str, Any]]:
    records: List[Dict[str, Any]] = []
    for directory in _candidate_dirs():
        if not directory.exists():
            continue

        source = directory.parts[-2] if directory.parts[-1] == 'normalized' else directory.parts[-1]
        for json_file in sorted(directory.glob('*.json')):
            loaded = _safe_load_json(json_file)
            if loaded is None:
                continue
            records.append(_normalize_record(source, json_file, loaded))
            if len(records) >= max_files:
                return records

    return records


def _query_terms(query: str) -> List[str]:
    return [term.lower() for term in query.split() if term.strip()]


def _search_records(records: List[Dict[str, Any]], query: str, limit: int, source_filter: str) -> List[Dict[str, Any]]:
    terms = _query_terms(query)
    results: List[Dict[str, Any]] = []

    for item in records:
        if source_filter and item['source'] != source_filter:
            continue

        blob = json.dumps(item['record'], sort_keys=True).lower()

        if terms:
            term_hits = sum(1 for term in terms if term in blob)
            if term_hits == 0:
                continue
        else:
            term_hits = 1

        results.append(
            {
                'source': item['source'],
                'record_id': item['record_id'],
                'title': item['title'],
                'path': item['path'],
                'term_hits': term_hits,
                'record': item['record'],
            }
        )

    results.sort(key=lambda entry: entry['term_hits'], reverse=True)
    return results[:limit]


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

    if tool == 'information-retrieval-ai.status':
        return {
            'ok': True,
            'status': 'ready',
            'service': SERVICE_SLUG,
            'tool': str(tool),
            'supports': ['retrieval.search'],
            'bootstrap_root': str(_bootstrap_root()),
            'frontend_safe_output': True,
            'slack_trigger_ready': True,
        }

    if tool not in {'retrieval.search', 'information.retrieve'}:
        return _error(tool, 'unsupported tool', f'Unsupported tool: {tool}')

    query = _first_non_empty(input_data.get('query'))
    source_filter = _first_non_empty(input_data.get('source'))
    limit = input_data.get('limit', 10)
    if not isinstance(limit, int) or limit <= 0:
        limit = 10

    records = _load_records()
    results = _search_records(records, query=query, limit=min(limit, 50), source_filter=source_filter)

    summary_card = {
        'title': 'Retrieval Search',
        'value': len(results),
        'subtitle': f"query='{query or '*'}' source='{source_filter or 'all'}'",
    }
    status_badge = {'level': 'success', 'label': 'results_found' if results else 'no_results'}
    data_table = {
        'columns': ['source', 'record_id', 'title', 'term_hits'],
        'rows': [
            {
                'source': item['source'],
                'record_id': item['record_id'],
                'title': item['title'],
                'term_hits': item['term_hits'],
            }
            for item in results
        ],
    }
    timeline_event = {
        'time': _now_iso(),
        'event': 'retrieval_search_executed',
        'detail': f"records_scanned={len(records)} results={len(results)}",
    }

    return {
        'ok': True,
        'status': 'processed',
        'service': SERVICE_SLUG,
        'tool': str(tool),
        'query': query,
        'source_filter': source_filter or None,
        'records_scanned': len(records),
        'retrieved_records': results,
        'summary_card': summary_card,
        'status_badge': status_badge,
        'data_table': data_table,
        'timeline_event': timeline_event,
        'alerts': [] if results else [{'severity': 'info', 'message': 'No matching records found in local bootstrap datasets'}],
        'action_list': [
            {'action': 'refine_query', 'hint': 'Use source filter or more specific terms'},
            {'action': 'forward_to_dashboard', 'toolId': 'reporting.aggregate'},
        ],
    }


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', '8080'))
    uvicorn.run(app, host='0.0.0.0', port=port)
