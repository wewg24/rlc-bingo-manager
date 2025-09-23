/**
 * Initialize.gs - One-time setup for RLC Bingo Manager
 * This properly uses the existing PullTabLibrary class with 152 games
 */

/**
 * Main initialization function - run this once when setting up
 * This creates all necessary sheets with proper headers and populates the pull-tab library
 */
function performInitialSetup() {
  try {
    console.log('Starting RLC Bingo Manager initial setup...');
    
    // Step 1: Initialize all sheets with proper headers
    const sheetsCreated = initializeSheets();
    console.log('Sheets initialized:', sheetsCreated);
    
    // Step 2: Populate the pull-tab library using the existing PullTabLibrary class
    const pullTabResult = populatePullTabLibraryFromClass();
    console.log('Pull-tab library populated:', pullTabResult);
    
    // Step 3: Set up triggers for automated tasks
    const triggersSetup = setupTriggers();
    console.log('Triggers configured:', triggersSetup);
    
    // Step 4: Initialize configuration settings
    const configResult = initializeConfiguration();
    console.log('Configuration initialized:', configResult);
    
    Logger.log('Initial setup completed successfully');
    
    return { 
      success: true, 
      message: 'Setup completed successfully',
      details: {
        sheets: sheetsCreated,
        pullTabLibrary: pullTabResult,
        triggers: triggersSetup,
        configuration: configResult
      }
    };
    
  } catch (error) {
    console.error('Setup failed:', error);
    return {
      success: false,
      error: error.toString(),
      message: 'Setup failed - please check the logs'
    };
  }
}

/**
 * Initialize all sheets with correct headers
 * This ensures each sheet has the proper column structure
 */
