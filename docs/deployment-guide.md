# Deployment Guide

## Prerequisites
- Google Account
- Access to Google Sheets
- Administrator permissions

## Step 1: Google Apps Script Setup

### 1.1 Access Script Editor
1. Open your Google Sheet
2. Go to Extensions → Apps Script
3. Delete default code

### 1.2 Import Source Files
Copy all files from `/src/apps-script/`:
- Code.gs
- HelperFunctions.gs
- Setup.gs
- appsscript.json

Copy all HTML files from `/src/html/`:
- index.html
- doorSales.html
- pullTabManager.html
- bingoGames.html
- cashClose.html
- reports.html

### 1.3 Enable APIs
1. Click Settings (gear icon)
2. Enable "Show appsscript.json"
3. Save settings

### 1.4 Run Initial Setup
```javascript
setupSystem()
