# Quick sync script for RLC Bingo Manager
# Pulls latest from Google Apps Script and checks git status

Write-Host "🔄 Quick sync starting..." -ForegroundColor Green

# Pull latest from Google Apps Script
Write-Host "📥 Pulling latest from Google Apps Script..." -ForegroundColor Yellow
clasp pull

# Check git status
Write-Host "📊 Checking git status..." -ForegroundColor Yellow
git status

# Check if there are any changes to commit
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "`n📝 Changes detected:" -ForegroundColor Yellow
    git status --short
    Write-Host "`n💡 Use 'git add .' and 'git commit -m \"message\"' to commit changes" -ForegroundColor Cyan
} else {
    Write-Host "✅ Working directory clean" -ForegroundColor Green
}

Write-Host "`n🔄 Quick sync complete!" -ForegroundColor Green