# ShieldMate MCP Rebuild Plan

## MCP Docker standards
- Base image: `python:3.11-slim`.
- Shared Dockerfile with `SERVICE_PATH` build arg per MCP.
- Serve via `uvicorn app:app --host 0.0.0.0 --port 8080`.
- Stateless services only; no hardcoded secrets (env-only config).

## Cloud Run rules
- `PORT` must be `8080`.
- Configure a health check endpoint that returns `200 OK`.
- Deploy each MCP independently; no coupled rollouts.
- No MCP-to-MCP dependency at runtime.

## Slack alerting
- Webhook-only alerts; best-effort delivery.
- No secrets or PII in payloads.

## Next-run checklist (build/push/deploy)
1. Verify Docker daemon is running and registry auth is available.
2. Validate the shared MCP Dockerfile uses `python:3.11-slim` and `SERVICE_PATH`.
3. For each MCP service:
   - Build the image with the `SERVICE_PATH` build arg.
   - Run a local container smoke test on port 8080.
4. Push images to the registry.
5. Deploy each MCP to Cloud Run with `PORT=8080`.
6. Verify health checks and basic endpoints.
7. Update MCP README documentation with deployment notes.
8. Capture audit output and store in docs.