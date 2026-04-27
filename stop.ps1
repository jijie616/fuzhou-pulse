$ErrorActionPreference = "Stop"
$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $workspace

$serverPids = Get-Process server -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id
if (-not $serverPids) {
    Write-Host "No running server.exe process was found."
    exit 0
}

foreach ($procId in $serverPids) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Milliseconds 500
Write-Host "Stopped server process(es): $($serverPids -join ', ')"
