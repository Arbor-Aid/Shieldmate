#!/usr/bin/env python3
"""Generate local Meta Business Suite staging files from the campaign CSV.

This script is intentionally local-only. It does not call the Meta API, does not
post content, and does not read or write secrets.
"""

from __future__ import annotations

import csv
import re
from pathlib import Path
from typing import Iterable
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse


REPO_ROOT = Path(__file__).resolve().parents[2]
INPUT_CSV = REPO_ROOT / "docs" / "marketing" / "codex-15-day-social-calendar.csv"
OUTPUT_DIR = REPO_ROOT / "output" / "meta_staging"

REQUIRED_COLUMNS = [
    "day",
    "date",
    "brand",
    "platform",
    "format",
    "content_pillar",
    "post_title",
    "headline",
    "body",
    "cta",
    "primary_url",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "qr_url",
    "image_prompt",
    "asset_name",
    "alt_text",
    "approval_status",
    "scheduled_status",
]

CHECKLIST_COLUMNS = [
    "day",
    "date",
    "brand",
    "platform",
    "post_title",
    "asset_name",
    "approval_status",
    "scheduled_status",
    "ready_to_stage",
    "notes",
]

VALUE_REQUIRED_COLUMNS = [
    column for column in REQUIRED_COLUMNS if column != "qr_url"
]

APPROVED_STATUSES = {"approved", "approved_to_stage", "ready", "ready_to_stage"}
NOT_STAGED_STATUSES = {"", "not_staged", "not staged", "draft"}


def slugify(value: str, fallback: str = "post") -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or fallback


def day_number(value: str) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def row_filename(row: dict[str, str], used_names: set[str]) -> str:
    day = day_number(row.get("day", ""))
    platform = slugify(row.get("platform", ""), "platform")
    title = slugify(row.get("post_title", ""), "post")
    base_name = f"day-{day:02d}-{platform}-{title}" if day else f"day-00-{platform}-{title}"
    filename = f"{base_name}.txt"
    counter = 2

    while filename in used_names:
        filename = f"{base_name}-{counter}.txt"
        counter += 1

    used_names.add(filename)
    return filename


