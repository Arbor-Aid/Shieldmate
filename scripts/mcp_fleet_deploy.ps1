$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
if ($PSVersionTable.PSVersion.Major -ge 7) { $PSNativeCommandUseErrorActionPreference = $false }

function Resolve-Gcloud {
  $cmd = Get-Command gcloud -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $candidates = @(
    "$env:LOCALAPPDATA\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd",
    "$env:ProgramFiles\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd",
    "$env:ProgramFiles(x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd"
  )
  foreach ($c in $candidates) {
    if ($c -and (Test-Path $c)) { return $c }
  }
  return $null
}

function Invoke-Gcloud {
  param(
    [Parameter(Mandatory = $true)][string]$Gcloud,
    [Parameter(Mandatory = $true)][string[]]$Args,
    [switch]$CaptureOutput
  )
  $old = $ErrorActionPreference
  $ErrorActionPreference = "SilentlyContinue"
  if ($CaptureOutput) {
    $output = & $Gcloud @Args 2>$null
  } else {
    & $Gcloud @Args 2>$null | Out-Null
    $output = $null
  }
  $ErrorActionPreference = $old
  return $output
}

function Write-ReportHeader([string]$Path, [string]$Project, [string]$Region, [string]$Repo, [string]$Tag, [string]$AuthMode) {
@"
# MCP Fleet Deploy Report
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Project: $Project
Region: $Region
Artifact Repo: $Repo
Tag: $Tag
AuthMode: $AuthMode

| Service | Path | Image | Build | Push | Deploy | URL | Health | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
"@ | Out-File -FilePath $Path -Encoding UTF8
}

