$ErrorActionPreference = "Stop"

$projectRoot = "D:\ShieldmateSSD\Shieldmate"
$hostingFolder = "D:\ShieldmateSSD\2marines-sites\shieldmate"
$firebaseProject = "marines-ai-agent"
$firebaseTarget = "shieldmate"
$firebaseConfig = Join-Path $projectRoot "firebase.json"

Write-Host "==> Shieldmate deploy starting..." -ForegroundColor Cyan
Write-Host "Project root: $projectRoot"
Write-Host "Hosting folder: $hostingFolder"

Set-Location $projectRoot

Write-Host "==> Installing dependencies"
npm install

Write-Host "==> Building production bundle (dist/)"
npm run build

if (-Not (Test-Path $hostingFolder)) {
  New-Item -ItemType Directory -Path $hostingFolder | Out-Null
}

Write-Host "==> Copying dist/ to Firebase hosting folder"
robocopy "$projectRoot\dist" $hostingFolder /MIR | Out-Null

if (-Not (Test-Path Env:FIREBASE_TOKEN) -and -Not (Test-Path Env:FIREBASE_SERVICE_ACCOUNT)) {
  Write-Warning "FIREBASE_TOKEN or FIREBASE_SERVICE_ACCOUNT env var not set. Set one before deploying."
}

Write-Host "==> Deploying hosting target '$firebaseTarget' to project '$firebaseProject'"
npx firebase-tools deploy --only "hosting:$firebaseTarget" --project $firebaseProject --config $firebaseConfig

Write-Host "==> Deployment complete."
Write-Host "Live site: https://shieldmate.2marines.us"
