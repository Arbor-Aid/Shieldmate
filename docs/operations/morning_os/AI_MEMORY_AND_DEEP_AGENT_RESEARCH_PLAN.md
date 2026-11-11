# AI Memory And Deep Agent Research Plan

Purpose: outline a future research plan for durable project memory, filesystem-backed context, and grounded agent work.

This is a research plan, not an implementation. No live integrations or memory systems are approved by this document.

## Research Goals

- Persistent project memory for recurring ShieldMate work.
- Filesystem-backed context that can be inspected and corrected by Joshua.
- Agent task logs that record decisions, commands, files touched, and blockers.
- Daily summaries that reduce context loss across work sessions.
- Source-of-truth docs that stay ahead of generated notes.
- Retrieval folders for active projects, archived decisions, and reference material.
- Grounding patterns that reduce hallucination by requiring repo/doc references.
- Human approval gates for any action that mutates accounts, deploys, posts, schedules, spends, or changes infrastructure.

## Candidate Memory Folders

```text
docs/operations/morning_os/
docs/operations/decisions/
docs/operations/daily_summaries/
docs/operations/task_logs/
D:\2marines\_local_work\project_context\
D:\2marines\_local_work\daily_notes\
```

Repo folders should contain durable, public-safe docs. Local folders can contain working notes that are not ready to commit.

## Agent Task Log Template

```text
Date:
Task:
Approved scope:
Files inspected:
Files changed:
Commands run:
Validation:
Risks:
Open questions:
Next action:
```

## Grounding Rules

- Prefer repo files and documented source-of-truth material over memory.
- Quote or reference local file paths when making claims about the repo.
- Mark unknowns as unknown.
- Use placeholders when a path, URL, token source, or account ID is not confirmed.
- Require Joshua approval before live API checks or account-side actions.

## Research Questions

- What should be stored in durable repo docs versus local-only notes?
- How should daily summaries roll up into source-of-truth docs?
- How should agent logs be searched without exposing private data?
- Which workflows need mandatory human approval gates?
- How should stale memory be detected and corrected?

## Lab 10 Logic To Review Later

Placeholder for class or lab concepts Joshua may want to incorporate later.

- [ ] Collect Lab 10 notes from Joshua.
- [ ] Identify reusable logic or workflow ideas.
- [ ] Compare each idea against ShieldMate privacy, audit, and approval requirements.
- [ ] Tie useful logic into the memory system only after Joshua reviews it.
- [ ] Do not invent Lab 10 details.

## Not Implemented

- No background memory service.
- No live retrieval pipeline.
- No autonomous agent runner.
- No account mutation.
- No deployment.
