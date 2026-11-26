# ShieldMate operational script guardrails:
# - Do not log secrets; token env vars may be checked for presence only.
# - Do not deploy, push, commit, or mutate Firebase from this script.
# - Keep generated reports free of token values and private file contents.
Param(
    [string]$RepoRoot,
    [string]$MachineName = [Environment]::MachineName
)

$ErrorActionPreference = "Continue"

if (-not $RepoRoot) {
    $RepoRoot = if ($env:SHIELDMATE_REPO_PATH) { $env:SHIELDMATE_REPO_PATH } else { "D:\2marines\Shieldmate" }
}

$commonPath = Join-Path $RepoRoot "scripts\onboarding\msi\MSI_Onboarding_Common.ps1"
. $commonPath

$repo = Resolve-MsiRepoRoot -RepoRoot $RepoRoot
$os = Get-CimInstance Win32_OperatingSystem
$tools = foreach ($tool in @("git", "node", "npm", "firebase", "gcloud", "docker", "java", "flutter", "dart")) {
    Test-MsiCommand -Name $tool
}

$gitSummary = $null
try {
    $gitSummary = Get-MsiGitSummary -RepoRoot $repo
} catch {
    $gitSummary = [PSCustomObject]@{
        branch = $null
        commit = $null
        status = "git summary unavailable: $($_.Exception.Message)"
    }
}

$bootstrapStatus = [PSCustomObject]@{
    ok = $false
    package_count = $null
    service_dir_count = $null
    status_payload_count = $null
    message = $null
}

try {
    $mcpDirs = @(Get-ChildItem -LiteralPath (Join-Path $repo "mcp") -Directory | Where-Object { $_.Name -notin @("common", "mcp-gateway") })
    $packages = @(Get-ChildItem -LiteralPath (Join-Path $repo "platform_bootstrap\mcps") -Directory | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName "bootstrap_package.json") })
    $payloads = @(Get-ChildItem -LiteralPath (Join-Path $repo "platform_bootstrap\shared\smoke_payloads\services") -File -Filter "*.status.request.json")
    $bootstrapStatus = [PSCustomObject]@{
        ok = (($mcpDirs.Count -eq 34) -and ($packages.Count -eq 34) -and ($payloads.Count -eq 34))
        package_count = $packages.Count
        service_dir_count = $mcpDirs.Count
        status_payload_count = $payloads.Count
        message = "MCP structural counts captured."
    }
} catch {
    $bootstrapStatus.message = $_.Exception.Message
}

$output = [PSCustomObject]@{
    timestamp = (Get-Date).ToUniversalTime().ToString("o")
    machine_name = $MachineName
    os = [PSCustomObject]@{
        caption = $os.Caption
        version = $os.Version
        architecture = $os.OSArchitecture
    }
    repo_root = $repo
    branch = $gitSummary.branch
    commit = $gitSummary.commit
    dirty_status = $gitSummary.status
    tools = $tools
    mcp_bootstrap = $bootstrapStatus
    secrets_captured = $false
    env_file_contents_captured = $false
}

$outDir = Join-Path $repo "docs\ops\monitoring"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null
$outPath = Join-Path $outDir "machine-health-$MachineName.json"
$historyStamp = Get-Date -Format "yyyyMMdd-HHmmss"
$historyPath = Join-Path $outDir "machine-health-$MachineName-$historyStamp.json"
$output | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $outPath -Encoding UTF8
$output | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $historyPath -Encoding UTF8
Write-Host "machine_health_report: $outPath"
Write-Host "machine_health_history: $historyPath"
