import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _default_record_log_path() -> Path:
    return _repo_root() / 'platform_bootstrap' / 'incidents' / 'document_manager_records.jsonl'


def _resolve_record_log_path() -> Path:
    configured = os.getenv('DOCUMENT_MANAGER_RECORD_LOG_PATH', '').strip()
    if configured:
        return Path(configured)
    return _default_record_log_path()


def write_doc_record_real(payload: Dict[str, Any]) -> None:
    # Future integration point (env-gated): add real Firestore write logic here.
    # Example gate: DOCUMENT_MANAGER_ENABLE_FIRESTORE_WRITE=true
    raise NotImplementedError('Real Firestore integration is not enabled.')


def _normalized_actions(actions: Any) -> Dict[str, Any]:
    if isinstance(actions, dict):
        return actions
    if isinstance(actions, list):
        return {'items': actions}
    return {'value': actions}


def build_structured_record(
    payload: Dict[str, Any],
    trace_id: Optional[str] = None,
    meta: Optional[Dict[str, Any]] = None,
    route: Optional[str] = None,
    chained_tools: Optional[List[str]] = None,
    source_type: Optional[str] = None,
) -> Dict[str, Any]:
    source_record = payload.get('source_record')
    source_record_id = None
    source_title = None
    if isinstance(source_record, dict):
        source_record_id = source_record.get('record_id')
        source_title = source_record.get('title')

    actions = _normalized_actions(payload.get('actions', {}))
    action_count = len(actions.keys()) if isinstance(actions, dict) else 0

    return {
        'event_type': 'document_manager.processed',
        'recorded_at': _now_iso(),
        'trace_id': trace_id,
        'doc_id': payload.get('doc_id'),
        'category': payload.get('category'),
        'route': route,
        'mcp_owner': payload.get('mcp_owner'),
        'repo_path': payload.get('repo_path'),
        'file_path': payload.get('file_path'),
        'source_type': source_type or payload.get('source') or 'direct',
        'source_record_id': source_record_id,
        'source_title': source_title,
        'actions': actions,
        'action_count': action_count,
        'chained_tools': chained_tools or [],
        'meta': meta or {},
    }


def _append_jsonl(path: Path, record: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('a', encoding='utf-8') as handle:
        handle.write(json.dumps(record) + '\n')


def write_doc_record(
    payload: Dict[str, Any],
    trace_id: Optional[str] = None,
    meta: Optional[Dict[str, Any]] = None,
    route: Optional[str] = None,
    chained_tools: Optional[List[str]] = None,
    source_type: Optional[str] = None,
) -> Dict[str, Any]:
    record = build_structured_record(
        payload=payload,
        trace_id=trace_id,
        meta=meta,
        route=route,
        chained_tools=chained_tools,
        source_type=source_type,
    )

    # Default-on local structured log for bootstrap/replay support.
    file_log_enabled = os.getenv('DOCUMENT_MANAGER_ENABLE_FILE_LOG', 'true').strip().lower() != 'false'
    if file_log_enabled:
        try:
            _append_jsonl(_resolve_record_log_path(), record)
        except Exception as exc:
            record['file_log_error'] = str(exc)

    print('[FIRESTORE READY]', json.dumps({
        'doc_id': record.get('doc_id'),
        'category': record.get('category'),
        'route': record.get('route'),
        'trace_id': record.get('trace_id'),
        'source_type': record.get('source_type'),
    }))

    return record
