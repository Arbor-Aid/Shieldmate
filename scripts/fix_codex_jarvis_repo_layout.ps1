# PURPOSE: Standardize repo layout for durability + git safety (prompts + templates + scripts)
# SAFE: Non-destructive (creates/overwrites only known text/script artifacts)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Info($m){ Write-Host "[INFO] $m" }
function Ok($m){ Write-Host "[OK] $m" }

$RepoRoot = (git rev-parse --show-toplevel 2>$null).Trim()
if(-not $RepoRoot){ throw "Not in a git repo. Open PowerShell in repo root and rerun." }
Set-Location $RepoRoot
Info "RepoRoot=$RepoRoot"

# Folders
$codexDir     = Join-Path $RepoRoot ".codex"
$docsPrompts  = Join-Path $RepoRoot "docs\prompts"
$docsContract = Join-Path $RepoRoot "docs\contracts"
$mcpScripts   = Join-Path $RepoRoot "scripts\mcp"
$outDir       = Join-Path $RepoRoot "scripts\out"

New-Item -ItemType Directory -Force -Path $codexDir,$docsPrompts,$docsContract,$mcpScripts,$outDir | Out-Null
Ok "Folders ensured"

# 1) Prompt template (FOREVER)
$promptTemplate = @'
YOU ARE CODEX.
MINIMIZE TOKENS.
OUTPUT ONLY CODE (or EXACT CLI COMMANDS) â€” NO EXPLANATION.

ROLE: [e.g., Senior DevOps Automation Agent]
OBJECTIVE: [1 sentence]
REPO_ROOT: [absolute path]
ENV: Windows 11 + PowerShell 7 (unless specified)
CONSTRAINTS:
- DO NOT delete unless explicitly instructed.
- Prefer rename/move over destructive actions.
- Fail fast: stop on first error.
- Do not change unrelated files.
INPUTS:
- [paths, env vars, files, etc.]
OUTPUTS REQUIRED:
- [list of files/scripts/commands]
STOP CONDITIONS:
- Stop after producing outputs.
- Stop if any command fails.

EXECUTION FORMAT:
- Provide a single script in this language: [powershell|bash|python|dart]
- Include strict mode / error handling.
- Echo progress markers.

TASK:
[bulleted tasks in strict order]
'@
Set-Content -Path (Join-Path $codexDir "PROMPT_TEMPLATE.txt") -Value $promptTemplate -Encoding UTF8
Set-Content -Path (Join-Path $docsPrompts "PROMPT_TEMPLATE.txt") -Value $promptTemplate -Encoding UTF8
Ok "Prompt template written"

# 2) Workflow contract (FOREVER)
$contract = @'
# Codex â†” Jarvis Workflow Contract (ShieldMate / 2Marines)

## Roles

### Jarvis
- Produces deterministic, script-first outputs with minimal tokens.
- Uses repo conventions and paths.
- Avoids creative refactors unless explicitly requested.
- Provides phase-based scripts (00,10,20,30,99) when DevOps is involved.

### Codex
- Outputs only executable code/commands; no explanation.
- Executes tasks exactly as scripted.
- On failure, stops immediately and returns a failure block:
  - script name
  - step
  - cwd
  - command
  - exact error
  - git branch + status summary

### Joshua
- Runs scripts from repo root unless told otherwise.
- Pastes back the failure block (not the entire log unless asked).
- Approves destructive actions explicitly using: "DESTRUCTIVE OK"

## Standard Failure Block (Codex/Joshua â†’ Jarvis)

FAILURE:
- script:
- step:
- cwd:
- command:
- error:
- git:

## Guardrails
- No git reset --hard, no rebase, no deletes unless Joshua says: DESTRUCTIVE OK
- No changing secrets/Firebase rules without explicit file diff output
- No moving large directories unless planned and logged
'@
Set-Content -Path (Join-Path $docsContract "CODEX_JARVIS_CONTRACT.md") -Value $contract -Encoding UTF8
Ok "Contract written"

# 3) Canonical MCP service root = mcp\ (NOT mcp\services\)
# Exclude non-service folders/files
$commonExcludes = @("common","__pycache__",".venv",".git",".github")
function Get-McpServiceDirs {
  param([string]$Root)
  Get-ChildItem -Path $Root -Directory |
    Where-Object {
      $name = $_.Name
      ($commonExcludes -notcontains $name) -and
      ($name -notlike ".*") -and
      (Test-Path (Join-Path $_.FullName "requirements.txt") -or Test-Path (Join-Path $_.FullName "Dockerfile"))
    }
}

