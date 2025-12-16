## Developer Operations (Optional Helpers)

- `npm run verify` / `npm run check` runs lint → typecheck → build.
- Pre-commit (optional): `npx husky-init && npm run prepare` then set hook to `npm run precommit` (script already defined). Skip if you prefer manual runs.
- Service worker + PWA are registered automatically; disable by commenting `registerServiceWorker()` in `src/main.tsx` if troubleshooting.
