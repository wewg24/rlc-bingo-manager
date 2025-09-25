# RLC Bingo Manager - Claude Development Notes

## Project Structure

### Frontend (GitHub Repository)
- Repository: https://github.com/wewg24/rlc-bingo-manager
- Frontend files: `admin.html`, `index.html`, `occasion.html`, etc.
- Hosted on GitHub Pages: https://wewg24.github.io/rlc-bingo-manager/
- **Deploy Process**: Git commit and push to `main` branch

### Backend (Google Apps Script Project)
- **Project ID**: `1W8URFctBaFd98FQpdzi7tI8h8OnUPi1rT-Et_SJRkKiMuVKra34pN5hU`
- **File**: `Code.gs` (single file, no folders)
- **API URL**: https://script.google.com/macros/s/AKfycbzT7N4Ul9mF3KDqOx9nuIeA-IdOeKBeDT18cYMjPcKsUgy3_Ud9iXqFriMGQLQ2otJTSw/exec
- **Deploy Process**: Use `clasp` commands

## Deployment Commands

### Deploy Frontend Changes
```bash
git add <files>
git commit -m "Description of changes"
git push origin main
```

### Deploy Backend Changes
```bash
# Push code to Google Apps Script project
clasp push

# Create new deployment (if needed)
clasp deploy --description "Description of changes"

# List deployments
clasp deployments

# Remove old deployments if needed (max 20 allowed)
clasp undeploy <deployment-id>
```

## Important Notes

1. **Code.gs is NOT tracked in GitHub** - it's deployed directly to Google Apps Script
2. **Frontend and backend are separate** - changes to admin.html go to GitHub, changes to Code.gs go to Google Apps Script
3. **API URL changes** with each new deployment - update frontend if needed
4. **Maximum 20 deployments** - remove old ones before creating new ones

## Current Version Info

### Frontend (GitHub)
- Last commit: f562a34
- Version: 11.1.2-cache-busting

### Backend (Google Apps Script)
- Deployment: @86 - AKfycbweRj6cAYCQ0XibjfXfXXPQBc9voXhJJs-dQaM_5AixcTRlmgscOd2mamy5UTDg5v5ptw
- Version: v11.3.0-punchlist-fixes
- Features: pull-tabs-library-152-games, session-games-68-total, cache-busting-support, pull-tab-crud-operations, enhanced-error-handling, save-occasion-api-fix

## Recent Changes (Sep 25, 2025)

### Comprehensive Punchlist Fixes (v11.3.0)

#### Admin Dashboard Enhancements
- **Session Games Management**: Added complete CRUD functionality with Add Game, Add Session, Edit, and Delete modal interfaces
- **Pull-Tab Library Management**: Fixed Edit/Add buttons, implemented real-time search functionality, added status column editing
- **PDF Modal Viewer**: Added in-app PDF viewer replacing new tab opening
- **Enhanced Error Handling**: Improved retry mechanisms and user feedback across all admin functions

#### Mobile Occasion Entry Fixes
- **Session Games Display**: Implemented proper session games loading in Game Results tab with JSONP support
- **Pull-Tab Library Dropdown**: Fixed missing library games by implementing proper API loading
- **UI Improvements**: Changed "Add Special Event" to "Add Custom", removed confusing Check columns from both tables
- **Review & Submit Totals**: Implemented comprehensive totals calculation that carries over all data from previous steps

#### Backend API Fixes
- **Save Occasion Support**: Added support for `save-occasion` action (frontend was calling this but backend only supported `saveOccasion`)
- **Enhanced Error Handling**: Improved saveDraft functionality with better debugging and error recovery
- **JSONP Compatibility**: Ensured all read operations work properly with JSONP to avoid CORS issues

#### Data Structure Improvements
- **Session Games**: Fixed table structure alignment between HTML headers and JavaScript-generated rows
- **Pull-Tab Management**: Corrected column mapping and added proper SE (Special Event) checkbox handling
- **Status Management**: Added editable status dropdown for pull-tab games (Active, Discontinued, Special Event, Out of Stock)

### Previous Changes
- Fixed JSONP timeout errors with retry/reload buttons
- Switched pull-tab operations from fetch to JSONP (avoid CORS)
- Changed price input to dropdown in add pull-tab dialog
- Added PDF modal popup viewer (replaces new tab opening)
- Enhanced error recovery with user self-mitigation options
- Added `add-pull-tab-game` API endpoint
- Added `update-pull-tab-game` API endpoint
- Added `handleAddPullTabGame()` and `handleUpdatePullTabGame()` functions
- Added `saveToJsonFile()` utility function