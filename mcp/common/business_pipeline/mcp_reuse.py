"""Fail-closed local contract for reusing existing MCP services.

Only ``data.validate`` currently has a native record-in/record-out shape that
can retain the Business Pipeline evidence envelope.  The other verified Tier 1
tools remain available for their native purposes, but direct pipeline-record
routing is blocked until their response contracts preserve the same controls.
This module prepares local request payloads only; it performs no network call.
"""

from copy import deepcopy
from typing import Any, Dict, Mapping


MCP_REUSE_ROUTES = {
    "retrieval.search": {
        "service": "information-retrieval-ai",
        "directRecordRouting": False,
        "reason": "native contract searches local bootstrap datasets rather than accepting a normalized record",
    },
    "data.validate": {
        "service": "data-scrubbing-ai",
        "directRecordRouting": True,
        "reason": "native validation_result.normalized_data retains the supplied source_record envelope",
    },
    "analytics.process": {
        "service": "mcp-analytics",
        "directRecordRouting": False,
        "reason": "native summary response does not retain identity/content hashes or review controls",
    },
    "reporting.aggregate": {
        "service": "reporting-dashboard-ai",
        "directRecordRouting": False,
        "reason": "native aggregate response summarizes counts and does not retain the evidence envelope",
    },
}

_PRESERVED_CONTROL_FIELDS = (
    "sourceIdentifier",
    "stableSourceRecordId",
    "identityHash",
    "contentHash",
    "reviewStatus",
    "humanReviewRequiredForBusinessUse",
    "writesPerformed",
)


class IncompatibleMcpContract(RuntimeError):
    """Raised before routing when evidence or a service contract is unsafe."""


def _validated_controls(record: Mapping[str, Any]) -> Dict[str, Any]:
    missing = [field for field in _PRESERVED_CONTROL_FIELDS if field not in record]
    if missing:
        raise IncompatibleMcpContract(
            f"Business Pipeline record lacks required control fields: {', '.join(missing)}"
        )
    if record.get("reviewStatus") != "INTELLIGENCE_ONLY":
        raise IncompatibleMcpContract("Only INTELLIGENCE_ONLY records may use this advisory route")
    if record.get("humanReviewRequiredForBusinessUse") is not True:
        raise IncompatibleMcpContract("Human review must remain required")
    if record.get("writesPerformed") != 0:
        raise IncompatibleMcpContract("No-write evidence is required")
    return {field: deepcopy(record[field]) for field in _PRESERVED_CONTROL_FIELDS}


def build_data_validation_request(record: Mapping[str, Any]) -> Dict[str, Any]:
    """Prepare a non-executing ``data.validate`` request with evidence intact."""
    controls = _validated_controls(record)
    return {
        "service": "data-scrubbing-ai",
        "toolId": "data.validate",
        "executionAuthorized": False,
        "writesAuthorized": False,
        "input": {
            "doc_id": controls["identityHash"],
            "category": "operations",
            "source": controls["sourceIdentifier"],
            "source_record": deepcopy(dict(record)),
            "actions": {
                "external_write_authorized": False,
                "human_review_required": True,
            },
        },
    }


def verify_data_validation_response(
    prepared_request: Mapping[str, Any],
    response: Mapping[str, Any],
) -> Dict[str, Any]:
    """Reject a validation result that drops or changes pipeline controls."""
    if prepared_request.get("toolId") != "data.validate":
        raise IncompatibleMcpContract("Prepared request is not the approved data.validate route")
    if prepared_request.get("executionAuthorized") is not False or prepared_request.get("writesAuthorized") is not False:
        raise IncompatibleMcpContract("Prepared request lost its no-execution/no-write controls")
    if response.get("ok") is not True or response.get("service") != "data-scrubbing-ai" or response.get("tool") != "data.validate":
        raise IncompatibleMcpContract("Validation response identity is missing or mismatched")
    validation = response.get("validation_result")
    normalized = validation.get("normalized_data") if isinstance(validation, Mapping) else None
    returned_record = normalized.get("source_record") if isinstance(normalized, Mapping) else None
    if not isinstance(returned_record, Mapping):
        raise IncompatibleMcpContract("Validation response did not retain source_record")
    expected = _validated_controls(prepared_request["input"]["source_record"])
    actual = _validated_controls(returned_record)
    if actual != expected:
        raise IncompatibleMcpContract("Validation response changed Business Pipeline evidence controls")
    return {
        "service": "data-scrubbing-ai",
        "toolId": "data.validate",
        "controlsPreserved": True,
        "executionAuthorized": False,
        "writesAuthorized": False,
    }
