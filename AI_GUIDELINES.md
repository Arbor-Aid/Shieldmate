# AI Contribution Guidelines (Codex / Copilot)

## Scope and Boundaries
- Active UI: Vite + React + TypeScript in `src/`.
- Legacy/isolated: `android/` and `frontend/arbor_aid_app/` (do **not** modify or remove).
- Deployable artifact: `dist/` built via `vite build`, deployed to Firebase Hosting target `shieldmate`.

## Where Code Belongs
- Shared services: `src/services/` (e.g., MCP client).
- Firebase setup and helpers: `src/lib/`.
- React contexts/hooks: `src/contexts/`, `src/hooks/`.
- UI: `src/components/` and `src/pages/`.
- Keep tests close to features; avoid placing anything in legacy Flutter paths.

## Env Vars (Vite)
- Use `import.meta.env.VITE_*` (with optional `process.env` fallback only when necessary).
- Required keys include:
  - `VITE_FIREBASE_*` (project config)
  - `VITE_FIREBASE_APPCHECK_KEY` (reCAPTCHA v3)
  - `VITE_MCP_ENDPOINT` (Cloud Run HTTPS endpoint)
  - `VITE_ENABLE_EMAIL_AUTH` (toggle email/password)
  - Optional: `roles` / `orgRoles` custom claims are read client-side for RBAC.

## Patterns to Follow
- **Auth**: Use `AuthContext` and helpers in `src/lib/firebaseService.ts`. Protected routes via `ProtectedRoute`.
- **RBAC**: Role claims are read via `resolveEffectiveRole` / `getRoleClaims` (see `roleService`). Roles include `super_admin`, `org_admin`, `staff`, `client` (legacy: `admin`, `organization`). Org-scoped roles live in `orgRoles` claims and Firestore under `organizations/{orgId}/members/{uid}`.
- **MCP**: Use `src/services/mcpClient.ts` or `useMcpClient` hook. Always send `Authorization: Bearer <idToken>` and `X-Firebase-AppCheck` when available; Cloud Run must validate both server-side. Org context is passed as `orgId`.
- **API/Firebase**: Initialize Firebase in `src/lib/firebase.ts`; never hardcode secrets; prefer env vars. Use Firestore/Functions/Storage through exported instances.
- **Imports/Style**: Prefer absolute imports via `@/`. Keep formatting to Prettier + ESLint defaults; avoid large refactors without need.
- **PWA**: Manifest + service worker live in `public/`. Registration is in `src/lib/pwa.ts` invoked from `src/main.tsx`. Keep API calls network-first to avoid stale auth/App Check.
- **Audit/Errors**: Use `recordAudit` for security-relevant actions; ErrorBoundary logs structured errors. Keep PII out of logs.

## Safety
- Do not touch hosting targets or dist outputs except via build/deploy scripts.
- Avoid adding inline secrets or tokens to the repo.
- Keep changes minimal and auditable; respect existing auth + MCP flows.
