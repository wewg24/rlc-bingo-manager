/**
 * RLC BINGO MANAGER - SETUP AND UTILITIES
 * One-time setup script and utility functions
 * Run setupSystem() once to initialize everything
 */

// ==========================================
// MASTER SETUP FUNCTION - FIXED VERSION
// ==========================================

/**
 * Run this function once to set up the entire system
 */
function setupSystem() {
  console.log('Starting RLC Bingo Manager Setup...');
  
  try {
    // 1. Initialize all sheets
    console.log('Step 1: Initializing sheets...');
    initializeAllSheets();
    
    // 2. Set up triggers
    console.log('Step 2: Setting up triggers...');
    setupTriggers();
    
    // 3. Create folder structure
    console.log('Step 3: Creating folder structure...');
    createFolderStructure();
    
    // 4. Load default data
    console.log('Step 4: Loading default data...');
    loadDefaultData();
    
    // 5. Set script properties
    console.log('Step 5: Setting script properties...');
    setScriptProperties();
    
    // 6. Create menu - ONLY if run from spreadsheet
    console.log('Step 6: Checking context for menu creation...');
    try {
      // This will only work if run from a spreadsheet
      createCustomMenu();
      console.log('✓ Custom menu created');
    } catch (menuError) {
      console.log('ℹ️ Menu creation skipped (run onOpen() from spreadsheet to create menu)');
    }
    
    // 7. Test connections
    console.log('Step 7: Testing connections...');
    testConnections();
    
    console.log('✅ Setup completed successfully!');
    console.log('');
    console.log('NEXT STEPS:');
    console.log('1. Open your spreadsheet');
    console.log('2. Refresh the page');
    console.log('3. You should see "🎰 Bingo Manager" menu');
    console.log('4. If not, run onOpen() function manually');
    console.log('5. Deploy as Web App to start using the system');
    
    // Generate setup report
    return generateSetupReport();
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

// ==========================================
// SETUP FUNCTIONS
// ==========================================

/**
 * Set up time-based triggers
 */
function setupTriggers() {
  // Remove existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Daily backup at 2 AM
  ScriptApp.newTrigger('createDailyBackup')
    .timeBased()
    .atHour(2)
    .everyDays(1)
    .create();
  
  // Weekly report generation - Monday at 9 AM
  ScriptApp.newTrigger('generateWeeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();
  
  // Monthly cleanup - First day of month at 3 AM
  ScriptApp.newTrigger('performMonthlyCleanup')
    .timeBased()
    .onMonthDay(1)
    .atHour(3)
    .create();
  
  // Add onOpen trigger for menu
  ScriptApp.newTrigger('onOpen')
    .forSpreadsheet(SPREADSHEET_ID)
    .onOpen()
    .create();
  
  console.log('✓ Triggers created (including onOpen for menu)');
}

/**
 * Create folder structure in Google Drive
 */
function createFolderStructure() {
  const rootFolderId = '13y-jTy3lcFazALyI4DrmeaQx8kLkCY-a'; // RLC Bingo root folder
  const rootFolder = DriveApp.getFolderById(rootFolderId);
  
  const folders = {
    'Data': '1TTmayi2D1oRvoemiTUF9eMTRUEsOPwnY',
    'Backups': '1f_TDuTEvSEm7Fut7aXsX0H-GG6LJFWtg',
    'Audit Reports': '1KiT6GB8onDmXxwNYpi9npsBzxOvDvxz4',
    'User Reports': '1jPT6A9YVDPmAhGmHmUXnZOtvIJsQozCr',
    'CSV Reports': '15raXM8l-oPjvwIXIhMlIgd0DeHIfza2S',
    'MGC Reports': '1nn94u0K8apDha8kZl7Pke2Kgu83M68kL',
    'Occasion Reports': '1Pks07sirbc7qLy62BP9BdwQZ3-ZXpHVk',
    'Bingo Session Forms': '1J6dP81ztaleclehIOuVUNH9VmApPmX_G',
    'Pull Tab Forms': '1eSAAgyI-Z2bSBlSCNadeVEDtubdPexbk',
    'Door Sales Reports': '1g0lfGUqI_dCeqv41ZxLaTyZqDAXt5Iyv'
  };
  
  // Verify or create folders
  Object.keys(folders).forEach(folderName => {
    try {
      const folder = DriveApp.getFolderById(folders[folderName]);
      console.log(`✓ Folder verified: ${folderName}`);
    } catch (e) {
      // Create folder if it doesn't exist
      const newFolder = rootFolder.createFolder(folderName);
      console.log(`✓ Folder created: ${folderName}`);
    }
  });
}

/**
 * Load default data into sheets
 */
function loadDefaultData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Load default pull-tab games
  const pullTabLibrary = ss.getSheetByName('PullTabLibrary');
  if (pullTabLibrary.getLastRow() === 1) {
    const defaultGames = [
      ['$500 Seal', 500, '$500 Seal Card', 'PT-500', 'Arrow International', 2400, 1.00, 2400, 1920, 480, 20, 'Window Seal', 'https://example.com', true],
      ['$300 Seal', 300, '$300 Seal Card', 'PT-300', 'Arrow International', 1800, 1.00, 1800, 1440, 360, 20, 'Window Seal', 'https://example.com', true],
      ['$200 Seal', 200, '$200 Seal Card', 'PT-200', 'Bingo King', 1200, 1.00, 1200, 960, 240, 20, 'Window Seal', 'https://example.com', true],
      ['Lucky 7s', 100, 'Lucky 7s Progressive', 'PT-L7', 'Arrow International', 1000, 0.50, 500, 400, 100, 20, 'Progressive', 'https://example.com', true],
      ['Cash King', 150, 'Cash King Deluxe', 'PT-CK', 'Bingo King', 1500, 0.50, 750, 600, 150, 20, 'Hold Ticket', 'https://example.com', true],
      ['Diamond Mine', 250, 'Diamond Mine Jackpot', 'PT-DM', 'Arrow International', 2000, 1.00, 2000, 1600, 400, 20, 'Event Ticket', 'https://example.com', true],
      ['Cherry Bells', 75, 'Cherry Bells Classic', 'PT-CB', 'Bingo King', 600, 0.25, 150, 120, 30, 20, 'Standard', 'https://example.com', true],
      ['Money Bags', 200, 'Money Bags Bonanza', 'PT-MB', 'Arrow International', 1600, 1.00, 1600, 1280, 320, 20, 'Window Seal', 'https://example.com', true],
      ['Gold Rush', 500, 'Gold Rush Mega', 'PT-GR', 'Arrow International', 3000, 1.00, 3000, 2400, 600, 20, 'Event Ticket', 'https://example.com', true],
      ['Lucky Stars', 100, 'Lucky Stars', 'PT-LS', 'Bingo King', 800, 0.50, 400, 320, 80, 20, 'Standard', 'https://example.com', true]
    ];
    
    defaultGames.forEach(game => {
      pullTabLibrary.appendRow(game);
    });
    console.log('✓ Default pull-tab games loaded');
  }
  
  // Load default users
  const usersSheet = ss.getSheetByName('Users');
  if (usersSheet.getLastRow() === 1) {
    const defaultUsers = [
      ['admin', 'ChangeMeNow123!', 'Administrator', 'System Admin', 'admin@rollalions.org', true, new Date(), null, 0, 'ALL'],
      ['manager', 'Manager123!', 'Manager', 'Bingo Manager', 'manager@rollalions.org', true, new Date(), null, 0, 'MANAGE,VIEW,REPORT'],
      ['cashier1', 'Cashier123!', 'Cashier', 'Cashier 1', 'cashier1@rollalions.org', true, new Date(), null, 0, 'SALES,VIEW'],
      ['volunteer1', 'Volunteer123!', 'Volunteer', 'Volunteer 1', 'volunteer1@rollalions.org', true, new Date(), null, 0, 'VIEW'],
      ['auditor', 'Auditor123!', 'Auditor', 'Financial Auditor', 'auditor@rollalions.org', true, new Date(), null, 0, 'AUDIT,VIEW,REPORT']
    ];
    
    defaultUsers.forEach(user => {
      usersSheet.appendRow(user);
    });
    console.log('✓ Default users loaded');
  }
}

/**
 * Set script properties
 */
function setScriptProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  scriptProperties.setProperties({
    'SPREADSHEET_ID': '1pmJO2WFi--TJs4kr1pFhKxBXEw4AiZdmrTIQ1_HBrVM',
    'ROOT_FOLDER_ID': '13y-jTy3lcFazALyI4DrmeaQx8kLkCY-a',
    'ORGANIZATION_NAME': 'Rolla Lions Club',
    'BINGO_LICENSE': 'B-0001',
    'DEFAULT_START_TIME': '18:00',
    'DEFAULT_END_TIME': '22:00',
    'DEFAULT_STARTING_CASH': '1200',
    'DEFAULT_BINGO_GAMES': '27',
    'PROGRESSIVE_1_BALLS': '48',
    'PROGRESSIVE_2_BALLS': '52',
    'PROGRESSIVE_CONSOLATION': '100',
    'LETTER_X_PRIZE': '250',
    'NUMBER_7_PRIZE': '250',
    'COVERALL_PRIZE': '500',
    'OFFAGE_THRESHOLD': '100',
    'DEBUG_MODE': 'false',
    'EMAIL_NOTIFICATIONS': 'true',
    'NOTIFICATION_EMAIL': 'bingo@rollalions.org',
    'TIMEZONE': 'America/Chicago',
    'VERSION': '3.0.0',
    'LAST_SETUP': new Date().toISOString()
  });
  
  console.log('✓ Script properties set');
}

/**
 * onOpen trigger - Creates menu when spreadsheet opens
 * This will run automatically when the spreadsheet is opened
 */
function onOpen(e) {
  createCustomMenu();
}

/**
 * Create custom menu in spreadsheet
 * Modified to work properly with UI context
 */
function createCustomMenu() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('🎰 Bingo Manager')
    .addItem('📱 Open Web App', 'openWebApp')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Reports')
      .addItem('Generate Form 104', 'generateCurrentForm104')
      .addItem('Quarterly Report', 'generateQuarterlyReport')
      .addItem('Offage Analysis', 'generateOffageReport')
      .addItem('Statistics Dashboard', 'generateStatsDashboard'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🔧 Administration')
      .addItem('Backup Now', 'createManualBackup')
      .addItem('Audit Current Session', 'auditCurrentSession')
      .addItem('Initialize Sheets', 'initializeAllSheets')
      .addItem('Clear Test Data', 'clearTestData'))
    .addSeparator()
    .addSubMenu(ui.createMenu('⚙️ Settings')
      .addItem('Edit Properties', 'showPropertiesDialog')
      .addItem('Manage Users', 'showUsersDialog')
      .addItem('Email Settings', 'showEmailSettings'))
    .addSeparator()
    .addItem('❓ Help & Support', 'showHelp')
    .addItem('ℹ️ About', 'showAbout')
    .addToUi();
}

