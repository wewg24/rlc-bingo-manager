# Resume Claude Code Development Session
# This script opens a terminal and invokes Claude Code to resume where we left off

param(
    [string]$Message = "Resume where we left off with the RLC Bingo Manager project. Please analyze the current state and continue with any pending tasks.",
    [switch]$ShowStatus,
    [switch]$CheckGit
)

Write-Host "Resuming Claude Code Development Session..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# Check if we're in the right directory
$currentPath = Get-Location
$expectedPath = "rlc-bingo-manager"
if ($currentPath.Path -notlike "*$expectedPath*") {
    Write-Warning "You might not be in the rlc-bingo-manager directory. Current path: $currentPath"
}

# Show current git status if requested
if ($CheckGit) {
    Write-Host "`nCurrent Git Status:" -ForegroundColor Yellow
    git status --short

    Write-Host "`nCurrent Branch:" -ForegroundColor Yellow
    git branch --show-current
}

# Show recent files modified if requested
if ($ShowStatus) {
    Write-Host "`nRecently Modified Files:" -ForegroundColor Yellow
    Get-ChildItem -Path . -Recurse -File |
        Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-1) -and $_.Name -notlike ".*" } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 10 Name, LastWriteTime |
        Format-Table -AutoSize
}

Write-Host "`nInvoking Claude Code..." -ForegroundColor Magenta
Write-Host "Message: $Message" -ForegroundColor Gray

# Simulate Claude Code invocation (replace with actual command when available)
# For now, this will open the command palette with Claude Code extension
Write-Host "`nTo manually invoke Claude Code:" -ForegroundColor Yellow
Write-Host "   1. Press Ctrl+Shift+P" -ForegroundColor White
Write-Host "   2. Type 'Claude Code: Chat'" -ForegroundColor White
Write-Host "   3. Send this message:" -ForegroundColor White
Write-Host "      '$Message'" -ForegroundColor Cyan

Write-Host "`nReady to resume development!" -ForegroundColor Green
