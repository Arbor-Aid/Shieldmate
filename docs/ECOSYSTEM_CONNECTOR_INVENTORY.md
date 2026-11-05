# 2Marines / ShieldMate Ecosystem Connector Inventory

Last verification: `2026-10-29T16:22:09Z`
Authoritative repository: `D:\2marines\Shieldmate`
Application workload Region: `us-east-2`
AWS Agent Toolkit control/catalog Region: `us-east-1`
Scheduling timezone for the intended sequence: `America/Detroit`

This inventory records observed runtime and repository evidence. Historical summaries are not health checks. A send attempt is not receipt, and `CONFIGURED` is not `VERIFIED`.

Location check: the established repositories are under `D:\2marines` (`Shieldmate`, `Jarvis`, and `HoneyScan`). The requested top-level paths `D:\jarvis`, `D:\mcp`, and `D:\logs` were absent; no parallel replacements were created. ShieldMate's existing `mcp\` tree and JARVIS's existing `.jarvis\runtime` were reused.

## Status vocabulary

- `PROPOSED`: designed or discussed, but not configured.
- `CONFIGURED`: configuration exists; current end-to-end behavior is not proven.
- `VERIFIED`: a bounded current check passed and sanitized evidence is recorded.
- `BLOCKED`: the check or connection cannot complete until the named blocker is resolved.
- `DISABLED`: intentionally absent, inactive, or gated off.

## Executive status

| Connection | Status | Current evidence |
|---|---|---|
| AWS CLI profile `2marines-aws` | VERIFIED | Browser login and STS caller identity passed with a managed assumed role; account identifier retained only as hash prefix `ab1c2e59df7c`; selected workload Region is `us-east-2`. |
| AWS Agent Toolkit catalog | VERIFIED | CLI catalog returned 107 available skills from `us-east-1`; 24 default skills installed for detected Claude Code and Codex skill locations. |
| AWS MCP proxy | VERIFIED | `MCP Proxy for AWS` v1.7.0 completed protocol initialization; generated Claude entry is scoped with `AWS_MCP_PROXY_PROFILES=2marines-aws`. |
| AWS MCP to Hermes | VERIFIED | The installer does not target Hermes, so the verified proxy was registered through Hermes's native MCP interface; 8/8 tools are enabled and the connection test passed. |
| AWS Shopify/EventBridge arm | PROPOSED | EventBridge is available in `us-east-2`, but the project has zero partner sources and zero rules. No resources were created. |
| Hermes local setup agent | VERIFIED | Hermes Agent `v0.18.2` runs locally; `aws-mcp` is enabled and tested; no cron jobs are configured. |
| OpenClaw gateway | DISABLED | No OpenClaw executable or standard OpenClaw configuration directory was found. Hermes contains migration support only. |
| Ollama main model `qwen3.5:4b` | VERIFIED | Ollama `0.40.12`; bounded local API response returned `OK`; model ran on GPU. |
| Ollama worker `qwen3.5:2b` | DISABLED | Model is not installed and no active routing references it. |
| Previously reported 0.8B model | DISABLED | No 0.8B Ollama model is installed or used. |
| Ollama hosted web search | BLOCKED | Current unauthenticated probe returned HTTP 401; `OLLAMA_API_KEY` is absent. Earlier HTTP 402 credit evidence is not cleared by this result. |
| Tailscale machine network | VERIFIED | Fieldbot, TheBot, and Honey were online; bounded pings reached TheBot and Honey through DERP. |
| Honey-to-TheBot encrypted SMB handoff | BLOCKED | No application share, mapping, encrypted delivery evidence, or receipt evidence was found; remote share enumeration returned access denied. |
| `connector:fieldbot-local` | VERIFIED | Fresh artifact and 9/9 connector tests passed. The requested identifier `connector:fieldbot` is not the actual configured identifier. |
| `connector:github-read-only` | CONFIGURED | Artifact exists but is stale and the current process has no GitHub token; no current remote read was claimed. |
| Business-source connectors | VERIFIED / BLOCKED | Grants.gov, USAspending, CSL, and OFAC public probes passed; SAM, Census, and Comtrade are blocked on process credentials. |
| Honey bounty-platform connectors | PROPOSED | HackerOne, Intigriti, and Bugcrowd appear only in starter/matrix material; no live adapters or credentials exist. |
| GCP Cloud Run / Artifact Registry | CONFIGURED | SDK/project and repository fleet records exist; live listing is blocked by expired Google authentication. |
| Firebase / Hosting | CONFIGURED | Project/target configuration and Shopify redirects exist; current Firebase CLI verification did not complete. |
| Shopify app for `shieldmate-4139.myshopify.com` | BLOCKED | Repository says active use of that domain was removed/replaced; no local app config, scopes, subscriptions, or handlers were found. |
| Shopify public redirect to `shieldmateapp.myshopify.com` | CONFIGURED | Firebase and frontend configuration consistently point to this domain; current Shopify Admin access was not used. |
| Google Workspace in OpenClaw/Hermes | DISABLED | Repository templates and historical ChatGPT evidence exist, but no local Hermes/OpenClaw Drive, Sheets, Docs, Gmail, or Calendar connection was found. |
| Daily tracker automation | CONFIGURED | Historical manifest records a ChatGPT Page refresh around 06:00 America/New_York; this is not a local Hermes/OpenClaw job. |
| Local OpenClaw scheduling | DISABLED | `hermes cron list` returned no jobs. Noon, 17:00, and 20:00 passes remain proposed. |

