/**
 * RLC Bingo Manager - Google Apps Script Backend v61
 * Compatible with both JSON and form-encoded requests
 * Fixed JSONP callback handling
 * Updated to use existing System folder structure
 * Added Drive reorganization function
 * Fixed test occasion with complete data structure
 * Fixed to use correct RLC Bingo Manager base folder
 * Added proper structure setup inside base folder
 * Added single occasion loading with complete data
 */

// Configuration - Updated to use existing folder structure
const CONFIG = {
  BASE_FOLDER_ID: '13y-jTy3lcFazALyI4DrmeaQx8kLkCY-a', // RLC Bingo Manager base folder
  SYSTEM_FOLDER: 'System',
  OCCASIONS_FOLDER: 'occasions',
  OCCASIONS_INDEX_FILE: 'occasions-index.json',
  BACKUP_FOLDER: 'Backups',
  REPORTS_FOLDER: 'Reports'
};

/**
 * Main entry point for web app requests
 */
function doPost(e) {
  try {
    console.log('doPost called with contentType:', e.postData?.type);
    console.log('Raw post data:', e.postData?.contents);

    let data;

    // Handle both JSON and form-encoded data
    if (e.postData?.type === 'application/json') {
      // JSON request
      data = JSON.parse(e.postData.contents);
    } else {
      // Form-encoded request - parse parameters
      data = {};

      // Parse URL-encoded data manually
      if (e.postData?.contents) {
        const params = e.postData.contents.split('&');
        for (const param of params) {
          const [key, value] = param.split('=').map(decodeURIComponent);
          data[key] = value;
        }
      }

      // Also check e.parameter for form data
      Object.assign(data, e.parameter || {});
    }

    console.log('Parsed data:', data);

    // Handle different actions
    if (data.action === 'saveOccasion' || data.action === 'save') {
      // For form data, the occasion data might be in the main object
      const occasionData = data.data ? data.data : data;
      return handleSaveOccasion(occasionData);
    }

    if (data.action === 'loadOccasions') {
      return handleLoadOccasions();
    }

    if (data.action === 'deleteOccasion') {
      return handleDeleteOccasion(data.occasionId || data.id);
    }

    // Default fallback for unknown actions
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Unknown action: ' + (data.action || 'none'),
        receivedData: data
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'doPost error: ' + error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for loading data with JSONP support)
 */
function doGet(e) {
  try {
    console.log('doGet called with parameters:', e.parameter);

    const action = e.parameter.action || 'loadOccasions';
    const callback = e.parameter.callback;

    console.log('doGet called with action:', action, 'callback:', callback);

    if (action === 'loadOccasions') {
      const result = handleLoadOccasions();
      const content = result.getContent();
      console.log('LoadOccasions result:', content);

      if (callback) {
        const jsonpResponse = callback + '(' + content + ')';
        console.log('JSONP response:', jsonpResponse);
        return ContentService
          .createTextOutput(jsonpResponse)
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (action === 'testDrive') {
      const result = testDriveAccess();
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (action === 'createTestOccasion') {
      const result = createTestOccasion();
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (action === 'reorganizeDrive') {
      const result = reorganizeDriveStructure();
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (action === 'setupProperStructure') {
      const result = setupProperFolderStructure();
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (action === 'loadOccasion' && e.parameter.id) {
      const result = handleLoadSingleOccasion(e.parameter.id);
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    throw new Error('Unknown GET action: ' + action);

  } catch (error) {
    console.error('Error in doGet:', error);
    const errorJson = JSON.stringify({
      success: false,
      error: 'doGet error: ' + error.toString(),
      stack: error.stack
    });

    const callback = e.parameter.callback;
    if (callback) {
      console.log('Returning JSONP error response');
      return ContentService
        .createTextOutput(callback + '(' + errorJson + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(errorJson)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test Google Drive access
 */
function testDriveAccess() {
  try {
    console.log('Testing Drive access...');
    const rootFolder = DriveApp.getRootFolder();
    const testFolderName = 'RLC Test ' + Date.now();
    const testFolder = rootFolder.createFolder(testFolderName);
    const testFile = testFolder.createFile('test.json', '{"test": true}', MimeType.PLAIN_TEXT);
    const content = testFile.getBlob().getDataAsString();
    testFolder.setTrashed(true);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Drive access test passed',
        testContent: content
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Save occasion data to JSON file
 */
function handleSaveOccasion(occasionData) {
  try {
    console.log('handleSaveOccasion called with:', occasionData);

    // Ensure occasionData is an object
    if (typeof occasionData === 'string') {
      try {
        occasionData = JSON.parse(occasionData);
      } catch (e) {
        console.log('Could not parse occasion data as JSON, treating as form data');
      }
    }

    // Get or create the data folder
    const folder = getOrCreateFolder(CONFIG.FOLDER_NAME);

    // Load existing occasions
    let occasions = [];
    const existingFile = getFileInFolder(folder, CONFIG.OCCASIONS_FILE);

    if (existingFile) {
      const content = existingFile.getBlob().getDataAsString();
      const parsedData = JSON.parse(content);
      occasions = parsedData.occasions || [];
    }

    // Generate ID if not provided
    const occasionId = occasionData.id || 'OCC_' + Date.now();
    occasionData.id = occasionId;
    occasionData.created = occasionData.created || new Date().toISOString();
    occasionData.modified = new Date().toISOString();

    console.log('Processing occasion with ID:', occasionId);

    // Remove existing entry if updating
    const originalLength = occasions.length;
    occasions = occasions.filter(o => o.id !== occasionId);
    console.log('Filtered', originalLength - occasions.length, 'existing entries');

    // Add new entry
    occasions.push(occasionData);

    // Sort by date (newest first)
    occasions.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Prepare data structure
    const fileData = {
      lastUpdated: new Date().toISOString(),
      count: occasions.length,
      occasions: occasions
    };

    // Save to file
    const jsonContent = JSON.stringify(fileData, null, 2);
    console.log('Saving JSON content, length:', jsonContent.length);

    if (existingFile) {
      existingFile.setContent(jsonContent);
    } else {
      folder.createFile(CONFIG.OCCASIONS_FILE, jsonContent, MimeType.PLAIN_TEXT);
    }

    // Create backup
    createBackup(fileData);

    console.log('Save completed successfully');

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Occasion saved successfully',
        id: occasionId,
        count: occasions.length
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error saving occasion:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Save error: ' + error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Load all occasions from index file (using existing System folder)
 */
function handleLoadOccasions() {
  try {
    const systemFolder = getOrCreateFolder(CONFIG.SYSTEM_FOLDER);
    const indexFile = getFileInFolder(systemFolder, CONFIG.OCCASIONS_INDEX_FILE);

    // If no index file exists, try to create it by scanning the occasions folder
    if (!indexFile) {
      console.log('No index file found, creating one...');
      updateOccasionsIndex();

      // Try to get the index file again
      const newIndexFile = getFileInFolder(systemFolder, CONFIG.OCCASIONS_INDEX_FILE);
      if (!newIndexFile) {
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            lastUpdated: new Date().toISOString(),
            count: 0,
            occasions: [],
            message: 'No occasions found, empty index created'
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    const content = indexFile.getBlob().getDataAsString();
    const data = JSON.parse(content);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        ...data,
        structure: 'subfolder',
        dataPath: 'System/occasions-index.json'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error loading occasions:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Delete an occasion
 */
function handleDeleteOccasion(occasionId) {
  try {
    const folder = getOrCreateFolder(CONFIG.FOLDER_NAME);
    const file = getFileInFolder(folder, CONFIG.OCCASIONS_FILE);

    if (!file) {
      throw new Error('No occasions file found');
    }

    const content = file.getBlob().getDataAsString();
    const data = JSON.parse(content);

    // Remove the occasion
    const originalCount = data.occasions.length;
    data.occasions = data.occasions.filter(o => o.id !== occasionId);
    const newCount = data.occasions.length;

    if (originalCount === newCount) {
      throw new Error('Occasion not found: ' + occasionId);
    }

    // Update metadata
    data.count = newCount;
    data.lastUpdated = new Date().toISOString();

    // Save updated file
    file.setContent(JSON.stringify(data, null, 2));

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Occasion deleted successfully',
        count: newCount
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error deleting occasion:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get the base RLC Bingo Manager folder
 */
function getBaseFolder() {
  try {
    return DriveApp.getFolderById(CONFIG.BASE_FOLDER_ID);
  } catch (error) {
    console.error('Cannot access base folder:', CONFIG.BASE_FOLDER_ID, error);
    // Fallback to root folder
    return DriveApp.getRootFolder();
  }
}

/**
 * Get or create a folder in Drive
 */
function getOrCreateFolder(folderName, parentFolder = null) {
  const parent = parentFolder || getBaseFolder();
  const folders = parent.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parent.createFolder(folderName);
  }
}

/**
 * Get a file in a specific folder
 */
function getFileInFolder(folder, fileName) {
  const files = folder.getFilesByName(fileName);
  return files.hasNext() ? files.next() : null;
}

/**
 * Create a backup of the data in existing Backups folder
 */
function createBackup(data) {
  try {
    const backupFolder = getOrCreateFolder(CONFIG.BACKUP_FOLDER);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `occasions-backup-${timestamp}.json`;

    backupFolder.createFile(backupFileName, JSON.stringify(data, null, 2), MimeType.PLAIN_TEXT);

    // Keep only last 5 backups
    const backups = backupFolder.getFiles();
    const backupFiles = [];

    while (backups.hasNext()) {
      backupFiles.push(backups.next());
    }

    // Sort by creation date, newest first
    backupFiles.sort((a, b) => b.getDateCreated() - a.getDateCreated());

    // Delete old backups (keep 5 most recent)
    for (let i = 5; i < backupFiles.length; i++) {
      backupFiles[i].setTrashed(true);
    }

  } catch (error) {
    console.error('Error creating backup:', error);
    // Don't throw - backup failure shouldn't stop the main operation
  }
}

/**
 * Create a test occasion for testing purposes
 */
function createTestOccasion() {
  try {
    console.log('Creating test occasion...');

    const testOccasion = {
      id: 'TEST_OCC_' + Date.now(),
      date: '2025-09-24',
      session: '5-1',
      sessionName: '1st/5th Monday',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      status: 'draft',

      // Occasion basic info
      occasion: {
        date: '2025-09-24',
        session: '5-1',
        sessionName: '1st/5th Monday',
        location: 'Rolla Lions Club',
        manager: 'Test Manager'
      },

      // Paper bingo inventory (manual count items)
      paperBingo: {
        'early-bird': { start: 100, end: 50, free: 5, sold: 45 },
        'regular-bingo': { start: 200, end: 100, free: 10, sold: 90 },
        'special-games': { start: 50, end: 25, free: 2, sold: 23 }
      },

      // POS door sales
      posSales: {
        'dauber': { name: 'Dauber', price: 1.00, quantity: 25, total: 25.00 },
        'coverall': { name: 'Coverall', price: 1.00, quantity: 30, total: 30.00 },
        'double-action': { name: 'Double Action', price: 1.00, quantity: 20, total: 20.00 }
      },

      // Electronic rentals
      electronic: {
        smallMachines: 10,
        largeMachines: 5,
        smallTotal: 400,
        largeTotal: 325,
        total: 725
      },

      // Game results
      games: [
        {
          gameNumber: 1,
          pattern: 'Straight Line',
          payout: 100,
          ballCount: 45,
          winners: 2
        },
        {
          gameNumber: 2,
          pattern: 'Four Corners',
          payout: 150,
          ballCount: 52,
          winners: 1
        },
        {
          gameNumber: 3,
          pattern: 'Full House',
          payout: 200,
          ballCount: 65,
          winners: 1
        }
      ],

      // Pull tabs
      pullTabs: [
        {
          name: 'Lucky 7s',
          cost: 1,
          quantity: 50,
          sold: 45,
          totalSales: 45
        },
        {
          name: 'Triple Match',
          cost: 2,
          quantity: 25,
          sold: 20,
          totalSales: 40
        }
      ],

      // Money count
      moneyCount: {
        bingo: {
          '1': 25, '5': 10, '10': 5, '20': 2, '50': 1, '100': 1
        },
        pullTab: {
          '1': 30, '5': 8, '10': 3, '20': 1
        }
      },

      // Financial totals
      totals: {
        totalPayout: 950,
        totalSales: 1100,
        netProfit: 150,
        pulltabSales: 85,
        bingoSales: 1015,
        posSales: 75,
        electronicSales: 725
      },

      notes: 'Complete test occasion with all required data structures for frontend compatibility'
    };

    // Use the updated save function
    return handleSaveOccasionV2(testOccasion);

  } catch (error) {
    console.error('Error creating test occasion:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Test creation error: ' + error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Save occasion data using existing System folder structure
 */
function handleSaveOccasionV2(occasionData) {
  try {
    console.log('handleSaveOccasionV2 called with:', occasionData);

    // Ensure occasionData is an object
    if (typeof occasionData === 'string') {
      try {
        occasionData = JSON.parse(occasionData);
      } catch (e) {
        console.log('Could not parse occasion data as JSON, treating as form data');
      }
    }

    // Get the existing System folder and create year-based organization like Photos
    const systemFolder = getOrCreateFolder(CONFIG.SYSTEM_FOLDER);
    const occasionsFolder = getOrCreateFolder(CONFIG.OCCASIONS_FOLDER, systemFolder);

    // Create year-based subfolder organization (matching Photos pattern)
    const currentYear = new Date().getFullYear().toString();
    const yearFolder = getOrCreateFolder(currentYear, occasionsFolder);

    // Generate ID if not provided
    const occasionId = occasionData.id || 'OCC_' + Date.now();
    occasionData.id = occasionId;
    occasionData.created = occasionData.created || new Date().toISOString();
    occasionData.modified = new Date().toISOString();

    console.log('Processing occasion with ID:', occasionId);

    // Create individual occasion file in year folder
    const occasionFileName = occasionId + '.json';
    const occasionContent = JSON.stringify(occasionData, null, 2);

    // Check if file exists in year folder
    const existingFile = getFileInFolder(yearFolder, occasionFileName);

    if (existingFile) {
      existingFile.setContent(occasionContent);
      console.log('Updated existing occasion file:', occasionFileName);
    } else {
      yearFolder.createFile(occasionFileName, occasionContent, MimeType.PLAIN_TEXT);
      console.log('Created new occasion file:', occasionFileName);
    }

    // Update the index file
    updateOccasionsIndex();

    // Create backup
    createBackup(occasionData);

    console.log('Save completed successfully');

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Occasion saved successfully with subfolder structure',
        id: occasionId,
        fileName: occasionFileName,
        location: 'System/occasions/' + currentYear + '/' + occasionFileName
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error saving occasion v2:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Save error: ' + error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Update the occasions index file (scan all year folders)
 */
function updateOccasionsIndex() {
  try {
    const systemFolder = getOrCreateFolder(CONFIG.SYSTEM_FOLDER);
    const occasionsFolder = getOrCreateFolder(CONFIG.OCCASIONS_FOLDER, systemFolder);

    // Get all year folders and scan for occasion files
    const yearFolders = occasionsFolder.getFolders();
    const occasions = [];

    // Also check for any files directly in occasions folder (legacy)
    const directFiles = occasionsFolder.getFiles();
    while (directFiles.hasNext()) {
      const file = directFiles.next();
      const fileName = file.getName();

      if (fileName.endsWith('.json')) {
        try {
          const content = file.getBlob().getDataAsString();
          const occasionData = JSON.parse(content);

          occasions.push({
            id: occasionData.id,
            date: occasionData.date,
            session: occasionData.session,
            sessionName: occasionData.sessionName,
            status: occasionData.status,
            fileName: fileName,
            yearFolder: 'root',
            created: occasionData.created,
            modified: occasionData.modified,
            totals: occasionData.totals
          });
        } catch (e) {
          console.error('Error parsing occasion file:', fileName, e);
        }
      }
    }

    // Scan each year folder
    while (yearFolders.hasNext()) {
      const yearFolder = yearFolders.next();
      const yearName = yearFolder.getName();
      const files = yearFolder.getFiles();

      while (files.hasNext()) {
        const file = files.next();
        const fileName = file.getName();

        if (fileName.endsWith('.json')) {
          try {
            const content = file.getBlob().getDataAsString();
            const occasionData = JSON.parse(content);

            occasions.push({
              id: occasionData.id,
              date: occasionData.date,
              session: occasionData.session,
              sessionName: occasionData.sessionName,
              status: occasionData.status,
              fileName: fileName,
              yearFolder: yearName,
              created: occasionData.created,
              modified: occasionData.modified,
              totals: occasionData.totals
            });
          } catch (e) {
            console.error('Error parsing occasion file:', fileName, e);
          }
        }
      }
    }

    // Sort by date (newest first)
    occasions.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Create index data
    const indexData = {
      lastUpdated: new Date().toISOString(),
      count: occasions.length,
      occasions: occasions
    };

    // Save index file
    const indexContent = JSON.stringify(indexData, null, 2);
    const existingIndex = getFileInFolder(systemFolder, CONFIG.OCCASIONS_INDEX_FILE);

    if (existingIndex) {
      existingIndex.setContent(indexContent);
    } else {
      systemFolder.createFile(CONFIG.OCCASIONS_INDEX_FILE, indexContent, MimeType.PLAIN_TEXT);
    }

    console.log('Updated occasions index with', occasions.length, 'occasions');

  } catch (error) {
    console.error('Error updating occasions index:', error);
  }
}

/**
 * Reorganize Google Drive structure and test access
 */
function reorganizeDriveStructure() {
  try {
    console.log('Starting Drive reorganization...');

    const operations = [];

    // Step 1: Test access to your specific RLC Bingo Manager folder
    let baseFolder;
    try {
      baseFolder = DriveApp.getFolderById(CONFIG.BASE_FOLDER_ID);
      operations.push('✓ Successfully accessed RLC Bingo Manager base folder');
      operations.push(`✓ Base folder: ${baseFolder.getName()}`);
      console.log('Base folder access confirmed:', baseFolder.getName());
    } catch (error) {
      operations.push('❌ Cannot access base folder, falling back to root');
      baseFolder = DriveApp.getRootFolder();
      console.log('Fallback to root folder');
    }

    // Step 2: Look for existing folders in your base folder
    const existingFolders = {};
    const folders = baseFolder.getFolders();

    while (folders.hasNext()) {
      const folder = folders.next();
      const name = folder.getName();
      existingFolders[name] = {
        id: folder.getId(),
        name: name,
        url: folder.getUrl()
      };
    }

    operations.push(`✓ Found ${Object.keys(existingFolders).length} existing folders`);
    console.log('Existing folders:', Object.keys(existingFolders));

    // Step 3: Create/verify required folder structure
    const requiredFolders = ['System', 'Backups', 'Reports', 'Photos'];
    const createdFolders = {};

    for (const folderName of requiredFolders) {
      if (existingFolders[folderName]) {
        createdFolders[folderName] = existingFolders[folderName];
        operations.push(`✓ Found existing folder: ${folderName}`);
      } else {
        const newFolder = baseFolder.createFolder(folderName);
        createdFolders[folderName] = {
          id: newFolder.getId(),
          name: folderName,
          url: newFolder.getUrl(),
          created: true
        };
        operations.push(`✓ Created new folder: ${folderName}`);
      }
    }

    // Step 4: Set up System subfolder structure
    const systemFolderId = createdFolders['System'].id;
    const systemFolder = DriveApp.getFolderById(systemFolderId);

    // Create occasions folder in System
    const occasionsFolders = systemFolder.getFoldersByName('occasions');
    let occasionsFolder;

    if (occasionsFolders.hasNext()) {
      occasionsFolder = occasionsFolders.next();
      operations.push('✓ Found existing System/occasions folder');
    } else {
      occasionsFolder = systemFolder.createFolder('occasions');
      operations.push('✓ Created System/occasions folder');
    }

    // Step 5: Create year folder structure (2025)
    const currentYear = new Date().getFullYear().toString();
    const yearFolders = occasionsFolder.getFoldersByName(currentYear);
    let yearFolder;

    if (yearFolders.hasNext()) {
      yearFolder = yearFolders.next();
      operations.push(`✓ Found existing System/occasions/${currentYear} folder`);
    } else {
      yearFolder = occasionsFolder.createFolder(currentYear);
      operations.push(`✓ Created System/occasions/${currentYear} folder`);
    }

    // Step 6: Create test occasion to verify write access
    const testOccasion = {
      id: 'DRIVE_TEST_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      session: '5-1',
      sessionName: '1st/5th Monday (Drive Test)',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      status: 'test',
      notes: 'Created by Drive reorganization test'
    };

    const testFileName = testOccasion.id + '.json';
    const testContent = JSON.stringify(testOccasion, null, 2);

    const testFile = yearFolder.createFile(testFileName, testContent, MimeType.PLAIN_TEXT);
    operations.push(`✓ Created test file: ${testFileName}`);

    // Step 7: Create occasions index
    updateOccasionsIndex();
    operations.push('✓ Updated occasions index');

    // Step 8: Create a backup to test backup folder access
    createBackup(testOccasion);
    operations.push('✓ Created test backup');

    // Step 9: Final structure verification
    const finalStructure = {
      root: {
        System: {
          id: systemFolder.getId(),
          url: systemFolder.getUrl(),
          subfolders: {
            occasions: {
              id: occasionsFolder.getId(),
              url: occasionsFolder.getUrl(),
              yearFolders: {
                [currentYear]: {
                  id: yearFolder.getId(),
                  url: yearFolder.getUrl(),
                  testFile: testFile.getUrl()
                }
              }
            }
          }
        },
        Backups: {
          id: createdFolders['Backups'].id,
          url: DriveApp.getFolderById(createdFolders['Backups'].id).getUrl()
        },
        Reports: {
          id: createdFolders['Reports'].id,
          url: DriveApp.getFolderById(createdFolders['Reports'].id).getUrl()
        },
        Photos: {
          id: createdFolders['Photos'].id,
          url: DriveApp.getFolderById(createdFolders['Photos'].id).getUrl()
        }
      }
    };

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Drive reorganization completed successfully',
        operations: operations,
        structure: finalStructure,
        testOccasionId: testOccasion.id,
        timestamp: new Date().toISOString()
      }, null, 2))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error reorganizing Drive:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Drive reorganization error: ' + error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Set up proper folder structure inside the existing RLC Bingo Manager folder
 */
function setupProperFolderStructure() {
  try {
    console.log('Setting up proper folder structure...');

    const operations = [];

    // Step 1: Access the RLC Bingo Manager base folder
    let baseFolder;
    try {
      baseFolder = DriveApp.getFolderById(CONFIG.BASE_FOLDER_ID);
      operations.push('✅ Successfully accessed RLC Bingo Manager folder');
      operations.push(`✅ Base folder: ${baseFolder.getName()}`);
      operations.push(`✅ Base folder URL: ${baseFolder.getUrl()}`);
    } catch (error) {
      throw new Error('Cannot access RLC Bingo Manager folder: ' + error.toString());
    }

    // Step 2: Check what's already in the base folder
    const existingFolders = {};
    const folders = baseFolder.getFolders();

    while (folders.hasNext()) {
      const folder = folders.next();
      const name = folder.getName();
      existingFolders[name] = {
        id: folder.getId(),
        name: name,
        url: folder.getUrl()
      };
    }

    operations.push(`✅ Found ${Object.keys(existingFolders).length} existing folders in RLC Bingo Manager`);

    // Step 3: Create/verify required folders INSIDE RLC Bingo Manager
    const requiredFolders = ['System', 'Backups', 'Reports'];
    const folderStructure = {};

    for (const folderName of requiredFolders) {
      if (existingFolders[folderName]) {
        folderStructure[folderName] = existingFolders[folderName];
        operations.push(`✅ Found existing folder: ${folderName}`);
      } else {
        const newFolder = baseFolder.createFolder(folderName);
        folderStructure[folderName] = {
          id: newFolder.getId(),
          name: folderName,
          url: newFolder.getUrl()
        };
        operations.push(`✅ Created folder: ${folderName}`);
      }
    }

    // Step 4: Handle Photos folder specially (it exists with proper structure)
    if (existingFolders['Photos']) {
      folderStructure['Photos'] = existingFolders['Photos'];
      operations.push('✅ Using existing Photos folder with proper structure');
    } else {
      const photosFolder = baseFolder.createFolder('Photos');
      folderStructure['Photos'] = {
        id: photosFolder.getId(),
        name: 'Photos',
        url: photosFolder.getUrl()
      };
      operations.push('✅ Created Photos folder');
    }

    // Step 5: Set up System subfolder structure
    const systemFolder = DriveApp.getFolderById(folderStructure['System'].id);

    // Create occasions folder
    const occasionsFolders = systemFolder.getFoldersByName('occasions');
    let occasionsFolder;

    if (occasionsFolders.hasNext()) {
      occasionsFolder = occasionsFolders.next();
      operations.push('✅ Found existing System/occasions folder');
    } else {
      occasionsFolder = systemFolder.createFolder('occasions');
      operations.push('✅ Created System/occasions folder');
    }

    // Create year folder
    const currentYear = new Date().getFullYear().toString();
    const yearFolders = occasionsFolder.getFoldersByName(currentYear);
    let yearFolder;

    if (yearFolders.hasNext()) {
      yearFolder = yearFolders.next();
      operations.push(`✅ Found existing System/occasions/${currentYear} folder`);
    } else {
      yearFolder = occasionsFolder.createFolder(currentYear);
      operations.push(`✅ Created System/occasions/${currentYear} folder`);
    }

    // Step 6: Create test occasion with complete structure
    const testOccasion = {
      id: 'PROPER_TEST_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      session: '5-1',
      sessionName: '1st/5th Monday (Proper Structure Test)',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      status: 'test',
      paperBingo: {
        'early-bird': { start: 100, end: 50, free: 5, sold: 45 }
      },
      posSales: {
        'dauber': { name: 'Dauber', price: 1.00, quantity: 25, total: 25.00 }
      },
      electronic: {
        smallMachines: 10,
        total: 400
      },
      notes: 'Test created with proper folder structure'
    };

    const testFileName = testOccasion.id + '.json';
    const testContent = JSON.stringify(testOccasion, null, 2);
    const testFile = yearFolder.createFile(testFileName, testContent, MimeType.PLAIN_TEXT);
    operations.push(`✅ Created test file: ${testFileName}`);

    // Step 7: Update index
    updateOccasionsIndex();
    operations.push('✅ Updated occasions index');

    // Step 8: Create backup
    createBackup(testOccasion);
    operations.push('✅ Created test backup');

    // Final structure summary
    const finalStructure = {
      baseFolder: {
        name: baseFolder.getName(),
        id: baseFolder.getId(),
        url: baseFolder.getUrl()
      },
      folders: {
        System: {
          ...folderStructure.System,
          occasions: {
            id: occasionsFolder.getId(),
            url: occasionsFolder.getUrl(),
            yearFolders: {
              [currentYear]: {
                id: yearFolder.getId(),
                url: yearFolder.getUrl(),
                testFile: testFile.getUrl()
              }
            }
          }
        },
        Backups: folderStructure.Backups,
        Reports: folderStructure.Reports,
        Photos: folderStructure.Photos
      }
    };

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Proper folder structure created successfully inside RLC Bingo Manager',
        operations: operations,
        structure: finalStructure,
        testOccasionId: testOccasion.id,
        timestamp: new Date().toISOString(),
        note: 'All folders created inside your RLC Bingo Manager folder - no root Drive pollution!'
      }, null, 2))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error setting up proper structure:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Setup error: ' + error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Load a single occasion with complete data by ID
 */
function handleLoadSingleOccasion(occasionId) {
  try {
    console.log('Loading single occasion:', occasionId);

    const systemFolder = getOrCreateFolder(CONFIG.SYSTEM_FOLDER);
    const occasionsFolder = getOrCreateFolder(CONFIG.OCCASIONS_FOLDER, systemFolder);

    // Search through year folders for the occasion
    const yearFolders = occasionsFolder.getFolders();

    while (yearFolders.hasNext()) {
      const yearFolder = yearFolders.next();
      const occasionFileName = occasionId + '.json';
      const occasionFile = getFileInFolder(yearFolder, occasionFileName);

      if (occasionFile) {
        const content = occasionFile.getBlob().getDataAsString();
        const occasionData = JSON.parse(content);

        console.log('Found complete occasion data:', occasionId);

        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            occasion: occasionData,
            source: 'individual_file',
            location: `System/occasions/${yearFolder.getName()}/${occasionFileName}`
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Also check root occasions folder for legacy files
    const legacyFile = getFileInFolder(occasionsFolder, occasionId + '.json');
    if (legacyFile) {
      const content = legacyFile.getBlob().getDataAsString();
      const occasionData = JSON.parse(content);

      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          occasion: occasionData,
          source: 'legacy_file',
          location: `System/occasions/${occasionId}.json`
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    throw new Error('Occasion not found: ' + occasionId);

  } catch (error) {
    console.error('Error loading single occasion:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Load single occasion error: ' + error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}