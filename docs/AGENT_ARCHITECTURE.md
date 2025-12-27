# ShieldMate Multi-Agent Architecture (v1.1+)

This document defines a secure, claims-first, multi-agent architecture for ShieldMate,
including Swarms AI orchestration, MCP tool access, and Raspberry Pi edge agents.
All privileged actions must be authorized via Firebase ID token custom claims.

## Goals
- Add a multi-agent orchestration layer without weakening claims-based RBAC.
- Route all tool/data access through MCP with token verification.
- Support distributed execution, including Raspberry Pi edge agents.
- Maintain auditable, org-scoped operations.

## High-Level Architecture
```
[User/Org UI] -> [ShieldMate Web App] -> [MCP Gateway (Cloud Run)]
                                  \
                                   -> [Agent Orchestrator Service]
                                      - Swarms AI Orchestrator
                                      - Agent Registry + Run Store
                                      - Task Queue (Pub/Sub/Cloud Tasks)
                                      - Audit Sink (Firestore/Logging)
                                             ^
                                             |
         [Edge Agent Runner (Raspberry Pi)] -+ (outbound HTTPS/WebSocket)

[Slacker Agents] -> [Slack Command Gateway] -> [MCP Gateway (Cloud Run)]
                                        \
                                         -> [Agent Orchestrator Service]
```

Key rules:
- MCP is the only tool gateway.
- All calls require Firebase ID tokens and claim checks.
- Edge agents authenticate as services, not users.
- Slacker agents are claim-gated and map Slack identity to Firebase identity.

## Gateway/MCP Ingress (External Service)
Gateway/MCP ingress is not implemented in this repository. It is an external
Cloud Run service (or separate repo) and must be inventoried independently.
Current ingress service identified in Cloud Run: `mcp-gateway` (see inventory).

## Framework Catalog (Reference Use Cases)
### Primary
- Swarms AI: multi-agent orchestration, configurable agent graphs and loops.

### Complementary Patterns
- LangGraph: deterministic state machines and DAG workflows.
- AutoGen: agent chats with tool usage and delegation.
- CrewAI: role-specialized agents with task planning.
- MetaGPT: structured role-based task decomposition.
- TaskWeaver: tool-first agent execution for data and automation tasks.
- Slacker agents: Slack-based automation agents that execute MCP actions via claim-gated commands.

## Agent Workflow Patterns
### Event-Driven Orchestration
- Trigger tasks on domain events (new org, new case, new doc).
- Enqueue agent tasks in a queue (Pub/Sub/Cloud Tasks).
- Orchestrator pulls, assigns, and executes with explicit policies.

### Human-in-the-Loop (HITL)
- Agent proposes action -> writes pending action.
- UI approval required before write operations.
- MCP enforces write permissions via claims.

### Deterministic State Machine
Workflow states: `queued -> running -> waiting_input -> completed|failed`
State is stored per run and immutable audit events are appended.

### Multi-Agent Collaboration
- Planner agent delegates to specialist agents.
- Each agent output is structured and validated (JSON schema).
- Orchestrator merges results and finalizes action.

### Idempotent Replays
All write actions must include an idempotency key to prevent duplication.

## Example Task Envelope
```json
{
  "taskId": "agt_01H...",
  "orgId": "2marines",
  "createdBy": "uid_123",
  "agentType": "case_intake",
  "intent": "summarize_and_route",
  "input": { "caseId": "case_123" },
  "policy": { "requiresApproval": true },
  "status": "queued",
  "idempotencyKey": "case_123:v1"
}
```

## MCP Authorization Pattern (Backend)
```ts
import { auth } from 'firebase-admin';

export async function verifyRole(authHeader: string, requiredRole: string) {
  if (!authHeader?.startsWith('Bearer ')) throw new Error('403');
  const decoded = await auth().verifyIdToken(authHeader.slice(7), true);
  if (decoded.role !== requiredRole) throw new Error('403');
  return decoded;
}
```

## Slacker Agent Integration
Slack-based agents must authenticate through a Slack command gateway and map Slack identity to a Firebase UID.
Authorization must still be claims-based (decoded token role), never email-only.

Slack trust model (diagram-style flow):
- Slack user
  -> Slack app (signature verified)
    -> Slack gateway route (`/slack/command`)
      -> Map Slack user to internal UID (lookup only)
        -> Issue MCP request with Firebase token
          -> MCP Gateway (claims enforced)

Explicit rules:
- Slack user IDs are not identities.
- Slack cannot call `/mcp/*` directly.
- Slack only triggers workflows already permitted by claims.

