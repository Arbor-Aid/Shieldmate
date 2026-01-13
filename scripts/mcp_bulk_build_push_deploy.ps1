param()

$ErrorActionPreference = "Stop"

function Invoke-External {
  param(
    [Parameter(Mandatory = $true)][string]$FilePath,
    [Parameter(Mandatory = $true)][string[]]$Arguments
  )
  $output = & $FilePath @Arguments 2>&1
  $exitCode = $LASTEXITCODE
  return [PSCustomObject]@{
    ExitCode = $exitCode
    Output = $output
  }
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outDir = Join-Path $PSScriptRoot "out"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$reportPath = Join-Path $outDir "mcp_deploy_report_$timestamp.md"

$project = $env:GCP_PROJECT_ID
if (-not $project) {
  $projectResult = Invoke-External "gcloud" @("config", "get-value", "project")
  if ($projectResult.ExitCode -eq 0) {
    $project = ($projectResult.Output | Select-Object -Last 1).Trim()
    if ($project -eq "(unset)" -or $project -eq "") {
      $project = $null
    }
  }
}

$region = if ($env:GCP_REGION) { $env:GCP_REGION } else { "us-central1" }
$repo = if ($env:AR_REPO) { $env:AR_REPO } else { "mcp" }
$tag = if ($env:MCP_TAG) { $env:MCP_TAG } else { "ops-2026-01-13" }

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$mcpRoot = Join-Path $repoRoot "mcp"

$services = @()
if (Test-Path $mcpRoot) {
  $services = Get-ChildItem -Path $mcpRoot -Directory |
    Where-Object { $_.Name -notin @('common', '__pycache__', '.venv') -and $_.Name -notmatch '^[\._]' } |
    Select-Object -ExpandProperty Name
}

$reportRows = @()

if (-not $project) {
  foreach ($service in $services) {
    $reportRows += [PSCustomObject]@{
      Service = $service
      Image = ""
      Url = ""
      BuildStatus = "skipped"
      PushStatus = "skipped"
      DeployStatus = "skipped"
      HealthStatus = "skipped"
      Notes = "missing GCP project id"
    }
  }
} else {
  $repoCheck = Invoke-External "gcloud" @("artifacts", "repositories", "describe", $repo, "--location", $region)
  if ($repoCheck.ExitCode -ne 0) {
    $repoCreate = Invoke-External "gcloud" @(
      "artifacts",
      "repositories",
      "create",
      $repo,
      "--repository-format=docker",
      "--location",
      $region
    )
  }

  $authResult = Invoke-External "gcloud" @("auth", "configure-docker", "$region-docker.pkg.dev", "--quiet")

  foreach ($service in $services) {
    $image = "$region-docker.pkg.dev/$project/$repo/${service}:$tag"
    $buildStatus = "skipped"
    $pushStatus = "skipped"
    $deployStatus = "skipped"
    $healthStatus = "skipped"
    $notes = @()
    $url = ""

    $buildResult = Invoke-External "docker" @(
      "build",
      "-f",
      "mcp/Dockerfile.mcp",
      "--build-arg",
      "SERVICE_PATH=$service/",
      "-t",
      $image,
      "mcp"
    )

    if ($buildResult.ExitCode -eq 0) {
      $buildStatus = "ok"
    } else {
      $buildStatus = "fail"
      $notes += "build failed"
    }

    if ($buildStatus -eq "ok") {
      $pushResult = Invoke-External "docker" @("push", $image)
      if ($pushResult.ExitCode -eq 0) {
        $pushStatus = "ok"
      } else {
        $pushStatus = "fail"
        $notes += "push failed"
      }
    }

    if ($pushStatus -eq "ok") {
      $serviceExists = $false
      $describeResult = Invoke-External "gcloud" @(
        "run",
        "services",
        "describe",
        $service,
        "--region",
        $region,
        "--format",
        "json"
      )
      if ($describeResult.ExitCode -eq 0) {
        $serviceExists = $true
      }

      $deployResult = Invoke-External "gcloud" @(
        "run",
        "deploy",
        $service,
        "--image",
        $image,
        "--region",
        $region,
        "--platform",
        "managed",
        "--port",
        "8080",
        "--no-allow-unauthenticated"
      )

      if ($deployResult.ExitCode -eq 0) {
        $deployStatus = "ok"
        if ($serviceExists) {
          $notes += "deployed with safe defaults"
        }
      } else {
        $deployStatus = "fail"
        $notes += "deploy failed"
      }
    }

    if ($deployStatus -eq "ok") {
      $urlResult = Invoke-External "gcloud" @(
        "run",
        "services",
        "describe",
        $service,
        "--region",
        $region,
        "--format",
        "value(status.url)"
      )
      if ($urlResult.ExitCode -eq 0) {
        $url = ($urlResult.Output | Select-Object -Last 1).Trim()
      }
    }

    if ($deployStatus -eq "ok" -and $url) {
      $healthStatus = "fail"
      try {
        $resp = Invoke-WebRequest -Uri "$url/health" -UseBasicParsing -TimeoutSec 15
        if ($resp.StatusCode -eq 200) {
          $healthStatus = "ok"
        } else {
          $healthStatus = "http_$($resp.StatusCode)"
        }
      } catch {
        $statusCode = $null
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
          $statusCode = [int]$_.Exception.Response.StatusCode
        }

        if ($statusCode -eq 401 -or $statusCode -eq 403) {
          $notes += "health check unauthorized; using proxy"
          $proxy = Start-Process -FilePath "gcloud" -ArgumentList @(
            "run",
            "services",
            "proxy",
            $service,
            "--region",
            $region,
            "--port",
            "8085"
          ) -PassThru -NoNewWindow

          try {
            Start-Sleep -Seconds 3
            $proxyResp = Invoke-WebRequest -Uri "http://127.0.0.1:8085/health" -UseBasicParsing -TimeoutSec 15
            if ($proxyResp.StatusCode -eq 200) {
              $healthStatus = "ok"
            } else {
              $healthStatus = "http_$($proxyResp.StatusCode)"
            }
          } catch {
            $healthStatus = "proxy_failed"
          } finally {
            if ($proxy -and -not $proxy.HasExited) {
              Stop-Process -Id $proxy.Id -Force
            }
          }
        } else {
          $healthStatus = "error"
        }
      }
    }

    $reportRows += [PSCustomObject]@{
      Service = $service
      Image = $image
      Url = $url
      BuildStatus = $buildStatus
      PushStatus = $pushStatus
      DeployStatus = $deployStatus
      HealthStatus = $healthStatus
      Notes = ($notes -join "; ")
    }
  }
}

$lines = @(
  "# MCP Bulk Deploy Report ($timestamp)",
  "",
  "| service | image | url | build_status | push_status | deploy_status | health_status | notes |",
  "| --- | --- | --- | --- | --- | --- | --- | --- |"
)

foreach ($row in $reportRows) {
  $lines += "| $($row.Service) | $($row.Image) | $($row.Url) | $($row.BuildStatus) | $($row.PushStatus) | $($row.DeployStatus) | $($row.HealthStatus) | $($row.Notes) |"
}

$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($reportPath, ($lines -join "`n"), $utf8)

Write-Host "Report written to: $reportPath"
