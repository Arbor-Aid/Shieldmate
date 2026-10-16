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
