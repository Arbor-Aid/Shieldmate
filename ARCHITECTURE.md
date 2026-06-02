# ShieldMate Architecture Overview

This document is the authoritative technical architecture for `D:\2marines\Shieldmate` on branch `ui-rebuild-flutter-gen-ui`.

## Web Platform (Active)
- Vite + React + TypeScript is the primary UI stack in `frontend/web`.
- Firebase Auth, App Check (reCAPTCHA v3), Firestore, Storage, and Analytics are initialized in `frontend/web/src/lib/firebase.ts`.
- MCP calls are made from the browser to Cloud Run over HTTPS using `frontend/web/src/services/mcpClient.ts`; Firebase ID tokens and App Check tokens are attached to every call.
- Auth state and route protection live in `frontend/web/src/contexts/AuthContext.tsx` and `frontend/web/src/components/ProtectedRoute.tsx`.
- PWA assets live in `frontend/web/public/manifest.webmanifest` and `frontend/web/public/service-worker.js`; app bootstrap is `frontend/web/src/main.tsx`.

## Current system flow
1. User signs in through Firebase Auth.
2. The active web client resolves Firebase ID tokens and App Check tokens when available.
3. The web client calls the MCP Gateway over HTTPS with `Authorization: Bearer <firebase-id-token>` and `X-Firebase-AppCheck` when present.
4. MCP Gateway enforces claims-based RBAC and org scope, then forwards the request to the target Cloud Run MCP service.
5. MCP services execute domain work and write to Firestore, Storage, or approved external systems.
6. Audit and analytics events remain aligned with the same claims and org boundaries.

## Hosting + Build
- Local and CI web builds run from `frontend/web` via `vite build`.
- Vite outputs `frontend/web/dist` (`frontend/web/vite.config.js`).
- Repo-level Firebase Hosting config lives in `firebase.json` and keeps SPA rewrites to `index.html`.
- `scripts/site-meta.cjs` resolves the active web project under `frontend/web` and stages assets into that `dist/` output.
- `deploy-shieldmate.ps1` still reflects an older root/dist deployment path and should be treated as a legacy helper until aligned.

## Data + Auth Boundary
- Analytics and event tracking use `trackEvent` from `frontend/web/src/lib/firebase.ts`.
- Firestore rules require App Check and claims-based access (`firestore.rules`).
- Claims-based RBAC is canonical: `role` / `roles` plus `org` / `orgId` / `orgRoles`.
- Do not loosen claims/auth enforcement to email-only authorization.

## MCP Integration
- Cloud Run services are reached via HTTPS endpoints configured through `VITE_MCP_ENDPOINT`.
- Requests use `Authorization: Bearer <firebase-id-token>` and include `X-Firebase-AppCheck` when available.
- `mcp/mcp-gateway` is the claims-based ingress and routing layer for MCP requests.
- `mcp_services.csv` remains the service inventory snapshot; the repo currently contains 34 deployable service directories in `mcp` excluding `common` and `mcp-gateway`.
- No MCP-to-MCP dependencies or direct calls; keep services independently deployable.

## Legacy / Isolated Flutter
- Flutter remains in `frontend/flutter/` for historical work but is not the active web client.
- Do not modify or delete Flutter assets while working on the web platform.
- Keep legacy references only when needed and clearly marked.
- Preserve cross-platform contract alignment where Firebase auth claims or MCP payloads are shared.
