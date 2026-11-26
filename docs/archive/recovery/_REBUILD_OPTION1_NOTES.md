# Rebuild Option 1 Notes

Created: 2026-01-14 22:35:22

## What this script did
- Wrote .vscode/settings.json to reduce Code.exe memory growth (watcher/search excludes).
- Ensured .gitignore contains common rebuild excludes (no secrets).
- Captured snapshots in _snapshots/
- If a Vite/React web app was detected at repo root, moved it into /web.

## Backups
Backups saved here:
D:\shieldmatessd\Shieldmate_RECLONE\_snapshots\backup_20260114_223516

## Safe VS Code open commands (avoid indexing the entire repo)
- Web only:
  code -n "D:/shieldmatessd/Shieldmate_RECLONE\web"
- Mobile only:
  code -n "D:/shieldmatessd/Shieldmate_RECLONE\mobile"
- MCP work (open separately only when needed):
  code -n "D:/shieldmatessd/Shieldmate_RECLONE\mcp"
