# ShieldMate operational script guardrails:
# - Do not log secrets; token env vars may be checked for presence only.
# - Do not deploy, push, commit, or mutate Firebase from this script.
# - Keep generated reports free of token values and private file contents.
Param(
    [string]$RepoRoot
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\MSI_Onboarding_Common.ps1"

$repo = Resolve-MsiRepoRoot -RepoRoot $RepoRoot
$log = New-MsiOnboardingLog -RepoRoot $repo -Name "00_Preflight_MSI"

Write-MsiLog -Path $log -Message "ShieldMate MSI preflight started."
Write-MsiLog -Path $log -Message "repo_path: $repo"

$os = Get-CimInstance Win32_OperatingSystem
$machine = [Environment]::MachineName
$arch = $os.OSArchitecture

Write-MsiLog -Path $log -Message "machine_name: $machine"
Write-MsiLog -Path $log -Message "os_version: $($os.Version)"
Write-MsiLog -Path $log -Message "architecture: $arch"

$gitExe = Get-MsiGitExe
if ($gitExe) {
    Write-MsiLog -Path $log -Message "git_executable: $gitExe"
    Push-Location $repo
    try {
        $gitSummary = Get-MsiGitSummary -RepoRoot $repo
        Write-MsiLog -Path $log -Message "branch: $($gitSummary.branch)"
        Write-MsiLog -Path $log -Message "commit: $($gitSummary.commit)"
        Write-MsiLog -Path $log -Message "git_status:"
        foreach ($line in ($gitSummary.status -split [Environment]::NewLine)) {
            if ($line.Trim()) {
                Write-MsiLog -Path $log -Message "  $line"
            }
        }
    } finally {
        Pop-Location
    }
} else {
    Write-MsiLog -Path $log -Message "git_executable: MISSING"
}

$toolNames = @("git", "node", "npm", "firebase", "gcloud", "docker", "java", "flutter", "dart")
$toolStatus = foreach ($tool in $toolNames) { Test-MsiCommand -Name $tool }

Write-MsiLog -Path $log -Message "path_tool_availability:"
foreach ($tool in $toolStatus) {
    $state = if ($tool.available) { "FOUND" } else { "MISSING" }
    $source = if ($tool.source) { $tool.source } else { "" }
    Write-MsiLog -Path $log -Message "  $($tool.name): $state $source"
}

$summaryPath = Join-Path $repo "docs\ops\logs\msi-onboarding\preflight-latest.json"
ConvertTo-MsiJsonFile -InputObject ([PSCustomObject]@{
    timestamp = (Get-Date).ToUniversalTime().ToString("o")
    machine_name = $machine
    os_version = $os.Version
    architecture = $arch
    repo_path = $repo
    git_executable = $gitExe
    git = if ($gitExe) { $gitSummary } else { $null }
    path_tools = $toolStatus
}) -Path $summaryPath

Write-MsiLog -Path $log -Message "summary_json: $summaryPath"
Write-MsiLog -Path $log -Message "ShieldMate MSI preflight completed."
