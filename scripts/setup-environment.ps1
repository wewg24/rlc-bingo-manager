# RLC Bingo Manager - Environment Setup Script
# This script ensures all tools are ready and authenticated

Write-Host "🚀 Setting up RLC Bingo Manager development environment..." -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path ".git")) {
    Write-Host "❌ Not in a git repository. Please run from project root." -ForegroundColor Red
    exit 1
}

# Check Git configuration
Write-Host "📊 Checking Git status..." -ForegroundColor Yellow
git status

# Check if clasp is logged in
Write-Host "🔐 Checking Google Apps Script authentication..." -ForegroundColor Yellow
$claspStatus = clasp login --status 2>&1
if ($claspStatus -match "not logged in") {
    Write-Host "❌ Not logged into Google Apps Script. Running login..." -ForegroundColor Red
    clasp login
} else {
    Write-Host "✅ Google Apps Script authenticated" -ForegroundColor Green
}

# Check clasp project status
Write-Host "📋 Checking Google Apps Script project status..." -ForegroundColor Yellow
clasp status

# Check if SSH key is configured for GitHub
Write-Host "🔑 Testing GitHub SSH connection..." -ForegroundColor Yellow
$sshTest = ssh -T git@github.com 2>&1
if ($sshTest -match "successfully authenticated") {
    Write-Host "✅ GitHub SSH connection working" -ForegroundColor Green
} else {
    Write-Host "⚠️  GitHub SSH may need configuration" -ForegroundColor Yellow
}

# Show project URLs
Write-Host "`n🌐 Project URLs:" -ForegroundColor Cyan
Write-Host "GitHub: https://github.com/wewg24/rlc-bingo-manager" -ForegroundColor Blue
Write-Host "Live Site: https://wewg24.github.io/rlc-bingo-manager/" -ForegroundColor Blue
Write-Host "Google Apps Script: https://script.google.com/home/projects/1W8URFctBaFd98FQpdzi7tI8h8OnUPi1rT-Et_SJRkKiMuVKra34pN5hU/edit" -ForegroundColor Blue

Write-Host "`n✅ Environment setup complete!" -ForegroundColor Green
Write-Host "💡 Use Ctrl+Shift+P in VS Code and search for 'Tasks: Run Task' to access quick commands" -ForegroundColor Cyan