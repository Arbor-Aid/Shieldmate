# MCP Contract: Google Ads (Ad Grants)

This document defines the MCP contract for Google Ads automation. All mutating
actions are regulated and require approval. Claims-based RBAC is mandatory.

## Gateway Base URL
- MCP Gateway (Cloud Run) routes requests to the Google Ads MCP service.
- Use `POST /mcp/execute` via the gateway. No direct client-side calls.

## Request Schema (Gateway)
```json
{
  "toolId": "mcp-google-ads",
  "orgId": "2marines",
  "input": {
    "action": "googleAds.createCampaign",
    "approvalId": "appr_123",
    "payload": {}
  },
  "meta": {}
}
```

## Tools (Minimum Set)
All tools are scoped by org. Mutating actions require approval.

1) `googleAds.createCampaign`
- Required role: org_admin or super_admin
- Approval required: YES (approvalId)
- Org scope: claims.org must match orgId

2) `googleAds.updateCampaign`
- Required role: org_admin or super_admin
- Approval required: YES (approvalId)
- Org scope: claims.org must match orgId

3) `googleAds.addKeywords`
- Required role: org_admin or super_admin
- Approval required: YES (approvalId)
- Org scope: claims.org must match orgId

4) `googleAds.pauseCampaign`
- Required role: org_admin or super_admin
- Approval required: YES (approvalId)
- Org scope: claims.org must match orgId

5) `googleAds.getPolicyChecks`
- Required role: org_admin or super_admin
- Approval required: NO (read-only)
- Org scope: claims.org must match orgId

## MCP Analytics (Read-Only)
Read-only metrics tooling for GA4/Ads reporting.

Example request:
```json
{
  "toolId": "mcp-analytics",
  "orgId": "2marines",
  "input": {
    "action": "analytics.getAdsMetrics",
    "timeRange": "last_30_days"
  }
}
```

## Approval Guard (Gateway Pseudocode)
```ts
// Pseudocode only
if (!verifyFirebaseToken(authHeader)) reject();
requireRole(['org_admin', 'super_admin']);
requireOrg(claims.org, orgId);

if (isRegulatedTool(action) && isMutating(action)) {
  requireApproval(approvalId, orgId, status = 'APPROVED');
}

appendAuditLog({ orgId, uid, action, approvalId, status });
forwardToMcpService(toolId, payload);
```

## Security Notes
- No email-based authorization.
- No client-side token storage for Google Ads.
- All API calls are server-side only.
- Fail closed on missing/invalid/stale claims.