## Connector records

### AWS CLI and managed browser authentication

- **Status / owner / purpose:** `VERIFIED`; Fieldbot local setup surface; authenticates the optional AWS arm.
- **Identifier / configuration:** profile `2marines-aws`; `C:\Users\devil\.aws\config`; AWS CLI `2.39.1` at the per-user official install path. Region is `us-east-2`.
- **Authentication / secrets:** `aws login` browser authentication, managed assumed role, short-lived cached credentials. No access key was requested, displayed, or stored in the repository. The reviewed guide says credentials are valid for 12 hours and renewable for 90 days.
- **Permissions / restrictions:** the managed role is broad, but project policies and the ShieldMate human-approval/execution gates still apply. This phase used read-only identity, plan, availability, and inventory calls only.
- **Inputs / outputs / consumer / schedule:** interactive browser authorization -> cached profile session -> AWS CLI and MCP proxy. On demand only.
- **Verification:** `aws sts get-caller-identity --profile 2marines-aws --region us-east-2`; caller type `assumed-role`, sanitized project hash `ab1c2e59df7c`.
- **Cost / entitlement / blocker / next:** account plan is `FREE`, `ACTIVE`, with $100 promotional credit reported through `2027-04-29`; verify spend-limit status in AWS Settings before provisioning.
- **Disable / rollback:** run `aws logout --profile 2marines-aws`; remove only the named profile after preserving any future profiles. Do not delete shared AWS configuration wholesale.

### AWS Agent Toolkit and AWS MCP proxy

- **Status / owner / purpose:** `VERIFIED` for catalog and proxy initialization; local developer tooling; current AWS documentation and bounded AWS API access.
- **Identifier / configuration:** `aws-mcp` in `C:\Users\devil\.claude.json`; command `uvx mcp-proxy-for-aws@latest https://aws-mcp.us-east-1.api.aws/mcp --metadata INSTALL_SOURCE=aws-cli`; env `AWS_MCP_PROXY_PROFILES=2marines-aws`.
- **Installer support observed:** Claude Code, Cline, Codex, Cursor, Devin, Gemini CLI, Kiro, OpenClaw, OpenCode, Pi, and Windsurf. Hermes is not an installer target and was connected through its own native MCP command.
- **Authentication / secrets:** consumes the named AWS CLI login profile; no static credential value is embedded in MCP configuration.
- **Permissions / restrictions:** inherits the profile's AWS permissions. ShieldMate execution gates apply. The installer detected Claude Code and Codex, installed 24 default AWS skills, configured MCP for Claude Code, then ended with Windows file-not-found while attempting another detected tool. It did not automatically connect OpenClaw or Hermes.
- **Inputs / outputs / consumer / schedule:** natural-language AWS requests -> official AWS MCP -> AWS API/documentation results. On demand. Hermes is the verified local consumer; Codex is not a routine-operation dependency.
- **Verification:** catalog returned 107 skills; protocol initialization returned server `MCP Proxy for AWS` version `1.7.0`. Current EventBridge skill was found and retrieved through `search_documentation` / `retrieve_skill`. `hermes mcp test aws-mcp` connected and discovered 8 tools.
- **Cost / entitlement / blocker / next:** Toolkit and proxy configuration have no direct resource cost; API calls can operate billable services. OpenClaw remains absent, but Hermes's native MCP registration supplies the existing-agent path.
- **Disable / rollback:** run `hermes mcp remove aws-mcp` to remove the local-agent registration; remove only `mcpServers.aws-mcp` from `.claude.json`, leaving other MCP entries intact; optionally remove the installed AWS skill directories after review. Logging out the named AWS profile also disables authenticated proxy calls.

