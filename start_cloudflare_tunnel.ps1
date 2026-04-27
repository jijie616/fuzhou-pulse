param(
    [string]$CloudflaredPath = "cloudflared",
    [int]$Port = 8081
)

$ErrorActionPreference = "Stop"
$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $workspace

Write-Host "Workspace: $workspace"

$serverPids = Get-Process server -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id
foreach ($procId in $serverPids) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}

$cloudflaredPids = Get-Process cloudflared -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id
foreach ($procId in $cloudflaredPids) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}

Write-Host "Compiling src\\server.cpp ..."
& "D:\vscode\mingw\mingw64\bin\g++.exe" -std=c++17 -Wall -Wextra -pedantic .\src\server.cpp -o .\server.exe -lws2_32

$serverOut = Join-Path $workspace "server_stdout.txt"
$serverErr = Join-Path $workspace "server_stderr.txt"
$portFile = Join-Path $workspace "server_port.txt"
$cloudflaredOut = Join-Path $workspace "cloudflared_stdout.txt"
$cloudflaredErr = Join-Path $workspace "cloudflared_stderr.txt"

foreach ($file in @($serverOut, $serverErr, $portFile, $cloudflaredOut, $cloudflaredErr)) {
    if (Test-Path $file) {
        Remove-Item -LiteralPath $file -Force
    }
}

Write-Host "Starting server.exe ..."
$serverProc = Start-Process -FilePath (Join-Path $workspace "server.exe") `
    -WorkingDirectory $workspace `
    -RedirectStandardOutput $serverOut `
    -RedirectStandardError $serverErr `
    -WindowStyle Hidden `
    -PassThru

Start-Sleep -Seconds 1

if (!(Test-Path $portFile)) {
    throw "server_port.txt was not created. The server may have failed to start."
}

$actualPort = (Get-Content -LiteralPath $portFile | Select-Object -First 1).Trim()
Write-Host "Server PID: $($serverProc.Id)"
Write-Host "Server port: $actualPort"

$cloudflaredCmd = Get-Command $CloudflaredPath -ErrorAction SilentlyContinue
if ($null -eq $cloudflaredCmd) {
    throw "cloudflared was not found. Install it first, or pass -CloudflaredPath 'C:\path\to\cloudflared.exe'."
}

Write-Host "Starting Cloudflare quick tunnel for http://127.0.0.1:$actualPort ..."
$cloudflaredProc = Start-Process -FilePath $cloudflaredCmd.Source `
    -ArgumentList @("tunnel", "--url", "http://127.0.0.1:$actualPort") `
    -WorkingDirectory $workspace `
    -RedirectStandardOutput $cloudflaredOut `
    -RedirectStandardError $cloudflaredErr `
    -WindowStyle Hidden `
    -PassThru

Start-Sleep -Seconds 5

Write-Host "cloudflared PID: $($cloudflaredProc.Id)"
Write-Host "Local app: http://127.0.0.1:$actualPort"
Write-Host "Quick Tunnel uses a random trycloudflare.com URL. Check the log below for the generated address."

if (Test-Path $cloudflaredOut) {
    Get-Content -LiteralPath $cloudflaredOut
}
if (Test-Path $cloudflaredErr) {
    Get-Content -LiteralPath $cloudflaredErr
}
