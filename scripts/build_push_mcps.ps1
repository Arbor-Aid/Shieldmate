# Builds + pushes Docker images for mcp/<service>/app.py (excluding mcp/common). NO DEPLOY.
$ErrorActionPreference = "Stop"

if(-not $env:AR_PROJECT -or -not $env:AR_REPO){
  throw "Missing env vars: AR_PROJECT and/or AR_REPO"
}

$shortSha = ""
try { $shortSha = (git rev-parse --short HEAD).Trim() } catch { $shortSha = "nosha" }
$tag = "0.1.0-$shortSha"

$services = Get-ChildItem -Directory "mcp" | Where-Object { $_.Name -ne "common" -and (Test-Path (Join-Path $_.FullName "app.py")) }

$results = @()

foreach($s in $services){
  $name = $s.Name
  $image = "us-docker.pkg.dev/$($env:AR_PROJECT)/$($env:AR_REPO)/$name:$tag"

  Write-Host "[INFO] Building $name -> $image"

  docker build -f "mcp\Dockerfile.mcp" --build-arg SERVICE_PATH="$name" -t $image "mcp" 2>$null
  docker push $image 2>$null

  $results += [pscustomobject]@{ service=$name; image=$image }
}

Write-Host "`nSummary:"
$results | Sort-Object service | Format-Table -AutoSize
