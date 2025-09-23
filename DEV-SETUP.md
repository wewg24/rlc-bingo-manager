# RLC Bingo Manager - Development Setup

This document explains how to quickly restore your development environment in VS Code with Claude Code.

## Quick Start (Restore Workspace)

1. **Open VS Code**
2. **File → Open Workspace from File**
3. **Select:** `RLC-Bingo-Manager.code-workspace`
4. **Run setup script:** Press `Ctrl+Shift+P` → "Tasks: Run Task" → "Setup Environment"

## What This Workspace Includes

### 🔧 **Automated Tools**
- **GitHub Integration**: Deploy key configured for direct push access
- **Google Apps Script**: `clasp` configured for direct editing
- **Claude Code**: Extension with project-specific settings

### 📋 **Available Tasks** (Ctrl+Shift+P → "Tasks: Run Task")
- **Setup Environment**: Check all authentication and connections
- **Sync with Google Apps Script**: Pull latest Google Apps Script files
- **Deploy to Google Apps Script**: Push changes to Google Apps Script
- **Check Git Status**: Quick git status check
- **Push to GitHub**: Deploy to GitHub (auto-deploys to live site)
- **Full Sync**: Pull from Google Apps Script + check git status

### 🌐 **Project URLs**
- **Live Site**: https://wewg24.github.io/rlc-bingo-manager/
- **GitHub Repo**: https://github.com/wewg24/rlc-bingo-manager
- **Google Apps Script**: [Project Link](https://script.google.com/home/projects/1W8URFctBaFd98FQpdzi7tI8h8OnUPi1rT-Et_SJRkKiMuVKra34pN5hU/edit)

### 🚀 **Quick Commands**
```powershell
# Setup environment
.\scripts\setup-environment.ps1

# Quick sync (pull Google Apps Script + check git)
.\scripts\quick-sync.ps1

# Open all project URLs
node scripts\open-live-site.js
```

## Workflow

### 1. **Making Changes to Google Apps Script**
```bash
clasp pull        # Get latest from Google Apps Script
# Edit .js files
clasp push        # Deploy changes
```

### 2. **Making Changes to Frontend**
```bash
# Edit index.html, js/, css/ files
git add .
git commit -m "Description of changes"
git push origin main    # Auto-deploys to live site
```

### 3. **Debugging Issues**
- Use Tasks → "Full Sync" to check everything
- Check console logs at live site
- Use Claude Code for intelligent debugging

## Authentication Status

- ✅ **GitHub**: Deploy key configured for `wewg24/rlc-bingo-manager`
- ✅ **Google Apps Script**: `clasp` logged in as `wewg24@gmail.com`
- ✅ **Claude Code**: Extension configured with project permissions

## File Structure

```
rlc-bingo-manager/
├── 📁 .claude/                 # Claude Code settings
├── 📁 scripts/                 # Automation scripts
├── 📄 .clasp.json             # Google Apps Script project config
├── 📄 *.js                    # Google Apps Script files (synced via clasp)
├── 📄 index.html              # Main frontend file
├── 📁 js/                     # Frontend JavaScript
├── 📁 css/                    # Styles
└── 📄 RLC-Bingo-Manager.code-workspace  # VS Code workspace config
```

## Emergency Recovery

If authentication is lost:

1. **GitHub**: Deploy key is persistent (no action needed)
2. **Google Apps Script**: Run `clasp login` in terminal
3. **Claude Code**: Should auto-restore with workspace

## Notes

- **Auto-save enabled**: Files save automatically after 1 second
- **Git auto-fetch**: Always shows latest remote status
- **Integrated terminal**: Opens in project directory
- **Smart commits**: Git will suggest commit messages