function initializeSheets() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const results = {
    created: [],
    updated: [],
    errors: []
  };
  
  // Define the complete sheet structure with headers
  const sheetDefinitions = {
    'Occasions': {
      headers: [
        'Occasion ID', 'Date', 'Occasion Type', 'Lion in Charge', 'Total Players',
        'Birthdays', 'Progressive Jackpot', 'Progressive Balls', 'Progressive Consolation',
        'Progressive Actual', 'Progressive Prize', 'Check Payment', 'Created', 'Created By', 'Status'
      ],
      formats: {
        2: 'MM/dd/yyyy',  // Date column
        7: '$#,##0.00',   // Progressive Jackpot
        9: '$#,##0.00',   // Progressive Consolation
        11: '$#,##0.00',  // Progressive Prize
        13: 'MM/dd/yyyy HH:mm:ss' // Created timestamp
      }
    },
    
    'SessionGames': {
      headers: [
        'Game ID', 'Occasion ID', 'Number', 'Color', 'Name',
        'Prize', 'Winners', 'Total Paid', 'Winner Info', 'Balls Called',
        'Created', 'Status'
      ],
      formats: {
        6: '$#,##0.00',  // Prize
        8: '$#,##0.00',  // Total Paid
        11: 'MM/dd/yyyy HH:mm:ss' // Created
      }
    },
    
    'PullTabUsage': {
      headers: [
        'Usage ID', 'Occasion ID', 'Game Name', 'Form Number', 'Serial Number',
        'Tickets Sold', 'Gross Sales', 'Prizes Paid', 'Net Revenue',
        'Last Sale Ticket', 'Created', 'Status'
      ],
      formats: {
        7: '$#,##0.00',  // Gross Sales
        8: '$#,##0.00',  // Prizes Paid
        9: '$#,##0.00',  // Net Revenue
        11: 'MM/dd/yyyy HH:mm:ss' // Created
      }
    },
    
    'PullTabLibrary': {
      headers: ['Game', 'Form', 'Count', 'Price', 'Profit', 'URL'],
      formats: {
        3: '#,##0',      // Count
        4: '$#,##0.00',  // Price
        5: '$#,##0.00'   // Profit
      }
    },
    
    'PaperBingo': {
      headers: [
        'Paper ID', 'Occasion ID', 'Type', 'Start Number', 'End Number',
        'Free Count', 'Sold Count', 'Price Each', 'Total Revenue', 'Created'
      ],
      formats: {
        8: '$#,##0.00',  // Price Each
        9: '$#,##0.00',  // Total Revenue
        10: 'MM/dd/yyyy HH:mm:ss' // Created
      }
    },
    
    'POSDoorSales': {
      headers: [
        'Sale ID', 'Occasion ID', 'Item Category', 'Item Name', 'Quantity',
        'Unit Price', 'Total Amount', 'Created'
      ],
      formats: {
        6: '$#,##0.00',  // Unit Price
        7: '$#,##0.00',  // Total Amount
        8: 'MM/dd/yyyy HH:mm:ss' // Created
      }
    },
    
    'Electronic': {
      headers: [
        'Electronic ID', 'Occasion ID', 'Small Machines', 'Large Machines',
        'Small Revenue', 'Large Revenue', 'Total Revenue', 'Created'
      ],
      formats: {
        5: '$#,##0.00',  // Small Revenue
        6: '$#,##0.00',  // Large Revenue
        7: '$#,##0.00',  // Total Revenue
        8: 'MM/dd/yyyy HH:mm:ss' // Created
      }
    },
    
    'MoneyCount': {
      headers: [
        'Count ID', 'Occasion ID', 'Drawer', 'Denomination', 'Count', 
        'Value', 'Type', 'Created'
      ],
      formats: {
        6: '$#,##0.00',  // Value
        8: 'MM/dd/yyyy HH:mm:ss' // Created
      }
    },
    
    'FinancialSummary': {
      headers: [
        'Summary ID', 'Occasion ID', 'Bingo Sales', 'PT Sales', 'SE Sales',
        'Gross Sales', 'Bingo Prizes', 'PT Prizes', 'SE Prizes', 'Total Prizes',
        'Check Prizes', 'Cash Deposit', 'Startup', 'Actual Profit', 'Ideal Profit', 
        'Over/Short', 'Created'
      ],
      formats: {
        3: '$#,##0.00',  // Bingo Sales
        4: '$#,##0.00',  // PT Sales
        5: '$#,##0.00',  // SE Sales
        6: '$#,##0.00',  // Gross Sales
        7: '$#,##0.00',  // Bingo Prizes
        8: '$#,##0.00',  // PT Prizes
        9: '$#,##0.00',  // SE Prizes
        10: '$#,##0.00', // Total Prizes
        11: '$#,##0.00', // Check Prizes
        12: '$#,##0.00', // Cash Deposit
        13: '$#,##0.00', // Startup
        14: '$#,##0.00', // Actual Profit
        15: '$#,##0.00', // Ideal Profit
        16: '$#,##0.00', // Over/Short
        17: 'MM/dd/yyyy HH:mm:ss' // Created
      }
    },
    
    'Metrics': {
      headers: [
        'Metric ID', 'Occasion ID', 'Metric Type', 'Metric Name', 
        'Metric Value', 'Created', 'Updated'
      ],
      formats: {
        6: 'MM/dd/yyyy HH:mm:ss', // Created
        7: 'MM/dd/yyyy HH:mm:ss'  // Updated
      }
    }
  };
  
  // Process each sheet definition
  for (const [sheetName, definition] of Object.entries(sheetDefinitions)) {
    try {
      let sheet = spreadsheet.getSheetByName(sheetName);
      
      if (!sheet) {
        // Create new sheet
        sheet = spreadsheet.insertSheet(sheetName);
        results.created.push(sheetName);
        console.log(`Created sheet: ${sheetName}`);
      } else {
        results.updated.push(sheetName);
      }
      
      // Check if headers need to be added or updated
      const lastColumn = sheet.getLastColumn();
      const lastRow = sheet.getLastRow();
      
      if (lastRow === 0 || lastColumn < definition.headers.length) {
        // Add or update headers
        sheet.getRange(1, 1, 1, definition.headers.length).setValues([definition.headers]);
        
        // Format header row
        const headerRange = sheet.getRange(1, 1, 1, definition.headers.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#f0f0f0');
        headerRange.setBorder(true, true, true, true, true, true);
        
        // Apply column formats if specified
        if (definition.formats) {
          for (const [colNum, format] of Object.entries(definition.formats)) {
            const column = parseInt(colNum);
            if (sheet.getMaxRows() > 1) {
              sheet.getRange(2, column, sheet.getMaxRows() - 1, 1).setNumberFormat(format);
            }
          }
        }
        
        // Freeze header row
        sheet.setFrozenRows(1);
        
        console.log(`Headers updated for: ${sheetName}`);
      }
      
    } catch (error) {
      console.error(`Error processing sheet ${sheetName}:`, error);
      results.errors.push(`${sheetName}: ${error.toString()}`);
    }
  }
  
  return results;
}

