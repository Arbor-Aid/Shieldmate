Param(
    [string]$RepoRoot = (Resolve-Path ".").Path,
    [string]$GatewayExecuteUrl = "http://localhost:8080/mcp/execute",
    [switch]$IncludeFunctional
)

$ErrorActionPreference = "Stop"

$bootstrapRoot = Join-Path $RepoRoot "platform_bootstrap"
$planPath = Join-Path $bootstrapRoot "shared/smoke_payloads/mass_smoke_plan.json"
if (-not (Test-Path $planPath)) {
    Write-Error "Missing smoke plan file: $planPath"
}

$plan = Get-Content $planPath -Raw | ConvertFrom-Json
$payloadPaths = @()
$payloadPaths += $plan.service_status_payloads
if ($IncludeFunctional) {
    foreach ($field in @("functional_orchestrator_payloads", "integration_readiness_payloads", "activation_payloads")) {
        if ($plan.PSObject.Properties.Name -contains $field) {
            $payloadPaths += $plan.$field
        }
    }
}

$token = $env:MCP_SMOKE_AUTH_TOKEN
$headers = @{
    "Content-Type" = "application/json"
}
if ($token) {
    $headers["Authorization"] = "Bearer $token"
}

$results = @()
foreach ($relPath in $payloadPaths) {
    $fullPath = Join-Path $RepoRoot $relPath
    if (-not (Test-Path $fullPath)) {
        $results += [PSCustomObject]@{
            payload = $relPath
            ok = $false
            status = "missing_payload_file"
            http_status = $null
        }
        continue
    }

    $raw = Get-Content $fullPath -Raw
    try {
        $resp = Invoke-WebRequest -Uri $GatewayExecuteUrl -Method Post -Headers $headers -Body $raw
        $results += [PSCustomObject]@{
            payload = $relPath
            ok = $true
            status = "sent"
            http_status = [int]$resp.StatusCode
        }
    } catch {
        $httpStatus = $null
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $httpStatus = [int]$_.Exception.Response.StatusCode
        }
        $results += [PSCustomObject]@{
            payload = $relPath
            ok = $false
            status = "failed"
            http_status = $httpStatus
        }
    }
}

$outDir = Join-Path $RepoRoot "scripts/out"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null
$stamp = (Get-Date).ToString("yyyyMMdd-HHmmss")
$outPath = Join-Path $outDir "mcp_mass_smoke_result_$stamp.json"
$results | ConvertTo-Json -Depth 5 | Set-Content -Path $outPath

$total = $results.Count
$okCount = ($results | Where-Object { $_.ok }).Count
$failCount = $total - $okCount

Write-Host "Mass smoke run completed"
Write-Host " - gateway_execute_url: $GatewayExecuteUrl"
Write-Host " - payload_total: $total"
Write-Host " - payload_ok: $okCount"
Write-Host " - payload_failed: $failCount"
Write-Host " - report: $outPath"
