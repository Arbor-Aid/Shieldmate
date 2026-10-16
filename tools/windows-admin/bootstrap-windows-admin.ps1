$module = Join-Path $PSScriptRoot "ShieldMate.WindowsAdmin\ShieldMate.WindowsAdmin.psm1"
Import-Module $module -Force

Write-Host "ShieldMate Windows Admin Toolkit Loaded" -ForegroundColor Green
Get-Command -Module ShieldMate.WindowsAdmin