/**
 * Manual function to create menu after setup
 * Run this from the spreadsheet if menu doesn't appear
 */
function createMenuManually() {
  try {
    createCustomMenu();
    SpreadsheetApp.getUi().alert('Success', 'Menu created successfully! Look for "🎰 Bingo Manager" in the menu bar.', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', 'Could not create menu: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Complete the setup process
 * Call this after setupSystem() completes
 */
function finalizeSetup() {
  const report = generateSetupReport();
  
  console.log('=================================');
  console.log('SETUP COMPLETE!');
  console.log('=================================');
  console.log('');
  console.log('System Information:');
  console.log('- Version: ' + report.version);
  console.log('- Spreadsheet ID: ' + report.spreadsheetId);
  console.log('- Sheets Created: ' + report.sheets.length);
  console.log('- Triggers Active: ' + report.triggers.length);
  console.log('');
  console.log('Connection Tests:');
  console.log('- Spreadsheet: ' + (report.tests.spreadsheet ? '✅' : '❌'));
  console.log('- Google Drive: ' + (report.tests.drive ? '✅' : '❌'));
  console.log('- Email Service: ' + (report.tests.email ? '✅' : '❌'));
  console.log('');
  console.log('=================================');
  console.log('DEPLOYMENT INSTRUCTIONS:');
  console.log('=================================');
  console.log('1. Click "Deploy" → "New Deployment"');
  console.log('2. Type: Web app');
  console.log('3. Execute as: Me');
  console.log('4. Who has access: Anyone (or your organization)');
  console.log('5. Click "Deploy"');
  console.log('6. Copy the Web App URL');
  console.log('');
  console.log('Your system is ready to use!');
  
  return report;
}

/**
 * Test all connections
 */
function testConnections() {
  const tests = {
    spreadsheet: false,
    drive: false,
    email: false
  };
  
  // Test spreadsheet connection
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const testSheet = ss.getSheetByName('BingoSessions');
    tests.spreadsheet = testSheet !== null;
  } catch (e) {
    console.error('Spreadsheet test failed:', e);
  }
  
  // Test Drive connection
  try {
    const folder = DriveApp.getFolderById('13y-jTy3lcFazALyI4DrmeaQx8kLkCY-a');
    tests.drive = folder !== null;
  } catch (e) {
    console.error('Drive test failed:', e);
  }
  
  // Test email capability
  try {
    const remaining = MailApp.getRemainingDailyQuota();
    tests.email = remaining > 0;
  } catch (e) {
    console.error('Email test failed:', e);
  }
  
  console.log('Connection tests:', tests);
  return tests;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Create daily backup
 */
function createDailyBackup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const backupFolderId = '1f_TDuTEvSEm7Fut7aXsX0H-GG6LJFWtg';
  const folder = DriveApp.getFolderById(backupFolderId);
  
  const date = new Date();
  const fileName = `RLC_Bingo_Backup_${date.toISOString().split('T')[0]}`;
  
  // Create copy
  const copy = ss.copy(fileName);
  const file = DriveApp.getFileById(copy.getId());
  
  // Move to backup folder
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  
  // Clean old backups (keep 30 days)
  cleanOldBackups(folder, 30);
  
  // Log backup
  logAction('BACKUP', 'System', fileName, {
    size: file.getSize(),
    created: file.getDateCreated()
  });
  
  console.log(`Backup created: ${fileName}`);
  return file.getId();
}

/**
 * Create manual backup
 */
function createManualBackup() {
  const fileId = createDailyBackup();
  SpreadsheetApp.getUi().alert('Backup Created', 
    `Manual backup completed successfully.\nFile ID: ${fileId}`, 
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Clean old backups
 */
function cleanOldBackups(folder, daysToKeep) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const files = folder.getFiles();
  let deletedCount = 0;
  
  while (files.hasNext()) {
    const file = files.next();
    if (file.getDateCreated() < cutoffDate) {
      file.setTrashed(true);
      deletedCount++;
    }
  }
  
  if (deletedCount > 0) {
    console.log(`Deleted ${deletedCount} old backup(s)`);
  }
}

/**
 * Generate weekly report
 */
function generateWeeklyReport() {
  const dateRange = getDateRange('week');
  const stats = getStatistics(dateRange.start.toISOString(), dateRange.end.toISOString());
  
  // Create report content
  const report = {
    reportId: 'WR' + Date.now(),
    type: 'WEEKLY',
    startDate: dateRange.start,
    endDate: dateRange.end,
    generatedAt: new Date(),
    statistics: stats
  };
  
  // Save to Reports sheet
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const reportsSheet = ss.getSheetByName('Reports');
  
  reportsSheet.appendRow([
    report.reportId,
    report.type,
    report.startDate,
    report.endDate,
    report.generatedAt,
    JSON.stringify(report.statistics)
  ]);
  
  // Send email if enabled
  const emailEnabled = PropertiesService.getScriptProperties().getProperty('EMAIL_NOTIFICATIONS') === 'true';
  if (emailEnabled) {
    const recipient = PropertiesService.getScriptProperties().getProperty('NOTIFICATION_EMAIL');
    const subject = `Weekly Bingo Report - ${dateRange.start.toLocaleDateString()}`;
    const body = formatWeeklyReportEmail(report);
    
    sendNotification(recipient, subject, body);
  }
  
  return report;
}

/**
 * Format weekly report email
 */
function formatWeeklyReportEmail(report) {
  const stats = report.statistics;
  
  return `
    <h2>Weekly Bingo Report</h2>
    <p><strong>Period:</strong> ${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}</p>
    
    <h3>Summary Statistics</h3>
    <table style="border-collapse: collapse; width: 100%;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Total Sessions:</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${stats.totalSessions}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Total Players:</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${stats.totalPlayers}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Total Gross Receipts:</td>
        <td style="padding: 8px; border: 1px solid #ddd;">$${stats.totalGross.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Total Net Profit:</td>
        <td style="padding: 8px; border: 1px solid #ddd;">$${stats.totalNet.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">Profit Margin:</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${stats.profitMargin.toFixed(1)}%</td>
      </tr>
    </table>
    
    <p style="margin-top: 20px; color: #666;">
      Generated automatically by RLC Bingo Manager
    </p>
  `;
}

/**
 * Perform monthly cleanup
 */
function performMonthlyCleanup() {
  console.log('Starting monthly cleanup...');
  
  // 1. Archive old sessions (older than 90 days)
  archiveOldSessions(90);
  
  // 2. Clean audit logs (keep 1 year)
  cleanAuditLogs(365);
  
  // 3. Optimize spreadsheet
  optimizeSpreadsheet();
  
  // 4. Generate monthly summary
  generateMonthlySummary();
  
  console.log('Monthly cleanup completed');
}

/**
 * Archive old sessions
 */
function archiveOldSessions(daysOld) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sessionsSheet = ss.getSheetByName('BingoSessions');
  const archiveSheet = ss.getSheetByName('ArchivedSessions') || ss.insertSheet('ArchivedSessions');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const data = sessionsSheet.getDataRange().getValues();
  const headers = data[0];
  const dateCol = headers.indexOf('date');
  
  let archivedCount = 0;
  
  // Copy headers to archive if needed
  if (archiveSheet.getLastRow() === 0) {
    archiveSheet.appendRow(headers);
  }
  
  // Archive old rows (process in reverse to avoid index issues)
  for (let i = data.length - 1; i > 0; i--) {
    const sessionDate = new Date(data[i][dateCol]);
    if (sessionDate < cutoffDate) {
      archiveSheet.appendRow(data[i]);
      sessionsSheet.deleteRow(i + 1);
      archivedCount++;
    }
  }
  
  if (archivedCount > 0) {
    console.log(`Archived ${archivedCount} old session(s)`);
  }
}

/**
 * Clean audit logs
 */
function cleanAuditLogs(daysToKeep) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const auditSheet = ss.getSheetByName('AuditLog');
  
  if (!auditSheet || auditSheet.getLastRow() <= 1) return;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const data = auditSheet.getDataRange().getValues();
  let deletedCount = 0;
  
  // Process in reverse
  for (let i = data.length - 1; i > 0; i--) {
    const logDate = new Date(data[i][0]);
    if (logDate < cutoffDate) {
      auditSheet.deleteRow(i + 1);
      deletedCount++;
    }
  }
  
  if (deletedCount > 0) {
    console.log(`Deleted ${deletedCount} old audit log(s)`);
  }
}

/**
 * Optimize spreadsheet
 */
function optimizeSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Remove empty rows and columns from each sheet
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    const maxRows = sheet.getMaxRows();
    const maxCols = sheet.getMaxColumns();
    
    // Delete excess rows
    if (maxRows > lastRow + 100) {
      sheet.deleteRows(lastRow + 101, maxRows - lastRow - 100);
    }
    
    // Delete excess columns
    if (maxCols > lastCol + 10) {
      sheet.deleteColumns(lastCol + 11, maxCols - lastCol - 10);
    }
  });
  
  SpreadsheetApp.flush();
  console.log('Spreadsheet optimized');
}

