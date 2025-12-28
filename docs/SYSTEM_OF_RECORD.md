# ShieldMate System of Record and Slack Control-Plane (v1.1)

This document defines authoritative ownership, change control, and Slack's role
in ShieldMate operations. It is production-grade and aligned to claims-only RBAC
using Firebase custom claims (`role`, `org`).

## Ownership and Change Control (Authoritative)

Authority chain (must be followed in this order):
Human decision -> ShieldMate UI -> MCP Gateway -> External Systems -> Audit Log -> Slack notify

System-of-record matrix (authoritative source of truth):

| System | Scope | Authority | Notes |
| --- | --- | --- | --- |
| ShieldMate (Firestore + UI) | Requests, approvals, org data | Authoritative | All regulated actions originate here. |
| MCP Gateway (Cloud Run) | Execution control plane | Authoritative | Claims-only RBAC; super_admin override. |
| External Systems (e.g., Google Ads) | Execution target | Non-authoritative | External side effects only; no auth source. |
| Audit Logs | Immutable trace | Authoritative | Append-only, admin-readable. |
| Slack | Notification + intake only | Non-authoritative | Never a source of truth or execution. |

Slack integration details:
See `docs/SLACK_INTEGRATION.md` (intake-only, non-authoritative).

Hard guardrails (non-negotiable):
- Deny by default; fail closed for privileged operations.
- Only claims-based RBAC (role/org from Firebase ID token) may authorize execution.
- Super_admin is the only global override.
- Claim changes require token refresh or re-login.

## RACI Summary

| Role | Responsible | Accountable | Consulted | Informed |
| --- | --- | --- | --- | --- |
| super_admin | Approvals and execution policy | System integrity | Dev/Ops | Org Admins |
| Dev/Ops | Gateway ops, audit integrity | Platform reliability | super_admin | Org Admins |
| Org Admins | Org-level approvals | Org compliance | super_admin | Staff |
| Marketing | Request creation | Campaign inputs | Org Admins | super_admin |
| Slack | Intake + notify only | None | None | All |

## Architecture Diagram (Authoritative Boundaries)

Text diagram:
Public Surfaces -> ShieldMate UI -> MCP Gateway -> External Systems
Slack Intake -> Intake Endpoint -> ShieldMate DRAFT (approvals)
ShieldMate UI -> Audit Logs -> Slack notify

Detailed view:

[Public Surfaces]
  - https://shieldmate.2marines.us
  - partner subdomains (if any)
  - social/marketing links
    |
    v
[ShieldMate UI + Firestore]
  - approvals: DRAFT -> PENDING -> APPROVED/REJECTED -> EXECUTED
  - claims-only RBAC: role/org
    |
    v
[MCP Gateway (Cloud Run)]
  - verifies Firebase ID token
  - enforces org scope and super_admin override
    |
    v
[External Systems]
  - Google Ads (regulated)
  - other MCP services
    |
    v
[Audit Logs]
  - append-only, admin-readable
    |
    v
[Slack]
  - notify only
  - optional intake (DRAFT creation)

Mermaid (optional):
```mermaid
flowchart LR
  A[Public Surfaces] --> B[ShieldMate UI + Firestore]
  B --> C[MCP Gateway (Cloud Run)]
  C --> D[External Systems]
  B --> E[Audit Logs]
  D --> E
  E --> F[Slack Notify]
  F --> B
  S[Slack Intake] --> I[Intake Endpoint]
  I -->|create DRAFT| B

  classDef nonauth fill:#f2f2f2,stroke:#999,color:#333;
  class F nonauth;
  class S nonauth;
```

## Notes on Claims and Sessions

- Authorization must use Firebase ID token claims (`role`, `org`).
- No email-based auth or Firestore-only roles.
- After claim updates, users must refresh token or re-login.
