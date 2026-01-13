# ShieldMate Architecture

## Core flow (Firebase -> MCP -> UI)
1. User signs in through Firebase Auth; ID tokens include role and org claims.
2. Flutter client calls the MCP Gateway on Cloud Run over HTTPS with Authorization: Bearer Firebase ID token (App Check when available).
3. MCP Gateway enforces RBAC and org scope, then forwards to the target MCP service.
4. MCP service executes the domain action and writes results to Firestore or Storage, or to external systems when required.
5. UI reads from Firebase and audit logs capture activity; Slack notifications are emitted when configured.

## Zero-trust and least-privilege
- All privileged actions require explicit role and org claims.
- Gateway is the only ingress for MCP execution.
- Deny-by-default enforcement; missing or invalid claims are rejected.

## Components
- Flutter client: `frontend/flutter` (web, Android, iOS).
- Firebase: Auth, Firestore, Storage, Analytics.
- MCP Gateway: `mcp/mcp-gateway` on Cloud Run.
- MCP services: Cloud Run containers built from `mcp/Dockerfile.mcp`.

## MCP isolation rules
- No MCP-to-MCP dependencies or direct calls.
- Each MCP service owns a single responsibility and deploys independently.
- Shared state is stored in Firebase or external systems, not in other MCPs.

## Audit boundaries
- Firestore rules enforce App Check and claims-based access (see `firestore.rules`).
- Audit logs are append-only and do not store PII (see `docs/COMPLIANCE.md`).