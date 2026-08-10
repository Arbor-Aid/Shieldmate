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
$log = New-MsiOnboardingLog -RepoRoot $repo -Name "10_Fix_Git_And_Path_MSI"

Write-MsiLog -Path $log -Message "ShieldMate MSI Git/PATH fix started."
Write-MsiLog -Path $log -Message "repo_path: $repo"

if (-not (Test-Path -LiteralPath $script:GitCmdDir)) {
    throw "Expected Git cmd directory missing: $script:GitCmdDir"
}

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $userPath) {
    $userPath = ""
}

$userPathParts = $userPath -split ";" | Where-Object { $_ -ne "" }
$gitPathPresent = $userPathParts | Where-Object { $_.TrimEnd("\") -ieq $script:GitCmdDir.TrimEnd("\") }

if (-not $gitPathPresent) {
    $newUserPath = (($userPathParts + $script:GitCmdDir) -join ";")
    [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
    Write-MsiLog -Path $log -Message "user_path_updated: added $script:GitCmdDir"
} else {
    Write-MsiLog -Path $log -Message "user_path_updated: false, Git path already present"
}

$processParts = $env:Path -split ";" | Where-Object { $_ -ne "" }
$processGitPathPresent = $processParts | Where-Object { $_.TrimEnd("\") -ieq $script:GitCmdDir.TrimEnd("\") }
if (-not $processGitPathPresent) {
    $env:Path = (($processParts + $script:GitCmdDir) -join ";")
    Write-MsiLog -Path $log -Message "process_path_updated: added $script:GitCmdDir"
}

$git = Get-MsiGitExe
if (-not $git) {
    throw "Git executable not found after PATH update."
}

$safeDirectories = @(& $git config --global --get-all safe.directory 2>$null)
if ($safeDirectories -notcontains $script:ExpectedSafeDirectory) {
    & $git config --global --add safe.directory $script:ExpectedSafeDirectory
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to add Git safe.directory for $script:ExpectedSafeDirectory"
    }
    Write-MsiLog -Path $log -Message "git_safe_directory_added: $script:ExpectedSafeDirectory"
} else {
    Write-MsiLog -Path $log -Message "git_safe_directory_added: false, already configured"
}

Push-Location $repo
try {
    $gitVersion = (& git --version 2>&1) -join " "
    if ($LASTEXITCODE -ne 0) {
        throw "git --version failed: $gitVersion"
    }
    Write-MsiLog -Path $log -Message "git_version: $gitVersion"

    $status = (& git status --short --branch 2>&1)
    if ($LASTEXITCODE -ne 0) {
        throw "git status failed: $($status -join [Environment]::NewLine)"
    }
    Write-MsiLog -Path $log -Message "git_status:"
    foreach ($line in $status) {
        Write-MsiLog -Path $log -Message "  $line"
    }
} finally {
    Pop-Location
}

Write-MsiLog -Path $log -Message "ShieldMate MSI Git/PATH fix completed."
