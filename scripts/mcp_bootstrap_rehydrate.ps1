Param(
    [string]$RepoRoot = (Resolve-Path ".").Path
)

$ErrorActionPreference = "Stop"

$bootstrapRoot = Join-Path $RepoRoot "platform_bootstrap"
if (-not (Test-Path $bootstrapRoot)) {
    Write-Error "Missing platform_bootstrap directory at $bootstrapRoot"
}

$requiredDirs = @(
    "shared/geography/states",
    "shared/geography/counties",
    "shared/geography/cities",
    "shared/geography/zipcodes",
    "shared/demographics",
    "shared/org_profiles",
    "shared/taxonomies",
    "shared/google_ads",
    "integrations/firebase",
    "integrations/google_drive",
    "integrations/notion",
    "integrations/windows_admin_tools",
    "integrations/slack",
    "shared/smoke_payloads",
    "mcps"
)

$requiredFiles = @(
    "bootstrap_manifest.json",
    "shared/smoke_payloads/mass_smoke_plan.json",
    "mcps/bootstrap_packages.index.json",
    "mcps/transitional_runtime_status.json",
    "integrations/windows_admin_tools/consumer_map.json",
    "integrations/google_drive/configs/google_drive_config.template.json",
    "integrations/notion/configs/notion_config.template.json"
)

$missingDirs = @()
foreach ($dir in $requiredDirs) {
    $path = Join-Path $bootstrapRoot $dir
    if (-not (Test-Path $path)) {
        $missingDirs += $dir
    }
}

$missingFiles = @()
foreach ($file in $requiredFiles) {
    $path = Join-Path $bootstrapRoot $file
    if (-not (Test-Path $path)) {
        $missingFiles += $file
    }
}

if ($missingDirs.Count -gt 0 -or $missingFiles.Count -gt 0) {
    Write-Host "Bootstrap rehydrate check FAILED"
    if ($missingDirs.Count -gt 0) {
        Write-Host "Missing directories:"
        $missingDirs | ForEach-Object { Write-Host " - $_" }
    }
    if ($missingFiles.Count -gt 0) {
        Write-Host "Missing files:"
        $missingFiles | ForEach-Object { Write-Host " - $_" }
    }
    exit 1
}

$packageIndexPath = Join-Path $bootstrapRoot "mcps/bootstrap_packages.index.json"
$packageCount = ((Get-Content $packageIndexPath -Raw | ConvertFrom-Json).Count)
$serviceDirCount = (Get-ChildItem (Join-Path $bootstrapRoot "mcps") -Directory | Where-Object { $_.Name -ne "index" }).Count

Write-Host "Bootstrap rehydrate check PASSED"
Write-Host " - bootstrap_root: $bootstrapRoot"
Write-Host " - package_count: $packageCount"
Write-Host " - mcp_service_dirs: $serviceDirCount"
Write-Host " - ready_for_mass_smoke: true"