```ts
// Pseudocode for Slack command handler
async function handleSlackCommand(cmd) {
  const slackEmail = await resolveSlackUserEmail(cmd.userId);
  const uid = await lookupFirebaseUidByEmail(slackEmail);
  const token = await mintCustomTokenForUid(uid);
  const decoded = await auth().verifyIdToken(token, true);
  if (decoded.role !== 'super_admin') throw new Error('403');
  return executeMcpCommand(cmd);
}
```

## Google Cloud Integration Notes
- Cloud Run hosts MCP Gateway and Agent Orchestrator services.
- Pub/Sub or Cloud Tasks provide queueing for agent workloads.
- Firestore stores run state and audit records.
- Cloud Logging captures system-level logs for ops monitoring.

## Google Cloud Runtime Responsibilities Matrix
| Component | Runs On | Responsibility | Auth Model |
| --- | --- | --- | --- |
| MCP Gateway | Cloud Run | AuthZ, routing | Firebase ID token |
| Agent Orchestrator | Cloud Run | Task lifecycle | Firebase ID token |
| Async Tasks | Pub/Sub / Cloud Tasks | Fan-out | Service account |
| Audit Logs | Firestore | Immutable logs | Admin SDK only |
| Edge Agents | Raspberry Pi | Execute tasks | Service token |

## Cloud Run Inventory (Authoritative)
Inventory derived from `gcloud run services list/describe` (project: marines-ai-agent).
Auth models and routes are not discoverable from this repo unless noted.

| Service Name | Region | Base URL | Purpose | Auth Model | Notes |
| --- | --- | --- | --- | --- | --- |
| mcp-gateway | us-central1 | https://mcp-gateway-779610430003.us-central1.run.app | Gateway/Ingress | Firebase ID token (protected routes) | Public: `/health`, `/version` |
| ai-budget-planner | us-central1 | https://ai-budget-planner-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| ai-expense-manager | us-central1 | https://ai-expense-manager-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| ai-financial-analyst | us-central1 | https://ai-financial-analyst-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| ai-financial-reporting-specialist | us-central1 | https://ai-financial-reporting-specialist-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| ai-invoice-processor | us-central1 | https://ai-invoice-processor-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| ai-payroll-manager | us-central1 | https://ai-payroll-manager-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| ai-tax-compliance-agent | us-central1 | https://ai-tax-compliance-agent-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| ai-training-coordinator | us-central1 | https://ai-training-coordinator-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| ai-ux-analyst | us-central1 | https://ai-ux-analyst-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| amazon-drop-shipping-ai | us-central1 | https://amazon-drop-shipping-ai-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| coder-agent | us-central1 | https://coder-agent-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| content-generation-ai | us-central1 | https://content-generation-ai-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| cto-agent | us-central1 | https://cto-agent-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| data-scrubbing-ai | us-central1 | https://data-scrubbing-ai-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| designer-ai-agent | us-central1 | https://designer-ai-agent-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| email-campaign-optimizer-ai | us-central1 | https://email-campaign-optimizer-ai-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| fundraising-chatbot-ai | us-central1 | https://fundraising-chatbot-ai-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| hr-ai-agent | us-central1 | https://hr-ai-agent-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| information-retrieval-ai | us-central1 | https://information-retrieval-ai-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| multimodal-ai | us-central1 | https://multimodal-ai-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| org-scrubber-mcp | us-central1 | https://org-scrubber-mcp-yd7bwat7eq-uc.a.run.app | MCP service (name + image include `mcp`) | TBD | Routes unknown |
| personalized-donation-ai | us-central1 | https://personalized-donation-ai-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| project-manager-agent | us-central1 | (no URL assigned) | MCP service (container in `mcp-containers`) | TBD | Service URL missing |
| qa-ai-agent | us-central1 | https://qa-ai-agent-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| reporting-dashboard-ai | us-central1 | https://reporting-dashboard-ai-yd7bwat7eq-uc.a.run.app | MCP service (container in `mcp-containers`) | TBD | Routes unknown |
| setuserclaims | us-central1 | https://setuserclaims-yd7bwat7eq-uc.a.run.app | Firebase Functions Gen2 (setUserClaims callable) | Firebase Auth callable | Cloud Functions artifact |

## Gateway Routes (Safety Boundaries)
Gateway/MCP ingress is not implemented in this repository. It is expected to run
as an external Cloud Run service (or separate repo) and must be inventoried
independently.

### Routes Implemented in This Repository
#### Firebase Hosting (Frontend)
- SPA entry via `/index.html` with rewrite on all paths.

#### Firebase Functions HTTPS Endpoints
- `setUserClaims` (HTTPS callable; claims-guarded super_admin only)

Function inventory:
| Function | Trigger | Auth Expectation |
| --- | --- | --- |
| `setUserClaims` | HTTPS callable | Firebase ID token + super_admin claim |

