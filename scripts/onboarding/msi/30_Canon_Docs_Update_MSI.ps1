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
$log = New-MsiOnboardingLog -RepoRoot $repo -Name "30_Canon_Docs_Update_MSI"
$markerPath = Join-Path $repo "docs\ops\logs\msi-onboarding\toolchain-verified.json"

Write-MsiLog -Path $log -Message "ShieldMate MSI canon docs update started."
Write-MsiLog -Path $log -Message "repo_path: $repo"

if (-not (Test-Path -LiteralPath $markerPath)) {
    Write-MsiLog -Path $log -Message "blocked: missing toolchain verification marker at $markerPath"
    Write-MsiLog -Path $log -Message "Run 20_Toolchain_Verify_MSI.ps1 successfully before updating canon docs."
    exit 2
}

$today = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$transitionBlock = @"

<!-- MSI_CANON_TRANSITION_START -->
## 2026-05-22 MSI Canon Transition

Active Windows development machine:
- MSI: active ShieldMate development workstation

Active MSI canon root:
$($script:ExpectedRepoRoot)

Legacy / parked machine:
- Old Dell laptop: legacy/parked after MSI onboarding. Preserve historical state; do not delete legacy paths without explicit authority.

Operating policy:
- MSI is the active development node for Launch Validation Phase.
- MCP updates must land on canon before endpoint activation.
- MCP Gateway remains the RBAC ingress.
- Slack remains notification and intake only, never system of record.
- Firebase claims, RBAC, and App Check guardrails remain unchanged.
- Existing Shopify/shop work is preserved.
<!-- MSI_CANON_TRANSITION_END -->
"@

function Set-TextFile {
    param(
        [string]$Path,
        [string]$Content
    )
    Set-Content -LiteralPath $Path -Value $Content -Encoding UTF8
    Write-MsiLog -Path $log -Message "updated: $Path"
}

function Update-TransitionDoc {
    param([string]$RelativePath)
    $path = Join-Path $repo $RelativePath
    $content = Get-Content -LiteralPath $path -Raw
    # Historical migration target only: replace the parked legacy clone path with the current canon root.
    $content = $content -replace [regex]::Escape("D:\shieldmatessd\Shieldmate_RECLONE"), $script:ExpectedRepoRoot
    $content = $content -replace "Updated: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}", "Updated: $today"
    $content = [regex]::Replace($content, "(?s)\r?\n?<!-- MSI_CANON_TRANSITION_START -->.*?<!-- MSI_CANON_TRANSITION_END -->", "")
    Set-TextFile -Path $path -Content ($content.TrimEnd() + $transitionBlock + [Environment]::NewLine)
}

Update-TransitionDoc -RelativePath "docs\infra\COMPUTER_TOPOLOGY_AND_LOCAL_FILESYSTEM.md"
Update-TransitionDoc -RelativePath "docs\SYSTEM_OF_RECORD.md"
Update-TransitionDoc -RelativePath "docs\DEV_OPERATIONS.md"
Update-TransitionDoc -RelativePath "ADMIN_RUNBOOK.md"

$readmePath = Join-Path $repo "README.md"
$readme = Get-Content -LiteralPath $readmePath -Raw
$readme = $readme.Replace(
    "MCP services (33 deployable service directories in `mcp`, excluding `common` and `mcp-gateway`)",
    "MCP services (34 deployable service directories in `mcp`, excluding `common` and `mcp-gateway`)"
)
$readme = [regex]::Replace($readme, "(?s)\r?\n?<!-- MSI_CANON_TRANSITION_START -->.*?<!-- MSI_CANON_TRANSITION_END -->", "")
Set-TextFile -Path $readmePath -Content ($readme.TrimEnd() + $transitionBlock + [Environment]::NewLine)

$serviceDirs = Get-ChildItem -LiteralPath (Join-Path $repo "mcp") -Directory |
    Where-Object { $_.Name -notin @("common", "mcp-gateway") } |
    Sort-Object Name

$serviceList = @()
$serviceList += "# MCP Service List"
$serviceList += ""
$serviceList += "Authoritative MCP services: **$($serviceDirs.Count)**"
$serviceList += ""
$serviceList += "Inclusion rule: folders under `mcp/` excluding `common` and `mcp-gateway`."
$serviceList += ""
$serviceList += "`mcp-gateway` remains the RBAC ingress and is not counted as a fleet service."
$serviceList += ""
$serviceList += "## Services"
$serviceList += ""
foreach ($dir in $serviceDirs) {
    $serviceList += "- $($dir.Name): mcp\$($dir.Name)"
}
$serviceList += ""
$serviceList += "## Guardrails"
$serviceList += ""
$serviceList += "- Slack is notification and intake only, never system of record."
$serviceList += "- MCP updates must land on canon before endpoint activation."
$serviceList += "- Claims-based RBAC remains enforced at the MCP Gateway."
$serviceList += "- Placeholder-connected services are not the same as domain-implemented services."

Set-TextFile -Path (Join-Path $repo "docs\MCP_SERVICE_LIST.md") -Content (($serviceList -join [Environment]::NewLine) + [Environment]::NewLine)

Write-MsiLog -Path $log -Message "ShieldMate MSI canon docs update completed."
