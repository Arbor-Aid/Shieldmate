# =========================
# MCP BULK DOCKER + GCP DEPLOY (CSV-DRIVEN)
# =========================
# Run in PowerShell (Admin). Verify elevation:
#   net session
#
# CSV path provided by Josh:
$CsvPath = "D:\shieldmatessd\Shieldmate_RECLONE\mcp_services.csv"

# --- Defaults (override by setting env vars before running) ---
$Region = if ($env:GCP_REGION) { $env:GCP_REGION } else { "us-central1" }
$Repo   = if ($env:AR_REPO) { $env:AR_REPO } else { "mcp" }
$Tag    = if ($env:MCP_TAG) { $env:MCP_TAG } else { ("ops-" + (Get-Date -Format "yyyyMMdd-HHmmss")) }

# Deploy auth mode: set to "public" if you want --allow-unauthenticated
$AuthMode = if ($env:CLOUD_RUN_AUTH) { $env:CLOUD_RUN_AUTH } else { "iam" }  # iam|public

# Health endpoint:
$HealthPath = "/health"

# Where the repo root is assumed (run this from repo root in VS Code terminal ideally)
$RepoRoot = (git rev-parse --show-toplevel 2>$null)
if (-not $RepoRoot) { throw "Not inside a git repo. cd into the ShieldMate repo root and rerun." }
$RepoRoot = $RepoRoot.Trim()

# Shared Dockerfile path
$Dockerfile = Join-Path $RepoRoot "mcp\Dockerfile.mcp"
if (-not (Test-Path $Dockerfile)) { throw "Missing shared Dockerfile: $Dockerfile" }

# MCP root folder used by the shared Dockerfile build context
$McpRoot = Join-Path $RepoRoot "mcp"
if (-not (Test-Path $McpRoot)) { throw "Missing MCP root folder: $McpRoot" }

# Output report
$OutDir = Join-Path $RepoRoot "scripts\out"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$Report = Join-Path $OutDir ("mcp_deploy_report_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".md")

function Assert-Tool([string]$Name) {
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) { throw "Required tool not found in PATH: $Name. Install it and reopen terminal." }
}

function Get-GcpProject {
  if ($env:GCP_PROJECT_ID) { return $env:GCP_PROJECT_ID }
  $p = (gcloud config get-value project 2>$null)
  if (-not $p) { throw "GCP project not set. Set `$env:GCP_PROJECT_ID or run: gcloud config set project <PROJECT_ID>" }
  return $p.Trim()
}

function Ensure-ArtifactRepo([string]$Project, [string]$Region, [string]$Repo) {
  $exists = $true
  gcloud artifacts repositories describe $Repo --location $Region --project $Project *> $null
  if ($LASTEXITCODE -ne 0) { $exists = $false }
  if (-not $exists) {
    Write-Host "Creating Artifact Registry repo $Repo in $Region..."
    gcloud artifacts repositories create $Repo --repository-format=docker --location $Region --project $Project
    if ($LASTEXITCODE -ne 0) { throw "Failed to create Artifact Registry repo: $Repo" }
  }
}

function Configure-DockerAuth([string]$Region) {
  Write-Host "Configuring Docker auth for Artifact Registry..."
  gcloud auth configure-docker "$Region-docker.pkg.dev" --quiet
  if ($LASTEXITCODE -ne 0) { throw "Failed to configure docker auth for $Region-docker.pkg.dev" }
}

