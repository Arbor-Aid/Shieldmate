## Developer Operations (Optional Helpers)

- `npm run verify` / `npm run check` runs lint → typecheck → build.
- Pre-commit (optional): `npx husky-init && npm run prepare` then set hook to `npm run precommit` (script already defined). Skip if you prefer manual runs.
- Service worker + PWA are registered automatically; disable by commenting `registerServiceWorker()` in `src/main.tsx` if troubleshooting.

---

## 2026-04-13 Multi-Node Authority Snapshot

Updated: 2026-04-13 21:32:45

Authoritative repo root:
D:\shieldmatessd\Shieldmate_RECLONE

Authoritative branch:
ui-rebuild-flutter-gen-ui

System node roles:
- THE-BOT: primary Windows control, build, and backend node
- HONEY: Raspberry Pi Kali monitoring and security node
- LAPTOP: dev, control, and review node

Operating policy:
- Laptop and THE-BOT stay aligned to canon during bring-up
- MCP updates must land on canon before endpoint activation
- Claims and auth schema remain unified end-to-end
- Do not delete folders; park legacy only after confirmation
