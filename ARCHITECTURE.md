# ShieldMate Architecture Overview

## Web Platform (Active)
- Vite + React + TypeScript is the primary UI stack.
- Firebase Hosting serves the built assets from `dist/` with SPA rewrites to `index.html`.
- Firebase Auth, App Check (reCAPTCHA v3), Firestore, Storage, and Analytics are initialized in `src/lib/firebase.ts`.
- MCP calls are made from the browser to Cloud Run over HTTPS using `src/services/mcpClient.ts` or the `useMcpClient` hook; Firebase ID tokens and App Check tokens are attached to every call.

## Legacy / Isolated Flutter
- Flutter remains in `android/` and `frontend/arbor_aid_app/` for historical work but is not the active web client.
- Do not modify or delete Flutter assets while working on the web platform.

## Hosting + Build
- Local and CI builds produce `dist/` via `vite build`.
- Firebase Hosting (site `2m-shieldmate-48cad`, target `shieldmate`) deploys only the `dist/` folder.

## Data + Auth Flow
- Auth state is provided through `AuthContext`; helpers live in `src/lib/firebaseService.ts`.
- Protected routes wrap pages in `ProtectedRoute`.
- Analytics and event tracking use `trackEvent` from `src/lib/firebase.ts`.
- PWA: `public/manifest.webmanifest` and `public/service-worker.js` provide installability and an offline shell; registration occurs in `src/main.tsx`.

## MCP Integration
- Cloud Run services are reached via HTTPS endpoints configured through `VITE_MCP_ENDPOINT`.
- Requests use `Authorization: Bearer <firebase-id-token>` and include `X-Firebase-AppCheck` when available.
- Cloud Run should validate Firebase ID tokens and App Check tokens server-side (Admin SDK + App Check verification).

## Future Mobile
- Mobile support will integrate with the existing Firebase + MCP stack.
- Keep cross-platform contracts (Auth, MCP payloads) stable to minimize future client work; no current Flutter activation is planned.
