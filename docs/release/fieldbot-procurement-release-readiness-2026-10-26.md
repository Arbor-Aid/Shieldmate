# FIELDBOT Procurement MCP and Release Readiness Handoff

Date: 2026-10-26
Mode: local implementation and verification only; no production deployment
Authority: ShieldMate Canon v2.0

## Executive decision

The release-candidate commit is preserved and all completed local test lanes pass. The
procurement paperwork chain is now reproducible with sanitized fixtures, deterministic
artifact hashes, a pending human approval record, and no external mutations.

Production deployment remains **NO-GO** as a whole. Release decisions must remain
service-specific. The blockers are production revision/rollback evidence, unresolved
authority for `document-manager`, parked trade services, placeholder invoice behavior,
missing THEBOT/OpenClaw exchange authority, and unverified store accounts/signing.

## 1. Release-candidate preservation

- Branch at start: `ui-rebuild-flutter-gen-ui`.
- HEAD at start: `f59d06f20cd5d00471937c065dfb7b7f17cc07ba`.
- Tracked tree at start: clean.
- Known pre-existing untracked area: `docs/business-compliance/pipeline/runs/` with five
  existing run files; they were preserved.
- No commit, push, merge, reset, cleanup, deployment, transaction, submission, or external
  message occurred.

## 2. Fleet authority

Repository authority is internally consistent:

- `ops/mcp_fleet_contract.json`: 34 records, exactly 28 Canon and 6 parked.
- Parked: `investment_recommendation`, `trade_execution_gateway`, `tradefinance_lc`,
  `tradeops`, `training_to_sop`, and `treasury`.
- `ops/mcp_service_index.json`: 34 operational entries.
- Canon-protected `mcp-gateway` is intentionally absent from the operational index.
- Operational-only `document-manager` is present in the index but absent from the Canon
  contract; its authority is unresolved.
- `scripts/mcp_fleet_deploy.ps1` intersects the operational index with Canon IDs, producing
  the observed 27 indexed Canon services. It does not select the full 34-entry index.
- `mcp-analytic` and `mcp-google-ad` remain deferred live-cloud legacy-review names; they
  are not aliases for Canon membership.

The targeted machine-readable handoff is
`ops/fieldbot_release_manifest_2026-10-26.json`.

## 3. Import/export and procurement capability matrix

