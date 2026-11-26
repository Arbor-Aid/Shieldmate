Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
param(
  [string]$Region = "us-central1",
  [string]$Out = "scripts\out\mcp_health.md",
  [string]$Path = "/health"
)
function Info($m){ Write-Host "[INFO] $m" }
function Ok($m){ Write-Host "[OK] $m" }

$Project = (gcloud config get-value project 2>$null).Trim()
if(-not $Project){ throw "No GCP project set." }

$dir = Split-Path $Out -Parent
if($dir -and -not (Test-Path $dir)){ New-Item -ItemType Directory -Force -Path $dir | Out-Null }

$services = (gcloud run services list --region $Region --project $Project --format "value(metadata.name)") |
  Where-Object { $_ -and $_.Trim().Length -gt 0 }
if(-not $services){ throw "No services found in Cloud Run region=$Region" }

$ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# MCP Health Report")
$lines.Add("")
$lines.Add("- Project: $Project")
$lines.Add("- Region: $Region")
$lines.Add("- Timestamp: $ts")
$lines.Add("")
$lines.Add("| Service | URL | Status |")
$lines.Add("|---|---|---|")

foreach($svc in $services){
  $url = (gcloud run services describe $svc --region $Region --project $Project --format "value(status.url)").Trim()
  if(-not $url){ $lines.Add("| $svc |  | NO_URL |"); continue }
  $target = "$url$Path"
  try{
    $r = Invoke-WebRequest -Uri $target -Method GET -TimeoutSec 15
    $lines.Add("| $svc | $target | $($r.StatusCode) |")
    Ok "$svc $($r.StatusCode)"
  } catch {
    $lines.Add("| $svc | $target | FAIL |")
    Info "$svc FAIL"
  }
}
$lines | Set-Content -Path $Out -Encoding UTF8
Write-Host "[DONE] wrote $Out"
