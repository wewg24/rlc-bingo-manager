# Advanced Claude Code Resume Script
# This script provides multiple ways to resume your Claude Code session

param(
    [string]$Mode = "interactive",  # Options: interactive, auto, status-only
    [string]$CustomMessage = "",
    [switch]$OpenFiles,
    [switch]$Verbose
)

function Show-Banner {
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host "                 CLAUDE CODE RESUME SESSION                     " -ForegroundColor Cyan
    Write-Host "=================================================================" -ForegroundColor Cyan
}

function Get-RecentActivity {
    Write-Host "`nRecent Activity Summary:" -ForegroundColor Yellow
    
    # Git changes
    $gitStatus = git status --porcelain 2>$null
    if ($gitStatus) {
        Write-Host "`nUncommitted Changes:" -ForegroundColor Red
        $gitStatus | ForEach-Object { Write-Host "   $_" }
    }
    
    # Recent commits
    Write-Host "`nRecent Commits:" -ForegroundColor Green
    git log --oneline -5 2>$null | ForEach-Object { Write-Host "   $_" }
    
    # Recently modified files
    Write-Host "`nRecently Modified Files (last 24h):" -ForegroundColor Blue
    Get-ChildItem -Recurse -File | 
        Where-Object { 
            $_.LastWriteTime -gt (Get-Date).AddHours(-24) -and 
            $_.Name -notmatch "^\." -and
            $_.Directory.Name -notmatch "node_modules|\.git" 
        } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 8 |
        ForEach-Object { 
            Write-Host "   $($_.Name) - $($_.LastWriteTime.ToString('HH:mm'))" 
        }
}

function Get-ProjectContext {
    $currentBranch = git branch --show-current 2>$null
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
    
    $context = "RLC Bingo Manager Project Context:
    
Project Type: Frontend (GitHub Pages) + Backend (Google Apps Script)
Current Branch: $currentBranch
Last Activity: $timestamp

Quick Status Check:
- Configuration files: PROJECT-CONFIG.json, CRITICAL-CONFIG.md
- Key files: Code.gs, index.html, admin.html  
- Data files: session-games.json, pulltabs-library.json

Common Tasks:
- Sync with Google Apps Script (clasp pull/push)
- Update game sessions and pull-tab data
- Frontend UI improvements
- Configuration validation

Please analyze the current state and suggest next steps or continue with pending tasks."
    
    return $context
}

function Open-RecentFiles {
    # Default to true if not specified - check if OpenFiles was explicitly set to false
    if (-not $PSBoundParameters.ContainsKey('OpenFiles') -or $OpenFiles) {
        Write-Host "`nOpening recent files in VS Code..." -ForegroundColor Magenta
        
        $recentFiles = @(
            "PROJECT-CONFIG.json",
            "CRITICAL-CONFIG.md", 
            "Code.gs",
            "index.html"
        )
        
        foreach ($file in $recentFiles) {
            if (Test-Path $file) {
                code $file
                Start-Sleep -Milliseconds 200
            }
        }
    }
}

function Invoke-ClaudeCode {
    param([string]$Message)
    
    Write-Host "`nPreparing Claude Code session..." -ForegroundColor Magenta
    Write-Host "Context Message:" -ForegroundColor Gray
    Write-Host $Message -ForegroundColor White
    
    # Try to use VS Code command if available
    Write-Host "`nQuick Actions:" -ForegroundColor Yellow
    Write-Host "   1. Press Ctrl+Shift+P and type 'Claude Code'" -ForegroundColor White
    Write-Host "   2. Or use Ctrl+Alt+C for new chat" -ForegroundColor White
    Write-Host "   3. Paste the context message above" -ForegroundColor White
    
    # Copy to clipboard if possible
    try {
        $Message | Set-Clipboard
        Write-Host "`nMessage copied to clipboard!" -ForegroundColor Green
    }
    catch {
        Write-Host "`nCould not copy to clipboard, please copy manually" -ForegroundColor Yellow
    }
}

# Main execution
Show-Banner

switch ($Mode) {
    "status-only" {
        Get-RecentActivity
        exit
    }
    
    "auto" {
        Get-RecentActivity
        $contextMessage = Get-ProjectContext
        if ($CustomMessage) {
            $contextMessage += "`n`nCustom Request: $CustomMessage"
        }
        Invoke-ClaudeCode -Message $contextMessage
        Open-RecentFiles
    }
    
    "interactive" {
        Get-RecentActivity
        
        Write-Host "`nWhat would you like to do?" -ForegroundColor Yellow
        Write-Host "   1. Resume with full context"
        Write-Host "   2. Quick status check only" 
        Write-Host "   3. Custom message to Claude"
        Write-Host "   4. Open recent files only"
        
        $choice = Read-Host "`nEnter choice (1-4)"
        
        switch ($choice) {
            "1" { 
                $contextMessage = Get-ProjectContext
                Invoke-ClaudeCode -Message $contextMessage
                Open-RecentFiles
            }
            "2" { 
                Write-Host "Status check complete!" -ForegroundColor Green 
            }
            "3" { 
                $customMsg = Read-Host "Enter your message for Claude"
                $contextMessage = Get-ProjectContext + "`n`nRequest: $customMsg"
                Invoke-ClaudeCode -Message $contextMessage
            }
            "4" { 
                Open-RecentFiles 
            }
            default { 
                Write-Host "Invalid choice. Running default action..." -ForegroundColor Red
                $contextMessage = Get-ProjectContext
                Invoke-ClaudeCode -Message $contextMessage
            }
        }
    }
}

Write-Host "`nClaude Code resume session ready!" -ForegroundColor Green