# Unified Business Compliance

Verified: 2026-10-14
Repository: `D:\2marines\Shieldmate`
Branch: `ui-rebuild-flutter-gen-ui`
Reviewed against commit: `67d2ab1 feat(business-pipeline): add offline preflight and dry-run tools`

## Mission

Unify SAM federal-contracting compliance and import/export operations through shared documentation, reusable records, role-based training, and a controlled contract-to-trade pipeline.

This directory is an operational control layer. It is not legal advice, does not decide regulatory applicability, and does not authorize a bid, shipment, export, import, payment, or trade. A qualified owner must approve each regulated decision against the current solicitation, award, transaction facts, and official authority.

## Repository verification

The working tree was clean before these documents were added: no staged, unstaged, or untracked files were reported. `origin` fetch and push both point to `https://github.com/Arbor-Aid/Shieldmate.git`.

No Git index lock was present. Two additional detached worktrees exist at `D:\2marines\_preview_worktrees\shieldmate-09c4cf6-public-hub` and `D:\2marines\Shieldmate-deploy-qa`; their existence does not prove that another Codex session is active. No worktree other than the authorized root was modified.

No standalone tracked file named `ShieldMate Canon v2.0` was found. Current Canon v2.0 authority is expressed by the following corroborating repository records:

- `docs/SYSTEM_OF_RECORD.md`
- `docs/infra/COMPUTER_TOPOLOGY_AND_LOCAL_FILESYSTEM.md`
- `docs/release/chatgpt-sync-mcp-2026-06-02.md`
- `docs/release/chatgpt-sync-marketing-2026-06-02.md`
- `README.md`

The preserved audits are:

- MCP Fleet Authority: `docs/mcp/mcp-fleet-audit.md`
- Claims schema: `docs/claims/claims-schema-audit.md`
- Supporting service audit: `docs/MCP_SERVICE_AUDIT.md`

### Stale checkout references

References to prior SSD checkout locations are stale for current execution. They remain in historical research/recovery material, captured build logs, the VS Code workspace, root deployment/housekeeping scripts, `README_ARCHITECTURE.md`, and `ops/MCP_ROOT_DETECTED.md`. Those files are outside this documentation-only compliance change and were not edited or deleted. Current compliance documents use only `D:\2marines\Shieldmate`.

### MCP Fleet Authority verification

Canon 28 remains unresolved. This documentation does not resolve or reinterpret it.

The current working inventory is 34 services, with identical service-name sets in:

- disk directories under `mcp/`, excluding `common` and `mcp-gateway`;
- `mcp_services.csv`;
- `platform_bootstrap/mcps/bootstrap_packages.index.json`; and
- `mcp/mcp-gateway/src/mcp/registry.ts`.

`platform_bootstrap/bootstrap_manifest.json` also declares an authoritative MCP count of 34. The preserved fleet audit records the separate Google Sheet as an incomplete 23-endpoint snapshot missing 11 services. No MCP directory, deployment record, or registry entry was changed here.

### Claims-schema verification

The canonical model remains:

```text
roles[] + orgRoles{} + orgId
legacy bridge: role + org
```

Verified implementations:

- Rules: `firestore.rules`
- Claims writers: `backend/firebase/functions/index.ts`, `backend/firebase/rbac-admin.ts`
- Active gateway: `mcp/mcp-gateway/src/auth/verifyFirebaseToken.ts`, `requireRole.ts`, `requireOrg.ts`
- Shared Python auth: `mcp/common/auth.py`
- Web adapter: `frontend/web/src/services/roleService.ts`
- Web admin client: `frontend/web/src/services/rbacAdminClient.ts`
- Flutter adapters: `frontend/flutter/lib/core/utils/user_profile.dart`, `user_profile_service.dart`

Known exceptions are preserved, not normalized by this work:

- `gateway/auth/*` is an inactive placeholder layer that models only legacy `role` and `org`.
- `mcp/common/auth.py` still accepts the compatibility `admin` boolean in `require_approver`.
- Web and Flutter continue to map canonical roles to legacy display/application roles.

Do not use compliance documentation as a reason to loosen rules, introduce email-based authorization, or bypass App Check or claims-based organization scoping.