# 4) MCP scripts (token-minimal) aligned to your tree
$script00 = @'
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
function Ok($m){ Write-Host "[OK] $m" }

foreach($c in @("git","gcloud","docker")){
  $x = Get-Command $c -ErrorAction SilentlyContinue
  if(-not $x){ throw "Missing command: $c" }
  Ok "$c -> $($x.Source)"
}

$proj = (gcloud config get-value project 2>$null).Trim()
if(-not $proj){ throw "gcloud project not set. Run: gcloud config set project <PROJECT_ID>" }
Ok "gcloud project = $proj"

docker info *> $null
Ok "docker daemon reachable"
Write-Host "[DONE] env check"
'@
Set-Content -Path (Join-Path $mcpScripts "00_env_check.ps1") -Value $script00 -Encoding UTF8

$script10 = @'
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
param(
  [string]$Region = "us-central1",
  [string]$Repo   = "mcp",
  [string]$Tag    = "git",
  [string]$Project = ""
)
function Info($m){ Write-Host "[INFO] $m" }
function Ok($m){ Write-Host "[OK] $m" }

$RepoRoot = (git rev-parse --show-toplevel).Trim()
if(-not $RepoRoot){ throw "Not in a git repo." }

if(-not $Project){ $Project = (gcloud config get-value project 2>$null).Trim() }
if(-not $Project){ throw "No GCP project set." }

$Sha = (git rev-parse --short HEAD).Trim()
if($Tag -eq "git"){ $Tag = $Sha }

$McpRoot = Join-Path $RepoRoot "mcp"
if(-not (Test-Path $McpRoot)){ throw "Missing mcp folder at $McpRoot" }

$SharedDockerfile = Join-Path $McpRoot "Dockerfile.mcp"
if(-not (Test-Path $SharedDockerfile)){ throw "Missing shared Dockerfile: $SharedDockerfile" }

$svcDirs = Get-ChildItem -Path $McpRoot -Directory | Where-Object {
  $_.Name -notin @("common","__pycache__") -and
  (Test-Path (Join-Path $_.FullName "requirements.txt") -or Test-Path (Join-Path $_.FullName "Dockerfile"))
}
if($svcDirs.Count -eq 0){ throw "No MCP services found under $McpRoot" }

Info "Project=$Project Region=$Region Repo=$Repo Tag=$Tag Services=$($svcDirs.Count)"

