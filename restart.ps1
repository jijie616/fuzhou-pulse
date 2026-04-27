param(
    [string]$Compiler = "D:\vscode\mingw\mingw64\bin\g++.exe"
)

$ErrorActionPreference = "Stop"
$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $workspace

& (Join-Path $workspace "stop.ps1")
& (Join-Path $workspace "run.ps1") -Compiler $Compiler
