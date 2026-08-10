# ShieldMate Architecture Quick Reference

Use `ARCHITECTURE.md` as the authoritative technical architecture for the current repo and branch. This file is a quick reference and operational snapshot only.

## Quick reference
- Active UI: `frontend/web` (Vite + React + TypeScript).
- Core platform: Firebase + `mcp/mcp-gateway` + Cloud Run MCP services.
- Claims and auth schema stay aligned end-to-end; do not loosen authorization to email-only trust.
- Flutter in `frontend/flutter` is legacy / isolated and must not be deleted.
- Detailed system flow, hosting notes, and service boundaries live in `ARCHITECTURE.md`.

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
