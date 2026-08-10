# Windows Admin Tools Integration Readiness

    Conventions:
    - scripts/ contains PowerShell collection scripts (safe, non-destructive by default).
    - outputs/raw contains native command output snapshots.
    - outputs/parsed contains parser outputs from raw text/XML to structured objects.
    - outputs/normalized_json contains normalized records matching schemas.
    - outputs/mcp_ready contains records formatted for MCP ingestion payloads.

    Expected normalized shape:
    {
      "source": "windows_admin_tools",
      "collector": "network|services|firewall|ports|event_logs|scheduled_tasks|storage|users_groups",
      "collected_at": "ISO-8601",
      "host": "hostname",
      "records": []
    }

    Likely MCP consumers:
    - coder-agent
    - qa-ai-agent
    - document-manager
    - tradeops
    - tradefinance_lc
    - training_to_sop
    - ai-training-coordinator
    - mcp-analytics
