# ShieldMate operational script guardrails:
# - Do not log secrets; token env vars may be checked for presence only.
# - Do not deploy, push, commit, or mutate Firebase from this script.
# - Keep generated reports free of token values and private file contents.
Set-StrictMode -Version Latest

$script:ExpectedRepoRoot = if ($env:SHIELDMATE_REPO_PATH) { $env:SHIELDMATE_REPO_PATH } else { "D:\2marines\Shieldmate" }
$script:ExpectedSafeDirectory = $script:ExpectedRepoRoot.Replace("\", "/")
$script:GitCmdDir = if ($env:GIT_CMD_PATH) { $env:GIT_CMD_PATH } else { "C:\Program Files\Git\cmd" }
$script:GitExeCandidates = @(
    (Join-Path $script:GitCmdDir "git.exe"),
    (Join-Path (Split-Path -Parent $script:GitCmdDir) "bin\git.exe")
)

function Resolve-MsiRepoRoot {
    param([string]$RepoRoot)

    if ($RepoRoot) {
        return (Resolve-Path -LiteralPath $RepoRoot).Path
    }

    return (Resolve-Path -LiteralPath $script:ExpectedRepoRoot).Path
}

function New-MsiOnboardingLog {
    param(
        [string]$RepoRoot,
        [string]$Name
    )

    $logRoot = Join-Path $RepoRoot "docs\ops\logs\msi-onboarding"
    New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    return Join-Path $logRoot "$Name-$stamp.log"
}

function Write-MsiLog {
    param(
        [string]$Path,
        [string]$Message
    )

    $line = "$(Get-Date -Format o) $Message"
    Write-Host $Message
    Add-Content -LiteralPath $Path -Value $line
}

function Get-MsiGitExe {
    $cmd = Get-Command git -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    foreach ($candidate in $script:GitExeCandidates) {
        if (Test-Path -LiteralPath $candidate) {
            return $candidate
        }
    }

    return $null
}

function Test-MsiCommand {
    param([string]$Name)

    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($cmd) {
        [PSCustomObject]@{
            name = $Name
            available = $true
            source = $cmd.Source
        }
    } else {
        [PSCustomObject]@{
            name = $Name
            available = $false
            source = $null
        }
    }
}

function Initialize-MsiProcessPath {
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $currentParts = @($env:Path -split ";" | Where-Object { $_ })
    $mergedParts = @($currentParts + ($machinePath -split ";") + ($userPath -split ";") | Where-Object { $_ })
    $deduped = New-Object System.Collections.Generic.List[string]

    foreach ($part in $mergedParts) {
        $exists = $false
        foreach ($item in $deduped) {
            if ($item.TrimEnd("\") -ieq $part.TrimEnd("\")) {
                $exists = $true
                break
            }
        }
        if (-not $exists) {
            $deduped.Add($part) | Out-Null
        }
    }

    $env:Path = ($deduped -join ";")
}

function Invoke-MsiGit {
    param(
        [string]$RepoRoot,
        [string[]]$Arguments,
        [switch]$AllowUnsafePathFailure
    )

    $git = Get-MsiGitExe
    if (-not $git) {
        throw "Git executable not found."
    }

    $argList = @("-c", "safe.directory=$script:ExpectedSafeDirectory") + $Arguments
    $output = & $git @argList 2>&1
    $code = $LASTEXITCODE

    if ($code -ne 0 -and -not $AllowUnsafePathFailure) {
        throw "git $($Arguments -join ' ') failed with exit code $code`: $output"
    }

    [PSCustomObject]@{
        exitCode = $code
        output = ($output -join [Environment]::NewLine)
    }
}

function Get-MsiGitSummary {
    param([string]$RepoRoot)

    Push-Location $RepoRoot
    try {
        $branch = (Invoke-MsiGit -RepoRoot $RepoRoot -Arguments @("rev-parse", "--abbrev-ref", "HEAD")).output.Trim()
        $commit = (Invoke-MsiGit -RepoRoot $RepoRoot -Arguments @("rev-parse", "HEAD")).output.Trim()
        $status = (Invoke-MsiGit -RepoRoot $RepoRoot -Arguments @("status", "--short", "--branch")).output
        [PSCustomObject]@{
            branch = $branch
            commit = $commit
            status = $status
        }
    } finally {
        Pop-Location
    }
}

function ConvertTo-MsiJsonFile {
    param(
        [object]$InputObject,
        [string]$Path
    )

    $dir = Split-Path -Parent $Path
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    $InputObject | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $Path -Encoding UTF8
}

Initialize-MsiProcessPath