### Hermes / OpenClaw local runtime

- **Status / owner / purpose:** Hermes and its AWS MCP connection `VERIFIED`; OpenClaw `DISABLED`; Fieldbot local assistant and task intake surface.
- **Identifier / configuration:** Hermes `v0.18.2`, `C:\Users\devil\AppData\Local\hermes\config.yaml`, `.env`, and `SOUL.md`. MCP identifier `aws-mcp` uses `uvx` with `AWS_MCP_PROXY_PROFILES=2marines-aws`. No `~/.openclaw` or other standard OpenClaw runtime directory was found.
- **Authentication / secrets:** Hermes `.env` contained no active provider credentials relevant to this inventory; values were not copied. OpenClaw has no authentication state.
- **Permissions / restrictions:** terminal backend is local; JARVIS remains pre-production with execution disabled. AWS tools are available but inherit the AWS profile and all existing human gates. Shopify, Google Workspace, GitHub, and cron configuration remain inactive in Hermes.
- **Inputs / outputs / consumer / schedule:** local prompts -> Hermes -> official AWS MCP tools. No cron schedule.
- **Verification:** `hermes --version`, `hermes mcp list`, `hermes mcp test aws-mcp`, and `hermes cron list` on 2026-10-29; MCP test connected in about 15 seconds and discovered 8 tools.
- **Cost / entitlement / blocker / next:** no connector fee; AWS service calls may incur normal charges. Start a new Hermes session before using the newly registered tools. Do not create a pretend OpenClaw directory just to satisfy installer detection.
- **Disable / rollback:** `hermes mcp remove aws-mcp`; this removes the one MCP entry without replacing Hermes configuration.

### Ollama models and web search

- **Status / owner / purpose:** main model `VERIFIED`; worker/0.8B `DISABLED`; hosted search `BLOCKED`; Fieldbot local inference and optional search augmentation.
- **Identifier / configuration:** Ollama `0.40.12`; installed model `qwen3.5:4b` (reported 4.7B parameters, Q4_K_M). Expected but absent `qwen3.5:2b`. No 0.8B model is installed.
- **Authentication / secrets:** local inference needs none. Hosted search requires `OLLAMA_API_KEY`; it is absent from the current process and Hermes `.env`.
- **Permissions / restrictions:** local inference only; hosted calls require explicit account entitlement. Do not buy credits or silently switch to a paid search provider.
- **Inputs / outputs / consumer / schedule:** prompt -> local Ollama API -> model response; no confirmed Hermes/OpenClaw route consumes it today. On demand.
- **Verification:** bounded local API returned `OK` with stop completion; `ollama list` and `ollama ps` inspected. Hosted `POST https://ollama.com/api/web_search` without a key returned HTTP 401.
- **Cost / entitlement / blocker / next:** local compute only. Official Ollama documentation requires an account API key and describes a free tier; the earlier observed HTTP 402 remains a possible credit blocker and needs a key-scoped retest by Joshua.
- **Disable / rollback:** stop the running model with `ollama stop qwen3.5:4b`; no model was pulled or removed in this phase.

### Tailscale machine connectivity

- **Status / owner / purpose:** `VERIFIED`; Fieldbot/TheBot/Honey private machine reachability.
- **Identifier / configuration:** Fieldbot `100.113.75.126`, TheBot `100.70.12.28`, Honey `100.100.142.118`; mac-bot was offline. Tailscale service is automatic/running.
- **Authentication / secrets:** Tailscale device identity and tailnet ACLs; keys were not inspected or recorded.
- **Permissions / restrictions:** network reachability is not application authorization, transfer, receipt, or acceptance. No SSH/SCP replacement was introduced.
- **Inputs / outputs / consumer / schedule:** private packets between machines; downstream services must authenticate separately. Continuous service, bounded health checks on demand.
- **Verification:** status showed Fieldbot/TheBot/Honey online; pings reached TheBot and Honey through DERP `ord`.
- **Cost / entitlement / blocker / next:** existing tailnet plan; direct-path performance was not proven. Review ACLs and device ownership in the Tailscale admin surface if an application port is later approved.
- **Disable / rollback:** stop/disable the local Tailscale service or revoke the device in Tailscale admin only with separate authorization.

