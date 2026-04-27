param(
    [string]$NgrokAuthtoken = $env:NGROK_AUTHTOKEN,
    [string]$NgrokPath = "ngrok",
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

$ngrokPids = Get-Process ngrok -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id
foreach ($procId in $ngrokPids) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}

Write-Host "Compiling src\\server.cpp ..."
& "D:\vscode\mingw\mingw64\bin\g++.exe" -std=c++17 -Wall -Wextra -pedantic .\src\server.cpp -o .\server.exe -lws2_32

$serverOut = Join-Path $workspace "server_stdout.txt"
$serverErr = Join-Path $workspace "server_stderr.txt"
$portFile = Join-Path $workspace "server_port.txt"
$ngrokOut = Join-Path $workspace "ngrok_stdout.txt"
$ngrokErr = Join-Path $workspace "ngrok_stderr.txt"

foreach ($file in @($serverOut, $serverErr, $portFile, $ngrokOut, $ngrokErr)) {
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

if ([string]::IsNullOrWhiteSpace($NgrokAuthtoken)) {
    Write-Warning "NGROK_AUTHTOKEN is not set. Server is running, but ngrok cannot be configured automatically."
    Write-Host "Set NGROK_AUTHTOKEN or pass -NgrokAuthtoken <token>, then rerun this script."
    exit 0
}

$ngrokCmd = Get-Command $NgrokPath -ErrorAction SilentlyContinue
if ($null -eq $ngrokCmd) {
    Write-Warning "ngrok was not found in PATH."
    Write-Host "Install it first, or rerun this script with -NgrokPath 'C:\path\to\ngrok.exe'."
    exit 0
}

Write-Host "Configuring ngrok authtoken ..."
& $ngrokCmd.Source config add-authtoken $NgrokAuthtoken | Out-Null

Write-Host "Starting ngrok tunnel for http://127.0.0.1:$actualPort ..."
$ngrokProc = Start-Process -FilePath $ngrokCmd.Source `
    -ArgumentList @("http", "http://127.0.0.1:$actualPort") `
    -WorkingDirectory $workspace `
    -RedirectStandardOutput $ngrokOut `
    -RedirectStandardError $ngrokErr `
    -WindowStyle Hidden `
    -PassThru

Start-Sleep -Seconds 3

Write-Host "ngrok PID: $($ngrokProc.Id)"
Write-Host "Local app: http://127.0.0.1:$actualPort"
Write-Host "If the public URL is not printed below yet, open http://127.0.0.1:4040 in your browser to inspect the tunnel."

if (Test-Path $ngrokOut) {
    Get-Content -LiteralPath $ngrokOut
}
