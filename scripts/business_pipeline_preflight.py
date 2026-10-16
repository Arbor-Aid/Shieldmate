"""Run ShieldMate business-pipeline pre-flight independently.

Examples:
  python scripts/business_pipeline_preflight.py
  python scripts/business_pipeline_preflight.py --live-public --output preflight.json
"""

import argparse
import json
from pathlib import Path
import sys


REPO = Path(__file__).resolve().parents[1]
COMMON = REPO / "mcp" / "common"
if str(COMMON) not in sys.path:
    sys.path.insert(0, str(COMMON))

from business_pipeline.preflight import run_preflight  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="ShieldMate business pipeline pre-flight")
    parser.add_argument("--live-public", action="store_true", help="Probe bounded public sources; never writes")
    parser.add_argument("--strict-live", action="store_true", help="Return nonzero for any non-PASS check")
    parser.add_argument("--output", type=Path, help="Optional JSON report path")
    args = parser.parse_args()

    report = run_preflight(REPO, live_public=args.live_public)
    rendered = json.dumps(report, indent=2, sort_keys=True)
    print(rendered)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered + "\n", encoding="utf-8")

    if report["overall"] != "PASS":
        return 1
    if args.strict_live and any(check["status"] != "PASS" for check in report["checks"]):
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

