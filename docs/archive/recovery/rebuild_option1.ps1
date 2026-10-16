<# 
rebuild_option1.ps1
ShieldMate “Option 1” rebuild helper script (safe, idempotent)

Goal:
- Stabilize the repo after SSD crash (reduce VS Code crash pressure)
- Capture before/after snapshots (_listing / _tree)
- Reconstruct the old “ShieldmateSSD\Shieldmate” style layout by:
  - Keeping infra roots at repo root: mcp/, gateway/, ops/, scripts/, shared/, infra/
  - Moving the React/Vite web app into /web if it currently lives at repo root
  - Creating /mobile placeholder (Flutter) without requiring secrets/API keys

NOTES:
- This script does NOT add API keys (by design).
- This script tries to be safe: it won’t overwrite existing folders and it keeps backups.
- Run in PowerShell from anywhere. Recommended: PowerShell (Admin) is fine, but not required.
#>

$ErrorActionPreference = "Stop"

function Write-Section([string]$Title) {
  Write-Host ""
  Write-Host "==== $Title ====" -ForegroundColor Cyan
}

function Assert-RepoRoot {
  $root = (git rev-parse --show-toplevel 2>$null)
  if (-not $root) { throw "Not inside a git repo. cd into D:\shieldmatessd\Shieldmate_RECLONE and rerun." }
  return $root.Trim()
}

function Safe-Mkdir([string]$Path) {
  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Force -Path $Path | Out-Null
  }
}

function Backup-Path([string]$PathToBackup, [string]$BackupRoot) {
  if (Test-Path $PathToBackup) {
    $name = Split-Path $PathToBackup -Leaf
    $dest = Join-Path $BackupRoot $name
    Write-Host "Backing up $PathToBackup -> $dest"
    if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
    Copy-Item -Recurse -Force $PathToBackup $dest
  }
}