function Read-McpCsv([string]$Path) {
  if (-not (Test-Path $Path)) { throw "CSV not found: $Path" }
  $rows = Import-Csv $Path
  if (-not $rows -or $rows.Count -eq 0) { throw "CSV is empty: $Path" }

  # Expected columns (flexible): service, name, service_name, folder, path, service_path
  # Normalize each row to: ServiceName + ServicePath (relative to mcp/)
  $norm = @()
  foreach ($r in $rows) {
    $svc = $r.service_name
    if (-not $svc) { $svc = $r.service }
    if (-not $svc) { $svc = $r.name }
    if (-not $svc) { throw "CSV row missing service name column (service_name/service/name)." }

    $p = $r.service_path
    if (-not $p) { $p = $r.path }
    if (-not $p) { $p = $r.folder }

    # If service_path is not provided, assume folder matches service name
    if (-not $p) { $p = $svc }

    # Normalize to a path relative to mcp root (Dockerfile expects SERVICE_PATH like "svc/")
    $p = $p.Trim().TrimStart("\").TrimStart("/").Replace("\","/")

    # If the CSV provided an absolute path, try to convert it to mcp-relative
    if ($p -match "^[A-Za-z]:\\") {
      # Absolute windows path; attempt strip "$RepoRoot\mcp\"
      $mcpPrefix = (Join-Path $RepoRoot "mcp\")  # note trailing slash
      if ($p.StartsWith($mcpPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        $p = $p.Substring($mcpPrefix.Length).Replace("\","/")
      } else {
        throw "CSV path looks absolute but not under repo mcp/: $($r.service_path)"
      }
    }

    # Ensure trailing slash for Dockerfile build-arg usage
    if (-not $p.EndsWith("/")) { $p = $p + "/" }

    $norm += [PSCustomObject]@{
      ServiceName = $svc.Trim()
      ServicePath = $p
    }
  }
  return $norm
}

function Deploy-CloudRun([string]$ServiceName, [string]$Image, [string]$Project, [string]$Region, [string]$AuthMode) {
  $authFlag = if ($AuthMode -eq "public") { "--allow-unauthenticated" } else { "--no-allow-unauthenticated" }
  gcloud run deploy $ServiceName `
    --image $Image `
    --project $Project `
    --region $Region `
    --platform managed `
    --port 8080 `
    $authFlag `
    --quiet
  return $LASTEXITCODE
}

function Get-CloudRunUrl([string]$ServiceName, [string]$Project, [string]$Region) {
  $url = gcloud run services describe $ServiceName --project $Project --region $Region --format "value(status.url)" 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $url) { return "" }
  return $url.Trim()
}

function Health-Check([string]$ServiceName, [string]$Url, [string]$Project, [string]$Region, [string]$HealthPath) {
  # Try direct first
  try {
    $resp = Invoke-WebRequest -Uri ($Url + $HealthPath) -UseBasicParsing -TimeoutSec 15
    if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 300) { return "ok (direct)" }
  } catch {
    # likely auth blocked or networking
  }

  # Proxy fallback (works for IAM-only)
  $port = 8085
  $job = Start-Job -ScriptBlock {
    param($svc,$proj,$reg,$p)
    gcloud run services proxy $svc --project $proj --region $reg --port $p | Out-Null
  } -ArgumentList $ServiceName,$Project,$Region,$port

  Start-Sleep -Seconds 3
  try {
    $resp2 = Invoke-WebRequest -Uri ("http://127.0.0.1:$port$HealthPath") -UseBasicParsing -TimeoutSec 15
    if ($resp2.StatusCode -ge 200 -and $resp2.StatusCode -lt 300) { return "ok (proxy)" }
    return "fail (proxy status $($resp2.StatusCode))"
  } catch {
    return "fail (proxy)"
  } finally {
    Stop-Job $job -Force -ErrorAction SilentlyContinue | Out-Null
    Remove-Job $job -Force -ErrorAction SilentlyContinue | Out-Null
  }
}

# -------------------------
# MAIN
# -------------------------
Assert-Tool docker
Assert-Tool gcloud
Assert-Tool git

# Basic auth sanity
Write-Host "Checking gcloud auth..."
gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "No active gcloud auth detected. Run: gcloud auth login ; gcloud auth application-default login"
  throw "Authenticate gcloud then rerun."
}

$Project = Get-GcpProject

Ensure-ArtifactRepo -Project $Project -Region $Region -Repo $Repo
Configure-DockerAuth -Region $Region

$services = Read-McpCsv -Path $CsvPath
Write-Host ("Loaded {0} services from CSV." -f $services.Count)

# Report header
@"
# MCP Bulk Docker + Cloud Run Deploy Report
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Project: $Project
Region: $Region
Artifact Repo: $Repo
Tag: $Tag
AuthMode: $AuthMode

| Service | ServicePath | Image | Build | Push | Deploy | URL | Health | Notes |
|---|---|---|---|---|---|---|---|---|
"@ | Out-File -FilePath $Report -Encoding UTF8

$builtOk=0; $pushedOk=0; $deployedOk=0; $healthyOk=0; $failed=0

foreach ($s in $services) {
  $svc = $s.ServiceName
  $svcPath = $s.ServicePath

  $img = "$Region-docker.pkg.dev/$Project/$Repo/${svc}:$Tag"

  $buildStatus=""; $pushStatus=""; $deployStatus=""; $url=""; $health=""; $notes=""

  # Validate service folder exists
  $svcFolder = Join-Path $McpRoot ($svcPath.Replace("/","\"))
  if (-not (Test-Path $svcFolder)) {
    $buildStatus="skip"; $pushStatus="skip"; $deployStatus="skip"
    $health="skip"
    $notes="Service path missing under mcp/: $svcPath"
    $failed++
  } else {
    Write-Host "=== $svc ($svcPath) ==="
    Write-Host "Building: $img"

    docker build -f $Dockerfile --build-arg SERVICE_PATH="$svcPath" -t $img $McpRoot
    if ($LASTEXITCODE -eq 0) { $buildStatus="ok"; $builtOk++ } else { $buildStatus="fail"; $failed++; $notes="docker build failed" }

    if ($buildStatus -eq "ok") {
      docker push $img
      if ($LASTEXITCODE -eq 0) { $pushStatus="ok"; $pushedOk++ } else { $pushStatus="fail"; $failed++; $notes="docker push failed" }
    } else {
      $pushStatus="skip"
    }

    if ($pushStatus -eq "ok") {
      Write-Host "Deploying to Cloud Run: $svc"
      $rc = Deploy-CloudRun -ServiceName $svc -Image $img -Project $Project -Region $Region -AuthMode $AuthMode
      if ($rc -eq 0) { $deployStatus="ok"; $deployedOk++ } else { $deployStatus="fail"; $failed++; $notes="cloud run deploy failed" }

      if ($deployStatus -eq "ok") {
        $url = Get-CloudRunUrl -ServiceName $svc -Project $Project -Region $Region
        if (-not $url) { $notes = ($notes + " no url") }
        else {
          $health = Health-Check -ServiceName $svc -Url $url -Project $Project -Region $Region -HealthPath $HealthPath
          if ($health -like "ok*") { $healthyOk++ } else { $failed++ }
        }
      } else {
        $health="skip"
      }
    } else {
      $deployStatus="skip"
      $health="skip"
    }
  }

  # write row
  ("| {0} | {1} | {2} | {3} | {4} | {5} | {6} | {7} | {8} |" -f `
    $svc, $svcPath, $img, $buildStatus, $pushStatus, $deployStatus, $url, $health, $notes.Trim()) |
    Out-File -FilePath $Report -Append -Encoding UTF8
}

# Summary footer
@"

## Summary
- Total services: $($services.Count)
- Built OK: $builtOk
- Pushed OK: $pushedOk
- Deployed OK: $deployedOk
- Healthy OK: $healthyOk
- Failed: $failed

Report file: $Report
"@ | Out-File -FilePath $Report -Append -Encoding UTF8

Write-Host "DONE. Report: $Report"