### Honey-to-TheBot sanitized artifact delivery

- **Status / owner / purpose:** `BLOCKED`; Honey produces sanitized security artifacts, TheBot receives approved artifacts.
- **Identifier / configuration:** no approved application SMB share or exchange directory was found. Local shares were administrative only; no mapped application share existed.
- **Authentication / secrets:** expected Windows/SMB machine or service identity with encryption; no usable application identity was found.
- **Permissions / restrictions:** sanitized artifacts only; no raw findings, credentials, or customer data. Sending does not establish receipt; approval and receipt timestamps must be preserved.
- **Inputs / outputs / consumer / schedule:** Honey sanitized artifact -> encrypted SMB staging -> TheBot receipt record. No active schedule.
- **Verification:** `net view` reached TheBot but returned access denied; repository/runtime search found no encrypted transfer plus receipt pair.
- **Cost / entitlement / blocker / next:** no incremental service cost. Joshua must approve share path, identity, ACL, conflict policy, encryption requirement, and receipt format before a synthetic test.
- **Disable / rollback:** remove only the approved mapping/share and revoke its service identity. Nothing was created in this phase.

### Fieldbot and GitHub observation connectors

- **Status / owner / purpose:** `connector:fieldbot-local` is `VERIFIED`; `connector:github-read-only` is `CONFIGURED`; Fieldbot observations feed JARVIS read-only evidence.
- **Identifier / configuration:** `D:\2marines\Jarvis\src\connectors`, `scripts`, and `.jarvis\runtime`; output files `fieldbot-observations.json` and `github-observations.json`.
- **Authentication / secrets:** Fieldbot local probes use local permissions. GitHub uses `JARVIS_GITHUB_TOKEN` when present; it was absent from the current process.
- **Permissions / restrictions:** observation only, no remote mutations. JARVIS remains `EXECUTION_DISABLED`.
- **Inputs / outputs / consumer / schedule:** local machine/repository metadata -> normalized observations -> JARVIS. No local cron was found.
- **Verification:** fresh Fieldbot artifact at `2026-10-29T15:52:57.866Z`, 13 observations, SHA-256 `af6d2de7c132c84a54ec97ce6fd1756a1d2b4fa1d2296022a4cec6a715f600ae`; 2 test files / 9 tests passed. GitHub artifact is dated `2026-08-10` and was not refreshed.
- **Cost / entitlement / blocker / next:** local connector has no service fee. GitHub is blocked on an approved read-only token and rate limits; refresh only after process-scoped token setup.
- **Disable / rollback:** stop invoking the observation scripts; remove runtime artifacts only under the existing retention policy. This phase updated only the Fieldbot runtime artifact.

### TheBot business import/export and trade connectors

- **Status / owner / purpose:** public sources `VERIFIED`; credentialed sources `BLOCKED`; parked trade execution services `DISABLED`; TheBot opportunity and trade research pipeline.
- **Identifier / configuration:** `mcp/common/business_pipeline/` and `scripts/business_pipeline_preflight.py`.
- **Authentication / secrets:** `SAM_API_KEY`, `CENSUS_API_KEY`, `COMTRADE_API_KEY` / secondary key are process or approved secret-store references only. Grants.gov and USAspending probes use public endpoints.
- **Permissions / restrictions:** discovery and draft-only outputs; no application, bid, sanction decision, payment, trade, or external send. Google Sheets writes require separate owner approval.
- **Inputs / outputs / consumer / schedule:** SAM Opportunities v2, Grants.gov, USAspending, Census CBP, UN Comtrade, CSL, and OFAC -> normalized opportunity/screening drafts -> approval queue/tracker. No current local scheduler.
- **Verification:** bounded public preflight passed Grants.gov HTTP 200, USAspending HTTP 200, CSL HTTP 206, OFAC SDN HTTP 200, and OFAC consolidated HTTP 200. SAM/Census/Comtrade were not called because required keys are absent.
- **Cost / entitlement / blocker / next:** public APIs are currently no-fee with provider limits; Comtrade code caps at 450 calls/day below the documented 500/day ceiling. Obtain approved keys only if those sources are needed.
- **Disable / rollback:** remove process credentials and stop the preflight/workflow. No provider or pipeline was rebuilt.

