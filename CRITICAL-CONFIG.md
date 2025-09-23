# 🚨 CRITICAL CONFIGURATION - DO NOT MODIFY WITHOUT APPROVAL 🚨

## ⚠️ WARNING: These values are PRODUCTION CONFIGURATION
## Changing these will break the live system and cause data loss!

### Google Services Configuration
```javascript
SPREADSHEET_ID: '1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc'  // ⚠️ LIVE DATA
DRIVE_FOLDER_ID: '13y-jTy3lcFazALyI4DrmeaQx8kLkCY-a'
PHOTOS_FOLDER_ID: '1g0lfGUqI_dCeqv41ZxLaTyZqDAXt5Iyv'
REPORTS_FOLDER_ID: '1KiT6GB8onDmXxwNYpi9npsBzxOvDvxz4'
```

### Deployment Configuration
```
Script ID: 1W8URFctBaFd98FQpdzi7tI8h8OnUPi1rT-Et_SJRkKiMuVKra34pN5hU
Deployment ID: AKfycbycm0NuPj3Y_7LZU7HaB54KB87hLHbDW8e3AQ8QwSrVXktKsiP9eusYK6z_whwuxL024A
Web App URL: https://script.google.com/macros/s/AKfycbycm0NuPj3Y_7LZU7HaB54KB87hLHbDW8e3AQ8QwSrVXktKsiP9eusYK6z_whwuxL024A/exec
```

### Repository Configuration
```
GitHub Repo: https://github.com/wewg24/rlc-bingo-manager
Live Site: https://wewg24.github.io/rlc-bingo-manager/
```

## 🛡️ VALIDATION CHECKLIST
Before making ANY changes to Google Apps Script configuration:

- [ ] Verify SPREADSHEET_ID matches: `1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc`
- [ ] Test API response at: `{WEB_APP_URL}?path=occasions`
- [ ] Confirm live site can load occasions list
- [ ] Verify editing/saving occasions works
- [ ] Check that session types display as "5-1", not dates

## 🚫 NEVER CHANGE THESE VALUES WITHOUT:
1. ✅ User approval
2. ✅ Full backup of current working state
3. ✅ Testing plan for rollback
4. ✅ Verification that new values are correct

## 📍 LAST KNOWN WORKING STATE
- **Date**: 2025-09-23
- **Version**: 31
- **Status**: WORKING - Occasions load correctly, no CORS errors
- **Validator**: bill.wiggins@phelps-county-bank.com