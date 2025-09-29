# Quick Resume Claude Code - Keyboard Shortcut Helper
# This creates user-level keybindings for VS Code

$userKeybindingsPath = "$env:APPDATA\Code\User\keybindings.json"

# Read existing keybindings if they exist
$existingBindings = @()
if (Test-Path $userKeybindingsPath) {
    try {
        $existingContent = Get-Content $userKeybindingsPath -Raw | ConvertFrom-Json
        $existingBindings = $existingContent
        Write-Host "Found existing keybindings file" -ForegroundColor Yellow
    }
    catch {
        Write-Host "Existing keybindings file has issues, will recreate" -ForegroundColor Yellow
        $existingBindings = @()
    }
}

# New keybindings to add
$newBindings = @(
    @{
        "key" = "ctrl+shift+r"
        "command" = "workbench.action.tasks.runTask"
        "args" = "Resume Claude Code Session"
    },
    @{
        "key" = "ctrl+alt+c" 
        "command" = "claude-code.newChat"
    }
)

# Merge with existing (remove duplicates)
$allBindings = @()
$allBindings += $existingBindings | Where-Object { 
    $_.key -ne "ctrl+shift+r" -and $_.key -ne "ctrl+alt+c" 
}
$allBindings += $newBindings

# Save to user keybindings
$allBindings | ConvertTo-Json -Depth 3 | Out-File -FilePath $userKeybindingsPath -Encoding UTF8

Write-Host "Updated user keybindings at:" -ForegroundColor Green
Write-Host "  $userKeybindingsPath" -ForegroundColor Gray
Write-Host "Added shortcuts:" -ForegroundColor Green
Write-Host "  Ctrl+Shift+R - Resume Claude Code Session" -ForegroundColor Yellow
Write-Host "  Ctrl+Alt+C - New Claude Code Chat" -ForegroundColor Yellow
Write-Host "Restart VS Code for keybindings to take effect!" -ForegroundColor Cyan
