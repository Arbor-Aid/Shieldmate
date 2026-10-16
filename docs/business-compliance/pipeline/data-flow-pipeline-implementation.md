# ShieldMate Data and Flow Pipeline — Local Dry-Run Implementation

Status: local validation and review-packet generation only
Authority date: 2026-10-14
Repository: `D:\2marines\Shieldmate`
Deployment status: not deployed

## Ownership map

| Function | Existing owner reused | Additive local implementation | Runtime status |
|---|---|---|---|
| Source retrieval and normalization | `mcp/information-retrieval-ai/` (`retrieval.search`) | `mcp/common/business_pipeline/sam.py`, `usaspending.py`, `grants.py`, `census.py`, `comtrade.py` | Tier 1 service verified; its native local-bootstrap search contract is not used as a normalized-record transport |
| Evidence validation | `mcp/data-scrubbing-ai/` (`data.validate`) | `mcp/common/business_pipeline/mcp_reuse.py` | Tier 1 service verified; a local no-execution adapter preserves the complete evidence envelope and fails closed on drift |
| Advisory analytics | `mcp/mcp-analytics/` (`analytics.process`) | none | Tier 1 service verified; direct record routing blocked because its response does not retain identity, content hash, and review controls |
| Advisory reporting | `mcp/reporting-dashboard-ai/` (`reporting.aggregate`) | none | Tier 1 service verified; direct record routing blocked because its response is aggregate-only and advertises publication actions |
| Trade and restricted-party review | `mcp/tradeops/` | `mcp/common/business_pipeline/screening.py` | Candidate generation only; existing TradeOps stub not activated |
| Exact workbook mapping | `platform_bootstrap/integrations/google_drive/` | Config, verified read-only schema snapshot, and `sheets.py` | Dry-run previews only |
| Fit and partner routing | Existing compliance records and tracker | `mcp/common/business_pipeline/workflow.py` | Recommendations remain pending human review |
| Jarvis approvals | `frontend/web/src/services/approvalService.ts` and existing organization-scoped claims | Dry-run approval packets in `workflow.py` | Existing UI/service unchanged; no production write |
| Communications | `mcp/content-generation-ai/` and authorized Gmail connector | Draft payload in `workflow.py` | No Gmail draft created and no message sent |
| Daily coordination | `mcp/project-manager-agent/`, master workbook, existing ChatGPT Page | Dated JSON handoff | No Page or Sheet write |

The standalone scripts add only `mcp/common` to their local import path. No top-level `mcp` package marker was added, avoiding changes to existing MCP namespace/runtime resolution.

## Reusable commands

Pre-flight:

```powershell
python scripts\business_pipeline_preflight.py
```

Unit tests:

```powershell
python -B -m unittest discover -s mcp\common\business_pipeline\tests -p "test_*.py" -v
```

Local dry-run demonstration:

```powershell
python scripts\business_pipeline_dry_run.py --output docs\business-compliance\pipeline\runs\api-source-integration-dry-run-2026-10-15.json
```

The commands never write to Google Sheets, Gmail, the daily Page, SAM.gov, USAspending, CSL, or OFAC.

## Ecosystem connection evidence

| Requirement | Existing function | Exact path | State | Actual gap/action |
|---|---|---|---|---|
| SAM discovery | Date windows, pagination, checkpoints, normalization | `mcp/common/business_pipeline/sam.py` | Implemented | Added bounded credential-redacted HTTP error diagnostics; live read remains credential/authorization gated |
| Grants.gov discovery | Source configured but no adapter | `mcp/common/business_pipeline/grants.py` | Implemented locally; not activated | Added public `search2` pagination and normalization; response tokens are discarded |
| Historical contract intelligence | USAspending adapter | `mcp/common/business_pipeline/usaspending.py` | Already implemented | Added shared identity/content hashes without changing historical-only status |
| Domestic industry intelligence | Shared discovery identity and normalization | `mcp/common/business_pipeline/census.py` | Implemented locally; not activated | County Business Patterns rows remain aggregate market statistics, never company leads or open opportunities |
| International trade-flow intelligence | Existing TradeOps ownership plus shared discovery identity | `mcp/common/business_pipeline/comtrade.py`; `mcp/tradeops/` | Implemented locally; not activated | Bounded read-only UN Comtrade statistics remain market context; no company lead, tariff, or regulatory determination is inferred |
| Identity and change tracking | Per-source IDs existed | `mcp/common/business_pipeline/discovery.py` | Implemented locally; not activated | Added shared stable identity, content hash, duplicate detection, modified-content review, and human-field preservation |
| Federal subcontracting | Compliance fields and manual sources | `platform_bootstrap/integrations/google_drive/configs/business_pipeline_config.template.json` | Manual/permissioned | No supported machine API verified; SUBNet must not be scraped |
| Commercial trade-flow intelligence | Existing TradeOps owner, no approved source account | same config; `mcp/tradeops/` | Authorization blocked | UN Comtrade limited to aggregate flow intelligence; company-data services require separate terms/account approval |
| Local analytical model | Owner-supplied local evidence: Ollama executable installed, local API reachable, `qwen3.5:4b` available | none | Optional and not activated by this pipeline | Deterministic normalization, credentials, mapping, and compliance controls never depend on Ollama; no endpoint was exposed or changed |
| Tier 1 MCP reuse | Service index, fleet contract, gateway registry, and each active `main.py` | `mcp/common/business_pipeline/mcp_reuse.py` | Four services verified; one safe record adapter | `data.validate` may receive a no-write evidence envelope; direct record routing through retrieval, analytics, and reporting remains blocked on incompatible output contracts |
| Shared review routing | Fit, screening and approval packet builders | `mcp/common/business_pipeline/workflow.py` | Implemented locally; not activated | Added type-aware recommendations; legal entity selection remains human-controlled |

