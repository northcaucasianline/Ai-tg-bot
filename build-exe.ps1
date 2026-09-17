$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root
Write-Host "=== AiTGAida Anna SINGLE EXE build ==="
Write-Host "Build directory: $Root"
Write-Host "Node.js: $(node -v)"
Write-Host "Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed." }
Write-Host "Building single Windows x64 EXE..."
npm run build:exe
if ($LASTEXITCODE -ne 0) { throw "EXE build failed." }
$Exe = Join-Path $Root "dist\AiTGAida-Anna.exe"
if (-not (Test-Path $Exe)) { throw "EXE was not created: $Exe" }
Write-Host ""
Write-Host "BUILD SUCCESSFUL" -ForegroundColor Green
Write-Host "EXE: $Exe"
Write-Host ""
Write-Host "The target PC does not need Node.js, npm, VS Code, Python or Git."