| Capability | Existing implementation | Authority / gateway route | Input -> output | Dependencies and claims | Local verification | Production eligibility / missing gate |
| --- | --- | --- | --- | --- | --- | --- |
| Procurement-document intake | `mcp/document-manager/main.py` | Operational-only unresolved; `document.process` -> `document-manager` `/execute` | Envelope `{toolId,input,orgId,meta}`; input requires/derives `doc_id`, category in `engineering|operations|ai_agents|governance`, optional actions/source fields -> normalized record, route, chained result, UI summary/audit metadata | FastAPI, requests, local record writer, gateway; gateway requires Firebase bearer token, allowed role, and org context. The service's direct `/execute` does not independently verify the token. | Existing pipeline tests; no live service call | **NO-GO** until Canon authority is resolved, direct ingress is constrained/reviewed, production revision is captured, and procurement categories/schema are approved. |
| Opportunity and qualification | `mcp/common/business_pipeline/sam.py`, `discovery.py`, `workflow.py`; `scripts/business_pipeline_dry_run.py` | Local common module, not a deployable MCP tool | Synthetic SAM record -> normalized stable ID/content hash -> fit recommendation with eligibility/trade holds | Python standard library; no credentials for fixture mode | 62-test business suite and procurement dry run | Local/read-only only. Live source credentials, legal-entity authority, and write identity remain separate gates. |
| Supplier/subcontractor and buyer records | `mcp/common/business_pipeline/screening.py`; new review-only builders in `workflow.py` | Local simulation; structural helpers may later use Canon `data.validate` and `org.scrub` | Sanitized party/source/status fields -> stable supplier record with verification hold; buyer record remains pending official-source review | Fixture data; no PII; no external screening provider | `test_procurement_packet_chain_is_review_only_and_auditable` | **NO-GO** for production verification. Requires authoritative screening, ownership/capacity sources, buyer authority, schema/retention approval, and claims-scoped storage. |
| Contract preparation / draft scope | `workflow.py:create_draft_scope`; documented stage map in `docs/business-compliance/pipeline/contract-to-trade-pipeline.md` | Local simulation. Parked `training_to_sop` exposes `sop.generate` operationally but has no Canon deployment authority. | Opportunity + supplier ID + deliverables/assumptions/exclusions -> non-binding `DRAFT_FOR_HUMAN_REVIEW` | Human contracting review; no signature path | Workflow unit test and procurement artifact | **NO-GO** for binding use. Requires approved contract schema, clauses/evidence, authorized signatory, and separate parked-service authority if `training_to_sop` is used. |
| Procurement packet and approval queue | `workflow.py:create_procurement_packet`, `create_approval_packet`, `build_local_audit_event`; `frontend/web/src/services/approvalService.ts`; `firestore.rules` | Local packet plus existing Firestore approvals; no procurement-specific gateway tool | Linked opportunity/qualification/supplier/scope -> hashed HOLD packet -> `PENDING_REVIEW` approval -> append-only local audit evidence | App Check, authenticated user, org-scoped `org_admin`/global canonical `super_admin`; immutable transition fields | 8 Firestore emulator cases; 5 Node 22 claim cases; 28 web tests | Firestore rules are review-ready, not deployed. Production ruleset/rollback and callable App Check posture must be captured. Procurement approval type/schema is not yet production-approved. |
| Purchase orders and invoices | `mcp/ai-invoice-processor/main.py` | Canon, but indexed `tier3_placeholder`; only connectivity route `ai-invoice-processor.status` is registered | Generic envelope is echoed with `status: placeholder`; no PO/invoice schema or acceptance control exists | FastAPI only; relies on gateway for auth | Dry run explicitly records `NOT_CREATED_APPROVAL_REQUIRED` and `NOT_CREATED_ACCEPTANCE_REQUIRED` | **NO-GO** as a procurement capability. Implement/approve PO, three-way match, acceptance, duplicate invoice, audit, and role controls before service-specific approval. |
| Shipping and customs documents | `mcp/tradeops/app.py`: `/shipment/triage`, `/shipment/docs/generate`, `/shipment/screening/denied-party`, `/shipment/audit/packet`, `/policy/product/check` | Parked; gateway exposes only `tradeops.status`; active `main.py` is placeholder and does not mount domain routes | `orgId`, shipment ID, documents/category -> missing-doc status, template paths, stub screening, packet ID, placeholder policy result | FastAPI, Firebase Admin, Firestore, shared auth/audit/Slack; bearer token + matching org; authoritative provider absent | In-process local test covers complete-doc triage and template generation with all side effects disabled | **LOCAL SIMULATION ONLY**. Screening provider is TODO; no classification, broker, AES/ACE, customs filing, storage or release authority. Separate Canon approval required. |
| Trade finance | `mcp/tradefinance_lc/app.py`: parse, checklist, doc validation, presentment pack, status | Parked; gateway exposes only `tradefinance_lc.status`; domain routes unmounted | `orgId`, `lcId`, terms/documents -> normalized terms, checklist, discrepancies, approval-gated pack ID, TODO status | Shared bearer/org auth; presentment requires `org_admin` or global `super_admin`; Firestore/audit/Slack dependencies | In-process discrepancy test confirms missing storage path is not cleared | **LOCAL SIMULATION ONLY**. Bank integration, authoritative document rules, status model, reconciliation and separate authority are missing. |
| Treasury handoff | `mcp/treasury/app.py`: profit allocation, policy, kill switch, risk, drawdown, monthly report | Parked; gateway exposes only `treasury.status`; domain routes unmounted | `orgId`, proposed order/policy/notional -> pass flag, approval requirement, warnings; several persistence/report paths are TODO | Shared bearer/org auth; kill switch requires approver; process-local state and Firestore audit | In-process risk test returns `approvalRequired: true`; no funds moved | **LOCAL SIMULATION ONLY**. No banking/funds connector; policy persistence, independent control ownership and separate Canon authority required. |
| Trade execution handoff | `mcp/trade_execution_gateway/app.py`: propose, approve, execute, cancel | Parked; gateway exposes only `trade_execution_gateway.status`; domain routes unmounted | `orgId`, order, policy -> pending approval proposal; execute path is explicitly a broker TODO stub | Shared bearer/org auth; approve/execute require approver; Firestore/audit/Slack | In-process proposal test stops at `pending_approval`; execute was not invoked | **LOCAL SIMULATION ONLY**. No execution authorization, broker connector, state persistence, reconciliation, kill-switch source or Canon approval. |
| Auditable records | `mcp/common/audit.py`, Firestore `audits`/`auditLogs` rules, local hash-chain-style event list | Mixed: local simulation plus existing platform rules | Actor/org/action/entity/correlation/retention or local artifact hash -> append-only evidence | App Check for Firestore; actor UID match; updates/deletes denied | Emulator verifies immutable changes are denied; dry run produces six ordered events | Production use requires approved record location/schema, retention/classification review, and current deployed rules evidence. |