foreach($d in $svcDirs){
  $name = $d.Name
  $img  = "$Region-docker.pkg.dev/$Project/$Repo/$name`:$Tag"

  if(Test-Path (Join-Path $d.FullName "Dockerfile")){
    Info "BUILD $name (local Dockerfile)"
    docker build -t $img $d.FullName
  } else {
    $rel = $d.FullName.Substring($RepoRoot.Length).TrimStart('\').Replace('\','/')
    Info "BUILD $name (shared Dockerfile) SERVICE_PATH=$rel"
    docker build -f $SharedDockerfile --build-arg SERVICE_PATH="$rel" -t $img $RepoRoot
  }

  Info "PUSH $img"
  docker push $img
  Ok "$name pushed"
}
Write-Host "[DONE] build+push"
'@
Set-Content -Path (Join-Path $mcpScripts "10_build_push.ps1") -Value $script10 -Encoding UTF8

$script20 = @'
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
param(
  [string]$Region = "us-central1",
  [string]$Repo   = "mcp",
  [string]$Tag    = "git",
  [string]$Project = "",
  [switch]$AllowUnauthenticated
)
function Info($m){ Write-Host "[INFO] $m" }
function Ok($m){ Write-Host "[OK] $m" }

$RepoRoot = (git rev-parse --show-toplevel).Trim()
if(-not $RepoRoot){ throw "Not in a git repo." }

if(-not $Project){ $Project = (gcloud config get-value project 2>$null).Trim() }
if(-not $Project){ throw "No GCP project set." }

$Sha = (git rev-parse --short HEAD).Trim()
if($Tag -eq "git"){ $Tag = $Sha }

$McpRoot = Join-Path $RepoRoot "mcp"
if(-not (Test-Path $McpRoot)){ throw "Missing mcp folder at $McpRoot" }

$svcDirs = Get-ChildItem -Path $McpRoot -Directory | Where-Object {
  $_.Name -notin @("common","__pycache__") -and
  (Test-Path (Join-Path $_.FullName "requirements.txt") -or Test-Path (Join-Path $_.FullName "Dockerfile"))
}
if($svcDirs.Count -eq 0){ throw "No MCP services found under $McpRoot" }

Info "Deploying $($svcDirs.Count) services (region=$Region tag=$Tag)"

foreach($d in $svcDirs){
  $svc = $d.Name
  $img = "$Region-docker.pkg.dev/$Project/$Repo/$svc`:$Tag"

  $args = @(
    "run","deploy",$svc,
    "--image",$img,
    "--region",$Region,
    "--project",$Project,
    "--platform","managed",
    "--port","8080",
    "--quiet"
  )
  if($AllowUnauthenticated){ $args += "--allow-unauthenticated" }
  else { $args += "--no-allow-unauthenticated" }

  Info "DEPLOY $svc"
  gcloud @args | Out-Null
  Ok "$svc deployed"
}
Write-Host "[DONE] deploy"
'@
Set-Content -Path (Join-Path $mcpScripts "20_deploy_cloudrun.ps1") -Value $script20 -Encoding UTF8

$script30 = @'
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
param(
  [string]$Region = "us-central1",
  [string]$Out = "scripts\out\mcp_health.md",
  [string]$Path = "/health"
)
function Info($m){ Write-Host "[INFO] $m" }
function Ok($m){ Write-Host "[OK] $m" }

$Project = (gcloud config get-value project 2>$null).Trim()
if(-not $Project){ throw "No GCP project set." }

$dir = Split-Path $Out -Parent
if($dir -and -not (Test-Path $dir)){ New-Item -ItemType Directory -Force -Path $dir | Out-Null }

$services = (gcloud run services list --region $Region --project $Project --format "value(metadata.name)") |
  Where-Object { $_ -and $_.Trim().Length -gt 0 }
if(-not $services){ throw "No services found in Cloud Run region=$Region" }

$ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# MCP Health Report")
$lines.Add("")
$lines.Add("- Project: $Project")
$lines.Add("- Region: $Region")
$lines.Add("- Timestamp: $ts")
$lines.Add("")
$lines.Add("| Service | URL | Status |")
$lines.Add("|---|---|---|")

foreach($svc in $services){
  $url = (gcloud run services describe $svc --region $Region --project $Project --format "value(status.url)").Trim()
  if(-not $url){ $lines.Add("| $svc |  | NO_URL |"); continue }
  $target = "$url$Path"
  try{
    $r = Invoke-WebRequest -Uri $target -Method GET -TimeoutSec 15
    $lines.Add("| $svc | $target | $($r.StatusCode) |")
    Ok "$svc $($r.StatusCode)"
  } catch {
    $lines.Add("| $svc | $target | FAIL |")
    Info "$svc FAIL"
  }
}
$lines | Set-Content -Path $Out -Encoding UTF8
Write-Host "[DONE] wrote $Out"
'@
Set-Content -Path (Join-Path $mcpScripts "30_healthcheck.ps1") -Value $script30 -Encoding UTF8

$script99 = @'
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
param(
  [string]$Region = "us-central1",
  [string]$Repo = "mcp",
  [string]$Tag = "git",
  [switch]$AllowUnauthenticated
)
& .\scripts\mcp\00_env_check.ps1
& .\scripts\mcp\10_build_push.ps1 -Region $Region -Repo $Repo -Tag $Tag
& .\scripts\mcp\20_deploy_cloudrun.ps1 -Region $Region -Repo $Repo -Tag $Tag -AllowUnauthenticated:$AllowUnauthenticated
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
& .\scripts\mcp\30_healthcheck.ps1 -Region $Region -Out ("scripts\out\mcp_health_{0}.md" -f $stamp)
Write-Host "[DONE] all"
'@
Set-Content -Path (Join-Path $mcpScripts "99_all.ps1") -Value $script99 -Encoding UTF8
Ok "MCP scripts written"

# 5) MCP README
$mcpReadme = "# MCP Scripts (Token-Minimal)`n`n## End-to-end`nFrom repo root:`n`n```powershell`n.\scripts\mcp\99_all.ps1 -Region us-central1 -Repo mcp -Tag git`n``` `n`n## Notes`n- Services are discovered under mcp\* (excluding mcp\common)`n- Tag=git uses current short commit SHA`n- Healthcheck hits /health by default; override with -Path /`n- Reports are written to scripts/out/`n"