def final_url(row: dict[str, str]) -> str:
    primary_url = row.get("primary_url", "").strip()
    if not primary_url:
        return ""

    parsed = urlparse(primary_url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    for key in ("utm_source", "utm_medium", "utm_campaign", "utm_content"):
        value = row.get(key, "").strip()
        if value:
            query[key] = value

    return urlunparse(parsed._replace(query=urlencode(query)))


def missing_values(row: dict[str, str], columns: Iterable[str]) -> list[str]:
    return [column for column in columns if not row.get(column, "").strip()]


def approval_ready(row: dict[str, str], missing_blocking_fields: list[str]) -> bool:
    approval_status = row.get("approval_status", "").strip().lower()
    scheduled_status = row.get("scheduled_status", "").strip().lower()
    return (
        not missing_blocking_fields
        and approval_status in APPROVED_STATUSES
        and scheduled_status in NOT_STAGED_STATUSES
    )


def needs_approval(row: dict[str, str]) -> bool:
    return row.get("approval_status", "").strip().lower() not in APPROVED_STATUSES


def text_file_content(
    row: dict[str, str],
    suggested_url: str,
    missing_required_values: list[str],
    ready_to_stage: bool,
) -> str:
    checklist_items = [
        "Confirm approval_status is approved before staging.",
        "Confirm the selected Meta Page/Instagram account matches the platform.",
        "Paste headline and caption/body exactly as reviewed.",
        "Verify CTA and primary URL.",
        "Use the suggested final URL with UTM parameters.",
        "Attach the approved asset matching the asset name.",
        "Add alt text where Meta Business Suite supports it.",
        "Confirm scheduled date/time and timezone.",
        "Leave the post as a draft unless a human approves scheduling.",
        "Do not publish from this local staging packet.",
    ]

    missing_text = (
        ", ".join(missing_required_values) if missing_required_values else "None"
    )

    lines = [
        "# Meta Business Suite Local Staging Draft",
        "",
        f"Day: {row.get('day', '')}",
        f"Date: {row.get('date', '')}",
        f"Brand: {row.get('brand', '')}",
        f"Platform: {row.get('platform', '')}",
        f"Format: {row.get('format', '')}",
        f"Post title: {row.get('post_title', '')}",
        f"Headline: {row.get('headline', '')}",
        "",
        "Caption/body:",
        row.get("body", ""),
        "",
        f"CTA: {row.get('cta', '')}",
        f"Primary URL: {row.get('primary_url', '')}",
        "",
        "UTM fields:",
        f"- utm_source: {row.get('utm_source', '')}",
        f"- utm_medium: {row.get('utm_medium', '')}",
        f"- utm_campaign: {row.get('utm_campaign', '')}",
        f"- utm_content: {row.get('utm_content', '')}",
        "",
        f"Suggested final URL: {suggested_url}",
        "",
        f"Image prompt: {row.get('image_prompt', '')}",
        f"Asset name: {row.get('asset_name', '')}",
        f"Alt text: {row.get('alt_text', '')}",
        f"Approval status: {row.get('approval_status', '')}",
        f"Scheduled status: {row.get('scheduled_status', '')}",
        f"Ready to stage: {'yes' if ready_to_stage else 'no'}",
        f"Missing required values: {missing_text}",
        "",
        "Meta Business Suite staging checklist:",
        *[f"- [ ] {item}" for item in checklist_items],
        "",
    ]
    return "\n".join(lines)


def read_campaign_rows() -> list[dict[str, str]]:
    if not INPUT_CSV.exists():
        raise FileNotFoundError(f"Input CSV not found: {INPUT_CSV}")

    with INPUT_CSV.open("r", encoding="utf-8-sig", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        missing_columns = [
            column for column in REQUIRED_COLUMNS if column not in (reader.fieldnames or [])
        ]
        if missing_columns:
            raise ValueError(
                "Input CSV is missing required columns: "
                + ", ".join(missing_columns)
            )
        return list(reader)


def write_readme(rows_processed: int, files_created: int) -> Path:
    readme_path = OUTPUT_DIR / "README.md"
    readme_path.write_text(
        "\n".join(
            [
                "# Meta Staging Output",
                "",
                "These files are local staging aids for Meta Business Suite.",
                "They do not connect to Meta, do not post content, and do not contain secrets.",
                "",
                "## How To Use",
                "",
                "1. Open the text file for the campaign day you want to stage.",
                "2. Confirm the approval status is approved before doing any account-side staging.",
                "3. In Meta Business Suite, create a draft post for the matching platform/account.",
                "4. Paste the headline, caption/body, CTA, and suggested final URL.",
                "5. Attach the approved creative asset named in the file.",
                "6. Add alt text where Meta Business Suite supports it.",
                "7. Leave the post as a draft unless Joshua explicitly approves scheduling or publishing.",
                "",
                "## Generated Summary",
                "",
                f"- Rows processed: {rows_processed}",
                f"- Files created: {files_created}",
                "",
                "## Safety Notes",
                "",
                "- No API calls were made by the generator.",
                "- No access tokens or account credentials are needed.",
                "- These files are not proof of approval.",
                "- Use `meta_staging_checklist.csv` to track account-side staging status.",
                "",
            ]
        ),
        encoding="utf-8",
    )
    return readme_path


def main() -> int:
    rows = read_campaign_rows()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    files_created = 0
    ready_count = 0
    needs_approval_count = 0
    missing_required_rows: list[str] = []
    used_names: set[str] = set()
    checklist_rows: list[dict[str, str]] = []

    for row in rows:
        missing_required_values = missing_values(row, REQUIRED_COLUMNS)
        missing_blocking_values = missing_values(row, VALUE_REQUIRED_COLUMNS)
        if missing_required_values:
            day = row.get("day", "?")
            missing_required_rows.append(f"day {day}: {', '.join(missing_required_values)}")

        suggested_url = final_url(row)
        ready_to_stage = approval_ready(row, missing_blocking_values)
        if ready_to_stage:
            ready_count += 1
        if needs_approval(row):
            needs_approval_count += 1

        filename = row_filename(row, used_names)
        output_path = OUTPUT_DIR / filename
        output_path.write_text(
            text_file_content(row, suggested_url, missing_required_values, ready_to_stage),
            encoding="utf-8",
        )
        files_created += 1

        notes: list[str] = []
        if missing_required_values:
            notes.append("missing: " + ", ".join(missing_required_values))
        if needs_approval(row):
            notes.append("needs approval")
        if row.get("scheduled_status", "").strip().lower() not in NOT_STAGED_STATUSES:
            notes.append("already staged or scheduled")

        checklist_rows.append(
            {
                "day": row.get("day", ""),
                "date": row.get("date", ""),
                "brand": row.get("brand", ""),
                "platform": row.get("platform", ""),
                "post_title": row.get("post_title", ""),
                "asset_name": row.get("asset_name", ""),
                "approval_status": row.get("approval_status", ""),
                "scheduled_status": row.get("scheduled_status", ""),
                "ready_to_stage": "yes" if ready_to_stage else "no",
                "notes": "; ".join(notes),
            }
        )

    checklist_path = OUTPUT_DIR / "meta_staging_checklist.csv"
    with checklist_path.open("w", encoding="utf-8", newline="") as checklist_file:
        writer = csv.DictWriter(checklist_file, fieldnames=CHECKLIST_COLUMNS)
        writer.writeheader()
        writer.writerows(checklist_rows)
    files_created += 1

    write_readme(len(rows), files_created + 1)
    files_created += 1

    print("Meta staging generation complete.")
    print(f"Rows processed: {len(rows)}")
    if missing_required_rows:
        print(f"Missing required fields: {len(missing_required_rows)} rows")
        for item in missing_required_rows:
            print(f"  - {item}")
    else:
        print("Missing required fields: 0")
    print(f"Files created: {files_created}")
    print(f"Rows ready to stage: {ready_count}")
    print(f"Rows needing approval: {needs_approval_count}")
    print(f"Output folder: {OUTPUT_DIR.relative_to(REPO_ROOT)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
