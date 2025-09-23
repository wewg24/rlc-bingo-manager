# Configuration Validation Script
# Ensures critical configuration values are correct before deployment

Write-Host "🔍 Validating RLC Bingo Manager Configuration..." -ForegroundColor Yellow

$ErrorCount = 0

# Check Google Apps Script configuration
$MainJsPath = "Main.js"
if (Test-Path $MainJsPath) {
    $content = Get-Content $MainJsPath -Raw

    # Check for correct spreadsheet ID
    if ($content -match "SPREADSHEET_ID: '1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc'") {
        Write-Host "✅ Correct SPREADSHEET_ID found" -ForegroundColor Green
    } else {
        Write-Host "❌ WRONG SPREADSHEET_ID in Main.js!" -ForegroundColor Red
        Write-Host "   Expected: 1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc" -ForegroundColor Red
        $ErrorCount++
    }

    # Check for correct photos folder ID
    if ($content -match "PHOTO_FOLDER_ID: '1g0lfGUqI_dCeqv41ZxLaTyZqDAXt5Iyv'") {
        Write-Host "✅ Correct PHOTO_FOLDER_ID found" -ForegroundColor Green
    } else {
        Write-Host "❌ WRONG PHOTO_FOLDER_ID in Main.js!" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "❌ Main.js not found!" -ForegroundColor Red
    $ErrorCount++
}

# Check config.js for correct API URL
$ConfigJsPath = "js/config.js"
if (Test-Path $ConfigJsPath) {
    $content = Get-Content $ConfigJsPath -Raw
    if ($content -match "AKfycbycm0NuPj3Y_7LZU7HaB54KB87hLHbDW8e3AQ8QwSrVXktKsiP9eusYK6z_whwuxL024A") {
        Write-Host "✅ Correct API_URL found in config.js" -ForegroundColor Green
    } else {
        Write-Host "❌ WRONG API_URL in config.js!" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "⚠️  config.js not found (frontend file)" -ForegroundColor Yellow
}

# Summary
if ($ErrorCount -eq 0) {
    Write-Host "`n✅ Configuration validation PASSED" -ForegroundColor Green
    Write-Host "Safe to deploy to Google Apps Script" -ForegroundColor Green
} else {
    Write-Host "`n❌ Configuration validation FAILED" -ForegroundColor Red
    Write-Host "DO NOT DEPLOY - Fix errors first!" -ForegroundColor Red
    Write-Host "Check CRITICAL-CONFIG.md for correct values" -ForegroundColor Yellow
}

exit $ErrorCount