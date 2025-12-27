# Manual Verification Checklist (Approvals)

## Approvals Workflow
- Create DRAFT approval (org_admin).
- Submit DRAFT -> PENDING (creator).
- Approve or Reject (org_admin/super_admin).
- Execute request logs EXECUTION_REQUESTED and does not mark EXECUTED.

## Security and Access
- Cross-org approvals are not visible or writable.
- Claims-only gating: no access if token claims are missing.
- auditLogs are append-only (no updates/deletes).

## Error Handling
- Gateway execution shows "Execution service not deployed yet" when MCP service is missing.

## Ops Note
- If claims changed, refresh token/relogin.