/**
 * Populate the pull-tab library using the existing PullTabLibrary class
 * This uses the 152 games already defined in PullTabLibrary.gs
 */
function populatePullTabLibraryFromClass() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('PullTabLibrary');
    
    if (!sheet) {
      // Create the sheet if it doesn't exist
      sheet = spreadsheet.insertSheet('PullTabLibrary');
      console.log('Created PullTabLibrary sheet');
    }
    
    // Use the PullTabLibrary class's built-in populateSheet method
    // This method already handles clearing, adding headers, and populating all 152 games
    const result = PullTabLibrary.populateSheet(sheet);
    
    if (result.success) {
      console.log(`Pull-tab library populated with ${result.gamesAdded} games`);
      
      // Auto-resize columns for better readability
      sheet.autoResizeColumns(1, 6);
      
      return {
        success: true,
        message: result.message,
        gamesAdded: result.gamesAdded
      };
    } else {
      throw new Error(result.message);
    }
    
  } catch (error) {
    console.error('Error populating pull-tab library:', error);
    return {
      success: false,
      error: error.toString(),
      message: 'Failed to populate pull-tab library'
    };
  }
}

/**
 * Initialize configuration settings
 * This sets up default values for the application
 */
function initializeConfiguration() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let configSheet = spreadsheet.getSheetByName('Configuration');
    
    if (!configSheet) {
      configSheet = spreadsheet.insertSheet('Configuration');
    }
    
    // Clear and set up configuration
    configSheet.clear();
    
    // Add headers
    const headers = ['Setting Name', 'Setting Value', 'Description', 'Last Updated'];
    configSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    configSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    configSheet.setFrozenRows(1);
    
    // Add default configuration values
    const configurations = [
      ['Organization Name', 'Richmond Lions Club', 'Name of the organization', new Date()],
      ['Default Session Type', '5-1', 'Default session type for new occasions', new Date()],
      ['Startup Cash', '1000', 'Default startup cash amount', new Date()],
      ['Small Machine Price', '40', 'Price for small electronic machines', new Date()],
      ['Large Machine Price', '65', 'Price for large electronic machines', new Date()],
      ['Progressive Consolation', '200', 'Default consolation prize for progressive', new Date()],
      ['Progressive Balls Default', '48', 'Default number of balls for progressive', new Date()],
      ['Birthday BOGO EB', '2', 'Number of free Early Birds per birthday', new Date()],
      ['Birthday BOGO 6F', '1', 'Number of free 6 Face per birthday', new Date()],
      ['API Version', '11.0.4', 'Current API version', new Date()],
      ['Last Setup Run', new Date().toISOString(), 'When setup was last run', new Date()]
    ];
    
    // Add configuration rows
    const startRow = 2;
    configurations.forEach((config, index) => {
      configSheet.getRange(startRow + index, 1, 1, config.length).setValues([config]);
    });
    
    // Format the date column
    configSheet.getRange(2, 4, configurations.length, 1).setNumberFormat('MM/dd/yyyy HH:mm:ss');
    
    // Auto-resize columns
    configSheet.autoResizeColumns(1, 4);
    
    return {
      success: true,
      configurations: configurations.length
    };
    
  } catch (error) {
    console.error('Error initializing configuration:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Set up automated triggers for the application
 */
function setupTriggers() {
  try {
    // Remove existing triggers to avoid duplicates
    const existingTriggers = ScriptApp.getProjectTriggers();
    existingTriggers.forEach(trigger => {
      ScriptApp.deleteTrigger(trigger);
    });
    console.log(`Removed ${existingTriggers.length} existing triggers`);
    
    // Add new triggers
    const triggersCreated = [];
    
    // Daily backup at 2 AM
    ScriptApp.newTrigger('performDailyBackup')
      .timeBased()
      .atHour(2)
      .everyDays(1)
      .create();
    triggersCreated.push('Daily backup at 2 AM');
    
    // Weekly metrics calculation on Mondays at 6 AM
    ScriptApp.newTrigger('calculateWeeklyMetrics')
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.MONDAY)
      .atHour(6)
      .create();
    triggersCreated.push('Weekly metrics on Mondays at 6 AM');
    
    // Monthly report generation on the 1st of each month at 8 AM
    ScriptApp.newTrigger('generateMonthlyReport')
      .timeBased()
      .onMonthDay(1)
      .atHour(8)
      .create();
    triggersCreated.push('Monthly report on 1st at 8 AM');
    
    return {
      success: true,
      triggersCreated: triggersCreated
    };
    
  } catch (error) {
    console.error('Error setting up triggers:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Perform daily backup of all data
 * This function is called by the daily trigger
 */
function performDailyBackup() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const backupFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    
    // Create a backup subfolder if it doesn't exist
    let backupSubfolder;
    const folders = backupFolder.getFoldersByName('Backups');
    if (folders.hasNext()) {
      backupSubfolder = folders.next();
    } else {
      backupSubfolder = backupFolder.createFolder('Backups');
    }
    
    // Create a copy of the spreadsheet
    const dateString = Utilities.formatDate(new Date(), 'America/Chicago', 'yyyy-MM-dd_HH-mm');
    const backupName = `RLC_Bingo_Backup_${dateString}`;
    
    const backupFile = spreadsheet.copy(backupName);
    DriveApp.getFileById(backupFile.getId()).moveTo(backupSubfolder);
    
    console.log(`Backup created: ${backupName}`);
    
    // Clean up old backups (keep only last 30 days)
    cleanupOldBackups(backupSubfolder, 30);
    
    return {
      success: true,
      backupName: backupName
    };
    
  } catch (error) {
    console.error('Backup failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Clean up old backup files
 */
function cleanupOldBackups(folder, daysToKeep) {
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
    console.log(`Deleted ${deletedCount} old backup files`);
  }
}

/**
 * Calculate weekly metrics
 * This function is called by the weekly trigger
 */
function calculateWeeklyMetrics() {
  // This would calculate and store various metrics
  // Implementation depends on specific business requirements
  console.log('Weekly metrics calculation triggered');
  return { success: true, timestamp: new Date() };
}

/**
 * Generate monthly report
 * This function is called by the monthly trigger
 */
function generateMonthlyReport() {
  // This would generate a comprehensive monthly report
  // Implementation depends on specific reporting requirements
  console.log('Monthly report generation triggered');
  return { success: true, timestamp: new Date() };
}

/**
 * Utility function to verify the setup
 * Run this to check that everything is configured correctly
 */
function verifySetup() {
  const results = {
    spreadsheet: false,
    sheets: {},
    pullTabLibrary: false,
    triggers: false,
    configuration: false
  };
  
  try {
    // Check spreadsheet access
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    results.spreadsheet = true;
    
    // Check required sheets
    const requiredSheets = [
      'Occasions', 'SessionGames', 'PullTabLibrary', 'PullTabUsage',
      'PaperBingo', 'POSDoorSales', 'Electronic', 'MoneyCount',
      'FinancialSummary', 'Metrics', 'Configuration'
    ];
    
    requiredSheets.forEach(sheetName => {
      const sheet = spreadsheet.getSheetByName(sheetName);
      results.sheets[sheetName] = sheet !== null;
    });
    
    // Check pull-tab library
    const pullTabSheet = spreadsheet.getSheetByName('PullTabLibrary');
    if (pullTabSheet) {
      results.pullTabLibrary = pullTabSheet.getLastRow() > 1;
    }
    
    // Check triggers
    const triggers = ScriptApp.getProjectTriggers();
    results.triggers = triggers.length > 0;
    
    // Check configuration
    const configSheet = spreadsheet.getSheetByName('Configuration');
    if (configSheet) {
      results.configuration = configSheet.getLastRow() > 1;
    }
    
    console.log('Setup verification results:', results);
    return results;
    
  } catch (error) {
    console.error('Verification failed:', error);
    results.error = error.toString();
    return results;
  }
}