All parked trade tests imported the existing `app.py` implementations and replaced authentication,
Firestore, audit and Slack side effects in process. This demonstrates deterministic behavior; it
does not make those routes mounted, authoritative, or deployable.

## 4. Procurement end-to-end result

Command:

```powershell
python scripts/procurement_pipeline_dry_run.py --output docs/business-compliance/pipeline/runs/fieldbot-procurement-dry-run-2026-10-26.json
```

Result:

1. Synthetic SAM opportunity normalized as `SAM:SIM-SAM-001`.
2. Qualification remains `PENDING_REVIEW` with eligibility and capacity concerns.
3. Sanitized supplier `SUP-769516DBF0A646EA` remains `HOLD_REVIEW`.
4. Buyer authority remains pending official-source review.
5. Draft scope `SCP-C6DB6F6F684517BB` is non-binding and signature-disabled.
6. Procurement packet `PRC-26D8B88DE8712450` is `HOLD_REVIEW`; its recorded content hash is
   `4a48cc2b68f4374f757abcee76dec10e03b3106cddf36650bd44a709a03f2b55`.
7. Approval `APR-C6B42BAFA5E620CA` is `PENDING_REVIEW` with `executionAuthorized: false`.
8. Six ordered local audit events contain SHA-256 artifact hashes.
9. `externalMutations` is empty; no bid, contact, PO, invoice, shipment, customs filing,
   finance action, signature, payment or external message occurred.

THEBOT contracts/supplier input was not present on FIELDBOT, so the integration is explicitly
marked `THEBOT_INPUT_NOT_PRESENT_LOCAL_FIXTURE_USED`.

## 5. OpenClaw and network exchange readiness

Read-only observations:

- FIELDBOT identity and Tailscale client are active and healthy on the expected tailnet.
- THEBOT is registered in that tailnet but was offline during verification.
- OpenClaw executable/configuration was not present in the checked FIELDBOT locations.
- No approved exchange directory was present.
- No non-system SMB shares exist. Only Windows administrative shares are present, so the
  ShieldMate repository is not shared as an application share.
- No credentials were printed into an artifact or added to the repository.

Status: **BLOCKED WITHOUT MUTATION**. The allowlisted path, THEBOT share/export identity,
ownership model and conflict policy were not available. Therefore no share, ACL or duplicate
repository was created. Atomic temp-write + rename, checksum/manifest validation, idempotent
retry and failed-transfer quarantine must be tested only after THEBOT supplies the exact approved
exchange directories and comes online.

Required THEBOT human/coordination input:

1. Name one inbound and one outbound exchange directory outside the canonical repo, or one
   direction-specific directory with explicit ownership.
2. Name the Windows/Tailscale identity and required read/write direction for each machine.
3. Confirm conflict winner rules and retention/quarantine paths.
4. Approve an atomic-delivery test using sanitized files only.

## 6. Authorization and release test evidence

| Lane | Command | Result |
| --- | --- | --- |
| Functions syntax | `npm run lint` in `backend/firebase/functions` | PASS |
| Functions Node 22 | `npm run test:node22` using repo-local Node 22.23.4 | PASS, 5/5 |
| Firestore rules | `firebase emulators:exec --project demo-shieldmate-release --only firestore "npm --prefix backend/firebase/rules-tests test"` | PASS, 8/8 |
| Rules test dependency audit | `npm audit` in `backend/firebase/rules-tests` | PASS, 0 vulnerabilities after pinned gRPC override |
| Functions dependency audit | `npm audit` in `backend/firebase/functions` | PASS, 0 vulnerabilities |
| MCP gateway | `npm test` in `mcp/mcp-gateway` | PASS build + 10/10 security tests |
| Business/trade local | `python -m unittest discover -s mcp/common/business_pipeline/tests -p 'test_*.py'` | PASS, 62/62 |
| Web | `npm test -- --runInBand` | PASS, 28/28 |
| Web production build | `npm run build:shieldmate` | PASS; large-chunk warnings only |
| Flutter | `flutter test` | PASS, 12/12 |

Negative cases proven:

- self-escalation denied;
- legacy/nested/global `super_admin` impersonation denied;
- cross-organization access denied;
- malformed nested organization roles denied;
- non-approver approval mutation denied;
- invalid `PENDING -> EXECUTED` transition denied;
- immutable approval payload alteration denied; and
- missing App Check denied.

The Firestore SDK cannot inject App Check into rules-unit tests. One environment therefore uses
the exact production rules to prove missing App Check fails closed; a second in-memory rules copy
replaces only `hasAppCheck()` with `true` so the remaining authorization paths can be tested. The
tracked production rules keep the real App Check condition.

