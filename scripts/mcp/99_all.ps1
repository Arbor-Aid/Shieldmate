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
