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
