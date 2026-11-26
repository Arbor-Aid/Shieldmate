"""Google Sheet schema validation and dry-run row mapping.

The module intentionally has no Google SDK dependency. Live connector metadata is
captured as a non-secret verified snapshot and validated here before any future
write adapter is considered.
"""

from dataclasses import dataclass, field
import re
from typing import Any, Dict, Iterable, List, Mapping, Sequence


def _canonical_header(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.casefold())


@dataclass(frozen=True)
class SheetSchemaResult:
    status: str
    sheet_title: str
    sheet_id: int
    headers: List[str]
    logical_to_header: Dict[str, str]
    missing_headers: List[str] = field(default_factory=list)
    duplicate_headers: List[str] = field(default_factory=list)
    ambiguous_headers: List[str] = field(default_factory=list)
    corrections: List[str] = field(default_factory=list)


def validate_sheet_schema(
    *,
    observed: Mapping[str, Any],
    expected_sheet_id: int,
    logical_to_header: Mapping[str, str],
) -> SheetSchemaResult:
    title = str(observed.get("title") or "")
    sheet_id = observed.get("sheetId")
    headers = [str(value) for value in observed.get("headers") or []]
    missing: List[str] = []
    duplicates: List[str] = []
    ambiguous: List[str] = []
    corrections: List[str] = []

    exact_counts: Dict[str, int] = {}
    canonical_groups: Dict[str, List[str]] = {}
    for header in headers:
        exact_counts[header] = exact_counts.get(header, 0) + 1
        canonical_groups.setdefault(_canonical_header(header), []).append(header)
    duplicates.extend(sorted(header for header, count in exact_counts.items() if count > 1))
    for group in canonical_groups.values():
        if len(group) > 1 and len(set(group)) > 1:
            ambiguous.extend(group)

    expected_headers = list(logical_to_header.values())
    for header in expected_headers:
        if header not in headers:
            missing.append(header)
    if sheet_id != expected_sheet_id:
        corrections.append(
            f"Expected sheetId {expected_sheet_id}, observed {sheet_id}; verify the existing tab without recreating it."
        )
    if headers != expected_headers:
        corrections.append(
            "Header order differs from the verified mapping; stop positional writes and refresh the schema snapshot."
        )
    if missing:
        corrections.append("Restore or remap missing required headers without mutating unrelated columns.")
    if duplicates or ambiguous:
        corrections.append("Resolve duplicate or canonically ambiguous headers before any write preview is approved.")

    status = "PASS"
    if sheet_id != expected_sheet_id or missing or duplicates or ambiguous or headers != expected_headers:
        status = "BLOCKED_SCHEMA"
    return SheetSchemaResult(
        status=status,
        sheet_title=title,
        sheet_id=int(sheet_id) if isinstance(sheet_id, int) else -1,
        headers=headers,
        logical_to_header=dict(logical_to_header),
        missing_headers=missing,
        duplicate_headers=duplicates,
        ambiguous_headers=sorted(set(ambiguous)),
        corrections=corrections,
    )


def build_write_preview(
    payload: Mapping[str, Any],
    schema: SheetSchemaResult,
) -> Dict[str, Any]:
    """Map logical properties to exact human headers without mutating a Sheet."""
    if schema.status != "PASS":
        raise ValueError(f"Schema for {schema.sheet_title!r} has not passed validation.")
    unknown = sorted(set(payload) - set(schema.logical_to_header))
    if unknown:
        raise ValueError(f"Unmapped logical properties: {', '.join(unknown)}")
    by_header = {
        schema.logical_to_header[key]: payload.get(key)
        for key in schema.logical_to_header
    }
    return {
        "mode": "DRY_RUN_NO_WRITE",
        "sheetTitle": schema.sheet_title,
        "sheetId": schema.sheet_id,
        "headerOrder": list(schema.headers),
        "valuesByHeader": by_header,
        "positionalRow": [by_header.get(header) for header in schema.headers],
    }


def find_first_empty_row(values: Sequence[Sequence[Any]], *, header_row: int = 1) -> int:
    """Return a one-based preview row without claiming it is safe to append."""
    for index, row in enumerate(values[header_row:], start=header_row + 1):
        if not any(value not in (None, "") for value in row):
            return index
    return len(values) + 1