### Honey bounty-platform connectors

- **Status / owner / purpose:** `PROPOSED`; Honey vulnerability-program intake for HackerOne, Intigriti, and Bugcrowd.
- **Identifier / configuration:** `D:\2marines\HoneyScan\templates\CONNECTOR_MATRIX.csv`; no implemented adapters or runtime services.
- **Authentication / secrets:** proposed platform-scoped credentials, absent. Never place raw findings or tokens in shared reports.
- **Permissions / restrictions:** read-only-first, program-scope and safe-harbor controls, human approval before submission. HoneyScan describes itself as a starter/offline triage project.
- **Inputs / outputs / consumer / schedule:** proposed platform program/finding metadata -> sanitized Honey artifact -> approved handoff. No schedule.
- **Verification:** filesystem and README inspection only; no API health check was possible because adapters do not exist.
- **Cost / entitlement / blocker / next:** depends on platform accounts/program access. First implement one approved read-only adapter only after platform/identity selection.
- **Disable / rollback:** no change; keep proposed rows disabled.

### GCP Cloud Run, Artifact Registry, and Firebase

- **Status / owner / purpose:** `CONFIGURED`; GCP remains the primary ShieldMate application platform.
- **Identifier / configuration:** gcloud project `marines-ai-agent`, Cloud Run/Artifact Registry Region `us-central1`, repository fleet/config under `mcp/`, `.firebaserc`, and `firebase.json`. Firebase targets include ShieldMate hosting.
- **Authentication / secrets:** active gcloud account metadata exists; cached token needs interactive reauthentication. Service secrets belong in Secret Manager or approved runtime env, never docs.
- **Permissions / restrictions:** existing deployment and human-approval gates remain. No deployment or live mutation was attempted.
- **Inputs / outputs / consumer / schedule:** Cloud Run MCP services, Artifact Registry images, Firebase Hosting/Auth/App Check/Firestore -> ShieldMate application and reporting surfaces. Existing platform schedules only.
- **Verification:** gcloud SDK `569.0.0`; repository audit records 34 operational MCP services, but current `gcloud run services list` and Artifact Registry listing failed during token refresh. Firebase CLI did not complete a live verification.
- **Cost / entitlement / blocker / next:** existing GCP billing applies. Joshua must run an interactive `gcloud auth login` in an approved session before current fleet health can be claimed.
- **Disable / rollback:** use existing GCP runbooks and service-specific rollback; no GCP configuration changed here.

### Shopify storefront and app configuration

- **Status / owner / purpose:** requested `shieldmate-4139.myshopify.com` app `BLOCKED`; current public redirect `shieldmateapp.myshopify.com` `CONFIGURED`; commerce storefront.
- **Identifier / configuration:** Firebase redirects and frontend marketing links point to `https://shieldmateapp.myshopify.com/`. Release evidence says active use of `shieldmate-4139.myshopify.com` was removed/replaced. No `shopify.app.toml`, local webhook handlers, app scopes, or subscription inventory was found.
- **Authentication / secrets:** Shopify Dev Dashboard / Admin API identity is required to inspect the actual app. Admin API tokens must stay in the app backend or approved secret manager, never frontend/config/docs.
- **Permissions / restrictions:** no products, prices, orders, inventory, subscriptions, app versions, or live automation may be changed in this phase. No Shopify CLI command was run.
- **Inputs / outputs / consumer / schedule:** public `/shop` and `/store` redirects -> storefront. App event flow is absent locally.
- **Verification:** repository-wide domain/config search; no authenticated Shopify health check. Current official Shopify docs say custom apps can use webhooks, but admin-created custom apps must configure them through the GraphQL Admin API rather than app-config tooling.
- **Cost / entitlement / blocker / next:** Shopify plan/app ownership is unverified. Joshua must identify the existing app and confirm whether `shieldmate-4139` or `shieldmateapp` is authoritative before any subscription work.
- **Disable / rollback:** revert only the relevant Firebase/frontend redirect through existing deployment gates; no redirect changed here.

