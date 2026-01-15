Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
param(
  [string]$Region = "us-central1",
  [string]$Repo   = "mcp",
  [string]$Tag    = "git",
  [string]$Project = "",
  [switch]$AllowUnauthenticated
)
function Info($m){ Write-Host "[INFO] $m" }
function Ok($m){ Write-Host "[OK] $m" }

$RepoRoot = (git rev-parse --show-toplevel).Trim()
if(-not $RepoRoot){ throw "Not in a git repo." }

if(-not $Project){ $Project = (gcloud config get-value project 2>$null).Trim() }
if(-not $Project){ throw "No GCP project set." }

$Sha = (git rev-parse --short HEAD).Trim()
if($Tag -eq "git"){ $Tag = $Sha }

$McpRoot = Join-Path $RepoRoot "mcp"
if(-not (Test-Path $McpRoot)){ throw "Missing mcp folder at $McpRoot" }

$svcDirs = Get-ChildItem -Path $McpRoot -Directory | Where-Object {
  $_.Name -notin @("common","__pycache__") -and
  (Test-Path (Join-Path $_.FullName "requirements.txt") -or Test-Path (Join-Path $_.FullName "Dockerfile"))
}
if($svcDirs.Count -eq 0){ throw "No MCP services found under $McpRoot" }

Info "Deploying $($svcDirs.Count) services (region=$Region tag=$Tag)"

foreach($d in $svcDirs){
  $svc = $d.Name
  $img = "$Region-docker.pkg.dev/$Project/$Repo/$svc`:$Tag"

  $args = @(
    "run","deploy",$svc,
    "--image",$img,
    "--region",$Region,
    "--project",$Project,
    "--platform","managed",
    "--port","8080",
    "--quiet"
  )
  if($AllowUnauthenticated){ $args += "--allow-unauthenticated" }
  else { $args += "--no-allow-unauthenticated" }

  Info "DEPLOY $svc"
  gcloud @args | Out-Null
  Ok "$svc deployed"
}
Write-Host "[DONE] deploy"