### External Gateway Routes (Out of Repo)
Gateway base URL (Cloud Run):
- https://mcp-gateway-779610430003.us-central1.run.app

All tool ingress routes through the gateway. Supported routes:
- `GET /health`
- `GET /version`
- `POST /mcp/execute` (role-checked, org-scoped)
- `POST /mcp/tools/:toolId` (role-checked, org-scoped)
- `POST /mcp/context` (role-checked, org-scoped)

Downstream MCP service routes remain unknown in this repo; route inventory must
be sourced from the gateway/service repo or service owners.

### Enforcement Contract (Hard Requirements)
All protected routes must:
- Verify Firebase ID token.
- Read `request.auth.token.role` and org claims.
- Reject missing or stale claims.
- Never allow MCP tools, agent tasks, or edge results to bypass the gateway.
- Treat Slack as a signal, not authority (Slack routes never grant auth).

## Edge Agent Prototype (Raspberry Pi)
### Minimal Structure
```
/edge-agent
  /config
    device.json
  /agent
    runner.py (or node)
    tools/
      local_sensors.py
      local_cache.py
  /systemd
    edge-agent.service
```

### Operational Flow
1) Device provisioning issues a device token (service identity).
2) Runner authenticates to MCP Gateway using that token.
3) Runner pulls tasks assigned to device/org.
4) Results are returned to the orchestrator; audit entries are appended.
5) Heartbeats confirm device health and liveness.

## Security and RBAC Requirements
### Claims-First Authorization
- All privileged actions require Firebase ID token custom claims.
- No email-based authorization, no Firestore-only role trust.
- Slacker agents must pass claim checks through the Slack command gateway.

### Service Identity for Agents
- Edge agents use service tokens, not user sessions.
- Tokens are short-lived and scoped per org/task.

### Least Privilege
- Agent types mapped to allowed MCP tools.
- Read/write separation enforced by MCP and Firestore rules.

### Auditability
- Every action writes an audit entry: actor, org, action, resource, timestamp.
- Avoid PII in logs.

### Data Isolation
- Org-scoped access only; deny cross-org by default.

## Explicit Non-Goals (v1.1)
- No peer-to-peer agent trust.
- No agent-issued credentials.
- No Firestore-only authorization.
- No long-lived edge credentials.
- No Slack-based role escalation.

## Integration Checklist
- Register agent types and allowed tools in an Agent Registry.
- Orchestrator dispatches tasks and enforces policies.
- MCP validates tokens and role claims on every request.
- Edge agents authenticate as services and run outbound-only.
- Audit logs capture all agent actions and failures.
- Slacker agents authenticate via Slack gateway with claim-based authorization.
- Google Cloud services (Cloud Run, Pub/Sub/Cloud Tasks, Firestore, Logging) are the default runtime stack.

## Claim Propagation Notes (Ops)
- Claim changes require a token refresh.
- MCP calls with stale tokens must fail closed.
- UI must surface "Re-login required" after admin role changes.

## Regulated External Systems: Google Ads (Ad Grants)
Google Ads (Ad Grants) is a regulated external system that requires strict
controls to prevent unapproved spend or policy violations. All automation must
be approval-gated and claims-authorized.

Trust boundary:
UI -> MCP Gateway (/mcp/execute) -> mcp-google-ads (Cloud Run)

Explicit Non-Goals (Ad Grants):
- No autonomous spend, launch, or bid changes without human approval.
- No direct client-side Google Ads API calls.
- No credential storage in the frontend.

Approval workflow (text diagram):
- User (org_admin/super_admin) submits change request
  -> Approval record created (PENDING)
    -> Human approval (super_admin or org_admin)
      -> Execute via MCP gateway (/mcp/execute) with approvalId
        -> mcp-google-ads performs server-side API call
          -> Audit log append-only record

Audit logging requirements:
- Log every regulated action with: orgId, actor uid, action, approvalId, toolId,
  status, timestamp.
- Fail closed when approvalId is missing or invalid.

Ad Grants policy constraints checklist (enforced in code):
- Only approved campaigns/ad groups/keywords are created or modified.
- No automated changes outside approved budgets and policy limits.
- All mutating actions require approvalId with status APPROVED.
- Enforce org scoping (claims.org must match orgId).

## MCP Additions
- mcp-google-ads (mutating actions require approval)
- mcp-analytics (read-only metrics for GA4/Ads)
See `docs/mcp-google-ads.md` and `docs/google-ads-approvals.md`.

## Operational Guardrails
- Rotate agent credentials regularly.
- Revoke tokens for compromised edge devices.
- Require explicit human approval for destructive actions.
- Keep super_admin as the only global override.
