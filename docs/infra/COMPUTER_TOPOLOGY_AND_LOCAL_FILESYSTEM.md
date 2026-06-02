# ShieldMate Computer Topology and Local Filesystem

Updated: 2026-06-01 15:16:28

## Authoritative Windows Repo Root
D:\2marines\Shieldmate

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
D:\2marines\Shieldmate

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
D:\2marines\Shieldmate

## Authoritative Branch Policy
- Canon branch is ui-rebuild-flutter-gen-ui
- Feature work must land on canon before multi-machine activation
- Laptop and THE-BOT must stay aligned to canon during system bring-up

## Local Filesystem Policy
- Canon Windows repo root is D:\2marines\Shieldmate
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
<!-- MSI_CANON_TRANSITION_START -->
## 2026-05-22 MSI Canon Transition

Active Windows development machine:
- MSI: active ShieldMate development workstation

Active MSI canon root:
D:\2marines\Shieldmate

Legacy / parked machine:
- Old Dell laptop: legacy/parked after MSI onboarding. Preserve historical state; do not delete legacy paths without explicit authority.

Operating policy:
- MSI is the active development node for Launch Validation Phase.
- MCP updates must land on canon before endpoint activation.
- MCP Gateway remains the RBAC ingress.
- Slack remains notification and intake only, never system of record.
- Firebase claims, RBAC, and App Check guardrails remain unchanged.
- Existing Shopify/shop work is preserved.
<!-- MSI_CANON_TRANSITION_END -->