The emulator initially exposed that valid top-level org claims could bypass a malformed same-org
`orgRoles` value. `firestore.rules` was tightened so a present same-org nested role value must be
a list. This is deny-only hardening.

## 7. Production revision and rollback evidence

The active gcloud account exists, but read access to project `marines-ai-agent` was denied when
listing Cloud Functions. Consequently the current `setUserClaims` revision, image digest, service
account, environment, traffic and rollback revision could not be captured. Local repository
evidence only proves the Gen2 callable path and its source entrypoint; it does not prove what is
deployed.

Production status: **NO-GO** until an authorized reader captures:

- Cloud Functions Gen2 function revision/runtime/service account/update time;
- underlying Cloud Run latest-ready revision, container image digest and traffic split;
- non-secret configuration and App Check enforcement posture; and
- the prior known-good revision/image used for rollback.

## 8. Existing application integrations

- The React router already contains protected approval routes at `/admin/approvals` and
  `/admin/approvals/new`; `approvalService.ts` implements Firestore draft, submit, approve,
  reject, execution metadata and audit-log writes.
- `/app/org/intake` exists, but `AppOrgIntake.tsx` is explicitly a placeholder. It was not
  rebuilt or extended.
- The current business pipeline, Google tracker mapping and conflict policy live under
  `mcp/common/business_pipeline/` and `docs/business-compliance/`; they were reused.
- Flutter contains existing role and MCP-client tests; no new screen or competing workflow was
  added.

## 9. Google Play and Apple readiness

Account-side membership, expiration/renewal, app ownership, access and policy notices remain
**UNVERIFIED**. Windows browser automation failed after the required retry/reset with
`windows sandbox failed: setup refresh had errors`; no login or account mutation was attempted.

Repo-side blockers remain:

- Android namespace/application ID is `com.example.arbor_aid_app`, while the manifest package is
  `com.twomarines.twomarinesonline` and the label is `arbor_aid_app`.
- Android release still uses the debug signing configuration; no upload keystore/key properties
  are present.
- iOS bundle ID is `com.example.arborAidApp`, while Codemagic documentation references another
  identifier.
- Apple team metadata exists in the Xcode project, but production bundle ownership,
  certificates/profiles and App Store Connect record were not verified.
- Store screenshots, confirmed ShieldMate privacy/support URLs, final store URLs and account-side
  app records are not established by repository evidence.

Human action: open Google Play Console and Apple Developer/App Store Connect with the account
owner, record membership/renewal dates, app record ownership/roles, policy notices, production
identifiers and signing readiness. Do not purchase, renew, submit or publish during that review.

## 10. Coordinated daily-tracker handoff

- New procurement packet: `PRC-26D8B88DE8712450` — `HOLD_REVIEW`.
- Pending approval: `APR-C6B42BAFA5E620CA` — owner review plus contracting/trade specialist.
- Supplier: `SUP-769516DBF0A646EA` — screening, capacity and ownership review outstanding.
- Draft scope: `SCP-C6DB6F6F684517BB` — review only, non-binding.
- External sends/transactions: none.
- Immediate next actions: obtain THEBOT fixture/contract inputs; verify entity/buyer/supplier;
  resolve `document-manager` and parked trade authority; obtain production read access; complete
  store-account review.
- Tracker write: not performed. The structured handoff is embedded in
  `docs/business-compliance/pipeline/runs/fieldbot-procurement-dry-run-2026-10-26.json` for a
  human-controlled update.

## Deployment rule

Use `ops/fieldbot_release_manifest_2026-10-26.json` for independent approvals. Never pass the
entire operational index to a deployment command. No unit in the manifest authorizes deployment;
each requires its named go criteria and rollback evidence first.

## Changed paths from this execution

- `backend/firebase/functions/package.json`
- `backend/firebase/functions/package-lock.json`
- `backend/firebase/rules-tests/package.json`
- `backend/firebase/rules-tests/package-lock.json`
- `backend/firebase/rules-tests/firestore-rules.test.js`
- `firestore.rules`
- `mcp/common/business_pipeline/workflow.py`
- `mcp/common/business_pipeline/tests/test_workflow.py`
- `mcp/common/business_pipeline/tests/test_trade_local_integration.py`
- `scripts/procurement_pipeline_dry_run.py`
- `ops/fieldbot_release_manifest_2026-10-26.json`
- `docs/release/fieldbot-procurement-release-readiness-2026-10-26.md`
- `docs/business-compliance/pipeline/runs/fieldbot-procurement-dry-run-2026-10-26.json`

The five older files under `docs/business-compliance/pipeline/runs/` were pre-existing and were
not edited.
