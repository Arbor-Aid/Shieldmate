# Prints gcloud run deploy commands for each MCP service. DOES NOT EXECUTE.
$ErrorActionPreference = "Stop"

$project = "<PROJECT>"
$region  = "<REGION>"

$services = Get-ChildItem -Directory "mcp" | Where-Object { $_.Name -ne "common" -and (Test-Path (Join-Path $_.FullName "app.py")) }

foreach($s in $services){
  $name = $s.Name
  $image = "<IMAGE_URI_FOR_$name>"
  Write-Host "gcloud run deploy $name `"
  Write-Host "  --project $project `"
  Write-Host "  --region $region `"
  Write-Host "  --image $image `"
  Write-Host "  --port 8080 `"
  Write-Host "  --no-allow-unauthenticated `"
  Write-Host "  --timeout 300 `"
  Write-Host "  --concurrency 40 `"
  Write-Host "  --cpu 1 `"
  Write-Host "  --memory 512Mi `"
  Write-Host "  --min-instances 0 `"
  Write-Host "  --max-instances 3 `"
  Write-Host "  --set-secrets=SLACK_WEBHOOK_URL=slack-webhook:latest,FIREBASE_CREDENTIALS_JSON=firebase-creds:latest"
  Write-Host ""
}
