# Local File Organizing Workflow

Purpose: keep local ShieldMate work organized before launch work begins each day.

This workflow is local-first and Windows-friendly. It does not require committing local working folders.

## Suggested Local Folder Layout

Use a local workspace outside committed source paths when possible:

```text
D:\2marines\_local_work\
  inbox\
  project_context\
  daily_notes\
  exported_phone_tabs\
  screenshots_needing_review\
  canva_exports\
  meta_staging_drafts\
  logs\
  archive\
```

If a file belongs in the repo, move it only after confirming it is safe to commit.

## Folder Purposes

- `inbox`: temporary holding area for new downloads, notes, screenshots, and pasted research.
- `project_context`: curated source-of-truth copies or notes for active tasks.
- `daily_notes`: daily working notes with decisions and blockers.
- `exported_phone_tabs`: links exported from phone browser sessions.
- `screenshots_needing_review`: screenshots awaiting privacy review before use.
- `canva_exports`: exported creative files for manual review.
- `meta_staging_drafts`: local draft copy and captions before account-side staging.
- `logs`: local command outputs or troubleshooting logs.
- `archive`: dated older local materials.

## Naming Conventions

Use dates and short labels:

```text
2026-06-04_morning-startup-notes.md
2026-06-04_firebase-console-links.md
2026-06-04_canva-day01-exports-review.md
2026-06-04_mcp-health-check-notes.md
```

For screenshots:

```text
2026-06-04_source_context_short-description_needs-review.png
2026-06-04_canva_day01_2marines_export-approved.png
```

## Daily Cleanup Routine

- [ ] Empty or sort the local inbox.
- [ ] Move phone-tab exports into the correct project context file.
- [ ] Review screenshots for sensitive data before reuse.
- [ ] Move approved creative exports into the correct local review folder.
- [ ] Archive old local notes by date.
- [ ] Delete only disposable local duplicates after confirming they are not needed.
- [ ] Keep repo docs clean and source-of-truth focused.

## Privacy Rules

- Do not save tokens, passwords, private emails, billing data, or account recovery material.
- Do not paste private account pages into repo docs.
- Do not commit screenshots unless they are reviewed and intentionally public-safe.
