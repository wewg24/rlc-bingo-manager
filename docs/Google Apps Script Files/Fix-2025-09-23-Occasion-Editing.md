# Fix: Occasion Editing Duplication Issue - 2025-09-23

## Problem
- When editing an existing occasion in the admin interface, it was creating duplicate records instead of updating the existing one
- Session type was showing as "Unknown" in the occasions table
- Data field mapping inconsistencies between frontend and Google Sheets

## Root Cause
1. **Google Apps Script `saveOccasionComplete` function** always created new occasion IDs and never checked for `isUpdate` flag
2. **Session type mapping mismatch**: Frontend expected keys like "5-1" but Google Sheets stored full labels like "1st/5th Monday"
3. **Field name inconsistencies** between Google Sheets headers and frontend expectations

## Solution Applied
### 1. Fixed `saveOccasionComplete` function in Main.js:
```javascript
// Before: Always created new ID
const occasionId = 'OCC_' + new Date().getTime();

// After: Check for update flag
const isUpdate = data.isUpdate && data.occasionId;
const occasionId = isUpdate ? data.occasionId : 'OCC_' + new Date().getTime();

// Added update logic
if (isUpdate) {
  // Find and update existing row
  const sheetData = occasionSheet.getDataRange().getValues();
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] === occasionId) {
      occasionRow[12] = sheetData[i][12] || new Date(); // Preserve created date
      occasionSheet.getRange(i + 1, 1, 1, occasionRow.length).setValues([occasionRow]);
      break;
    }
  }
} else {
  // Add new row
  occasionSheet.appendRow(occasionRow);
}
```

### 2. Fixed `getOccasions` function field mapping:
```javascript
// Added session type mapping
const sessionTypeMap = {
  '1st/5th Monday': '5-1',
  '2nd Monday': '6-2',
  '3rd Monday': '7-3',
  '4th Monday': '8-4'
};

// Map to frontend expected field names
return {
  id: obj['Occasion ID'],
  date: obj['Date'],
  sessionType: sessionTypeMap[obj['Session Type']] || obj['Session Type'],
  lionInCharge: obj['Lion in Charge'] || obj['Lion'],
  totalPlayers: obj['Total Players'] || 0,
  totalRevenue: obj['Total Revenue'] || 0,
  netProfit: obj['Net Profit'] || 0,
  status: obj['Status']
};
```

## Result
- ✅ Editing occasions now updates existing records instead of creating duplicates
- ✅ Session types display correctly in the occasions table
- ✅ Field mapping consistent between frontend and backend
- ✅ Online status indicator shows proper connection

## Deployed
- Google Apps Script updated via `clasp push`
- Changes are live on the production API endpoint