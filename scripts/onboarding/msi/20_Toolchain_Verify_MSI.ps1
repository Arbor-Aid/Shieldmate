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
$log = New-MsiOnboardingLog -RepoRoot $repo -Name "20_Toolchain_Verify_MSI"

Write-MsiLog -Path $log -Message "ShieldMate MSI toolchain verify started."
Write-MsiLog -Path $log -Message "repo_path: $repo"

$packagePath = Join-Path $repo "functions\package.json"
$package = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json
$requiredNodeEngine = [string]$package.engines.node

$installHints = @{
    git = "Install Git for Windows or add $script:GitCmdDir to user PATH. Override with GIT_CMD_PATH if needed."
    node = "Install Node.js major version $requiredNodeEngine and ensure node is on PATH."
    npm = "Install Node.js major version $requiredNodeEngine; npm should be included."
    firebase = "Install Firebase CLI after Node is available: npm install -g firebase-tools."
    gcloud = "Install Google Cloud SDK and authenticate with the ShieldMate project."
    docker = "Install Docker Desktop, start it, and verify docker version."
    java = "Install a supported JDK and ensure java is on PATH."
    flutter = "Optional for legacy/isolated Flutter validation: add Flutter SDK bin to PATH."
    dart = "Optional for legacy/isolated Flutter validation: add Flutter/Dart to PATH."
}

$hardRequired = @("git", "node", "npm", "firebase", "gcloud", "docker", "java")
$optional = @("flutter", "dart")
$toolNames = $hardRequired + $optional

$toolResults = @()
foreach ($tool in $toolNames) {
    $cmd = Test-MsiCommand -Name $tool
    $version = $null
    if ($cmd.available) {
        try {
            $versionOutput = & $tool --version 2>&1
            $version = ($versionOutput -join " ").Trim()
        } catch {
            $version = "version check failed: $($_.Exception.Message)"
        }
    }

    $toolResults += [PSCustomObject]@{
        name = $tool
        available = $cmd.available
        source = $cmd.source
        version = $version
        required = ($hardRequired -contains $tool)
        install_hint = if ($cmd.available) { $null } else { $installHints[$tool] }
    }
}

$nodeCompatible = $false
$nodeMajor = $null
$nodeResult = $toolResults | Where-Object { $_.name -eq "node" } | Select-Object -First 1
if ($nodeResult -and $nodeResult.available -and $nodeResult.version -match "v?(\d+)\.") {
    $nodeMajor = [int]$Matches[1]
    $nodeCompatible = ($nodeMajor -eq [int]$requiredNodeEngine)
}

$missingHardRequired = @($toolResults | Where-Object { $_.required -and -not $_.available })
$hardStatusOk = ($missingHardRequired.Count -eq 0) -and $nodeCompatible

foreach ($result in $toolResults) {
    $state = if ($result.available) { "FOUND" } else { "MISSING" }
    $requiredText = if ($result.required) { "required" } else { "optional" }
    Write-MsiLog -Path $log -Message "$($result.name): $state ($requiredText) $($result.version)"
    if ($result.install_hint) {
        Write-MsiLog -Path $log -Message "  install_hint: $($result.install_hint)"
    }
}

Write-MsiLog -Path $log -Message "functions_node_engine: $requiredNodeEngine"
Write-MsiLog -Path $log -Message "node_major_detected: $nodeMajor"
Write-MsiLog -Path $log -Message "node_24_compatible: $nodeCompatible"
Write-MsiLog -Path $log -Message "firebase_claims_rbac_appcheck_modified: false"

$statusObject = [PSCustomObject]@{
    timestamp = (Get-Date).ToUniversalTime().ToString("o")
    repo_path = $repo
    functions_node_engine = $requiredNodeEngine
    node_major_detected = $nodeMajor
    node_24_compatible = $nodeCompatible
    hard_required_ok = $hardStatusOk
    tools = $toolResults
    firebase_claims_rbac_appcheck_modified = $false
}

$statusPath = Join-Path $repo "docs\ops\logs\msi-onboarding\toolchain-status-latest.json"
ConvertTo-MsiJsonFile -InputObject $statusObject -Path $statusPath
Write-MsiLog -Path $log -Message "status_json: $statusPath"

$markerPath = Join-Path $repo "docs\ops\logs\msi-onboarding\toolchain-verified.json"
if ($hardStatusOk) {
    ConvertTo-MsiJsonFile -InputObject $statusObject -Path $markerPath
    Write-MsiLog -Path $log -Message "toolchain_verified_marker: $markerPath"
    Write-MsiLog -Path $log -Message "ShieldMate MSI toolchain verify completed."
    exit 0
}

Write-MsiLog -Path $log -Message "ShieldMate MSI toolchain verify FAILED. Missing required tools or Node major version is not $requiredNodeEngine."
exit 1