### Google Workspace, tracker, and notifications

- **Status / owner / purpose:** historical tracker `CONFIGURED`; OpenClaw/Hermes Workspace connections `DISABLED`; Slack runtime `BLOCKED`; reporting and human review.
- **Identifier / configuration:** `docs/business-compliance/integrations/tracker-source-manifest.json`, Google Drive templates under `platform_bootstrap/integrations/google_drive`, and `mcp/common/slack.py` using secret reference `SLACK_WEBHOOK_URL`.
- **Authentication / secrets:** historical manifest records connected-owner bounded reads on 2026-10-14, not a current local credential. No Hermes/OpenClaw Drive, Sheets, Docs, Gmail, Calendar, or Slack credential was found.
- **Permissions / restrictions:** Sheets writes disabled pending owner approval and protected-range verification. Gmail output is draft-only/not created. Slack is notification/intake only and never system of record.
- **Inputs / outputs / consumer / schedule:** business source results -> tracker/approval queue; ChatGPT Page is the daily action surface. Historical schedule was around 06:00 America/New_York.
- **Verification:** local manifest and preflight schema checks passed; repository runtime explicitly says direct Google Sheets access is not configured.
- **Cost / entitlement / blocker / next:** Workspace and notification plan limits are unverified. Establish a dedicated local identity only in a separate approved connection task.
- **Disable / rollback:** remove the runtime secret reference or disable the specific notifier; preserve tracker/source records. No local Workspace connection was added.

## Proposed optional Shopify -> AWS arm

Status: `PROPOSED`. Keep all live store automation and application deployment disabled until the existing Shopify app, scopes, and subscriptions are inventoried with Joshua.

### Boundary and event set

- AWS would receive read-only operational copies of a deliberately small set of order-lifecycle events, initially `orders/create`, `orders/updated`, `orders/cancelled`, `refunds/create`, and fulfillment create/update events after current topic/scope verification.
- Use Shopify delivery filtering and `include_fields` to minimize customer data. Do not route customer profiles, payment credentials, full addresses, or raw order payloads into shared reporting.
- GCP remains authoritative for Firebase Hosting, Auth, App Check, Firestore, Cloud Run/MCP services, the application UI, and the existing reporting/approval pipeline.
- AWS does not mutate Shopify. It normalizes selected events into a sanitized envelope containing correlation ID, topic, shop reference, event timestamp, resource reference/hash, processing status, and evidence pointer.
- The cross-cloud ingestion contract into the existing reporting pipeline does not yet exist. Until service-to-service authentication and receipt semantics are approved, AWS output must not be described as delivered.

### Availability and setup evidence

- Official AWS regional-availability lookup reports Amazon EventBridge `isAvailableIn` `us-east-2`.
- The AWS project is on an active FREE plan. The current project has one default event bus, zero default-bus rules, and zero customer event sources in `us-east-2`.
- Shopify must first create the partner source from the existing app's Dev Dashboard using the AWS project identifier and `us-east-2`. AWS then associates that pending source with an event bus in the same Region.
- A direct `ListPartnerEventSources` call for Shopify's partner namespace is restricted to the partner; customer-side `ListEventSources` is the correct pending-source check and currently returns zero.

### Duplicate, ordering, retry, and recovery behavior

- Shopify does not guarantee ordering. Consumers must compare delivery/resource timestamps and reject stale state transitions.
- Use Shopify's webhook delivery ID to deduplicate a delivery and event ID to correlate multiple subscriptions from the same merchant action. Store only the minimum identifier/hash and processing result under the existing retention policy.
- Classic EventBridge rule targets retry retriable delivery failures with exponential backoff for up to 24 hours and 185 attempts by default. A publish/send response is not receipt; verify the downstream target separately.
- A standard SQS dead-letter queue is justified for production recovery, not because a queue is generally available. It remains `PROPOSED` and must be approved before enablement. Without a DLQ, events are dropped after retries exhaust.
- Recovery sequence: alarm on `FailedInvocations`, inspect sanitized error metadata, fix permissions/target, redrive from the approved DLQ or perform a bounded read-only Shopify reconciliation for the outage window, then record receipt.

### Required permissions and secret handling

