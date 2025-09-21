# Shieldmate Governance Snapshot

| Capability | Status | Notes |
| --- | --- | --- |
| Branch Protection | Enabled | `main` blocks force pushes/deletions, requires reviews, status checks. |
| CODEOWNERS | Active | Reviews mapped to core, frontend, backend, DevOps, security teams. |
| Secrets Management | Centralized | CI consumes secrets via GitHub Actions; local `.env` stays ignored. |
| CI/CD | Automated | GitHub Actions runs lint, tests, deploy, MCP health checks, and Slack notify. |
| Dependabot | Scheduled | Weekly scans for npm, Docker, and GitHub Actions dependencies. |
| Docs & Integrations | Connected | Slack, Google Workspace, and Notion guides live in `/docs`. |