## Existing assets reused

- General compliance posture: `README_COMPLIANCE.md`, `docs/COMPLIANCE.md`
- System authority and approvals: `docs/SYSTEM_OF_RECORD.md`
- Existing software contract record: `docs/contracts/CODEX_JARVIS_CONTRACT.md`
- Existing import/export notes and JSON examples: `docs/tradeops/`
- Existing domain implementations: `mcp/tradeops/app.py`, `mcp/tradefinance_lc/app.py`, `mcp/trade_execution_gateway/app.py`
- Existing MCP inventory and activation evidence: `ops/MCP_COLLABORATION_MATRIX.md`, `ops/mcp_learning_pipeline_map.json`

No existing SAM entity registration record, federal opportunity record, federal award compliance record, item-classification decision, restricted-party screening record, or shipment compliance file was found. The templates in this directory fill those documentation gaps without asserting that registration, eligibility, classification, screening, licensing, or shipment clearance has occurred.

## Directory map

- `regulatory-reference-register.md` — primary-source control register and review cadence.
- `templates/federal-opportunity-award-record.md` — reusable opportunity, clause, award, and change record.
- `templates/trade-transaction-record.md` — reusable import/export decision and evidence record.
- `sops/contract-to-trade.md` — manual-first operating procedure and stop gates.
- `training/compliance-training-matrix.md` — role-based training and evidence requirements.
- `pipeline/contract-to-trade-pipeline.md` — record flow, state model, MCP mapping, and automation limits.

- `pipeline/michigan-thailand-pilot.md` - research-only Michigan/Washtenaw-to-Thailand machinery pilot scope.
- `pipeline/michigan-thailand-naics-hs-candidates.json` - official-source candidate concordance with specialist-review controls.
- `pipeline/michigan-thailand-freight-corridor.md` - bounded BTS NTAD/USACE corridor and port assessment.
- `integrations/ecosystem-tracker-connection.md` - verified master tracker, daily tracker, and repository-access boundary.
- `integrations/tracker-source-manifest.json` - non-secret source identity and tab manifest.
- `integrations/daily-tracker-mapping.md` - controlled mapping between compliance records, workbook tabs, and the daily tracker.
- `integrations/sync-permissions-and-conflict-policy.md` - least-privilege setup and conflict-preservation rules.

## Control rules

1. Use official sources and the exact solicitation or award as the applicability authority.
2. Keep registration, representation, clause, classification, screening, license, and approval evidence with the linked record.
3. Treat `HOLD`, `BLOCKED`, `EXPIRED`, and missing evidence as fail-closed states.
4. A clear screen is not a license determination; a license determination is not shipment authorization.
5. Re-screen parties and re-evaluate classification when facts change.
6. Use one `correlationId` across opportunity, award, trade, approval, document, and audit records.
7. Keep Slack as intake/notification only. Approval and evidence remain in ShieldMate's authoritative record.
8. Do not send regulated work to transitional MCP domain routes until their runtime and integrations are separately activated and approved.

## Operating entity and ecosystem responsibility

Owner direction designates **ShieldMate LLC** as the intended commercial operating entity for commercial contracting, technology, and approved import/export work. This direction does not establish a verified SAM registration, certification, customs qualification, export authorization, or eligibility for a particular award. Each binding responsibility must name exactly one legal entity and one authorized approver.

