# Platform Bootstrap

    This directory is the reboot/rehydration layer for the ShieldMate MCP fleet.

    Scope:
    - Shared data roots (geography, demographics, org profiles, taxonomies, Google Ads)
    - Integration readiness roots (Firebase, Google Drive, Notion, Slack, Windows admin tools)
    - Per-MCP bootstrap packages and smoke payload pointers
    - Mass smoke payloads for post-cold-start verification

    Contract:
    - Gateway remains the only ingress for tool execution.
    - Canonical gateway execute route is /mcp/execute (with /execute compatibility alias).
    - Service bootstrap packages are machine-readable JSON under platform_bootstrap/mcps/<service>/bootstrap_package.json.
