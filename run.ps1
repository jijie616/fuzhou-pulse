param(
    [string]$Compiler = "D:\vscode\mingw\mingw64\bin\g++.exe"
)

$ErrorActionPreference = "Stop"
$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $workspace

Write-Host "Stopping existing server instances..."
Get-Process server -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

Write-Host "Building server.exe..."
& (Join-Path $workspace "build.ps1") -Compiler $Compiler

$serverOut = Join-Path $workspace "server_stdout.txt"
$serverErr = Join-Path $workspace "server_stderr.txt"
$portFile = Join-Path $workspace "server_port.txt"

foreach ($file in @($serverOut, $serverErr, $portFile)) {
    if (Test-Path $file) {
        Remove-Item -LiteralPath $file -Force
    }
}

Write-Host "Starting server.exe in background..."
$proc = Start-Process -FilePath (Join-Path $workspace "server.exe") `
    -WorkingDirectory $workspace `
    -RedirectStandardOutput $serverOut `
    -RedirectStandardError $serverErr `
    -WindowStyle Hidden `
    -PassThru

Start-Sleep -Seconds 1

if (!(Test-Path $portFile)) {
    throw "server_port.txt was not created. Server may have failed to start."
}

$port = (Get-Content -LiteralPath $portFile | Select-Object -First 1).Trim()
Write-Host "Server PID: $($proc.Id)"
Write-Host "Listening on: http://127.0.0.1:$port/"
