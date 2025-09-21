<#!
.SYNOPSIS
  Updates Firebase dependencies and runs maintenance commands.

.DESCRIPTION
  Updates firebase dependency to ^11.9.0, reinstalls packages, attempts to patch undici,
  and prints summaries of outdated packages and remaining vulnerabilities.
  Safe to run multiple times.
#>

param(
  [string]$ProjectRoot = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)

$ErrorActionPreference = 'Stop'

function Write-Step {
  param([string]$Message)
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-NpmCommand {
  param(
    [string[]]$Arguments,
    [switch]$ContinueOnError
  )

  Write-Step "Running: npm $($Arguments -join ' ')"
  Push-Location $ProjectRoot
  try {
    & npm @Arguments
    $exitCode = $LASTEXITCODE
  }
  finally {
    Pop-Location
  }

  if ($exitCode -ne 0) {
    if ($ContinueOnError) {
      Write-Warning "Command 'npm $($Arguments -join ' ')' failed with exit code $exitCode. Continuing."
    }
    else {
      throw "Command 'npm $($Arguments -join ' ')' failed with exit code $exitCode."
    }
  }
}

$packageJsonPath = Join-Path $ProjectRoot 'package.json'
if (-not (Test-Path $packageJsonPath)) {
  throw "package.json not found at $packageJsonPath"
}

Write-Step "Loading package.json"
$packageContent = Get-Content $packageJsonPath -Raw
$packageJson = $packageContent | ConvertFrom-Json

$targetFirebaseVersion = '^11.9.0'
$packageUpdated = $false

if ($packageJson.dependencies.firebase) {
  if ($packageJson.dependencies.firebase -ne $targetFirebaseVersion) {
    Write-Step "Updating firebase dependency to $targetFirebaseVersion"
    $packageJson.dependencies.firebase = $targetFirebaseVersion
    $packageUpdated = $true
  }
  else {
    Write-Step "Firebase dependency already at $targetFirebaseVersion"
  }
}
else {
  Write-Warning "Firebase dependency not found in package.json dependencies."
}

if ($packageUpdated) {
  Write-Step "Writing updated package.json"
  $packageJson | ConvertTo-Json -Depth 100 | Out-File -FilePath $packageJsonPath -Encoding utf8
}
else {
  Write-Step "No changes required for package.json"
}

Invoke-NpmCommand -Arguments @('install')
Invoke-NpmCommand -Arguments @('audit', 'fix') -ContinueOnError
Invoke-NpmCommand -Arguments @('install', 'undici@latest', '--save-exact') -ContinueOnError

Write-Step "Summary: npm outdated"
Invoke-NpmCommand -Arguments @('outdated') -ContinueOnError

Write-Step "Summary: npm audit"
Invoke-NpmCommand -Arguments @('audit') -ContinueOnError

Write-Step "Dependency update process complete"
