"""Shared source identity, change detection, and local reconciliation helpers.

These helpers do not persist records. They prepare deterministic review evidence
for the existing workbook and approval flows.
"""

from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import json
import re
from typing import Any, Dict, Iterable, List, Mapping, Optional, Sequence


DEFAULT_VOLATILE_FIELDS = {
    "accesskey",
    "requestid",
    "retrievedat",
    "retrieved_at",
    "token",
}

PROTECTED_HUMAN_FIELDS = {
    "approvalStatus",
    "approver",
    "decision",
    "decisionTimestamp",
    "humanDecision",
    "notes",
    "reviewOwner",
    "reviewStatus",
    "reviewer",
    "reviewerDecision",
}


def _normalize_identifier(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip()).casefold()


def stable_source_identity(source_identifier: str, stable_source_record_id: str) -> str:
    """SHA-256 of normalized source plus stable source record ID."""
    source = _normalize_identifier(source_identifier)
    record_id = _normalize_identifier(stable_source_record_id)
    if not source or not record_id:
        raise ValueError("source identifier and stable source record ID are required")
    return hashlib.sha256(f"{source}\x00{record_id}".encode("utf-8")).hexdigest()


def _stable_content(value: Any, volatile_fields: set[str]) -> Any:
    if isinstance(value, Mapping):
        return {
            str(key): _stable_content(item, volatile_fields)
            for key, item in sorted(value.items(), key=lambda pair: str(pair[0]))
            if str(key).casefold() not in volatile_fields
        }
    if isinstance(value, (list, tuple)):
        return [_stable_content(item, volatile_fields) for item in value]
    return value


def normalized_content_hash(
    content: Mapping[str, Any],
    *,
    volatile_fields: Iterable[str] = DEFAULT_VOLATILE_FIELDS,
) -> str:
    stable = _stable_content(content, {field.casefold() for field in volatile_fields})
    rendered = json.dumps(stable, ensure_ascii=False, separators=(",", ":"), sort_keys=True, default=str)
    return hashlib.sha256(rendered.encode("utf-8")).hexdigest()


def attach_discovery_identity(
    record: Mapping[str, Any],
    *,
    source_identifier: str,
    stable_source_record_id: str,
    content_fields: Sequence[str],
) -> Dict[str, Any]:
    result = dict(record)
    content = {field: result.get(field) for field in content_fields}
    result["identityHash"] = stable_source_identity(source_identifier, stable_source_record_id)
    result["contentHash"] = normalized_content_hash(content)
    result["sourceIdentifier"] = source_identifier
    result["stableSourceRecordId"] = stable_source_record_id
    return result


def normalize_external_lead(
    *,
    opportunity_type: str,
    source_identifier: str,
    stable_source_record_id: str,
    title: str,
    official_link: str,
    retrieved_at: Optional[str] = None,
    published_at: Optional[str] = None,
    response_deadline: Optional[str] = None,
    agency_or_buyer: Optional[str] = None,
    parties: Iterable[str] = (),
    source_status: str = "UNVERIFIED_SOURCE_RECORD",
    details: Optional[Mapping[str, Any]] = None,
) -> Dict[str, Any]:
    retrieved_at = retrieved_at or datetime.now(timezone.utc).isoformat()
    record = {
        "source": source_identifier,
        "sourceNoticeId": stable_source_record_id,
        "stableOpportunityId": f"{opportunity_type}:{stable_source_record_id}",
        "opportunityType": opportunity_type,
        "title": title,
        "officialLink": official_link,
        "publishedAt": published_at,
        "responseDeadline": response_deadline,
        "agencyOrBuyer": agency_or_buyer,
        "parties": list(parties),
        "sourceStatus": source_status,
        "retrievedAt": retrieved_at,
        "details": dict(details or {}),
    }
    return attach_discovery_identity(
        record,
        source_identifier=source_identifier,
        stable_source_record_id=stable_source_record_id,
        content_fields=(
            "opportunityType", "title", "officialLink", "publishedAt",
            "responseDeadline", "agencyOrBuyer", "parties", "sourceStatus", "details",
        ),
    )


def reconcile_record(
    incoming: Mapping[str, Any],
    existing: Optional[Mapping[str, Any]] = None,
) -> Dict[str, Any]:
    identity = incoming.get("identityHash")
    content_hash = incoming.get("contentHash")
    if not identity or not content_hash:
        raise ValueError("incoming record requires identityHash and contentHash")
    if existing is None:
        return {"status": "NEW", "identityHash": identity, "record": deepcopy(dict(incoming))}
    if existing.get("identityHash") != identity:
        raise ValueError("cannot reconcile records with different identities")
    status = "UNCHANGED" if existing.get("contentHash") == content_hash else "MODIFIED_SOURCE_CONTENT"
    proposed = deepcopy(dict(existing))
    for key, value in incoming.items():
        if key not in PROTECTED_HUMAN_FIELDS:
            proposed[key] = deepcopy(value)
    preserved = sorted(key for key in PROTECTED_HUMAN_FIELDS if key in existing)
    return {
        "status": status,
        "identityHash": identity,
        "previousContentHash": existing.get("contentHash"),
        "incomingContentHash": content_hash,
        "preservedHumanFields": preserved,
        "record": proposed,
    }


def reconcile_batch(
    incoming_records: Iterable[Mapping[str, Any]],
    existing_records: Iterable[Mapping[str, Any]] = (),
) -> Dict[str, Any]:
    existing = {str(item.get("identityHash")): item for item in existing_records if item.get("identityHash")}
    first_seen: Dict[str, Mapping[str, Any]] = {}
    outcomes: List[Dict[str, Any]] = []
    for incoming in incoming_records:
        identity = str(incoming.get("identityHash") or "")
        if not identity:
            raise ValueError("all records require identityHash")
        if identity in first_seen:
            prior = first_seen[identity]
            outcomes.append({
                "status": "DUPLICATE_REPEAT" if prior.get("contentHash") == incoming.get("contentHash") else "CONFLICTING_SOURCE_CONTENT_REVIEW",
                "identityHash": identity,
                "record": deepcopy(dict(incoming)),
            })
            continue
        first_seen[identity] = incoming
        outcomes.append(reconcile_record(incoming, existing.get(identity)))
    return {
        "recordsReceived": len(outcomes),
        "uniqueIdentities": len(first_seen),
        "outcomes": outcomes,
        "writesPerformed": 0,
    }
