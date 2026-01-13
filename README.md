# ShieldMate

ShieldMate is a mission support platform that pairs a Flutter client with Firebase services and a fleet of MCP microservices deployed to Google Cloud Run.

ShieldMate is NOT a government agency.
ShieldMate provides no legal or medical advice.

## Current system summary
- Flutter frontend targets web, Android, and iOS in `frontend/flutter`.
- Firebase Auth, Firestore, Storage, and Analytics are part of the platform; Firebase packages are declared in `frontend/flutter/pubspec.yaml`.
- MCP microservices (approximately 30 in scope; 24 listed in `mcp_services.csv`) are FastAPI ASGI services built from `mcp/Dockerfile.mcp`.
- MCP Gateway (`mcp/mcp-gateway`) enforces claims-based RBAC using Firebase Admin and routes requests to Cloud Run services.
- Slack alerts and intake are configured via `SLACK_*` environment variables (template in `.env.bak`).
- Codemagic iOS pipeline lives in `frontend/flutter/codemagic.yaml`.
- Android builds require Kotlin Gradle Plugin 2.1.10 (see `frontend/flutter/android/settings.gradle`).

## Repository map
- `frontend/flutter`: Flutter app for web, Android, and iOS.
- `frontend/web`: Vite/React web client present in the repository.
- `mcp/Dockerfile.mcp`: Shared MCP Dockerfile (python:3.11-slim, port 8080).
- `mcp/mcp-gateway`: Cloud Run MCP gateway (claims-only RBAC).
- `mcp_services.csv`: MCP service inventory snapshot.
- `firebase.json`, `firestore.rules`, `storage.rules`: Firebase configuration and rules.
- `docs/`: architecture, compliance, and operations references.

## Security and RBAC
- Claims-based RBAC via Firebase custom claims (role/org); no email-only authorization.
- Zero-trust, least-privilege enforcement at the MCP Gateway; fail closed on missing claims.
- Slack is notification and intake only, never a system of record.

## Compliance posture
- SOC2/ISO readiness focus: audit logging, data isolation, access reviews, incident response.
- Data minimization and PII handling are documented in `README_COMPLIANCE.md`.

## Documentation
- `README_ARCHITECTURE.md`
- `README_MCPs.md`
- `README_DEPLOYMENT.md`
- `README_COMPLIANCE.md`
