# ShieldMate

ShieldMate is a mission support platform built around a web-first Vite + React + TypeScript client, Firebase services, and a fleet of MCP services deployed behind a Cloud Run gateway.

Flutter remains in `frontend/flutter` as legacy / isolated work and must not be deleted or treated as the active web client on this branch.

ShieldMate is NOT a government agency.
ShieldMate provides no legal or medical advice.

## Current system summary
- Active UI: Vite + React + TypeScript in `frontend/web`.
- Legacy / isolated UI: Flutter in `frontend/flutter` for historical web, Android, and iOS work.
- Firebase Auth, Firestore, Storage, Analytics, App Check, and Hosting config remain core platform services.
- MCP services (33 deployable service directories in `mcp`, excluding `common` and `mcp-gateway`) are built from `mcp/Dockerfile.mcp`.
- MCP Gateway (`mcp/mcp-gateway`) enforces claims-based RBAC using Firebase Admin and routes requests to Cloud Run services.
- Web MCP calls originate from `frontend/web/src/services/mcpClient.ts` and use Firebase ID tokens plus App Check when available.
- Slack alerts and intake are configured via `SLACK_*` environment variables (template in `.env.bak`).
- Codemagic iOS pipeline lives in `frontend/flutter/codemagic.yaml`.
- Android builds require Kotlin Gradle Plugin 1.8.22 (see `frontend/flutter/android/settings.gradle`).

## Repository map
- `frontend/web`: Active Vite/React/TypeScript web client.
- `frontend/flutter`: Legacy / isolated Flutter app for historical web, Android, and iOS work.
- `mcp/`: MCP service fleet, shared Dockerfile, and Cloud Run gateway.
- `mcp/Dockerfile.mcp`: Shared MCP Dockerfile (python:3.11-slim, port 8080).
- `mcp/mcp-gateway`: Cloud Run MCP gateway (claims-based RBAC).
- `mcp_services.csv`: MCP service inventory snapshot.
- `firebase.json`, `firestore.rules`, `storage.rules`: Firebase configuration and rules.
- `docs/`: architecture, compliance, and operations references.

## Security and RBAC
- Claims-based RBAC via Firebase custom claims; no email-only authorization.
- Zero-trust, least-privilege enforcement at the MCP Gateway and in Firestore rules; fail closed on missing claims.
- Slack is notification and intake only, never a system of record.

## Compliance posture
- SOC2/ISO readiness focus: audit logging, data isolation, access reviews, incident response.
- Data minimization and PII handling are documented in `README_COMPLIANCE.md`.

## Documentation
- `ARCHITECTURE.md`: authoritative current technical architecture and system flow.
- `README_ARCHITECTURE.md`: quick architecture reference, repo authority snapshot, and operating guardrails.
- `README_MCPs.md`
- `README_DEPLOYMENT.md`
- `README_COMPLIANCE.md`
