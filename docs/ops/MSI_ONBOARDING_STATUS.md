# MSI Onboarding Status

Updated: 2026-06-01 15:17 ET

## Phase

2Marines / ShieldMate Launch Validation Phase + MSI Computer Onboarding.

## Task Summary

- Total tasks: 7
- Completed: 6
- In progress: 0
- Pending: 1

## Current State

- Active recommended canon root: `D:\2marines\Shieldmate`
- Branch: `ui-rebuild-flutter-gen-ui`
- Commit: `fd1de983dfb32dd5fdc0bdeacf2517834ab86a44`
- MSI is not currently running an elevated shell.
- VS Code Flutter SDK settings now point at `D:\2marines\Shieldmate\flutter`.
- WSL2 is installed with Ubuntu as the default distribution; `wsl -l -v` shows Ubuntu running on version 2.
- Docker Desktop is installed and running; Docker client/server report version 29.4.3.
- The `docker-desktop` WSL distro is running on version 2.
- `wsl --status` still prints a WSL1 optional-component warning, but the active Ubuntu distro is WSL2.
- Latest toolchain verification passed on 2026-06-01 15:15 ET; `toolchain-verified.json` exists.
- Latest post-setup verification passed on 2026-06-01 15:16 ET.
- Canon docs update completed on 2026-06-01 15:16 ET.
- MCP bootstrap remains aligned at 34 services.
- Shopify/shop dirty work is preserved.
- No legacy Dell machine-health JSON is present under `docs/ops/monitoring/` on this MSI checkout.

## Completed

- Git PATH and `safe.directory` configured for the ShieldMate repo.
- Node 24/npm available.
- Firebase CLI available.
- Google Cloud SDK available through MSI local wrapper.
- Java, Flutter, and Dart available.
- WSL2 Ubuntu available.
- Docker Desktop 4.74.0 installed; Docker Engine 29.4.3 available.
- Repo VS Code settings updated away from the old `D:\shieldmatessd\Shieldmate_RECLONE\flutter` path.
- Web validation passed: lint, typecheck, and build.
- Functions lint passed after a minimal starter-file lint fix.
- MCP bootstrap rehydrate passed with 34 packages and 34 service directories.
- MSI machine health captured under `docs/ops/monitoring/`, most recently on 2026-06-01 15:16 ET.
- `20_Toolchain_Verify_MSI.ps1` rerun on 2026-06-01 and passed.
- `99_Post_Setup_Verification_MSI.ps1` rerun on 2026-06-01 and passed.
- `30_Canon_Docs_Update_MSI.ps1` rerun on 2026-06-01 and completed.

## In Progress

- None.

## Pending

- Capture final machine health on the legacy Dell and compare against the MSI report if the Dell is still available.

## Blocker

- No active MSI onboarding blocker remains.
- `docker` may require a new Windows terminal/VS Code session to appear on PATH automatically; this session used `C:\Program Files\Docker\Docker\resources\bin`.

## Completed Commands

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\onboarding\msi\20_Toolchain_Verify_MSI.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\onboarding\msi\99_Post_Setup_Verification_MSI.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\onboarding\msi\30_Canon_Docs_Update_MSI.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\monitoring\ShieldMate-MachineHealth.ps1
```

## Guardrails

- Do not delete repo files or parked paths.
- Do not reset or rebase.
- Do not print env file contents.
- Do not loosen Firebase claims, RBAC, or App Check.
- Keep Slack as notify/intake only.
- Keep MCP Gateway as RBAC ingress.
