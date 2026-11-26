# ShieldMate Slack Integration

ShieldMate uses Slack as a visibility and alerting layer only. Slack is never a system of record and never a control plane for MCP execution.

## Purpose and scope
- Slack delivers best-effort notifications for MCP/agent activity and platform health.
- Channels mirror MCP and agent roles (approximately 30 channels aligned to the MCP service set).
- Slack never blocks workflow execution; failed Slack delivery must not stop MCP execution.

## Webhooks only
- Outbound webhooks only.
- Webhook URLs are stored in environment variables (for example `SLACK_*` keys) and are never hardcoded.
- Do not commit webhook URLs, tokens, or environment values.

## Data handling rules
- No secrets, tokens, or credentials in Slack payloads.
- No PII in Slack payloads.
- Keep payloads minimal: status, event type, timestamp, and high-level context IDs only.

## Failure handling
- Slack is best-effort; delivery failures do not block core workflows.
- Log failures and emit an audit/ops signal for review.
- Retry with limited backoff; drop after max retries to prevent cascading delays.

## Security rules
- Slack is untrusted for authorization; all RBAC is enforced in ShieldMate and MCP Gateway.
- Treat Slack as read-only visibility with no execution privileges.
- Rotate webhook URLs regularly and scope them to the minimum required channel set.
- Allowlist approved Slack workspaces and channels for outbound posts.