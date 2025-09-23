/**
 * Emergency repair script for corrupted Google Sheets column structure
 * This script will fix the column headers and realign data
 */

function repairOccasionsSheet() {
  const SPREADSHEET_ID = '1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc';
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Occasions');

  if (!sheet) {
    console.error('Occasions sheet not found');
    return;
  }

  console.log('Current sheet structure:');
  console.log('Last row:', sheet.getLastRow());
  console.log('Last column:', sheet.getLastColumn());

  // Get current data
  const data = sheet.getDataRange().getValues();
  console.log('Current headers (row 1):', data[0]);

  if (data.length > 1) {
    console.log('Sample data (row 2):', data[1]);
  }

  // Define correct headers
  const correctHeaders = [
    'Occasion ID',
    'Date',
    'Session Type',
    'Lion in Charge',
    'Total Players',
    'Birthdays',
    'Progressive Jackpot',
    'Progressive Balls',
    'Progressive Consolation',
    'Progressive Actual',
    'Progressive Prize',
    'Check Payment',
    'Created',
    'Created By',
    'Status'
  ];

  console.log('Setting correct headers...');

  // Clear the sheet and set correct headers
  sheet.clear();
  sheet.getRange(1, 1, 1, correctHeaders.length).setValues([correctHeaders]);

  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, correctHeaders.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');

  // Set column widths
  sheet.setColumnWidth(1, 150); // Occasion ID
  sheet.setColumnWidth(2, 100); // Date
  sheet.setColumnWidth(3, 120); // Session Type
  sheet.setColumnWidth(4, 120); // Lion in Charge
  sheet.setColumnWidth(5, 80);  // Total Players
  sheet.setColumnWidth(6, 80);  // Birthdays
  sheet.setColumnWidth(7, 100); // Progressive Jackpot
  sheet.setColumnWidth(8, 100); // Progressive Balls
  sheet.setColumnWidth(9, 120); // Progressive Consolation
  sheet.setColumnWidth(10, 100); // Progressive Actual
  sheet.setColumnWidth(11, 100); // Progressive Prize
  sheet.setColumnWidth(12, 80);  // Check Payment
  sheet.setColumnWidth(13, 120); // Created
  sheet.setColumnWidth(14, 100); // Created By
  sheet.setColumnWidth(15, 80);  // Status

  // Freeze header row
  sheet.setFrozenRows(1);

  console.log('Occasions sheet structure repaired successfully');
  console.log('Headers set:', correctHeaders);

  return {
    success: true,
    message: 'Occasions sheet repaired with correct headers',
    headers: correctHeaders
  };
}

function inspectCurrentData() {
  const SPREADSHEET_ID = '1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc';
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Occasions');

  if (!sheet) {
    return { error: 'Occasions sheet not found' };
  }

  const data = sheet.getDataRange().getValues();

  return {
    success: true,
    totalRows: data.length,
    totalColumns: data[0] ? data[0].length : 0,
    headers: data[0] || [],
    sampleData: data.slice(1, 4), // First 3 data rows
    lastRow: sheet.getLastRow(),
    lastColumn: sheet.getLastColumn()
  };
}