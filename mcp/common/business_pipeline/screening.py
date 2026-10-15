"""Conservative, synthetic-testable screening candidate generation.

This module creates review candidates only. It cannot clear a party or release a
transaction, and it keeps source-provided scores separate from internal name
similarity because CSL and OFAC scoring semantics are not interchangeable.
"""

from datetime import datetime, timezone
from difflib import SequenceMatcher
import hashlib
import re
import unicodedata
from typing import Any, Dict, Iterable, List, Mapping, Optional

from . import FUZZY_THRESHOLD


SCREENING_STATES = {
    "NOT_SCREENED",
    "NO_CANDIDATE_MATCH",
    "POTENTIAL_MATCH",
    "FALSE_POSITIVE_REVIEWED",
    "CONFIRMED_RESTRICTION",
    "INSUFFICIENT_INFORMATION",
    "LEGAL_REVIEW_REQUIRED",
    "HOLD_COMPLIANCE_REVIEW",
}


def normalize_official_screening_record(
    record: Mapping[str, Any],
    *,
    source: str,
    source_version: str,
) -> Dict[str, Any]:
    """Normalize already-parsed official source data without equating score scales.

    Callers remain responsible for using the current official machine-readable
    release and retaining the raw source artifact/provenance outside this object.
    """
    if source not in {"ITA_CSL", "OFAC_SLS"}:
        raise ValueError("Unsupported official screening source")
    names = record.get("aliases") or record.get("alt_names") or []
    identifiers = record.get("identifiers") or record.get("ids") or []
    programs = record.get("programs") or record.get("program") or []
    countries = record.get("countries") or record.get("country") or []
    if isinstance(names, str):
        names = [names]
    if isinstance(identifiers, str):
        identifiers = [identifiers]
    if isinstance(programs, str):
        programs = [programs]
    if isinstance(countries, str):
        countries = [countries]
    return {
        "uid": record.get("uid") or record.get("id") or record.get("source_id"),
        "source": source,
        "sourceVersion": source_version,
        "listName": record.get("listName") or record.get("source_list") or record.get("list"),
        "name": record.get("name") or record.get("primary_name") or record.get("sdn_name"),
        "aliases": list(names),
        "identifiers": [str(value) for value in identifiers],
        "countries": list(countries),
        "programs": list(programs),
        "evidenceUrl": record.get("evidenceUrl") or record.get("source_url"),
        "sourceScore": record.get("score"),
        "sourceScoreScale": f"{source}_SOURCE_DEFINED_NOT_COMPARABLE",
        "ownershipControlIndicators": list(record.get("ownershipControlIndicators") or []),
        "rawSourceReference": record.get("rawSourceReference"),
    }


def normalize_name(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value or "")
    ascii_text = "".join(char for char in decomposed if not unicodedata.combining(char))
    return " ".join(re.sub(r"[^a-zA-Z0-9]+", " ", ascii_text).casefold().split())


def name_similarity(left: str, right: str) -> float:
    return SequenceMatcher(None, normalize_name(left), normalize_name(right)).ratio()


def _case_id(linked_record: str, party_reference: str, source_version: str) -> str:
    digest = hashlib.sha256(f"{linked_record}|{party_reference}|{source_version}".encode("utf-8")).hexdigest()[:16]
    return f"SCR-{digest.upper()}"


def generate_candidates(
    party: Mapping[str, Any],
    source_records: Iterable[Mapping[str, Any]],
    *,
    threshold: float = FUZZY_THRESHOLD,
) -> List[Dict[str, Any]]:
    if not 0 <= threshold <= 1:
        raise ValueError("FUZZY_THRESHOLD must be between 0 and 1")
    party_name = str(party.get("name") or "")
    party_identifiers = {normalize_name(str(value)) for value in party.get("identifiers") or [] if value}
    candidates: List[Dict[str, Any]] = []
    for record in source_records:
        primary_name = str(record.get("name") or "")
        aliases = [str(value) for value in record.get("aliases") or []]
        record_identifiers = {normalize_name(str(value)) for value in record.get("identifiers") or [] if value}
        identifier_matches = sorted(party_identifiers & record_identifiers)
        names = [primary_name, *aliases]
        scored = [(candidate_name, name_similarity(party_name, candidate_name)) for candidate_name in names if candidate_name]
        best_name, best_score = max(scored, key=lambda item: item[1], default=("", 0.0))
        exact = bool(best_name and normalize_name(best_name) == normalize_name(party_name))
        alias_match = bool(best_name and best_name in aliases)
        if exact or identifier_matches or best_score >= threshold:
            candidates.append({
                "candidateId": record.get("uid") or record.get("id"),
                "source": record.get("source"),
                "listName": record.get("listName"),
                "matchedName": best_name,
                "matchType": "STRONG_IDENTIFIER" if identifier_matches else ("EXACT_ALIAS" if exact and alias_match else ("EXACT_NAME" if exact else ("FUZZY_ALIAS" if alias_match else "FUZZY_NAME"))),
                "internalNameSimilarity": round(best_score, 6),
                "internalThreshold": threshold,
                "sourceProvidedScore": record.get("sourceScore"),
                "sourceScoreScale": record.get("sourceScoreScale") or "UNSPECIFIED_NOT_COMPARABLE",
                "identifierMatches": identifier_matches,
                "countries": list(record.get("countries") or []),
                "programs": list(record.get("programs") or []),
                "evidenceUrl": record.get("evidenceUrl"),
                "ownershipControlIndicators": list(record.get("ownershipControlIndicators") or []),
            })
    return candidates