function Append-ReportRow([string]$Path, [string]$Service, [string]$ServicePath, [string]$Image, [string]$Build, [string]$Push, [string]$Deploy, [string]$Url, [string]$Health, [string]$Notes) {
  ("| {0} | {1} | {2} | {3} | {4} | {5} | {6} | {7} | {8} |" -f `
    $Service, $ServicePath, $Image, $Build, $Push, $Deploy, $Url, $Health, $Notes) |
    Out-File -FilePath $Path -Append -Encoding UTF8
}

function Write-ReportSummary([string]$Path, [int]$Total, [int]$BuiltOk, [int]$PushedOk, [int]$DeployedOk, [int]$HealthyOk, [int]$Failed) {
@"

## Summary
- Total services: $Total
- Built OK: $BuiltOk
- Pushed OK: $PushedOk
- Deployed OK: $DeployedOk
- Healthy OK: $HealthyOk
- Failed: $Failed
"@ | Out-File -FilePath $Path -Append -Encoding UTF8
}

function Ensure-ArtifactRepo([string]$Gcloud, [string]$Project, [string]$Region, [string]$Repo) {
  Invoke-Gcloud -Gcloud $Gcloud -Args @("artifacts","repositories","describe",$Repo,"--location",$Region,"--project",$Project)
  if ($LASTEXITCODE -ne 0) {
    Invoke-Gcloud -Gcloud $Gcloud -Args @("artifacts","repositories","create",$Repo,"--repository-format=docker","--location",$Region,"--project",$Project)
    if ($LASTEXITCODE -ne 0) { throw "Failed to create Artifact Registry repo: $Repo" }
  }
}

function Configure-DockerAuth([string]$Gcloud, [string]$Region) {
  Invoke-Gcloud -Gcloud $Gcloud -Args @("auth","configure-docker","$Region-docker.pkg.dev","--quiet")
  if ($LASTEXITCODE -ne 0) { throw "Failed to configure docker auth for $Region-docker.pkg.dev" }
}

function Build-EnvVars([object]$Service, [string]$Tag) {
  $baseDescription = if ($Service.PSObject.Properties.Name -contains "description" -and $Service.description) {
    $Service.description
  } else {
    "$($Service.display_name) MCP service."
  }
  $map = @{
    "PORT" = "8080"
    "SERVICE_NAME" = $Service.display_name
    "SERVICE_SLUG" = $Service.slug
    "SERVICE_VERSION" = $Tag
    "SERVICE_DESCRIPTION" = $baseDescription
    "LOG_LEVEL" = "info"
    "GIT_SHA" = $Tag
    "K_REVISION" = "cloud-run"
  }
  $required = @()
  $reserved = @("PORT", "K_REVISION")
  if ($Service.PSObject.Properties.Name -contains "env_vars_required" -and $Service.env_vars_required) {
    $required = @($Service.env_vars_required)
  }
  if (-not $required -or $required.Count -eq 0) {
    $required = @($map.Keys)
  }
  $envPairs = @()
  $placeholders = New-Object System.Collections.Generic.List[string]
  $skipped = New-Object System.Collections.Generic.List[string]
  foreach ($name in $required) {
    if ($reserved -contains $name) {
      $skipped.Add($name) | Out-Null
      continue
    }
    if ($map.ContainsKey($name)) {
      $envPairs += "$name=$($map[$name])"
    } else {
      $envPairs += "$name=REQUIRED"
      $placeholders.Add($name) | Out-Null
    }
  }
  return [PSCustomObject]@{
    EnvString = ($envPairs -join ",")
    Placeholders = $placeholders
    Skipped = $skipped
  }
}

function Test-Health([string]$Url, [string]$Path, [int]$Attempts) {
  $healthUrl = "$Url$Path"
  $authBlocked = $false
  for ($i = 1; $i -le $Attempts; $i++) {
    try {
      $resp = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 15
      if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 300) { return "ok (direct)" }
    } catch {
      $statusCode = $null
      if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
        $statusCode = [int]$_.Exception.Response.StatusCode
      }
      if ($statusCode -eq 401 -or $statusCode -eq 403) {
        $authBlocked = $true
        break
      }
    }
    Start-Sleep -Seconds ([Math]::Min(15, 2 * $i))
  }
  return @{ Status = "fail (direct)"; AuthBlocked = $authBlocked }
}

function Test-Health-Auth([string]$Gcloud, [string]$Url, [string]$Path, [int]$Attempts) {
  $healthUrl = "$Url$Path"
  for ($i = 1; $i -le $Attempts; $i++) {
    $token = (Invoke-Gcloud -Gcloud $Gcloud -Args @("auth","print-identity-token") -CaptureOutput).Trim()
    if (-not $token) {
      Start-Sleep -Seconds ([Math]::Min(15, 2 * $i))
      continue
    }
    try {
      $resp = Invoke-WebRequest -Uri $healthUrl -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing -TimeoutSec 15
      if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 300) { return "ok (auth)" }
    } catch {
      # retry
    }
    Start-Sleep -Seconds ([Math]::Min(15, 2 * $i))
  }
  return "fail (auth)"
}

function Test-Health-Proxy([string]$Gcloud, [string]$ServiceName, [string]$Project, [string]$Region, [string]$Path, [int]$Attempts) {
  $port = 8085
  $job = Start-Job -ScriptBlock {
    param($gc, $svc, $proj, $reg, $p)
    $ErrorActionPreference = "SilentlyContinue"
    & $gc run services proxy $svc --project $proj --region $reg --port $p 2>$null | Out-Null
  } -ArgumentList $Gcloud, $ServiceName, $Project, $Region, $port

  Start-Sleep -Seconds 3
  $healthUrl = "http://127.0.0.1:$port$Path"
  try {
    for ($i = 1; $i -le $Attempts; $i++) {
      try {
        $resp = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 15
        if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 300) { return "ok (proxy)" }
      } catch {
        # retry
      }
      Start-Sleep -Seconds ([Math]::Min(15, 2 * $i))
    }
    return "fail (proxy)"
  } finally {
    Stop-Job -Job $job -ErrorAction SilentlyContinue | Out-Null
    Remove-Job -Job $job -ErrorAction SilentlyContinue | Out-Null
  }
}

# -------------------------
# MAIN
# -------------------------
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$Tag = if ($env:MCP_TAG) { $env:MCP_TAG } else { "ops-" + (Get-Date -Format "yyyyMMdd-HHmmss") }
$Region = if ($env:GCP_REGION) { $env:GCP_REGION } else { "us-central1" }
$Repo = if ($env:AR_REPO) { $env:AR_REPO } else { "mcp" }
$AuthMode = if ($env:CLOUD_RUN_AUTH) { $env:CLOUD_RUN_AUTH } else { "iam" }

$RepoRoot = (git rev-parse --show-toplevel 2>$null).Trim()
if (-not $RepoRoot) {
  $RepoRoot = Split-Path -Parent $PSScriptRoot
}

$OutDir = Join-Path $RepoRoot "scripts\\out"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$Report = Join-Path $OutDir ("mcp_deploy_report_" + $Timestamp + ".md")

Write-ReportHeader -Path $Report -Project "unknown" -Region $Region -Repo $Repo -Tag $Tag -AuthMode $AuthMode

$BuiltOk = 0
$PushedOk = 0
$DeployedOk = 0
$HealthyOk = 0
$Failed = 0
$Total = 0

try {
  $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
  if (-not $dockerCmd) { throw "docker not found in PATH." }
  try { docker info *> $null } catch { throw "Docker engine not running." }

  $gcloud = Resolve-Gcloud
  if (-not $gcloud) { throw "gcloud not found in PATH or standard install locations." }
  $gcloudDir = Split-Path -Parent $gcloud
  if ($gcloudDir -and ($env:Path -notlike "*$gcloudDir*")) {
    $env:Path = "$gcloudDir;$env:Path"
  }

  Invoke-Gcloud -Gcloud $gcloud -Args @("auth","list","--filter=status:ACTIVE","--format=value(account)")
  if ($LASTEXITCODE -ne 0) { throw "No active gcloud auth. Run: gcloud auth login" }

  $Project = if ($env:GCP_PROJECT_ID) { $env:GCP_PROJECT_ID } else { (Invoke-Gcloud -Gcloud $gcloud -Args @("config","get-value","project") -CaptureOutput).Trim() }
  if (-not $Project) { throw "GCP project not set. Set GCP_PROJECT_ID or run: gcloud config set project <PROJECT_ID>" }

  Write-ReportHeader -Path $Report -Project $Project -Region $Region -Repo $Repo -Tag $Tag -AuthMode $AuthMode

  $IndexPath = Join-Path $RepoRoot "ops\\mcp_service_index.json"
  if (-not (Test-Path $IndexPath)) { throw "Missing service index: $IndexPath" }
  $services = Get-Content -Raw $IndexPath | ConvertFrom-Json
  $services = @($services)
  if (-not $services -or $services.Count -eq 0) { throw "Service index is empty: $IndexPath" }
  if ($services[0].image -and ($services[0].image -match ":([^:/]+)$")) {
    $Tag = $Matches[1]
    Write-ReportHeader -Path $Report -Project $Project -Region $Region -Repo $Repo -Tag $Tag -AuthMode $AuthMode
  }

  $Dockerfile = Join-Path $RepoRoot "mcp\\Dockerfile.mcp"
  if (-not (Test-Path $Dockerfile)) { throw "Missing shared Dockerfile: $Dockerfile" }
  $McpRoot = Join-Path $RepoRoot "mcp"
  if (-not (Test-Path $McpRoot)) { throw "Missing MCP root folder: $McpRoot" }

  Ensure-ArtifactRepo -Gcloud $gcloud -Project $Project -Region $Region -Repo $Repo
  Configure-DockerAuth -Gcloud $gcloud -Region $Region

  foreach ($svc in $services) {
    $Total++
    $svcName = $svc.display_name
    $svcSlug = $svc.slug
    $relPath = $svc.rel_path
    if (-not $relPath) { $relPath = $svcSlug }
    $servicePath = $relPath.Trim()
    $servicePath = ($servicePath -replace "^[./\\\\]+", "").Replace("\\", "/")
    if ($servicePath.StartsWith("mcp/")) { $servicePath = $servicePath.Substring(4) }
    if (-not $servicePath.EndsWith("/")) { $servicePath += "/" }

    $image = if ($svc.image) { $svc.image } else { "$Region-docker.pkg.dev/$Project/$Repo/${svcSlug}:$Tag" }
    $cloudRunName = if ($svc.cloud_run_service_name) { $svc.cloud_run_service_name } else { $svcSlug }
    $healthPath = if ($svc.health_path) { $svc.health_path } else { "/health" }

    $buildStatus = "skip"
    $pushStatus = "skip"
    $deployStatus = "skip"
    $healthStatus = "skip"
    $notes = ""
    $url = ""

    $svcFolder = Join-Path $McpRoot ($servicePath.Replace("/", "\\"))
    if (-not (Test-Path $svcFolder)) {
      $notes = "Service path missing under mcp/: $servicePath"
      $Failed++
      Append-ReportRow -Path $Report -Service $svcName -ServicePath $servicePath -Image $image -Build $buildStatus -Push $pushStatus -Deploy $deployStatus -Url $url -Health $healthStatus -Notes $notes
      continue
    }

    docker build -f $Dockerfile --build-arg SERVICE_PATH="$servicePath" -t $image $McpRoot
    if ($LASTEXITCODE -eq 0) {
      $buildStatus = "ok"
      $BuiltOk++
    } else {
      $buildStatus = "fail"
      $Failed++
      $notes = "docker build failed"
    }

    if ($buildStatus -eq "ok") {
      docker push $image
      if ($LASTEXITCODE -eq 0) {
        $pushStatus = "ok"
        $PushedOk++
      } else {
        $pushStatus = "fail"
        $Failed++
        $notes = "docker push failed"
      }
    }

    if ($pushStatus -eq "ok") {
      $envData = Build-EnvVars -Service $svc -Tag $Tag
      $envString = if ($envData.EnvString) { $envData.EnvString } else { "PORT=8080" }
      if ($envData.Placeholders.Count -gt 0) {
        $notes = ($notes + " placeholders: " + ($envData.Placeholders -join ",")).Trim()
      }
      if ($envData.Skipped.Count -gt 0) {
        $notes = ($notes + " reserved env vars skipped: " + ($envData.Skipped -join ",")).Trim()
      }
      $authFlag = if ($AuthMode -eq "public") { "--allow-unauthenticated" } else { "--no-allow-unauthenticated" }
      Invoke-Gcloud -Gcloud $gcloud -Args @(
        "run","deploy",$cloudRunName,
        "--image",$image,
        "--project",$Project,
        "--region",$Region,
        "--platform","managed",
        "--port","8080",
        "--set-env-vars",$envString,
        $authFlag,
        "--quiet"
      )
      if ($LASTEXITCODE -eq 0) {
        $deployStatus = "ok"
        $DeployedOk++
      } else {
        $deployStatus = "fail"
        $Failed++
        if (-not $notes) { $notes = "cloud run deploy failed" }
      }
    }

    if ($deployStatus -eq "ok") {
      $url = (Invoke-Gcloud -Gcloud $gcloud -Args @("run","services","describe",$cloudRunName,"--project",$Project,"--region",$Region,"--format=value(status.url)") -CaptureOutput).Trim()
      if (-not $url) {
        $healthStatus = "skip"
        $notes = ($notes + " no url").Trim()
      } else {
        $directResult = Test-Health -Url $url -Path $healthPath -Attempts 10
        if ($directResult -is [string] -and $directResult -like "ok*") {
          $healthStatus = $directResult
          $HealthyOk++
        } else {
          $authBlocked = $false
          if ($directResult -is [hashtable] -and $directResult.AuthBlocked) { $authBlocked = $true }
          if ($authBlocked) {
            $healthStatus = Test-Health-Auth -Gcloud $gcloud -Url $url -Path $healthPath -Attempts 10
            if ($healthStatus -like "ok*") { $HealthyOk++ } else { $Failed++ }
          } else {
            $healthStatus = "fail (direct)"
            $Failed++
          }
        }
      }
    }

    Append-ReportRow -Path $Report -Service $svcName -ServicePath $servicePath -Image $image -Build $buildStatus -Push $pushStatus -Deploy $deployStatus -Url $url -Health $healthStatus -Notes $notes.Trim()
  }
} catch {
  $Failed++
  Append-ReportRow -Path $Report -Service "preflight" -ServicePath "-" -Image "-" -Build "fail" -Push "skip" -Deploy "skip" -Url "-" -Health "-" -Notes $_.Exception.Message
} finally {
  Write-ReportSummary -Path $Report -Total $Total -BuiltOk $BuiltOk -PushedOk $PushedOk -DeployedOk $DeployedOk -HealthyOk $HealthyOk -Failed $Failed
  Write-Host "DONE. Report: $Report"
}
