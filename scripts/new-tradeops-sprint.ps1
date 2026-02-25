# Creates TradeOps MCP structure + prints local run commands (NO deploy).
$ErrorActionPreference = "Stop"

Write-Host "[INFO] Ensuring folders..."
$dirs = @(
  "mcp/common","mcp/tradeops","mcp/tradefinance_lc","mcp/treasury","mcp/investment_recommendation","mcp/trade_execution_gateway","mcp/training_to_sop",
  "docs/tradeops","docs/tradeops/sops","scripts","src/types"
)
foreach($d in $dirs){ if(-not (Test-Path $d)){ New-Item -ItemType Directory -Path $d -Force | Out-Null } }
Write-Host "[OK] Folders ready."

Write-Host "`n[INFO] Local run commands (each service uses uvicorn on port you choose):"
Write-Host "  python -m venv .venv"
Write-Host "  .\.venv\Scripts\Activate.ps1"
Write-Host "  pip install -r mcp\tradeops\requirements.txt"
Write-Host "  uvicorn mcp.tradeops.app:app --host 0.0.0.0 --port 8010"
Write-Host "  uvicorn mcp.tradefinance_lc.app:app --host 0.0.0.0 --port 8011"
Write-Host "  uvicorn mcp.treasury.app:app --host 0.0.0.0 --port 8012"
Write-Host "  uvicorn mcp.investment_recommendation.app:app --host 0.0.0.0 --port 8013"
Write-Host "  uvicorn mcp.trade_execution_gateway.app:app --host 0.0.0.0 --port 8014"
Write-Host "  uvicorn mcp.training_to_sop.app:app --host 0.0.0.0 --port 8015"

Write-Host "`n[TODO] Cloud Run deploy steps:"
Write-Host "  1) Build + push images with scripts/build_push_mcps.ps1 (requires AR_PROJECT/AR_REPO)"
Write-Host "  2) Print deploy commands with scripts/print_gcloud_deploy_mcps.ps1"
Write-Host "  3) Configure Secret Manager for SLACK_WEBHOOK_URL + Firebase creds"
