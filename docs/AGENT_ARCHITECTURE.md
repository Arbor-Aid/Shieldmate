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

## Gateway Routes (Safety Boundaries)
### Public (Before Safety Route)
These routes are accessible without Firebase ID tokens but should still enforce
basic validation (rate limits, signature checks, schema validation).
- `GET /health`
- `GET /version`
- `GET /status`
- `POST /slack/events` (Slack signature required)

### Enforcement Contract (Hard Requirements)
All protected routes must:
- Verify Firebase ID token.
- Read `request.auth.token.role` and org claims.
- Reject missing or stale claims.
- Never allow MCP tools, agent tasks, or edge results to bypass the gateway.
- Treat Slack as a signal, not authority (Slack routes never grant auth).

### Protected (Behind Safety Route)
These routes require a valid Firebase ID token and claim checks on every call.
- `POST /mcp/execute` (role-checked)
- `POST /mcp/tools/:toolId` (role-checked)
- `POST /mcp/context` (role-checked)
- `GET /agent/runs` (org-scoped)
- `POST /agent/tasks` (org-scoped + role-checked)
- `POST /agent/approve` (super_admin or org_admin)
- `POST /admin/claims` (super_admin only)
- `POST /admin/orgs` (super_admin only)
- `GET /admin/audit` (super_admin only)
- `POST /edge/heartbeat` (service token + org scope)
- `POST /edge/results` (service token + org scope)

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

## Operational Guardrails
- Rotate agent credentials regularly.
- Revoke tokens for compromised edge devices.
- Require explicit human approval for destructive actions.
- Keep super_admin as the only global override.