function Write-TreeSnapshot([string]$RepoRoot, [string]$OutFile) {
  # Uses built-in tree command if available; falls back to PowerShell recursion.
  $treeCmd = Get-Command tree -ErrorAction SilentlyContinue
  if ($treeCmd) {
    cmd /c "cd /d `"$RepoRoot`" && tree /a /f" | Out-File -Encoding utf8 $OutFile
  } else {
    Get-ChildItem -LiteralPath $RepoRoot -Recurse -Force |
      Select-Object FullName, Length, LastWriteTime |
      Sort-Object FullName |
      Format-Table -Auto | Out-String | Out-File -Encoding utf8 $OutFile
  }
}

function Write-ListingSnapshot([string]$RepoRoot, [string]$OutFile) {
  Get-ChildItem -LiteralPath $RepoRoot -Force |
    Select-Object Name, Mode, Length, LastWriteTime |
    Sort-Object Name |
    Format-Table -Auto | Out-String | Out-File -Encoding utf8 $OutFile
}

function Ensure-VSCodeStabilitySettings([string]$RepoRoot) {
  Write-Section "Create .vscode/settings.json (reduce file watcher + tsserver load)"
  $vscodeDir = Join-Path $RepoRoot ".vscode"
  Safe-Mkdir $vscodeDir

  $settingsPath = Join-Path $vscodeDir "settings.json"

  # Conservative excludes to prevent Code.exe memory ballooning in large repos.
  $settings = @'
{
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/build/**": true,
    "**/.dart_tool/**": true,
    "**/coverage/**": true,
    "**/scripts/out/**": true,
    "**/mcp/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.dart_tool": true,
    "**/coverage": true,
    "**/scripts/out": true,
    "**/mcp": true
  },
  "typescript.tsserver.maxTsServerMemory": 2048,
  "typescript.disableAutomaticTypeAcquisition": true,
  "git.autofetch": false
}
'@

  $settings | Out-File -Encoding utf8 $settingsPath
  Write-Host "Wrote: $settingsPath"
}

function Ensure-Gitignore([string]$RepoRoot) {
  Write-Section "Ensure .gitignore has common excludes"
  $path = Join-Path $RepoRoot ".gitignore"
  if (-not (Test-Path $path)) {
    New-Item -ItemType File -Force $path | Out-Null
  }

  $existing = Get-Content $path -ErrorAction SilentlyContinue
  $add = @(
    "",
    "# --- rebuild_option1 additions ---",
    "node_modules/",
    "dist/",
    "build/",
    ".dart_tool/",
    ".idea/",
    ".vscode/",
    "coverage/",
    "scripts/out/",
    "*.log",
    "*.tmp",
    ".env",
    ".env.local",
    ".env.*.local"
  )

  foreach ($line in $add) {
    if ($existing -notcontains $line) { Add-Content -Path $path -Value $line }
  }

  Write-Host "Updated: $path"
}

function Detect-WebAtRoot([string]$RepoRoot) {
  # Heuristic: if package.json exists at repo root and src/ exists at root, assume web app lives at root.
  $pkg = Join-Path $RepoRoot "package.json"
  $src = Join-Path $RepoRoot "src"
  $pub = Join-Path $RepoRoot "public"
  $indexHtml = Join-Path $RepoRoot "index.html"

  if ((Test-Path $pkg) -and (Test-Path $src) -and (Test-Path $pub)) { return $true }
  if ((Test-Path $pkg) -and (Test-Path $indexHtml) -and (Test-Path $src)) { return $true }
  return $false
}

function Move-WebIntoWebFolder([string]$RepoRoot, [string]$BackupRoot) {
  Write-Section "Move web app into /web (only if web appears to live at repo root)"

  $webDir = Join-Path $RepoRoot "web"
  if (Test-Path $webDir) {
    Write-Host "web/ already exists. Skipping move."
    return
  }

  if (-not (Detect-WebAtRoot $RepoRoot)) {
    Write-Host "No clear web app at repo root. Skipping move."
    return
  }

  Safe-Mkdir $webDir

  # Files/folders typically belonging to Vite/React web app:
  $candidates = @(
    "src",
    "public",
    "index.html",
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "vite.config.ts",
    "vite.config.js",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "postcss.config.js",
    "tailwind.config.js",
    "tailwind.config.ts",
    "eslint.config.js",
    ".eslintrc",
    ".eslintrc.json",
    ".prettierrc",
    ".prettierrc.json",
    ".prettierignore",
    "firebase.json",
    ".firebaserc"
  )

  # Back up root web artifacts before move
  Backup-Path (Join-Path $RepoRoot "src") $BackupRoot
  Backup-Path (Join-Path $RepoRoot "public") $BackupRoot
  Backup-Path (Join-Path $RepoRoot "package.json") $BackupRoot
  Backup-Path (Join-Path $RepoRoot "index.html") $BackupRoot

  foreach ($item in $candidates) {
    $from = Join-Path $RepoRoot $item
    if (Test-Path $from) {
      $to = Join-Path $webDir $item
      Write-Host "Moving $item -> web/$item"
      Move-Item -Force $from $to
    }
  }

  # If there is a top-level "firebase" folder that is web-related, move it too
  $firebaseFolder = Join-Path $RepoRoot "firebase"
  if (Test-Path $firebaseFolder) {
    Write-Host "Moving firebase/ -> web/firebase/"
    Move-Item -Force $firebaseFolder (Join-Path $webDir "firebase")
  }

  Write-Host "Web move complete."
}

function Ensure-MobilePlaceholder([string]$RepoRoot) {
  Write-Section "Create /mobile placeholder (Flutter) - no secrets"

  $mobileDir = Join-Path $RepoRoot "mobile"
  Safe-Mkdir $mobileDir

  $readme = Join-Path $mobileDir "README_MOBILE_REBUILD.md"
  if (-not (Test-Path $readme)) {
    @"
# Mobile (Flutter) - Rebuild Placeholder

This folder is intentionally a placeholder created during rebuild_option1.ps1.

Next steps (manual/Codex):
- Restore the Flutter project scaffold (lib/, android/, ios/, pubspec.yaml, etc.)
- Confirm flutter_gen_ui dependency in pubspec.yaml
- Recreate missing lib/screens flows (Client + Org Admin + Super Admin)
- Do NOT add API keys here. Use:
  - .env.local (ignored)
  - CI environment variables (Codemagic)
  - Firebase / GCP secrets

"@ | Out-File -Encoding utf8 $readme
    Write-Host "Wrote: $readme"
  }
}

function Write-RebuildNotes([string]$RepoRoot, [string]$BackupRoot) {
  Write-Section "Write rebuild notes + where to open VS Code safely"

  $notes = Join-Path $RepoRoot "_REBUILD_OPTION1_NOTES.md"
  @"
# Rebuild Option 1 Notes

Created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## What this script did
- Wrote .vscode/settings.json to reduce Code.exe memory growth (watcher/search excludes).
- Ensured .gitignore contains common rebuild excludes (no secrets).
- Captured snapshots in _snapshots/
- If a Vite/React web app was detected at repo root, moved it into /web.

## Backups
Backups saved here:
$BackupRoot

## Safe VS Code open commands (avoid indexing the entire repo)
- Web only:
  code -n "$RepoRoot\web"
- Mobile only:
  code -n "$RepoRoot\mobile"
- MCP work (open separately only when needed):
  code -n "$RepoRoot\mcp"
"@ | Out-File -Encoding utf8 $notes

  Write-Host "Wrote: $notes"
}

# -------------------- MAIN --------------------
Write-Section "ShieldMate Option 1 Rebuild Script"

$repoRoot = Assert-RepoRoot
Write-Host "Repo root: $repoRoot"

Write-Section "Basic git state (for your records)"
git status
git log -5 --oneline

# Create snapshot + backup locations
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$snapDir = Join-Path $repoRoot "_snapshots"
Safe-Mkdir $snapDir

$backupRoot = Join-Path $snapDir ("backup_" + $stamp)
Safe-Mkdir $backupRoot

Write-Section "Capture BEFORE snapshots"
Write-ListingSnapshot $repoRoot (Join-Path $snapDir ("_listing_before_" + $stamp + ".txt"))
Write-TreeSnapshot    $repoRoot (Join-Path $snapDir ("_tree_before_" + $stamp + ".txt"))

Ensure-VSCodeStabilitySettings $repoRoot
Ensure-Gitignore $repoRoot

Move-WebIntoWebFolder $repoRoot $backupRoot
Ensure-MobilePlaceholder $repoRoot

Write-Section "Capture AFTER snapshots"
Write-ListingSnapshot $repoRoot (Join-Path $snapDir ("_listing_after_" + $stamp + ".txt"))
Write-TreeSnapshot    $repoRoot (Join-Path $snapDir ("_tree_after_" + $stamp + ".txt"))

Write-RebuildNotes $repoRoot $backupRoot

Write-Section "Done"
Write-Host "Next: open VS Code on subfolders only:"
Write-Host "  code -n `"$repoRoot\web`""
Write-Host "  code -n `"$repoRoot\mobile`""
Write-Host ""
Write-Host "If you want, paste the new _tree_after_*.txt and I'll generate the Codex bulk prompt to recreate missing files."
