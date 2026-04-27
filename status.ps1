$ErrorActionPreference = "Stop"
$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $workspace

$server = Get-Process server -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $server) {
    Write-Host "Server status: stopped"
    exit 0
}

$listen = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $_.OwningProcess -eq $server.Id } |
    Sort-Object LocalPort |
    Select-Object -First 1

if ($null -eq $listen) {
    Write-Host "Server status: running, but no listening socket was detected"
    Write-Host "PID: $($server.Id)"
    exit 0
}

Write-Host "Server status: running"
Write-Host "PID: $($server.Id)"
Write-Host "Address: $($listen.LocalAddress)"
Write-Host "Port: $($listen.LocalPort)"
Write-Host "URL: http://127.0.0.1:$($listen.LocalPort)/"
