# ShieldMate operational script guardrails:
# - Do not log secrets; token env vars may be checked for presence only.
# - Do not deploy, push, commit, or mutate Firebase from this script.
# - Keep generated reports free of token values and private file contents.
Param(
    [string]$RepoRoot
)

$ErrorActionPreference = "Continue"
. "$PSScriptRoot\MSI_Onboarding_Common.ps1"

$repo = Resolve-MsiRepoRoot -RepoRoot $RepoRoot
$log = New-MsiOnboardingLog -RepoRoot $repo -Name "99_Post_Setup_Verification_MSI"

function Run-Step {
    param(
        [string]$Name,
        [scriptblock]$Command
    )

    Write-MsiLog -Path $log -Message "running: $Name"
    try {
        $global:LASTEXITCODE = 0
        $output = & $Command 2>&1
        $success = $?
        $nativeCode = if ($LASTEXITCODE -is [int]) { $LASTEXITCODE } else { 0 }
        $code = if ($success) { $nativeCode } elseif ($nativeCode -eq 0) { 1 } else { $nativeCode }
        foreach ($line in $output) {
            Write-MsiLog -Path $log -Message "  $line"
        }
        [PSCustomObject]@{
            name = $Name
            ok = ($code -eq 0)
            exitCode = $code
            output = ($output -join [Environment]::NewLine)
        }
    } catch {
        Write-MsiLog -Path $log -Message "  ERROR: $($_.Exception.Message)"
        [PSCustomObject]@{
            name = $Name
            ok = $false
            exitCode = 1
            output = $_.Exception.Message
        }
    }
}

Write-MsiLog -Path $log -Message "ShieldMate MSI post-setup verification started."
Write-MsiLog -Path $log -Message "repo_path: $repo"

$results = @()
Push-Location $repo
try {
    $git = Get-MsiGitExe
    $results += Run-Step -Name "git status --short --branch" -Command { & $git status --short --branch }
    $results += Run-Step -Name "npm --prefix frontend/web run check" -Command { npm --prefix frontend/web run check }
    $results += Run-Step -Name "npm --prefix functions run lint" -Command { npm --prefix functions run lint }
    $results += Run-Step -Name "mcp_bootstrap_rehydrate" -Command { powershell -ExecutionPolicy Bypass -File scripts\mcp_bootstrap_rehydrate.ps1 }

    $massSmokeConfigured = ($env:MCP_GATEWAY_EXECUTE_URL -and $env:MCP_SMOKE_AUTH_TOKEN)
    if ($massSmokeConfigured) {
        $gatewayUrl = $env:MCP_GATEWAY_EXECUTE_URL
        $results += Run-Step -Name "mcp_mass_smoke_from_bootstrap" -Command {
            powershell -ExecutionPolicy Bypass -File scripts\mcp_mass_smoke_from_bootstrap.ps1 -GatewayExecuteUrl $gatewayUrl
        }
    } else {
        Write-MsiLog -Path $log -Message "optional_mass_smoke: skipped, MCP_GATEWAY_EXECUTE_URL and MCP_SMOKE_AUTH_TOKEN are not both configured"
    }

    $summary = Get-MsiGitSummary -RepoRoot $repo
    $dirtyFiles = @(($summary.status -split [Environment]::NewLine) | Where-Object { $_.Trim() -and $_ -notmatch "^##" })
    $toolchainPath = Join-Path $repo "docs\ops\logs\msi-onboarding\toolchain-status-latest.json"
    $toolchainStatus = if (Test-Path -LiteralPath $toolchainPath) { Get-Content -LiteralPath $toolchainPath -Raw | ConvertFrom-Json } else { $null }
    $bootstrapResult = $results | Where-Object { $_.name -eq "mcp_bootstrap_rehydrate" } | Select-Object -First 1

    $report = [PSCustomObject]@{
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        path = $repo
        branch = $summary.branch
        commit = $summary.commit
        dirty_files_preserved = $dirtyFiles
        toolchain_status = $toolchainStatus
        mcp_bootstrap_status = if ($bootstrapResult -and $bootstrapResult.ok) { "passed" } else { "failed_or_not_run" }
        checks = $results
        next_action = if (@($results | Where-Object { -not $_.ok }).Count -eq 0) { "Run 30_Canon_Docs_Update_MSI.ps1 if toolchain verification marker exists." } else { "Install missing toolchain items, rerun 20_Toolchain_Verify_MSI.ps1, then rerun 99_Post_Setup_Verification_MSI.ps1." }
    }

    $reportPath = Join-Path $repo "docs\ops\logs\msi-onboarding\post-setup-summary-latest.json"
    ConvertTo-MsiJsonFile -InputObject $report -Path $reportPath
    Write-MsiLog -Path $log -Message "summary_json: $reportPath"
} finally {
    Pop-Location
}

$failed = @($results | Where-Object { -not $_.ok })
if ($failed.Count -gt 0) {
    Write-MsiLog -Path $log -Message "ShieldMate MSI post-setup verification FAILED."
    exit 1
}

Write-MsiLog -Path $log -Message "ShieldMate MSI post-setup verification completed."
exit 0