/**
 * Generate monthly summary
 */
function generateMonthlySummary() {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  const endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
  
  const stats = getStatistics(startDate.toISOString(), endDate.toISOString());
  
  // Save summary
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let summarySheet = ss.getSheetByName('MonthlySummaries') || ss.insertSheet('MonthlySummaries');
  
  if (summarySheet.getLastRow() === 0) {
    summarySheet.appendRow([
      'Month', 'Year', 'Sessions', 'Players', 'Gross', 'Prizes', 'Net', 'Margin', 'Generated'
    ]);
  }
  
  summarySheet.appendRow([
    lastMonth.toLocaleString('default', { month: 'long' }),
    lastMonth.getFullYear(),
    stats.totalSessions,
    stats.totalPlayers,
    stats.totalGross,
    stats.totalPrizes,
    stats.totalNet,
    stats.profitMargin,
    new Date()
  ]);
  
  console.log('Monthly summary generated');
}

// ==========================================
// MENU FUNCTIONS
// ==========================================



/**
 * Open web app - Fixed version
 */
function openWebApp() {
  const url = ScriptApp.getService().getUrl();
  
  if (!url || url === '') {
    // Not deployed yet
    SpreadsheetApp.getUi().alert(
      'Web App Not Deployed',
      'The web app has not been deployed yet.\n\n' +
      'To deploy:\n' +
      '1. In Apps Script, click Deploy → New Deployment\n' +
      '2. Choose "Web app" as the type\n' +
      '3. Set execution and access permissions\n' +
      '4. Click Deploy\n' +
      '5. Copy the Web App URL',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  // Simple alert with the URL
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    'Open Web App',
    'Your Web App URL:\n\n' + url + '\n\n' +
    'Click OK to copy this URL to your clipboard instructions.',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result == ui.Button.OK) {
    // Show instructions for copying
    ui.alert(
      'Copy URL',
      'To open the web app:\n\n' +
      '1. Copy this URL:\n' + url + '\n\n' +
      '2. Open a new browser tab\n' +
      '3. Paste the URL and press Enter\n\n' +
      'Tip: Bookmark the URL for easy access!',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Alternative function to get Web App URL
 * Run this from the script editor to get your URL
 */
function getWebAppUrl() {
  const url = ScriptApp.getService().getUrl();
  
  if (!url || url === '') {
    console.log('❌ Web App not deployed yet!');
    console.log('\nTo deploy:');
    console.log('1. Click Deploy → New Deployment');
    console.log('2. Choose "Web app" as the type');
    console.log('3. Configure settings:');
    console.log('   - Execute as: Me');
    console.log('   - Who has access: Anyone (or your organization)');
    console.log('4. Click Deploy');
    console.log('5. Copy the Web App URL');
  } else {
    console.log('✅ Your Web App URL:');
    console.log(url);
    console.log('\nCopy and paste this URL into your browser to access the web app.');
    console.log('Bookmark it for easy access!');
  }
  
  return url;
}

/**
 * Alternative: Create a simple HTML popup with the URL
 * This works better from the spreadsheet menu
 */
function showWebAppLink() {
  const url = ScriptApp.getService().getUrl();
  
  if (!url || url === '') {
    SpreadsheetApp.getUi().alert('Please deploy the web app first!');
    return;
  }
  
  const htmlContent = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h3>RLC Bingo Manager Web App</h3>
      <p>Your web app is deployed at:</p>
      <div style="background: #f0f0f0; padding: 10px; border-radius: 5px; margin: 10px 0;">
        <code style="font-size: 12px; word-break: break-all;">${url}</code>
      </div>
      <p>To access the web app:</p>
      <ol>
        <li>Copy the URL above</li>
        <li>Open a new browser tab</li>
        <li>Paste the URL and press Enter</li>
        <li>Bookmark for easy access!</li>
      </ol>
      <button onclick="google.script.host.close()" style="margin-top: 10px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    </div>
  `;
  
  const html = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(400)
    .setHeight(300);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Web App URL');
}

/**
 * Generate current Form 104
 */
function generateCurrentForm104() {
  const sessionId = getCurrentSessionId();
  if (!sessionId) {
    SpreadsheetApp.getUi().alert('No Active Session', 
      'There is no active session to generate Form 104.', 
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  const form104 = generateMGCForm104(sessionId);
  SpreadsheetApp.getUi().alert('Form 104 Generated', 
    `Form 104 has been generated for session ${sessionId}`, 
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Show help - Fixed for permissions
 */
function showHelp() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Help & Support',
    'RLC Bingo Manager Help\n\n' +
    '📧 Email: bingo@rollalions.org\n' +
    '📞 Phone: (573) 555-0100\n' +
    '📞 Emergency: (573) 555-0111\n\n' +
    'Quick Tips:\n' +
    '• Start new occasion from Dashboard\n' +
    '• Record all door sales and pull-tabs\n' +
    '• Close session with cash reconciliation\n' +
    '• Generate Form 104 after closing\n\n' +
    'For detailed help, see the User Manual in GitHub.',
    ui.ButtonSet.OK);
}

/**
 * Show about - Fixed for permissions
 */
function showAbout() {
  const version = PropertiesService.getScriptProperties().getProperty('VERSION') || '3.0.0';
  
  SpreadsheetApp.getUi().alert('About RLC Bingo Manager',
    '🎰 RLC Bingo Manager\n' +
    'Version: ' + version + '\n\n' +
    'Rolla Lions Club\n' +
    'Serving the Community Since 1925\n\n' +
    'Missouri Gaming Commission Compliant\n' +
    'License #B-0001\n\n' +
    '© 2025 Rolla Lions Club',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Clear test data (use with caution!)
 */
function clearTestData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Clear Test Data', 
    'WARNING: This will delete ALL data except templates and users. Are you sure?', 
    ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.NO) {
    return;
  }
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetsToClean = [
    'BingoSessions', 'DoorSales', 'PullTabs', 'BingoGames',
    'CashReconciliation', 'OffageTracking', 'Reports', 'MGCReports'
  ];
  
  sheetsToClean.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
  });
  
  ui.alert('Data Cleared', 'Test data has been cleared successfully.', ui.ButtonSet.OK);
}

/**
 * Generate setup report
 */
function generateSetupReport() {
  const report = {
    timestamp: new Date(),
    version: PropertiesService.getScriptProperties().getProperty('VERSION'),
    spreadsheetId: SPREADSHEET_ID,
    webAppUrl: ScriptApp.getService().getUrl(),
    sheets: [],
    folders: [],
    triggers: [],
    tests: testConnections()
  };
  
  // List sheets
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ss.getSheets().forEach(sheet => {
    report.sheets.push({
      name: sheet.getName(),
      rows: sheet.getLastRow(),
      columns: sheet.getLastColumn()
    });
  });
  
  // List triggers
  ScriptApp.getProjectTriggers().forEach(trigger => {
    report.triggers.push({
      function: trigger.getHandlerFunction(),
      type: trigger.getEventType()
    });
  });
  
  console.log('Setup Report:', JSON.stringify(report, null, 2));
  return report;
}

// ==========================================
// ERROR HANDLING
// ==========================================

/**
 * Global error handler
 */
function handleError(error, context) {
  console.error(`Error in ${context}:`, error);
  
  // Log to audit
  logAction('ERROR', context, '', {
    message: error.message,
    stack: error.stack
  });
  
  // Send notification if critical
  if (context === 'CRITICAL') {
    const recipient = PropertiesService.getScriptProperties().getProperty('NOTIFICATION_EMAIL');
    sendNotification(recipient, 
      'Critical Error in Bingo Manager',
      `<p>A critical error occurred:</p><pre>${error.message}</pre>`
    );
  }
  
  throw error;
}
