# ================================
# ShieldMate Windows Admin Toolkit
# ================================

function Write-AdminToolkitLog {
    param([string]$Message)

    $logDir = Join-Path $PSScriptRoot "..\logs"
    if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

    $logFile = Join-Path $logDir "admin-toolkit.log"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    "$timestamp - $Message" | Out-File -Append -FilePath $logFile
}

function Get-SystemInfo {
    Write-Host "Gathering system information..." -ForegroundColor Cyan
    Get-CimInstance Win32_OperatingSystem | Select CSName, Version, OSArchitecture
}

function Get-ServiceStatus {
    param([string]$ServiceName)
    Write-Host "Checking service: $ServiceName" -ForegroundColor Yellow
    Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
}

function Restart-ServiceSafe {
    param([string]$ServiceName)

    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

    if (!$service) {
        Write-Host "Service not found: $ServiceName" -ForegroundColor Red
        return
    }

    if ($service.Status -eq "Running") {
        Write-Host "Restarting $ServiceName" -ForegroundColor Green
        Restart-Service $ServiceName -Force
    } else {
        Write-Host "Starting $ServiceName" -ForegroundColor Yellow
        Start-Service $ServiceName
    }
}

function Get-CommonDevServices {
    Write-Host "Checking common dev services..." -ForegroundColor Cyan
    Get-Service | Where-Object {
        $_.Name -match "docker|wsl|vmcompute"
    }
}

function Test-DockerDesktopHealth {
    Write-Host "Testing Docker..." -ForegroundColor Cyan

    try {
        docker version
        Write-Host "Docker CLI OK" -ForegroundColor Green
    } catch {
        Write-Host "Docker CLI not available" -ForegroundColor Red
    }

    Get-Service -Name "com.docker.service" -ErrorAction SilentlyContinue
}

function Test-FirebaseEmulatorPorts {
    $ports = @(4000,5000,8080,8085,9000,9099)
    foreach ($port in $ports) {
        $result = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        if ($result.TcpTestSucceeded) {
            Write-Host "Port $port OPEN" -ForegroundColor Green
        } else {
            Write-Host "Port $port CLOSED" -ForegroundColor Red
        }
    }
}

function Test-McpLocalEndpoints {
    param([string[]]$Endpoints)

    foreach ($url in $Endpoints) {
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
            Write-Host "$url OK ($($response.StatusCode))" -ForegroundColor Green
        } catch {
            Write-Host "$url FAILED" -ForegroundColor Red
        }
    }
}

function Test-VSCodeDevMachine {
    Write-Host "Checking dev tools..." -ForegroundColor Cyan

    foreach ($cmd in @("git","docker","node","npm","firebase","flutter")) {
        if (Get-Command $cmd -ErrorAction SilentlyContinue) {
            Write-Host "$cmd OK" -ForegroundColor Green
        } else {
            Write-Host "$cmd MISSING" -ForegroundColor Red
        }
    }
}

function Export-DiagnosticsBundle {
    $outputDir = Join-Path $PSScriptRoot "..\output"
    if (!(Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir | Out-Null }

    $file = Join-Path $outputDir ("diagnostics_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".txt")

    Get-SystemInfo | Out-File $file
    Get-CommonDevServices | Out-File -Append $file

    Write-Host "Diagnostics exported to $file" -ForegroundColor Cyan
}

Export-ModuleMember -Function *