- Shopify: an existing app with the minimum read scopes required by each selected topic; start with `read_orders` and verify whether fulfillment topics require an additional read scope in the current webhook reference. No write scope is proposed.
- AWS setup identity: permissions to inspect/associate the partner event source and to create the approved event bus/rule/target later. Production infrastructure permissions must be narrower than the broad managed human role.
- EventBridge target role: trust `events.amazonaws.com`, restrict by source project and source ARN, and grant only the target action. If a DLQ is approved, grant `sqs:SendMessage` to that queue.
- Cross-cloud reporting: use an approved service identity/workload-federation design where possible. If a secret is unavoidable, store it in AWS Secrets Manager and the corresponding GCP secret store; never in Shopify TOML, frontend code, MCP config, or reports.

### Estimated cost and spending controls

- This setup phase created no AWS resources, so expected resource cost from this phase is `$0`.
- Classic EventBridge partner-event ingestion is currently `$1.00 per million` events of up to 64 KB each. At 100,000 qualifying events/month, estimated EventBridge ingestion is about `$0.10/month`; same-project target delivery is listed at no additional EventBridge delivery charge.
- If an EventBridge API Destination is chosen for a public HTTPS reporting endpoint, its current price is `$0.20 per million` invocations plus internet data transfer; 100,000 invocations is about `$0.02` before transfer. It is not selected yet.
- Lambda, CloudWatch Logs, SQS DLQ requests/storage, KMS, Secrets Manager, and data transfer are separate. At this anticipated low volume they may fit free allowances, but do not budget them as zero.
- Before provisioning, Joshua should confirm the project Region and paid/free status in AWS Settings, set or confirm a hard spend limit, and create a small budget alert. A `$5/month` guardrail is a reasonable starting point for this optional arm, subject to Joshua's approval.

### Rollback

Disable the Shopify subscription first, confirm event drain/receipt, disable the EventBridge rule, retain sanitized failure evidence for the approved retention window, then delete the rule, target, associated event bus/source, DLQ, logs, secrets, and service role in dependency order. Preserve GCP and storefront configuration. Do not delete the default event bus.

## Scheduling evidence and intended sequence

| Local time (`America/Detroit`) | Status | Dependency and ordering |
|---|---|---|
| 05:00 | PROPOSED | Overnight report should be complete and available for human review. No local Hermes/OpenClaw job proves this today. |
| 06:00 tracker refresh | CONFIGURED | Historical ChatGPT Page automation is recorded around 06:00 America/New_York, which currently aligns with Detroit offset. Exact scheduler ownership and current run receipt were not verified locally. |
| 06:00 OpenClaw task intake | DISABLED | Must run only after tracker refresh produces a receipt. No OpenClaw/Hermes cron job exists, so dependency/order is not implemented. |
| 12:00 | PROPOSED | Additional bounded work pass; do not enable until owner, inputs, idempotency, and receipt are specified. |
| 17:00 | PROPOSED | Additional bounded work pass; same gate. |
| 20:00 | PROPOSED | Additional bounded work pass; same gate. |

No schedule was created or enabled in this phase.

## Remaining owner actions

1. In AWS Settings, confirm `us-east-2`, the FREE/paid plan choice, and a spend limit; do not paste credentials into chat.
2. In the Shopify Dev Dashboard, identify the authoritative existing app/store and reconcile `shieldmate-4139.myshopify.com` versus `shieldmateapp.myshopify.com`; export or review current scopes and subscriptions without changing them.
3. Start a new Hermes session when AWS tools are needed. If an actual OpenClaw runtime is later required, approve a separate migration/install task; do not make Codex a routine-operation dependency.
4. Supply an approved Ollama account API key in the local secret process if hosted search is still desired, then rerun the entitlement probe; do not purchase credits silently.
5. Reauthenticate gcloud interactively to permit current read-only Cloud Run/Artifact Registry/Firebase health verification.
6. Approve an SMB application share/identity/ACL/encryption and receipt schema before a synthetic Honey-to-TheBot transfer.

## Next concrete integration task

After Joshua identifies the existing Shopify app and confirms its current read scopes/subscriptions, create a **development-only** Shopify EventBridge partner source in `us-east-2`, associate it to a non-production event bus, and send one synthetic `orders/create` webhook. Verify both EventBridge ingestion and a sanitized downstream receipt with the same correlation ID before enabling any live subscription.
