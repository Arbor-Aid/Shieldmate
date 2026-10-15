"""Standalone pre-flight checks for the dry-run business pipeline."""

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import subprocess
from typing import Any, Dict, List, Mapping
from urllib import request

from .sheets import validate_sheet_schema
from .credentials import credential_present


VALID_STATUSES = {
    "PASS",
    "FAIL",
    "BLOCKED_CREDENTIALS",
    "BLOCKED_SCHEMA",
    "BLOCKED_SOURCE",
    "REQUIRES_OWNER_APPROVAL",
}


@dataclass(frozen=True)
class Check:
    name: str
    status: str
    evidence: List[str]
    detail: str
    correction: str = ""

    def __post_init__(self) -> None:
        if self.status not in VALID_STATUSES:
            raise ValueError(f"Unsupported pre-flight status: {self.status}")


def _read_json(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _git(repo: Path, *args: str) -> str:
    completed = subprocess.run(
        ["git", *args], cwd=repo, check=True, capture_output=True, text=True
    )
    return completed.stdout.strip()


def _dependency_check(repo: Path) -> Check:
    prohibited = {"pandas", "gspread"}
    hits: List[str] = []
    for requirements in repo.glob("**/requirements*.txt"):
        if any(part in {"node_modules", ".git"} for part in requirements.parts):
            continue
        for line_number, line in enumerate(requirements.read_text(encoding="utf-8").splitlines(), 1):
            package = line.split("#", 1)[0].strip().split("==", 1)[0].split("[", 1)[0].casefold()
            if package in prohibited:
                hits.append(f"{requirements.relative_to(repo)}:{line_number}:{package}")
    return Check(
        name="dependency_policy",
        status="FAIL" if hits else "PASS",
        evidence=hits or ["All requirements*.txt files scanned"],
        detail="No Pandas or GSpread dependency is allowed for this pipeline.",
        correction="Remove the prohibited dependency and use standard-library adapters." if hits else "",
    )


def _source_head(url: str, *, user_agent: str = "ShieldMate-Preflight/1.0") -> int:
    req = request.Request(url, method="HEAD", headers={"User-Agent": user_agent})
    with request.urlopen(req, timeout=20) as response:
        return int(response.status)


def _source_range(url: str) -> int:
    req = request.Request(
        url,
        method="GET",
        headers={"Range": "bytes=0-1023", "User-Agent": "ShieldMate-Preflight/1.0"},
    )
    with request.urlopen(req, timeout=20) as response:
        response.read(1024)
        return int(response.status)


def _usaspending_probe(url: str) -> int:
    body = json.dumps(
        {
            "subawards": False,
            "limit": 1,
            "page": 1,
            "filters": {
                "award_type_codes": ["A", "B", "C", "D"],
                "time_period": [{"start_date": "2026-09-01", "end_date": "2026-09-02"}],
            },
            "fields": ["Award ID", "Last Modified Date"],
        }
    ).encode("utf-8")
    req = request.Request(
        url,
        data=body,
        method="POST",
        headers={"Content-Type": "application/json", "User-Agent": "ShieldMate-Preflight/1.0"},
    )
    with request.urlopen(req, timeout=20) as response:
        payload = json.loads(response.read().decode("utf-8"))
        if not isinstance(payload.get("results"), list) or not isinstance(payload.get("page_metadata"), dict):
            raise ValueError("USAspending response lacks results/page_metadata")
        return int(response.status)


def _grants_probe(url: str) -> int:
    body = json.dumps({"keyword": "veterans", "rows": 1, "startRecordNum": 0, "oppStatuses": "forecasted|posted"}).encode("utf-8")
    req = request.Request(
        url,
        data=body,
        method="POST",
        headers={"Content-Type": "application/json", "Accept": "application/json", "User-Agent": "ShieldMate-Preflight/1.0"},
    )
    with request.urlopen(req, timeout=20) as response:
        payload = json.loads(response.read().decode("utf-8"))
        data = payload.get("data")
        if not isinstance(data, Mapping) or not isinstance(data.get("oppHits"), list):
            raise ValueError("Grants.gov response lacks data.oppHits")
        return int(response.status)


def run_preflight(repo: Path, *, live_public: bool = False) -> Dict[str, Any]:
    repo = repo.resolve()
    config_path = repo / "platform_bootstrap/integrations/google_drive/configs/business_pipeline_config.template.json"
    schema_path = repo / "platform_bootstrap/integrations/google_drive/normalized/business_pipeline_sheet_schema.verified.json"
    config = _read_json(config_path)
    observed = _read_json(schema_path)
    checks: List[Check] = []

    try:
        root = Path(_git(repo, "rev-parse", "--show-toplevel")).resolve()
        branch = _git(repo, "branch", "--show-current")
        checks.append(Check(
            "repository_identity",
            "PASS" if root == repo and branch else "FAIL",
            [str(root), branch, _git(repo, "log", "-1", "--oneline")],
            "Repository root and current branch resolved without mutation.",
            "Run from the authorized repository root." if root != repo else "",
        ))
    except Exception as exc:
        checks.append(Check("repository_identity", "FAIL", [str(repo)], str(exc), "Verify Git and repository path."))

    required_paths = config["requiredEvidencePaths"]
    missing_paths = [path for path in required_paths if not (repo / path).exists()]
    checks.append(Check(
        "authority_evidence",
        "FAIL" if missing_paths else "PASS",
        required_paths,
        "Required authority/audit evidence paths exist." if not missing_paths else f"Missing: {missing_paths}",
        "Restore only the missing evidence path; do not invent a Canon file." if missing_paths else "",
    ))
    checks.append(_dependency_check(repo))

    observed_sheets = {sheet["title"]: sheet for sheet in observed["sheets"]}
    for title, target in config["googleSheet"]["targetSheets"].items():
        if title not in observed_sheets:
            checks.append(Check(
                f"google_schema:{title}", "BLOCKED_SCHEMA", [str(schema_path.relative_to(repo))],
                "Verified schema snapshot is missing the existing target tab.",
                "Refresh metadata from the existing workbook; never recreate the tab.",
            ))
            continue
        result = validate_sheet_schema(
            observed=observed_sheets[title],
            expected_sheet_id=target["sheetId"],
            logical_to_header=target["logicalToHeader"],
        )
        checks.append(Check(
            f"google_schema:{title}", result.status,
            [str(schema_path.relative_to(repo)), f"sheetId={result.sheet_id}", *result.headers],
            f"Validated {len(result.headers)} exact headers; rows with data={observed_sheets[title]['dataRowCount']}.",
            " ".join(result.corrections),
        ))

    checks.append(Check(
        "google_protected_ranges",
        "REQUIRES_OWNER_APPROVAL",
        [str(schema_path.relative_to(repo)), "connector metadata does not expose protected-range definitions"],
        "Formats, validation, formulas, bounds, and row IDs were inspected; protected ranges remain unverifiable through the current connector surface.",
        "Before any write, verify protected ranges through an approved Sheets API identity and owner-reviewed preview.",
    ))
    checks.append(Check(
        "google_write_authority",
        "REQUIRES_OWNER_APPROVAL",
        ["Live workbook was read only", "No write credential is configured in repository/runtime"],
        "Write integration is intentionally disabled.",
        "Provide separate explicit staging approval after read verification and conflict-policy tests.",
    ))

    credential_sources = {
        "sam": config["sources"]["samGov"],
        "census": config["sources"]["census"],
        "comtrade": config["sources"]["unComtrade"],
    }
    for name, source_config in credential_sources.items():
        env_name = source_config["apiKeyEnv"]
        key_present = credential_present(env_name)
        checks.append(Check(
            f"{name}_credentials",
            "PASS" if key_present else "BLOCKED_CREDENTIALS",
            [source_config["documentation"], source_config["endpoint"], f"environment={env_name}"],
            f"{env_name} is available to the current process." if key_present else f"{env_name} is not available to the current process; no live request was attempted.",
            f"Owner supplies {env_name} through the approved process environment; never commit or log it." if not key_present else "",
        ))

    if live_public:
        probes = [
            ("usaspending_source", lambda: _usaspending_probe(config["sources"]["usaSpending"]["endpoint"]), config["sources"]["usaSpending"]["endpoint"]),
            ("grants_source", lambda: _grants_probe(config["sources"]["grantsGov"]["endpoint"]), config["sources"]["grantsGov"]["endpoint"]),
            ("csl_source", lambda: _source_range(config["sources"]["csl"]["download"]), config["sources"]["csl"]["download"]),
            ("ofac_sdn_source", lambda: _source_head(config["sources"]["ofac"]["sdnXml"]), config["sources"]["ofac"]["sdnXml"]),
            ("ofac_consolidated_source", lambda: _source_head(config["sources"]["ofac"]["consolidatedXml"]), config["sources"]["ofac"]["consolidatedXml"]),
        ]
        for name, probe, evidence in probes:
            try:
                status = probe()
                checks.append(Check(name, "PASS" if 200 <= status < 300 else "BLOCKED_SOURCE", [evidence, f"HTTP {status}"], "Bounded public-source probe completed."))
            except Exception as exc:
                checks.append(Check(name, "BLOCKED_SOURCE", [evidence], str(exc), "Retry later; do not substitute scraped or undocumented data."))
    else:
        checks.append(Check(
            "public_source_network",
            "REQUIRES_OWNER_APPROVAL",
            ["Run with --live-public for bounded public probes"],
            "Network probes were skipped; local schema and fixtures remain usable.",
        ))

    local_blockers = [check for check in checks if check.status in {"FAIL", "BLOCKED_SCHEMA"}]
    return {
        "reportVersion": "1.0",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "scope": "LOCAL_DRY_RUN_ONLY",
        "overall": "PASS" if not local_blockers else local_blockers[0].status,
        "liveMutationAuthorized": False,
        "checks": [asdict(check) for check in checks],
    }

