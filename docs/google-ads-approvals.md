# Google Ads Approvals and Audit Logging

This document defines the approvals workflow and audit logging requirements for
Google Ads (Ad Grants) actions. All mutating actions require an APPROVED
approval record and claims-based authorization.

## Firestore Collections (Design Spec)

### approvals/{approvalId}
- orgId (string)
- type: "GOOGLE_ADS_CHANGE"
- status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED"
- requestedBy (uid)
- approvedBy (uid, optional)
- payload (campaign/adgroup/keyword/adcopy change request)
- createdAt (server timestamp)
- updatedAt (server timestamp)

### auditLogs/{logId}
Append-only regulated event logs. Do not store secrets.

Recommended fields:
- orgId
- actorUid
- action (tool action string)
- approvalId
- toolId
- status (REQUESTED|APPROVED|EXECUTED|REJECTED|FAILED)
- timestamp (server timestamp)

## Required Approval States
- DRAFT: Request saved but not submitted.
- PENDING: Submitted and awaiting approval.
- APPROVED: Approved by org_admin or super_admin.
- REJECTED: Explicitly denied.
- EXECUTED: Applied in Google Ads via MCP.

## Required Audit Events
- approval.requested
- approval.approved
- approval.rejected
- ads.executed
- ads.failed

Each event must include orgId, actorUid, approvalId, toolId, and timestamp.

## Enforcement Rules
- Mutating actions require approvalId with status APPROVED.
- orgId on approval must match claims.org.
- super_admin is the only global override.
