# API Setup Roadmap

Last updated: 2026-06-03

## Scope

This roadmap organizes API setup for the active 15-day launch campaign without adding secrets or changing deployment scripts. The 90-day framework is future expansion only and is not part of the current commit.

It covers readiness, ownership, approvals, and verification gates.

## Principles

- Do not commit secrets.
- Keep private credentials in approved secret storage.
- Keep regulated or paid actions behind approval workflows.
- Prefer server-side API calls for external systems.
- Keep public frontend environment values limited to non-secret URLs and client-safe config.
- Record owners, permissions, and rollback steps for each integration.
- Keep supervised agents and MCP tools in review-or-draft mode unless a human approval gate is satisfied.

## Active 15-Day Campaign Inputs

- Marketing CSV: `docs/marketing/codex-15-day-social-calendar.csv`
- UTM campaign: `15day_launch_test`
- Allowed test sources: `facebook`, `instagram`, `google`, `linktree`
- Allowed test mediums: `social`, `paid_social`, `paid_search`, `organic`
- Status columns: `approval_status` and `scheduled_status`

## Phase 1: Inventory

- List every launch integration.
- Identify owner, account, environment, and current status.
- Separate public config from private credentials.
- Confirm which APIs can mutate external systems.
- Confirm which APIs affect billing or spend.

## Phase 2: Identity And Access

- Confirm Firebase auth roles and organization claims.
- Confirm MCP protected routes fail closed.
- Confirm Meta Business roles.
- Confirm Google Ads account roles.
- Confirm Apple Developer and Google Play roles.
- Remove stale access where appropriate.

## Phase 3: Secret Storage

- Store server-side credentials outside the repo.
- Use approved environment variables or secret manager entries.
- Document secret names without recording secret values.
- Confirm local development does not require production secrets.
- Confirm CI/CD secrets are scoped to the minimum required workflows.

## Phase 4: External APIs

| System | Purpose | Mutation Risk | Approval Needed |
| --- | --- | --- | --- |
| Firebase | Hosting, auth, functions, Firestore, storage | High | Yes for deploy or rules changes |
| MCP gateway | Server-side tool execution | High | Yes for mutating tools |
| Google Ads | Campaign and ad management | High | Yes before execution |
| Meta Business | Organic staging, ads, billing access | High | Yes before publishing or billing changes |
| Shopify | Storefront and commerce URLs | Medium | Yes before product or checkout changes |
| Apple Developer | TestFlight and app records | High | Yes before beta submission |
| Google Play | Internal testing and app records | High | Yes before beta publication |

## Supervised Agent And MCP Model

- Agents may collect context, prepare drafts, and assemble checklists.
- MCP tools may perform health checks and non-mutating verification.
- Any action that publishes, deploys, spends money, changes billing, changes permissions, submits app builds, or mutates an external platform requires human approval.
- Approval records should identify the system, action, requester, approver, timestamp, and rollback or pause path.

## Nine Operating Agents Workbench

The operating agents workbench is a planning concept for this 15-day cycle, not a new automation launch. Use it to assign review ownership across nine lanes:

- Marketing Review Agent
- Meta Staging Agent
- Google Ads Approval Agent
- MCP Verification Agent
- App Store Beta Agent
- Marine Coins Staging Agent
- API Setup Agent
- Access And Billing Agent
- Launch Coordination Agent

Each agent lane should stay supervised and draft-first until the relevant human approval gate is met.

## Phase 5: Verification

- Verify public health checks.
- Verify protected routes reject unauthenticated requests.
- Verify authorized requests require correct role and org.
- Verify no external mutation occurs during read-only checks.
- Verify analytics and UTM conventions.
- Verify account-side audit trails for approvals.

## Phase 6: Launch Controls

- Keep a written approval record for each launch action.
- Keep deploy, ad launch, billing, and beta release approvals separate.
- Confirm rollback or pause steps before execution.
- Capture post-launch evidence.

## Open Decisions

- Final Meta Business asset IDs.
- Final Google Ads account and campaign IDs.
- Final Apple bundle ID and Google Play application ID.
- Final public store URLs.
- Final secret storage names and owners.
