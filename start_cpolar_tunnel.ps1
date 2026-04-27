param(
    [string]$CpolarAuthtoken = $env:CPOLAR_AUTHTOKEN,
    [string]$CpolarPath = "cpolar",
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

$cpolarPids = Get-Process cpolar -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id
foreach ($procId in $cpolarPids) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}

Write-Host "Compiling src\\server.cpp ..."
& "D:\vscode\mingw\mingw64\bin\g++.exe" -std=c++17 -Wall -Wextra -pedantic .\src\server.cpp -o .\server.exe -lws2_32

$serverOut = Join-Path $workspace "server_stdout.txt"
$serverErr = Join-Path $workspace "server_stderr.txt"
$portFile = Join-Path $workspace "server_port.txt"
$cpolarOut = Join-Path $workspace "cpolar_stdout.txt"
$cpolarErr = Join-Path $workspace "cpolar_stderr.txt"

foreach ($file in @($serverOut, $serverErr, $portFile, $cpolarOut, $cpolarErr)) {
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

$cpolarCmd = Get-Command $CpolarPath -ErrorAction SilentlyContinue
if ($null -eq $cpolarCmd) {
    throw "cpolar was not found. Install it first, or pass -CpolarPath 'C:\path\to\cpolar.exe'."
}

if ([string]::IsNullOrWhiteSpace($CpolarAuthtoken)) {
    throw "CPOLAR_AUTHTOKEN is not set. Pass -CpolarAuthtoken <token> or set the environment variable first."
}

Write-Host "Configuring cpolar authtoken ..."
& $cpolarCmd.Source authtoken $CpolarAuthtoken | Out-Null

Write-Host "Starting cpolar tunnel for http://127.0.0.1:$actualPort ..."
$cpolarProc = Start-Process -FilePath $cpolarCmd.Source `
    -ArgumentList @("http", "$actualPort") `
    -WorkingDirectory $workspace `
    -RedirectStandardOutput $cpolarOut `
    -RedirectStandardError $cpolarErr `
    -WindowStyle Hidden `
    -PassThru

Start-Sleep -Seconds 4

Write-Host "cpolar PID: $($cpolarProc.Id)"
Write-Host "Local app: http://127.0.0.1:$actualPort"
Write-Host "If the public URL is not visible below yet, open the cpolar local dashboard at http://127.0.0.1:9200/."

if (Test-Path $cpolarOut) {
    Get-Content -LiteralPath $cpolarOut
}