| Participant | Permitted working lane | Binding responsibility boundary | Verification required before reliance |
| --- | --- | --- | --- |
| ShieldMate LLC | Intended commercial bidder/contractor, purchaser, seller, technology provider, vendor, and operator of approved trade transactions | Acts only in its own legal capacity. It may be IOR only for its own eligible, approved imports and must not become IOR merely because its software organizes a shipment. | Legal name/status, authority, SAM/UEI/CAGE when applicable, contracting authority, banking/accounting boundary, insurance, and trade/compliance ownership |
| 2Marines | Community delivery, outreach, training, referrals, eligible applications, and separately documented partner projects | A grant or contract belongs to 2Marines only when 2Marines is the eligible named applicant/awardee. ShieldMate may participate only under a separately authorized and properly procured role. | Legal/tax status, program eligibility, award authority, procurement policy, conflict controls, and cost allocation |
| NWWNA | Community delivery, outreach, referrals, training, and eligible partner/applicant roles | NWWNA's eligibility, funds, representations, accounts, and approvals remain separate. | Legal/tax status, leadership authority, program eligibility, procurement/subaward rules, and cost allocation |
| American Legion Post 282 | Separately approved community, facility, referral, training, or applicant/partner lane | Do not infer national/state American Legion authority, exemption, eligibility, or sponsorship from the Post name. | Exact chartered entity, exemption/tax treatment, leadership/signing authority, program eligibility, facility authority, and conflict rules |
| Ypsilanti Hub | Physical/local coordination, intake, training, meeting, referral, or delivery site after authorization | Treat as a site/operating lane, not an independent legal entity, until documentary evidence establishes otherwise. It cannot own an award, sign, bank, employ, procure, import, or export without a verified legal sponsor and delegated authority. | Sponsor/operator; legal status; physical location(s); leadership; premises/facility authority; insurance; data/security owner; financial and signing authority |

Multiple organizations may collaborate, but each record must name one `Applicant_Entity`, `Contracting_Entity`, `Awardee_Entity`, `Operating_Entity`, `Vendor_Entity`, and responsible party when that role applies. Use `NOT_APPLICABLE` with rationale rather than blending roles. Shared delivery does not share EINs, exemptions, SAM status, certifications, banking, accounting, security boundaries, or ownership of funds.

For grants and partner-funded work, preserve awardee ownership, allowable-cost and cost-allocation evidence, procurement or subrecipient classification, related-party/conflict review, separate invoicing, and controls against duplicate reimbursement. A collaborator may collect information or deliver authorized work; it may not use another entity's identity or make that entity's representation.

## Connected tracker authority

The verified master is the Google Sheet **2Marines Ecosystem | Grants & Contracts Pipeline | October 2026**, identified in the non-secret source manifest and owned through the approved connected account. The linked ChatGPT Page **Project tracker** is the verified daily summary/action surface. The workbook remains the detailed grant/contract pipeline; local files are controlled records or dated snapshots, not an independently maintained second pipeline.

This interactive Codex session verified read access through the connected owner account. That does not confer Google credentials on repository code, MCPs, local scripts, or deployed runtimes. Repository evidence shows a Drive-readiness template only; no live Google Sheets client or dedicated tracker identity is configured. No write, sharing, automation, or credential change was made in this pass.

## Ypsilanti Hub unresolved facts

Repository and connected-tracker evidence do not yet verify the Hub's sponsor/operator, independent legal status, physical location(s), leadership, premises authority, insurance, data/security owner, financial account, or signing authority. Until those facts and an authority reference are recorded, use the Hub only as a proposed delivery-site label and route every binding action to the verified sponsoring legal entity.

## Open owner decisions

- Verify ShieldMate LLC's formation/status, authority, registrations, and named approvers before it bids, contracts, imports, or exports; designate any different legal entity explicitly per record.
- Record the SAM UEI, CAGE code, registration status/expiration, NAICS codes, and representations only after verification in SAM.gov.
- Define the initial target agencies, contract types, product/service categories, and likely FAR/agency-supplement clauses.
- Appoint contracting, export, import, cybersecurity/CUI, and record-retention owners and alternates.
- Maintain the excluded-by-default ITAR boundary; route any defense indicator or jurisdiction ambiguity to qualified review and reject controlled scope that ShieldMate is not authorized to handle.
- Select approved restricted-party screening and evidence-retention methods; the current TradeOps screening endpoint is a stub.
- Select a customs broker and define importer-of-record responsibility without delegating the importer's legal accountability.
- Approve a retention schedule by record class; use the longest applicable contractual or regulatory period when requirements overlap.
- Verify the Ypsilanti Hub sponsor/operator, site authority, leadership, insurance, data boundary, and legal status.
- Confirm each partner's legal/tax status, signing authority, procurement/subaward rules, conflict process, and program-specific eligibility before an application or award.
- Decide whether repository/runtime access to the ecosystem tracker is needed; the connected interactive session is currently the only verified Google read path.
