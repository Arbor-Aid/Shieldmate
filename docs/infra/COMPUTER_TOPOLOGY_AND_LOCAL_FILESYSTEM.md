# ShieldMate Computer Topology and Local Filesystem

Updated: 2026-04-13 21:32:45

## Authoritative Windows Repo Root
D:\shieldmatessd\Shieldmate_RECLONE

## Authoritative Branch
ui-rebuild-flutter-gen-ui

## Node Topology

### THE-BOT
Role: primary Windows control, build, and backend node.

Responsibilities:
- canonical git sync
- Firebase CLI and emulator control
- backend validation
- local build and test coordination

Repo root:
D:\shieldmatessd\Shieldmate_RECLONE

### HONEY
Role: Raspberry Pi Kali monitoring and security node.

Responsibilities:
- monitoring
- tailscale-only secure mesh participation
- security observation
- MCP execution support where assigned

Current operating state:
- wlan0 active
- tailscale connected
- no public ports exposed

### LAPTOP
Role: dev, control, and review node.

Responsibilities:
- branch integration
- documentation updates
- coordination with THE-BOT
- controlled feature work

Repo root:
D:\shieldmatessd\Shieldmate_RECLONE

## Authoritative Branch Policy
- Canon branch is ui-rebuild-flutter-gen-ui
- Feature work must land on canon before multi-machine activation
- Laptop and THE-BOT must stay aligned to canon during system bring-up

## Local Filesystem Policy
- Canon Windows repo root is D:\shieldmatessd\Shieldmate_RECLONE
- Do not move repo roots without confirmation
- Do not delete parked or legacy paths without authority confirmation
- Keep ops notes, logs, and documentation inside repo-controlled paths

## MCP Integration Policy
- MCP updates must exist on canon before endpoint activation
- Claims and auth schema must remain unified end-to-end
- Do not loosen rules to compensate for integration drift

## Current Authority Snapshot
- Laptop aligned to ui-rebuild-flutter-gen-ui
- THE-BOT aligned to ui-rebuild-flutter-gen-ui
- HONEY operating as monitoring and security node
- Feature work preserved separately and merged to canon before activation