def create_screening_case(
    *,
    linked_record: str,
    party_role: str,
    party: Mapping[str, Any],
    source_records: Iterable[Mapping[str, Any]],
    source_name: str,
    source_version: str,
    threshold: float = FUZZY_THRESHOLD,
    retrieved_at: Optional[str] = None,
) -> Dict[str, Any]:
    retrieved_at = retrieved_at or datetime.now(timezone.utc).isoformat()
    party_name = str(party.get("name") or "").strip()
    if not party_name:
        status = "INSUFFICIENT_INFORMATION"
        candidates: List[Dict[str, Any]] = []
    else:
        candidates = generate_candidates(party, source_records, threshold=threshold)
        status = "POTENTIAL_MATCH" if candidates else "NO_CANDIDATE_MATCH"
    hold = status in {"POTENTIAL_MATCH", "INSUFFICIENT_INFORMATION", "LEGAL_REVIEW_REQUIRED", "CONFIRMED_RESTRICTION", "HOLD_COMPLIANCE_REVIEW"}
    party_reference = party.get("reference") or (normalize_name(party_name)[:40] if party_name else "MISSING")
    return {
        "screeningCaseId": _case_id(linked_record, str(party_reference), source_version),
        "linkedRecord": linked_record,
        "partyRole": party_role,
        "partyReference": party_reference,
        "officialSource": source_name,
        "sourceVersion": source_version,
        "retrievedAt": retrieved_at,
        "threshold": threshold,
        "thresholdMeaning": "internal candidate-generation sensitivity; not a legal or source clearance threshold",
        "reviewStatus": status,
        "executionHold": hold,
        "legalClearance": False,
        "candidates": candidates,
        "reviewer": None,
        "decision": None,
        "rationale": None,
        "approver": None,
        "approvalTimestamp": None,
        "rescreenRequired": True,
        "nextAction": "HUMAN_REVIEW" if hold else "CONTINUE_OTHER_INDEPENDENT_COMPLIANCE_GATES",
    }


def screening_case_payload(case: Mapping[str, Any]) -> Dict[str, Any]:
    candidates = list(case.get("candidates") or [])
    first = candidates[0] if candidates else {}
    return {
        "screening_case_id": case.get("screeningCaseId"),
        "linked_record": case.get("linkedRecord"),
        "party_role": case.get("partyRole"),
        "party_reference": case.get("partyReference"),
        "official_source": case.get("officialSource"),
        "source_version_retrieved_utc": f"{case.get('sourceVersion')} / {case.get('retrievedAt')}",
        "candidate_match_reference": first.get("candidateId") or "NONE",
        "match_evidence_url": first.get("evidenceUrl"),
        "match_type_identifiers": f"{first.get('matchType') or 'NONE'}; internal_similarity={first.get('internalNameSimilarity')}",
        "ownership_control_review": "PENDING_HUMAN_REVIEW" if candidates else "NOT_ESTABLISHED_BY_NAME_SEARCH",
        "destination_end_use_review": "PENDING_SEPARATE_REVIEW",
        "potential_restriction": "; ".join(first.get("programs") or []) or "NONE_IDENTIFIED_BY_THIS_SEARCH",
        "review_status": case.get("reviewStatus"),
        "assigned_reviewer": case.get("reviewer"),
        "reviewer_decision": case.get("decision"),
        "decision_rationale_evidence": case.get("rationale"),
        "approver": case.get("approver"),
        "approval_timestamp": case.get("approvalTimestamp"),
        "rescreen_due": "BEFORE_EXECUTION_AND_ON_CHANGE",
        "execution_hold": "HOLD" if case.get("executionHold") else "NO_SCREENING_HOLD_OTHER_GATES_REMAIN",
    }

