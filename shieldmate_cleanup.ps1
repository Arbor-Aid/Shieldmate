# ============================
# 2Marines Shieldmate: One-Shot Cleanup + Build Script
# ============================

$ErrorActionPreference = 'Stop'

# --------- CONFIG (edit if needed) ----------
$PROJECT_ROOT = "D:\shieldmatessd\shieldmate\frontend\arbor_aid_app"
$ANDROID_SDK  = "D:\Android\Sdk"
$JAVA_HOME    = "C:\Program Files\Eclipse Adoptium\jdk-21.0.4.7-hotspot"
$NUGET_EXE    = "D:\shieldmatessd\nuget.exe"   # leave as-is if nuget.exe is here; otherwise point to your nuget.exe

# Toggles
$RUN_FORMAT    = $true
$RUN_FIXES     = $true
$RUN_ANALYZE   = $true
$BUILD_WINDOWS = $true
$BUILD_WEB     = $true
$TRY_NUGET     = $true    # harmless if solution has no packages

# --------- Helpers ----------
function Write-Section($msg) { Write-Host "`n==== $msg ====" -ForegroundColor Cyan }
function Ensure-Dir($p) { if (-not (Test-Path $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null } }
function Ensure-InProcessPath($dir) {
  if ([string]::IsNullOrWhiteSpace($dir)) { return }
  $paths = ($env:Path -split ';') | Where-Object { $_ }
  if ($paths -notcontains $dir) {
    $env:Path = ($paths + $dir) -join ';'
  }
}
function Add-ToUserPath($dir) {
  if ([string]::IsNullOrWhiteSpace($dir)) { return }
  $current = [Environment]::GetEnvironmentVariable('Path','User')
  $parts = @()
  if ($current) { $parts = ($current -split ';') | Where-Object { $_ } }
  if ($parts -notcontains $dir) {
    $new = ($parts + $dir) -join ';'
    [Environment]::SetEnvironmentVariable('Path', $new, 'User')
  }
}
function Cmd-Exists($name) { return $null -ne (Get-Command $name -ErrorAction SilentlyContinue) }

# --------- Pre-flight checks ----------
Write-Section "Validating project path"
if (-not (Test-Path $PROJECT_ROOT)) {
  Write-Host "Project path not found: $PROJECT_ROOT" -ForegroundColor Red
  Write-Host "Edit `$PROJECT_ROOT near the top of this script, then rerun." -ForegroundColor Yellow
  exit 1
}

# Logs
$LOG_DIR = Join-Path $PROJECT_ROOT ("tools\logs\" + (Get-Date -Format 'yyyyMMdd_HHmmss'))
Ensure-Dir $LOG_DIR

# --------- Environment: Android, Java, NuGet ----------
Write-Section "Setting env vars (Android SDK, Java, NuGet)"

# Android
$env:ANDROID_HOME     = $ANDROID_SDK
$env:ANDROID_SDK_ROOT = $ANDROID_SDK
Ensure-InProcessPath (Join-Path $ANDROID_SDK "platform-tools")
Add-ToUserPath        (Join-Path $ANDROID_SDK "platform-tools")

# Java
if (Test-Path $JAVA_HOME) {
  $env:JAVA_HOME = $JAVA_HOME
  Ensure-InProcessPath (Join-Path $JAVA_HOME "bin")
  Add-ToUserPath        (Join-Path $JAVA_HOME "bin")
} else {
  Write-Host "JAVA_HOME not found at: $JAVA_HOME (continuing since Flutter already showed green)" -ForegroundColor Yellow
}

# NuGet
if (Test-Path $NUGET_EXE) {
  $nugetDir = Split-Path $NUGET_EXE -Parent
  Ensure-InProcessPath $nugetDir
  Add-ToUserPath        $nugetDir
  Set-Alias -Name nuget -Value $NUGET_EXE -Scope Global
} elseif (Cmd-Exists "nuget") {
  # already on PATH
} else {
  Write-Host "nuget.exe not found. Either install it or set `$NUGET_EXE to the correct path." -ForegroundColor Yellow
}

# --------- Kill stale ADB (non-fatal if missing) ----------
Write-Section "Killing stale ADB (safe to ignore if not installed)"
try { & adb kill-server 2>$null | Out-Null } catch {}

# --------- Tool versions ----------
Write-Section "Tool versions"
try {
  flutter --version | Tee-Object -FilePath (Join-Path $LOG_DIR "flutter_version.txt")
} catch {
  Write-Host "Flutter not found on PATH." -ForegroundColor Red
  exit 1
}
if (Cmd-Exists "dart") {
  dart --version | Tee-Object -FilePath (Join-Path $LOG_DIR "dart_version.txt")
}
if (Cmd-Exists "nuget") {
  nuget help | Out-File (Join-Path $LOG_DIR "nuget_help.txt")
}

# --------- Flutter doctor ----------
Write-Section "flutter doctor -v"
flutter doctor -v 2>&1 | Tee-Object -FilePath (Join-Path $LOG_DIR "doctor.txt")

# --------- Go to project ----------
Push-Location $PROJECT_ROOT

# --------- Pub get / Clean ----------
Write-Section "flutter clean + flutter pub get"
flutter clean   2>&1 | Tee-Object -FilePath (Join-Path $LOG_DIR "clean.txt")
flutter pub get 2>&1 | Tee-Object -FilePath (Join-Path $LOG_DIR "pub_get.txt")

# --------- Optional: formatting & safe fixes ----------
if ($RUN_FORMAT) {
  Write-Section "dart format (lib/)"
  if (Test-Path "lib") {
    dart format lib --line-length 100 2>&1 | Tee-Object -FilePath (Join-Path $LOG_DIR "format.txt")
  } else {
    Write-Host "No lib/ directory found at $PROJECT_ROOT" -ForegroundColor Yellow
  }
}

if ($RUN_FIXES) {
  Write-Section "dart fix (dry-run -> apply)"
  dart fix --dry-run 2>&1 | Tee-Object -FilePath (Join-Path $LOG_DIR "dart_fix_dry_run.txt")
  dart fix --apply   2>&1 | Tee-Object -FilePath (Join-Path $LOG_DIR "dart_fix_apply.txt")
}

# --------- Analyzer ----------
if ($RUN_ANALYZE) {
  Write-Section "flutter analyze"
  flutter analyze 2>&1 | Tee-Object -FilePath (Join-Path $LOG_DIR "analyze.txt")
}

# --------- Optional NuGet restore on runner.sln (harmless if empty) ----------
if ($TRY_NUGET) {
  $runnerSln = Join-Path $PROJECT_ROOT "build\windows\x64\runner\runner.sln"
  if ((Test-Path $runnerSln) -and (Cmd-Exists "nuget")) {
    Write-Section "nuget restore (runner.sln)"
    nuget restore "$runnerSln" 2>&1 | Tee-Object -FilePath (Join-Path $LOG_DIR "nuget_restore_runner.txt")
  } else {
    Write-Host "Skipping NuGet restore (runner.sln not found or nuget missing)." -ForegroundColor DarkYellow
  }
}

# --------- Build: Windows ----------
if ($BUILD_WINDOWS) {
  Write-Section "flutter build windows -v"
  flutter build windows -v 2>&1 | Tee-Object -FilePath (Join-Path $LOG_DIR "build_windows.txt")
}

# --------- Build: Web ----------
if ($BUILD_WEB) {
  Write-Section "flutter build web"
  flutter build web 2>&1 | Tee-Object -FilePath (Join-Path $LOG_DIR "build_web.txt")
}

# --------- Summary ----------
Pop-Location
Write-Section "DONE"
Write-Host "Logs saved to: $LOG_DIR" -ForegroundColor Green
Write-Host "Tip: Reopen PowerShell to ensure PATH changes persist to new sessions." -ForegroundColor DarkCyan