Synthetic proof: `docs/business-compliance/pipeline/runs/ecosystem-integration-dry-run-2026-10-14.json` exercises federal solicitation, grant, commercial-trade, and subcontracting records through normalization, stable identity, deduplication, change detection, legal/trade routing, screening hold, review packet, and no-write output.

Reference implementations were not installed or copied. License review used these exact upstream revisions: `uncomtrade/comtradeapicall@0848a3f1cf63234a93fb5635b9b19b2265afab71` (MIT), `Upkuajing/upkuajing-trade-company-search@5de42c0474f833c6bdc1ac0b639426db20828877` (MIT code; paid underlying API), and `IndoTender/thecompanyatlas-mcp@7478c38ba6a6b2b32190fa8ca00cb7a0c4353471` (no license file verified). The repository continues to use its standard-library HTTP/schema approach.

## Pre-flight gates

- Local continuation requires repository identity, evidence paths, dependency policy, and all three exact worksheet schemas to pass.
- Missing SAM credentials produce `BLOCKED_CREDENTIALS`; the live SAM adapter must stop while synthetic fixtures remain available for local tests.
- Schema mismatch produces `BLOCKED_SCHEMA` before positional row creation.
- Source failure produces `BLOCKED_SOURCE` and must not fall back to web scraping.
- Google protected-range verification and all writes remain `REQUIRES_OWNER_APPROVAL`.
- Public-source probes are bounded and read-only.

## Source and decision boundaries

- SAM query dates are emitted only as `MM/dd/yyyy`; response values retain their original text plus defensive normalization.
- Historical SAM windows are chronological, no longer than one calendar year, and overlap on their inclusive boundary; notice IDs deduplicate overlaps.
- USAspending awards are labeled historical market intelligence, never active bid opportunities.
- The internal fuzzy threshold is `0.85`. It produces candidates, not clearance, and never equates source-defined CSL/OFAC scores.
- A candidate match, identifier hit, ambiguous identity, ownership concern, stale list, or restricted end-use signal requires human review and may hold execution.
- Approval packets start `PENDING_REVIEW`; only an authorized human can decide. Specialist matters offer `HOLD` and `ESCALATE`.
- Email output is payload-only. Sender/legal-entity mismatch produces `HOLD_SENDER_IDENTITY`.
- Suspected controlled technical data must not enter ordinary prompts, the workbook, Git, or unrestricted MCP runtimes; use metadata-only references and escalate.

## Credential and rollout blockers

1. Owner-controlled runtime environments supply `SAM_API_KEY`, `CENSUS_API_KEY`, and the primary `COMTRADE_API_KEY`. Repository code reads process environment values only; it does not parse tracked `.env.*` files or write local secret files. The Comtrade secondary key remains separate and unused for ordinary reads. Keys must never be committed, logged, embedded in report URLs, or placed in fixtures.
   For a local PowerShell session, dot-source `scripts/load_business_pipeline_credentials.ps1`; add `-IncludeSecondary` only for deliberate owner-controlled rotation. The helper prompts without echo, sets process-scoped variables only, and reports booleans only.
2. UN Comtrade uses a process-local UTC-day request budget of 450 by default, below the documented 500-call/day free-account ceiling (https://uncomtrade.org/docs/subscriptions/). The configured limit cannot exceed 500. HTTP 429 retries are capped, honor a valid `Retry-After` only within the local delay cap, otherwise use bounded exponential backoff, and never switch keys automatically. Restarting the process resets the local counter, so this is a conservative client guard rather than a provider-quota ledger.
3. Repository code has no approved Google Sheets write identity. Before staging, authorize least-privilege access, verify protected ranges, and run the conflict/version policy.
4. The connected owner-account tools demonstrate read access in this execution environment but do not grant credentials to repository code.
5. Gmail identity was verified read-only; no repository OAuth identity is configured and no draft/send action is authorized.
6. The daily ChatGPT Page has a connected interface in this environment, but repository code has no verified programmatic write contract. Use the local dated handoff until separately approved.
7. TradeOps, content-generation, and project-manager contracts remain outside this local activation. Retrieval, data-scrubbing, analytics, and reporting are Tier 1 services, but only the evidence-preserving `data.validate` adapter is approved for local Business Pipeline record preparation.

## Production gate

The smallest next step is an owner-approved staging review: provide a secret SAM key, authorize a least-privilege Google test identity, verify protected ranges and row-version behavior on copies or explicitly designated staging ranges, and run read-then-preview conflict tests. That approval does not authorize bid submission, sanctions disposition, email sending, customs filing, Page synchronization, deployment, or recurring polling.

Do not alter or mutate existing target workbook schemas or activate unverified placeholder runtimes without explicit staging.
