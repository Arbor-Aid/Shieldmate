# ============================
# Shieldmate Git Housekeeping Script
# ============================

$ErrorActionPreference = 'Stop'

function Write-Section([string]$msg) {
  Write-Host "`n==== $msg ====" -ForegroundColor Cyan
}

# Ensure we are in the repo root
Write-Section "Validating repo"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git is not available on PATH." -ForegroundColor Red
  exit 1
}

$repoRoot = "D:\shieldmatessd\shieldmate"
if (-not (Test-Path $repoRoot)) {
  Write-Host "Repo root not found: $repoRoot" -ForegroundColor Red
  exit 1
}
Set-Location $repoRoot

# Detect rebase
Write-Section "Checking rebase status"
$gitDir = (git rev-parse --git-dir) 2>$null
if (-not $gitDir) {
  Write-Host "Not inside a Git repository." -ForegroundColor Red
  exit 1
}
$rebaseInProgress = (Test-Path (Join-Path $gitDir 'rebase-apply')) -or (Test-Path (Join-Path $gitDir 'rebase-merge'))
if ($rebaseInProgress) {
  Write-Host "Rebase detected. Auto-adding, amending, and continuing..."
  git add --all
  git commit --amend --no-edit
  git rebase --continue
}

# Files to stage explicitly
$stageList = @(
  '.env.bak',
  'jest.config.cjs',
  'jest.setup.ts',
  'nuget.exe',
  'shieldmate_cleanup.ps1',
  'src/hooks/__tests__',
  'src/hooks/useMcpClient.ts',
  'src/mocks'
)

Write-Section "Staging changes"
# Stage everything
git add --all
foreach ($item in $stageList) {
  git add $item -f 2>$null
}

# Update .gitignore
Write-Section "Updating .gitignore"
$gitignorePath = Join-Path $repoRoot '.gitignore'
if (-not (Test-Path $gitignorePath)) {
  New-Item -ItemType File -Path $gitignorePath -Force | Out-Null
}
$existingEntries = Get-Content $gitignorePath
$ignoreItems = @(
  '.env.bak',
  'nuget.exe',
  'shieldmate_cleanup.ps1',
  'src/mocks/',
  'src/hooks/__tests__/'
)
$updated = $false
foreach ($entry in $ignoreItems) {
  if ($existingEntries -notcontains $entry) {
    Add-Content $gitignorePath $entry
    $updated = $true
  }
}
if ($updated) {
  git add .gitignore
}

# Commit
Write-Section "Committing"
$commitMessage = 'chore: add helper scripts, Jest setup, MCP hooks'
if (-not (git diff --cached --quiet)) {
  git commit -m $commitMessage
  $committedFiles = git diff HEAD^..HEAD --name-only
} else {
  Write-Host "Nothing to commit." -ForegroundColor Yellow
  $committedFiles = @()
}

# Sync with origin/main
Write-Section "Syncing with origin/main"
git fetch origin
git pull origin main --rebase
git push origin main

# Summary
Write-Section "Summary"
if ($committedFiles.Count -gt 0) {
  Write-Host "Committed files:" -ForegroundColor Green
  $committedFiles | ForEach-Object { Write-Host "  $_" }
} else {
  Write-Host "No new commit was created." -ForegroundColor Yellow
}

Write-Host "Ignored locally:" -ForegroundColor Green
$ignoreItems | ForEach-Object { Write-Host "  $_" }

Write-Host "\nGit status:" -ForegroundColor Cyan
git status --short
