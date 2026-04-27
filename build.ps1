param(
    [string]$Compiler = "D:\vscode\mingw\mingw64\bin\g++.exe"
)

$ErrorActionPreference = "Stop"
$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $workspace

Write-Host "Building FuzhouPulse..."
& $Compiler -std=c++17 -Wall -Wextra -pedantic .\src\server.cpp -o .\server.exe -lws2_32
Write-Host "Build completed: $workspace\server.exe"
