# ShieldMate Slack Integration (Intake Only, Non-Authoritative)

This document defines the Slack integration surface. Slack is never a source
of truth for auth or execution. All privileged actions require claims-based
authorization in ShieldMate and execution via MCP Gateway.

## Principles
- Slack is a notification and intake surface only.
- Slack identity is not trusted for authorization.
- All Slack-originated actions are auditable in ShieldMate.
- No secrets or tokens are stored in Slack.

## Commands (Intake Only)

Allowed:
- `/sm-request` -> creates a DRAFT approval request in ShieldMate
- `/sm-status` -> reads approval status (read-only; no mutation)

Explicitly forbidden:
- `/sm-approve` (approvals must occur in ShieldMate UI)
- Any Slack command that executes MCP tools directly

## Intake Flow (Authoritative Path)

Slack user -> Slack app (signature verified) ->
ShieldMate intake endpoint -> creates DRAFT approval ->
ShieldMate UI approval -> MCP execute -> audit append -> Slack notify

Slack cannot call `/mcp/*` directly.

## Required Audit Fields (Slack-Originated Requests)
When Slack creates a DRAFT request, the request must include:
- `requestId`
- `orgId`
- `createdBy` (mapped internal UID)
- `source: "slack"`
- `timestamp`

Audit logs must record:
- `eventType: APPROVAL_CREATED`
- `actorUid` (mapped internal UID)
- `metadata.source = "slack"`

## Security Requirements
- Verify Slack signature for all Slack requests.
- Map Slack user -> internal UID (lookup only).
- Authorization decision must use Firebase ID token claims.
- Reject if no valid claims or org mismatch.
- Fail closed on missing inputs or invalid signatures.

## Non-Goals
- No Slack-based role escalation.
- No Slack-side approvals or execution.
- No Slack storage of sensitive data.

