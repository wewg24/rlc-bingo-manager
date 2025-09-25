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
  REPORTS_FOLDER: 'Reports',
  SESSION_GAMES_FOLDER: 'sessiongames',
  PULLTABS_FOLDER: 'pulltabs',
  PULLTABS_LIBRARY_FILE: 'pulltabs-library.json',
  PULLTABS_INDEX_FILE: 'pulltabs-index.json',
  SESSION_GAMES_FILE: 'session-games.json',
  SESSIONS_INDEX_FILE: 'sessions-index.json'
};

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': 'https://wewg24.github.io',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '3600'
    });
}

/**
 * Helper function to create CORS-enabled response
 */
function createCorsResponse(content, mimeType = ContentService.MimeType.JSON) {
  return ContentService
    .createTextOutput(content)
    .setMimeType(mimeType)
    .setHeaders({
      'Access-Control-Allow-Origin': 'https://wewg24.github.io',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
}

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
      console.log('Delete occasion request received with data:', data);
      console.log('occasionId:', data.occasionId, 'id:', data.id);
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
    // Backend deployment info
    const BACKEND_INFO = {
      version: 'v11.1.2-cache-busting',
      deployed: '2025-09-24T23:45:00Z',
      features: ['pull-tabs-library-152-games', 'session-games-68-total', 'cache-busting-support'],
      commit: '4c1d70e'
    };

    console.log('🚀 Backend Deployment Info:', BACKEND_INFO);
    console.log('=== doGet DEBUG START ===');
    console.log('Full parameters object:', e.parameter);
    console.log('Raw action value:', e.parameter.action);

    const action = e.parameter.action || 'loadOccasions';
    const callback = e.parameter.callback;

    console.log('Resolved action:', action);
    console.log('Callback:', callback);
    console.log('=== doGet DEBUG END ===');

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

    // Handle different path-based requests
    const path = e.parameter.path;

    if (path === 'occasion' && e.parameter.id) {
      const result = handleLoadSingleOccasion(e.parameter.id);
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (path === 'occasion-games' || path === 'session-games') {
      const result = handleLoadSessionGames(e.parameter.occasionType || e.parameter.sessionType);
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (path === 'pulltabs') {
      const result = handleLoadPullTabs();
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    // Index management endpoints
    if (action === 'updateSessionsIndex') {
      const result = updateSessionsIndex();
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (action === 'updatePullTabsIndex') {
      const result = updatePullTabsIndex();
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (action === 'resetIndex') {
      const result = createFreshIndexFile();
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (action === 'rebuildIndex') {
      const result = updateOccasionsIndex();
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (action === 'testDrive') {
      const result = createFreshIndexFile();
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

    if (action === 'initializeLibraries') {
      const result = initializeLibraryFiles();
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

    if (action === 'cleanIndex') {
      const result = createFreshIndexFile();
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (action === 'createLibraryFiles') {
      const result = forceCreateLibraryFiles();
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (action === 'getSessionGames') {
      const result = handleGetSessionGames();
      const content = result.getContent();

      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + content + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return result;
    }

    if (action === 'getPullTabsLibrary') {
      console.log('*** PULL-TABS HANDLER REACHED! ***');
      const result = handleGetPullTabsLibrary();
      const content = result.getContent();

      if (callback) {
        return createCorsResponse(callback + '(' + content + ')', ContentService.MimeType.JAVASCRIPT);
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
    console.log('handleDeleteOccasion called with occasionId:', occasionId);

    if (!occasionId || occasionId === 'null' || occasionId === 'undefined') {
      throw new Error('Invalid occasion ID provided: ' + occasionId);
    }

    // Validate CONFIG values
    if (!CONFIG.SYSTEM_FOLDER) {
      throw new Error('CONFIG.SYSTEM_FOLDER is not defined');
    }
    if (!CONFIG.OCCASIONS_INDEX_FILE) {
      throw new Error('CONFIG.OCCASIONS_INDEX_FILE is not defined');
    }

    console.log('Getting system folder:', CONFIG.SYSTEM_FOLDER);
    // Get the system folder and index file
    const systemFolder = getOrCreateFolder(CONFIG.SYSTEM_FOLDER);
    console.log('Getting index file:', CONFIG.OCCASIONS_INDEX_FILE);
    const indexFile = getFileInFolder(systemFolder, CONFIG.OCCASIONS_INDEX_FILE);

    if (!indexFile) {
      throw new Error('Occasions index file not found');
    }

    // Load the index
    const indexContent = indexFile.getBlob().getDataAsString();
    const indexData = JSON.parse(indexContent);

    // Find the occasion in the index
    const occasionIndex = indexData.occasions.findIndex(o => o.id === occasionId);
    if (occasionIndex === -1) {
      throw new Error('Occasion not found in index: ' + occasionId);
    }

    const occasion = indexData.occasions[occasionIndex];

    // Find and delete the actual occasion file using index data
    console.log('Getting occasions folder:', CONFIG.OCCASIONS_FOLDER);
    const occasionsFolder = getOrCreateFolder(CONFIG.OCCASIONS_FOLDER, systemFolder);

    // Use the yearFolder and fileName from the index if available
    const yearFolderName = occasion.yearFolder || new Date(occasion.date).getFullYear().toString();
    const fileName = occasion.fileName || (occasionId + '.json');

    console.log('Using year folder:', yearFolderName);
    console.log('Using file name:', fileName);

    if (!yearFolderName || yearFolderName === 'null' || yearFolderName === 'undefined') {
      throw new Error('Invalid year folder name: ' + yearFolderName);
    }
    if (!fileName || fileName === 'null' || fileName === 'undefined') {
      throw new Error('Invalid file name: ' + fileName);
    }

    const yearFolder = getOrCreateFolder(yearFolderName, occasionsFolder);
    const occasionFile = getFileInFolder(yearFolder, fileName);

    if (occasionFile) {
      occasionFile.setTrashed(true);
    }

    // Remove from index
    indexData.occasions.splice(occasionIndex, 1);
    indexData.count = indexData.occasions.length;
    indexData.lastUpdated = new Date().toISOString();

    // Save updated index
    indexFile.setContent(JSON.stringify(indexData, null, 2));

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Occasion deleted successfully',
        count: indexData.count
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
 * Create a fresh, empty occasions index file
 */
function createFreshIndexFile() {
  try {
    console.log('Creating fresh occasions index file...');

    const systemFolder = getOrCreateFolder(CONFIG.SYSTEM_FOLDER);

    // Create fresh index data with empty occasions array
    const freshIndexData = {
      lastUpdated: new Date().toISOString(),
      count: 0,
      occasions: []
    };

    // Delete old index file if it exists
    const existingIndex = getFileInFolder(systemFolder, CONFIG.OCCASIONS_INDEX_FILE);
    if (existingIndex) {
      console.log('Deleting old index file...');
      existingIndex.setTrashed(true);
    }

    // Create new fresh index file
    const indexContent = JSON.stringify(freshIndexData, null, 2);
    const newIndexFile = systemFolder.createFile(CONFIG.OCCASIONS_INDEX_FILE, indexContent, MimeType.PLAIN_TEXT);

    console.log('Created fresh index file with 0 occasions');

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Fresh index file created successfully',
        count: 0,
        lastUpdated: freshIndexData.lastUpdated,
        fileId: newIndexFile.getId(),
        fileUrl: newIndexFile.getUrl()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error creating fresh index file:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
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

    // Also ensure library files exist (piggyback on this working function)
    try {
      // Create sessiongames folder and file
      const sessionsFolder = getOrCreateFolder(CONFIG.SESSION_GAMES_FOLDER, systemFolder);
      const sessionGamesData = getDefaultSessionGames();
      const sessionGamesJson = JSON.stringify(sessionGamesData, null, 2);

      let sessionFileStatus = 'exists';
      const existingSessionFile = getFileInFolder(sessionsFolder, CONFIG.SESSION_GAMES_FILE);
      if (!existingSessionFile) {
        sessionsFolder.createFile(CONFIG.SESSION_GAMES_FILE, sessionGamesJson, MimeType.PLAIN_TEXT);
        sessionFileStatus = 'created';
      }

      // Create pulltabs folder and file
      const pullTabsFolder = getOrCreateFolder(CONFIG.PULLTABS_FOLDER, systemFolder);
      const pullTabsData = getDefaultPullTabsLibrary();
      const pullTabsJson = JSON.stringify(pullTabsData, null, 2);

      let pullTabFileStatus = 'exists';
      const existingPullTabFile = getFileInFolder(pullTabsFolder, CONFIG.PULLTABS_LIBRARY_FILE);
      if (!existingPullTabFile) {
        pullTabsFolder.createFile(CONFIG.PULLTABS_LIBRARY_FILE, pullTabsJson, MimeType.PLAIN_TEXT);
        pullTabFileStatus = 'created';
      }

      console.log('Library files checked:', sessionFileStatus, pullTabFileStatus);
    } catch (libError) {
      console.error('Library creation error:', libError);
      // Don't fail the whole function for library issues
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: `Index updated with ${occasions.length} occasions`,
        count: occasions.length,
        lastUpdated: indexData.lastUpdated
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error updating occasions index:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Update the sessions index file
 */
function updateSessionsIndex() {
  try {
    const systemFolder = getOrCreateFolder(CONFIG.SYSTEM_FOLDER);
    const sessionsFolder = getOrCreateFolder(CONFIG.SESSION_GAMES_FOLDER, systemFolder);

    // Get all session definition files
    const files = sessionsFolder.getFiles();
    const sessions = [];

    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();

      if (fileName.endsWith('.json') && fileName !== CONFIG.SESSIONS_INDEX_FILE) {
        try {
          const content = file.getBlob().getDataAsString();
          const sessionData = JSON.parse(content);

          // Extract session metadata
          Object.keys(sessionData).forEach(sessionType => {
            sessions.push({
              sessionType: sessionType,
              sessionName: CONFIG.SESSION_TYPES ? CONFIG.SESSION_TYPES[sessionType] || sessionType : sessionType,
              gameCount: sessionData[sessionType] ? sessionData[sessionType].length : 0,
              fileName: fileName,
              lastModified: file.getLastUpdated().toISOString()
            });
          });
        } catch (e) {
          console.error('Error parsing session file:', fileName, e);
        }
      }
    }

    // Sort by session type
    sessions.sort((a, b) => a.sessionType.localeCompare(b.sessionType));

    // Create index data
    const indexData = {
      lastUpdated: new Date().toISOString(),
      count: sessions.length,
      sessions: sessions
    };

    // Save index file
    const indexContent = JSON.stringify(indexData, null, 2);
    const existingIndex = getFileInFolder(sessionsFolder, CONFIG.SESSIONS_INDEX_FILE);

    if (existingIndex) {
      existingIndex.setContent(indexContent);
    } else {
      sessionsFolder.createFile(CONFIG.SESSIONS_INDEX_FILE, indexContent, MimeType.PLAIN_TEXT);
    }

    console.log('Updated sessions index with', sessions.length, 'session types');

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: `Sessions index updated with ${sessions.length} session types`,
        count: sessions.length,
        lastUpdated: indexData.lastUpdated
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error updating sessions index:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Update the pulltabs index file
 */
function updatePullTabsIndex() {
  try {
    const systemFolder = getOrCreateFolder(CONFIG.SYSTEM_FOLDER);
    const pullTabsFolder = getOrCreateFolder(CONFIG.PULLTABS_FOLDER, systemFolder);

    // Get all pulltab files
    const files = pullTabsFolder.getFiles();
    const pullTabs = [];

    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();

      if (fileName.endsWith('.json') && fileName !== CONFIG.PULLTABS_INDEX_FILE) {
        try {
          const content = file.getBlob().getDataAsString();
          const pullTabData = JSON.parse(content);

          if (Array.isArray(pullTabData)) {
            // Extract individual games
            pullTabData.forEach(game => {
              pullTabs.push({
                name: game.name,
                form: game.form,
                count: game.count,
                price: game.price,
                profit: game.profit,
                identifier: game.identifier,
                fileName: fileName,
                lastModified: file.getLastUpdated().toISOString()
              });
            });
          }
        } catch (e) {
          console.error('Error parsing pulltab file:', fileName, e);
        }
      }
    }

    // Sort by name
    pullTabs.sort((a, b) => a.name.localeCompare(b.name));

    // Create index data
    const indexData = {
      lastUpdated: new Date().toISOString(),
      count: pullTabs.length,
      pullTabs: pullTabs
    };

    // Save index file
    const indexContent = JSON.stringify(indexData, null, 2);
    const existingIndex = getFileInFolder(pullTabsFolder, CONFIG.PULLTABS_INDEX_FILE);

    if (existingIndex) {
      existingIndex.setContent(indexContent);
    } else {
      pullTabsFolder.createFile(CONFIG.PULLTABS_INDEX_FILE, indexContent, MimeType.PLAIN_TEXT);
    }

    console.log('Updated pulltabs index with', pullTabs.length, 'games');

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: `PullTabs index updated with ${pullTabs.length} games`,
        count: pullTabs.length,
        lastUpdated: indexData.lastUpdated
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error updating pulltabs index:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Initialize library files with default data
 */
function initializeLibraryFiles() {
  try {
    const operations = [];

    // Ensure folders exist
    const systemFolder = getOrCreateFolder(CONFIG.SYSTEM_FOLDER);
    const sessionsFolder = getOrCreateFolder(CONFIG.SESSION_GAMES_FOLDER, systemFolder);
    const pullTabsFolder = getOrCreateFolder(CONFIG.PULLTABS_FOLDER, systemFolder);

    operations.push('✅ Created/verified folder structure');

    // Create session games file
    const sessionGamesData = getDefaultSessionGames();
    const sessionGamesContent = JSON.stringify(sessionGamesData, null, 2);

    const existingSessionFile = getFileInFolder(sessionsFolder, CONFIG.SESSION_GAMES_FILE);
    if (existingSessionFile) {
      existingSessionFile.setContent(sessionGamesContent);
      operations.push('✅ Updated existing session-games.json');
    } else {
      sessionsFolder.createFile(CONFIG.SESSION_GAMES_FILE, sessionGamesContent, MimeType.PLAIN_TEXT);
      operations.push('✅ Created session-games.json');
    }

    // Create pulltabs library file
    const pullTabsData = getDefaultPullTabsLibrary();
    const pullTabsContent = JSON.stringify(pullTabsData, null, 2);

    const existingPullTabFile = getFileInFolder(pullTabsFolder, CONFIG.PULLTABS_LIBRARY_FILE);
    if (existingPullTabFile) {
      existingPullTabFile.setContent(pullTabsContent);
      operations.push('✅ Updated existing pulltabs-library.json');
    } else {
      pullTabsFolder.createFile(CONFIG.PULLTABS_LIBRARY_FILE, pullTabsContent, MimeType.PLAIN_TEXT);
      operations.push('✅ Created pulltabs-library.json');
    }

    // Update indexes
    updateSessionsIndex();
    operations.push('✅ Updated sessions index');

    updatePullTabsIndex();
    operations.push('✅ Updated pulltabs index');

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Library files initialized successfully',
        operations: operations,
        sessionGames: Object.keys(sessionGamesData).length + ' session types',
        pullTabs: pullTabsData.length + ' pull tab games'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error initializing library files:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Create library files directly in Google Drive
 */
function createLibraryFilesDirectly() {
  try {
    const operations = [];

    // Get or create folder structure
    const baseFolder = DriveApp.getFolderById(CONFIG.BASE_FOLDER_ID);
    operations.push('✅ Found base folder: ' + baseFolder.getName());

    const systemFolder = getOrCreateFolder(CONFIG.SYSTEM_FOLDER, baseFolder);
    operations.push('✅ Found/created system folder');

    const sessionsFolder = getOrCreateFolder(CONFIG.SESSION_GAMES_FOLDER, systemFolder);
    const pullTabsFolder = getOrCreateFolder(CONFIG.PULLTABS_FOLDER, systemFolder);
    operations.push('✅ Found/created sessiongames and pulltabs folders');

    // Create session games JSON content
    const sessionGamesData = getDefaultSessionGames();
    const sessionGamesJson = JSON.stringify(sessionGamesData, null, 2);

    // Create pulltabs library JSON content
    const pullTabsData = getDefaultPullTabsLibrary();
    const pullTabsJson = JSON.stringify(pullTabsData, null, 2);

    // Write session games file
    const existingSessionFile = getFileInFolder(sessionsFolder, CONFIG.SESSION_GAMES_FILE);
    if (existingSessionFile) {
      existingSessionFile.setContent(sessionGamesJson);
      operations.push('✅ Updated ' + CONFIG.SESSION_GAMES_FILE + ' (' + Object.keys(sessionGamesData).length + ' session types)');
    } else {
      sessionsFolder.createFile(CONFIG.SESSION_GAMES_FILE, sessionGamesJson, MimeType.PLAIN_TEXT);
      operations.push('✅ Created ' + CONFIG.SESSION_GAMES_FILE + ' (' + Object.keys(sessionGamesData).length + ' session types)');
    }

    // Write pulltabs library file
    const existingPullTabFile = getFileInFolder(pullTabsFolder, CONFIG.PULLTABS_LIBRARY_FILE);
    if (existingPullTabFile) {
      existingPullTabFile.setContent(pullTabsJson);
      operations.push('✅ Updated ' + CONFIG.PULLTABS_LIBRARY_FILE + ' (' + pullTabsData.length + ' games)');
    } else {
      pullTabsFolder.createFile(CONFIG.PULLTABS_LIBRARY_FILE, pullTabsJson, MimeType.PLAIN_TEXT);
      operations.push('✅ Created ' + CONFIG.PULLTABS_LIBRARY_FILE + ' (' + pullTabsData.length + ' games)');
    }

    // Create index files
    try {
      updateSessionsIndex();
      operations.push('✅ Updated sessions index');
    } catch (e) {
      operations.push('❌ Sessions index failed: ' + e.message);
    }

    try {
      updatePullTabsIndex();
      operations.push('✅ Updated pulltabs index');
    } catch (e) {
      operations.push('❌ Pulltabs index failed: ' + e.message);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Library files created successfully',
        operations: operations,
        sessionTypes: Object.keys(sessionGamesData).length,
        pullTabGames: pullTabsData.length,
        timestamp: new Date().toISOString()
      }, null, 2))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error creating library files:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        stack: error.stack,
        timestamp: new Date().toISOString()
      }, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Force create library files - simple version that definitely works
 */
function forceCreateLibraryFiles() {
  try {
    const operations = [];

    // Get the System folder directly
    const baseFolder = DriveApp.getFolderById(CONFIG.BASE_FOLDER_ID);
    const systemFolder = baseFolder.getFoldersByName(CONFIG.SYSTEM_FOLDER).next();
    operations.push('✅ Found System folder: ' + systemFolder.getId());

    // Create sessiongames folder
    let sessionsFolder;
    const sessionsFolders = systemFolder.getFoldersByName(CONFIG.SESSION_GAMES_FOLDER);
    if (sessionsFolders.hasNext()) {
      sessionsFolder = sessionsFolders.next();
      operations.push('✅ Found existing sessiongames folder');
    } else {
      sessionsFolder = systemFolder.createFolder(CONFIG.SESSION_GAMES_FOLDER);
      operations.push('✅ Created sessiongames folder: ' + sessionsFolder.getId());
    }

    // Create pulltabs folder
    let pullTabsFolder;
    const pullTabsFolders = systemFolder.getFoldersByName(CONFIG.PULLTABS_FOLDER);
    if (pullTabsFolders.hasNext()) {
      pullTabsFolder = pullTabsFolders.next();
      operations.push('✅ Found existing pulltabs folder');
    } else {
      pullTabsFolder = systemFolder.createFolder(CONFIG.PULLTABS_FOLDER);
      operations.push('✅ Created pulltabs folder: ' + pullTabsFolder.getId());
    }

    // Create session games file
    const sessionGamesData = getDefaultSessionGames();
    const sessionGamesJson = JSON.stringify(sessionGamesData, null, 2);

    // Check if file exists
    const sessionFiles = sessionsFolder.getFilesByName(CONFIG.SESSION_GAMES_FILE);
    if (sessionFiles.hasNext()) {
      const existingFile = sessionFiles.next();
      existingFile.setContent(sessionGamesJson);
      operations.push('✅ Updated existing ' + CONFIG.SESSION_GAMES_FILE);
    } else {
      sessionsFolder.createFile(CONFIG.SESSION_GAMES_FILE, sessionGamesJson, MimeType.PLAIN_TEXT);
      operations.push('✅ Created ' + CONFIG.SESSION_GAMES_FILE);
    }

    // Create pulltabs library file
    const pullTabsData = getDefaultPullTabsLibrary();
    const pullTabsJson = JSON.stringify(pullTabsData, null, 2);

    // Check if file exists
    const pullTabFiles = pullTabsFolder.getFilesByName(CONFIG.PULLTABS_LIBRARY_FILE);
    if (pullTabFiles.hasNext()) {
      const existingFile = pullTabFiles.next();
      existingFile.setContent(pullTabsJson);
      operations.push('✅ Updated existing ' + CONFIG.PULLTABS_LIBRARY_FILE);
    } else {
      pullTabsFolder.createFile(CONFIG.PULLTABS_LIBRARY_FILE, pullTabsJson, MimeType.PLAIN_TEXT);
      operations.push('✅ Created ' + CONFIG.PULLTABS_LIBRARY_FILE);
    }

    operations.push('✅ SUCCESS: Created ' + Object.keys(sessionGamesData).length + ' session types and ' + pullTabsData.length + ' pulltab games');

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Library files forcefully created!',
        operations: operations,
        sessionTypes: Object.keys(sessionGamesData).length,
        pullTabGames: pullTabsData.length,
        folders: {
          sessiongames: sessionsFolder.getId(),
          pulltabs: pullTabsFolder.getId()
        },
        timestamp: new Date().toISOString()
      }, null, 2))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error in forceCreateLibraryFiles:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        stack: error.stack,
        timestamp: new Date().toISOString()
      }, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
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

    // Step 9: Create library files
    try {
      const sessionsFolder = getOrCreateFolder(CONFIG.SESSION_GAMES_FOLDER, systemFolder);
      const pullTabsFolder = getOrCreateFolder(CONFIG.PULLTABS_FOLDER, systemFolder);
      operations.push('✅ Created sessiongames and pulltabs folders');

      // Create session games file
      const sessionGamesData = getDefaultSessionGames();
      const sessionGamesJson = JSON.stringify(sessionGamesData, null, 2);
      sessionsFolder.createFile(CONFIG.SESSION_GAMES_FILE, sessionGamesJson, MimeType.PLAIN_TEXT);
      operations.push('✅ Created ' + CONFIG.SESSION_GAMES_FILE + ' with ' + Object.keys(sessionGamesData).length + ' session types');

      // Create pulltabs library file
      const pullTabsData = getDefaultPullTabsLibrary();
      const pullTabsJson = JSON.stringify(pullTabsData, null, 2);
      pullTabsFolder.createFile(CONFIG.PULLTABS_LIBRARY_FILE, pullTabsJson, MimeType.PLAIN_TEXT);
      operations.push('✅ Created ' + CONFIG.PULLTABS_LIBRARY_FILE + ' with ' + pullTabsData.length + ' games');

    } catch (libError) {
      operations.push('❌ Library creation failed: ' + libError.message);
    }

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
 * Load session games data
 */
function handleLoadSessionGames(sessionType) {
  try {
    console.log('Loading session games for:', sessionType);

    // Load from JSON file in sessiongames folder
    const sessionGamesData = loadFromJsonFile(CONFIG.SESSION_GAMES_FOLDER, CONFIG.SESSION_GAMES_FILE);

    let games;
    if (sessionGamesData && sessionGamesData[sessionType]) {
      games = sessionGamesData[sessionType];
    } else {
      // Fallback to default session games
      const defaultSessionGames = getDefaultSessionGames();
      games = defaultSessionGames[sessionType] || defaultSessionGames['5-1'];
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        games: games,
        sessionType: sessionType
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error loading session games:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Load pull tabs library
 */
function handleLoadPullTabs() {
  try {
    console.log('Loading pull tabs library from JSON file');

    // Load from JSON file in pulltabs folder
    const pullTabs = loadFromJsonFile(CONFIG.PULLTABS_FOLDER, CONFIG.PULLTABS_LIBRARY_FILE);

    if (pullTabs && pullTabs.length > 0) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          games: pullTabs
        }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      // Fallback to default games if file doesn't exist
      const defaultPullTabs = getDefaultPullTabsLibrary();

      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          games: defaultPullTabs
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    console.error('Error loading pull tabs:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle getSessionGames API request
 */
function handleGetSessionGames() {
  try {
    const sessionGames = loadFromJsonFile(CONFIG.SESSION_GAMES_FOLDER, CONFIG.SESSION_GAMES_FILE);

    if (!sessionGames) {
      console.log('Session games file not found, using default data');
      const defaultGames = getDefaultSessionGames();

      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          data: defaultGames,
          source: 'default',
          message: 'Using comprehensive default session games data'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: sessionGames,
        source: 'file',
        message: 'Comprehensive session games loaded successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error loading session games:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle getPullTabsLibrary API request
 */
function handleGetPullTabsLibrary() {
  try {
    const pullTabsLibrary = loadFromJsonFile(CONFIG.PULLTABS_FOLDER, CONFIG.PULLTABS_LIBRARY_FILE);

    if (!pullTabsLibrary) {
      console.log('Pull-tabs library file not found, using default data');
      const defaultLibrary = getDefaultPullTabsLibrary();

      return createCorsResponse(JSON.stringify({
        success: true,
        data: defaultLibrary,
        source: 'default',
        message: 'Using comprehensive default pull-tabs library'
      }));
    }

    return createCorsResponse(JSON.stringify({
      success: true,
      data: pullTabsLibrary,
      source: 'file',
      message: 'Comprehensive pull-tabs library loaded successfully'
    }));

  } catch (error) {
    console.error('Error loading pull-tabs library:', error);
    return createCorsResponse(JSON.stringify({
      success: false,
      error: error.toString()
    }));
  }
}

/**
 * Load JSON data from a file in the specified folder
 */
function loadFromJsonFile(folderName, fileName) {
  try {
    const baseFolder = DriveApp.getFolderById(CONFIG.BASE_FOLDER_ID);
    const systemFolder = baseFolder.getFoldersByName(CONFIG.SYSTEM_FOLDER).next();
    const targetFolder = systemFolder.getFoldersByName(folderName).next();

    const files = targetFolder.getFilesByName(fileName);
    if (!files.hasNext()) {
      console.log(`File ${fileName} not found in ${folderName} folder`);
      return null;
    }

    const file = files.next();
    const content = file.getBlob().getDataAsString();
    return JSON.parse(content);

  } catch (error) {
    console.error(`Error loading JSON from ${folderName}/${fileName}:`, error);
    return null;
  }
}

/**
 * Get default pull tabs library structure
 */
function getDefaultPullTabsLibrary() {
  return {
    metadata: {
      lastUpdated: new Date().toISOString(),
      totalGames: 152,
      source: "RLC Bingo Event Pull Tab Games Base Library.csv",
      description: "Complete curated pull-tab games library with informational URLs"
    },
    categories: {
      byPrice: {
        "$1": [],
        "$2": [],
        "$5": []
      },
      byProfit: {
        low: {range: "0-100", games: []},
        medium: {range: "101-300", games: []},
        high: {range: "301-500", games: []},
        veryHigh: {range: "500+", games: []}
      },
      withUrls: [],
      withoutUrls: []
    },
    games: [
      {name: "Beat the Clock 599", form: "7724H", count: 960, price: 1, idealProfit: 361, url: null, identifier: "Beat the Clock 599_7724H", profitMargin: 37.6, costBasis: 0.624, hasInformationalFlyer: false},
      {name: "Black Jack 175", form: "6916M", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Black Jack 175_6916M", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Black Jack 200", form: "6779P", count: 300, price: 1, idealProfit: 100, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Black Jack 200_6779P", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Black Jack 280", form: "6917M", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Black Jack 280_6917M", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Black Jack 400", form: "6918M", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Black Jack 400_6918M", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Black Jack 599", form: "6919M", count: 840, price: 1, idealProfit: 241, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Black Jack 599_6919M", profitMargin: 28.7, costBasis: 0.713, hasInformationalFlyer: true},
      {name: "Black Jack 700", form: "6268P", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Black Jack 700_6268P", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Bubble Gum 100", form: "6906V", count: 150, price: 1, idealProfit: 50, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Bubble Gum 100_6906V", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Bubble Gum 175", form: "6747U", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Bubble Gum 175_6747U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Bubble Gum 280", form: "6748U", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Bubble Gum 280_6748U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Bubble Gum 325", form: "6771V", count: 500, price: 1, idealProfit: 175, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Bubble Gum 325_6771V", profitMargin: 35.0, costBasis: 0.65, hasInformationalFlyer: true},
      {name: "Bubble Gum 400", form: "6749U", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Bubble Gum 400_6749U", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Bubble Gum 599", form: "6750U", count: 840, price: 1, idealProfit: 241, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Bubble Gum 599_6750U", profitMargin: 28.7, costBasis: 0.713, hasInformationalFlyer: true},
      {name: "Bubble Gum 700", form: "6751U", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Bubble Gum 700_6751U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Chase Your Dreams 200", form: null, count: 300, price: 1, idealProfit: 100, url: null, identifier: "Chase Your Dreams 200_None", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: false},
      {name: "Chocolate 100", form: "6906V", count: 150, price: 1, idealProfit: 50, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Chocolate 100_6906V", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Chocolate 175", form: "6747U", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Chocolate 175_6747U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Chocolate 280", form: "6748U", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Chocolate 280_6748U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Chocolate 325", form: "6771V", count: 500, price: 1, idealProfit: 175, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Chocolate 325_6771V", profitMargin: 35.0, costBasis: 0.65, hasInformationalFlyer: true},
      {name: "Chocolate 400", form: "6749U", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Chocolate 400_6749U", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Chocolate 599", form: "6750U", count: 840, price: 1, idealProfit: 241, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Chocolate 599_6750U", profitMargin: 28.7, costBasis: 0.713, hasInformationalFlyer: true},
      {name: "Chocolate 700", form: "6751U", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Chocolate 700_6751U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Claw Enforcement 175", form: null, count: 280, price: 1, idealProfit: 105, url: null, identifier: "Claw Enforcement 175_None", profitMargin: 37.5, costBasis: 0.625, hasInformationalFlyer: false},
      {name: "Cotton Candy 100", form: "6906V", count: 150, price: 1, idealProfit: 50, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Cotton Candy 100_6906V", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Cotton Candy 175", form: "6747U", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Cotton Candy 175_6747U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Cotton Candy 280", form: "6748U", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Cotton Candy 280_6748U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Cotton Candy 325", form: "6771V", count: 500, price: 1, idealProfit: 175, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Cotton Candy 325_6771V", profitMargin: 35.0, costBasis: 0.65, hasInformationalFlyer: true},
      {name: "Cotton Candy 400", form: "6749U", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Cotton Candy 400_6749U", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Cotton Candy 599", form: "6750U", count: 840, price: 1, idealProfit: 241, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Cotton Candy 599_6750U", profitMargin: 28.7, costBasis: 0.713, hasInformationalFlyer: true},
      {name: "Cotton Candy 700", form: "6751U", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Cotton Candy 700_6751U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Crap Shoot 175", form: "6916M", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Crap Shoot 175_6916M", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Crap Shoot 200", form: "6779P", count: 300, price: 1, idealProfit: 100, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Crap Shoot 200_6779P", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Crap Shoot 280", form: "6917M", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Crap Shoot 280_6917M", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Crap Shoot 400", form: "6918M", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Crap Shoot 400_6918M", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Crap Shoot 599", form: "6919M", count: 840, price: 1, idealProfit: 241, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Crap Shoot 599_6919M", profitMargin: 28.7, costBasis: 0.713, hasInformationalFlyer: true},
      {name: "Crap Shoot 700", form: "6268P", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Crap Shoot 700_6268P", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Dabbin' Dachsund 200", form: null, count: 300, price: 1, idealProfit: 100, url: null, identifier: "Dabbin' Dachsund 200_None", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: false},
      {name: "Dabbin' Me Ma 200", form: null, count: 300, price: 1, idealProfit: 100, url: null, identifier: "Dabbin' Me Ma 200_None", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: false},
      {name: "Day Dabbin' 200", form: null, count: 300, price: 1, idealProfit: 100, url: null, identifier: "Day Dabbin' 200_None", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: false},
      {name: "Dig Life 200", form: null, count: 300, price: 1, idealProfit: 100, url: null, identifier: "Dig Life 200_None", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: false},
      {name: "Double Bubble 140", form: "5595Y", count: 200, price: 1, idealProfit: 60, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C5594Y.PDF", identifier: "Double Bubble 140_5595Y", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Double Bubble 175", form: "5596Y", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C5594Y.PDF", identifier: "Double Bubble 175_5596Y", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Double Bubble 280", form: "5597Y", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C5594Y.PDF", identifier: "Double Bubble 280_5597Y", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Double Bubble 425", form: "5102Z", count: 600, price: 1, idealProfit: 175, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C5594Y.PDF", identifier: "Double Bubble 425_5102Z", profitMargin: 29.2, costBasis: 0.708, hasInformationalFlyer: true},
      {name: "Dumbo Dab 175", form: "6219H", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Dumbo Dab 175_6219H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Fire Fighters 140", form: null, count: 225, price: 1, idealProfit: 85, url: null, identifier: "Fire Fighters 140_None", profitMargin: 37.8, costBasis: 0.622, hasInformationalFlyer: false},
      {name: "Fire Fighters 599", form: "5991FF", count: 960, price: 1, idealProfit: 361, url: null, identifier: "Fire Fighters 599_5991FF", profitMargin: 37.6, costBasis: 0.624, hasInformationalFlyer: false},
      {name: "Flamingo Bingo 140", form: null, count: 230, price: 1, idealProfit: 90, url: null, identifier: "Flamingo Bingo 140_None", profitMargin: 39.1, costBasis: 0.609, hasInformationalFlyer: false},
      {name: "Funky Chicken 280", form: null, count: 445, price: 1, idealProfit: 165, url: null, identifier: "Funky Chicken 280_None", profitMargin: 37.1, costBasis: 0.629, hasInformationalFlyer: false},
      {name: "Gator Dab 175", form: "6219H", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Gator Dab 175_6219H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Gator Dab 280", form: "6220H", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Gator Dab 280_6220H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Gator Dab 280", form: "6220H", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Gator Dab 280_6220H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Gator Dab 400", form: "6221H", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Gator Dab 400_6221H", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Gator Dab 400", form: "6221H", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Gator Dab 400_6221H", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Gator Dab 700", form: "6222H", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Gator Dab 700_6222H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Gator Dab 700", form: "6222H", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Gator Dab 700_6222H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Gotcha 140", form: "783Q", count: 200, price: 1, idealProfit: 60, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C785Q.PDF", identifier: "Gotcha 140_783Q", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Gotcha 280", form: "784Q", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C785Q.PDF", identifier: "Gotcha 280_784Q", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Gotcha 425", form: "785Q", count: 600, price: 1, idealProfit: 175, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C785Q.PDF", identifier: "Gotcha 425_785Q", profitMargin: 29.2, costBasis: 0.708, hasInformationalFlyer: true},
      {name: "Gum Drops 100", form: "6906V", count: 150, price: 1, idealProfit: 50, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Gum Drops 100_6906V", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Gum Drops 175", form: "6747U", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Gum Drops 175_6747U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Gum Drops 280", form: "6748U", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Gum Drops 280_6748U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Gum Drops 325", form: "6771V", count: 500, price: 1, idealProfit: 175, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Gum Drops 325_6771V", profitMargin: 35.0, costBasis: 0.65, hasInformationalFlyer: true},
      {name: "Gum Drops 400", form: "6749U", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Gum Drops 400_6749U", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Gum Drops 599", form: "6750U", count: 840, price: 1, idealProfit: 241, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Gum Drops 599_6750U", profitMargin: 28.7, costBasis: 0.713, hasInformationalFlyer: true},
      {name: "Gum Drops 700", form: "6751U", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Gum Drops 700_6751U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Hiss & Make Up 350", form: null, count: 550, price: 1, idealProfit: 200, url: null, identifier: "Hiss & Make Up 350_None", profitMargin: 36.4, costBasis: 0.636, hasInformationalFlyer: false},
      {name: "Jack 280", form: null, count: 400, price: 1, idealProfit: 120, url: null, identifier: "Jack 280_None", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: false},
      {name: "Kick Grass 200", form: null, count: 300, price: 1, idealProfit: 100, url: null, identifier: "Kick Grass 200_None", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: false},
      {name: "Life Happens 599", form: "7726H", count: 960, price: 1, idealProfit: 361, url: null, identifier: "Life Happens 599_7726H", profitMargin: 37.6, costBasis: 0.624, hasInformationalFlyer: false},
      {name: "Lion Dab 175", form: "6219H", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Lion Dab 175_6219H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Lion Dab 280", form: "6220H", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Lion Dab 280_6220H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Lion Dab 400", form: "6221H", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Lion Dab 400_6221H", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Lion Dab 700", form: "6222H", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Lion Dab 700_6222H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Lollipops 100", form: "6906V", count: 150, price: 1, idealProfit: 50, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Lollipops 100_6906V", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Lollipops 175", form: "6747U", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Lollipops 175_6747U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Lollipops 280", form: "6748U", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Lollipops 280_6748U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Lollipops 325", form: "6771V", count: 500, price: 1, idealProfit: 175, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Lollipops 325_6771V", profitMargin: 35.0, costBasis: 0.65, hasInformationalFlyer: true},
      {name: "Lollipops 400", form: "6749U", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Lollipops 400_6749U", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Lollipops 599", form: "6750U", count: 840, price: 1, idealProfit: 241, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Lollipops 599_6750U", profitMargin: 28.7, costBasis: 0.713, hasInformationalFlyer: true},
      {name: "Lollipops 700", form: "6751U", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF", identifier: "Lollipops 700_6751U", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Luckies 100", form: "55886", count: 140, price: 1, idealProfit: 40, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C55888.PDF", identifier: "Luckies 100_55886", profitMargin: 28.6, costBasis: 0.714, hasInformationalFlyer: true},
      {name: "Luckies 200", form: "55887", count: 300, price: 1, idealProfit: 100, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C55888.PDF", identifier: "Luckies 200_55887", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Luckies 350", form: "55888", count: 550, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C55888.PDF", identifier: "Luckies 350_55888", profitMargin: 36.4, costBasis: 0.636, hasInformationalFlyer: true},
      {name: "Luckies 500", form: "55889", count: 770, price: 1, idealProfit: 270, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C55888.PDF", identifier: "Luckies 500_55889", profitMargin: 35.1, costBasis: 0.649, hasInformationalFlyer: true},
      {name: "Mewsical 350", form: null, count: 550, price: 1, idealProfit: 200, url: null, identifier: "Mewsical 350_None", profitMargin: 36.4, costBasis: 0.636, hasInformationalFlyer: false},
      {name: "Monkey in the Middle 210", form: null, count: 300, price: 1, idealProfit: 90, url: null, identifier: "Monkey in the Middle 210_None", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: false},
      {name: "Monkey See Monkey Do 200", form: null, count: 300, price: 1, idealProfit: 100, url: null, identifier: "Monkey See Monkey Do 200_None", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: false},
      {name: "Monopoly Chance It 140", form: "7973H", count: 230, price: 1, idealProfit: 90, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7972H.PDF", identifier: "Monopoly Chance It 140_7973H", profitMargin: 39.1, costBasis: 0.609, hasInformationalFlyer: true},
      {name: "Monopoly Chance It 280", form: "7975H", count: 440, price: 1, idealProfit: 160, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7972H.PDF", identifier: "Monopoly Chance It 280_7975H", profitMargin: 36.4, costBasis: 0.636, hasInformationalFlyer: true},
      {name: "Monopoly Chance It 400", form: "7976H", count: 660, price: 1, idealProfit: 260, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7972H.PDF", identifier: "Monopoly Chance It 400_7976H", profitMargin: 39.4, costBasis: 0.606, hasInformationalFlyer: true},
      {name: "Monopoly Chance It 599", form: "7177J", count: 960, price: 1, idealProfit: 361, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7972H.PDF", identifier: "Monopoly Chance It 599_7177J", profitMargin: 37.6, costBasis: 0.624, hasInformationalFlyer: true},
      {name: "Mouse Keeping 350", form: null, count: 550, price: 1, idealProfit: 200, url: null, identifier: "Mouse Keeping 350_None", profitMargin: 36.4, costBasis: 0.636, hasInformationalFlyer: false},
      {name: "Panda Dab 175", form: "6219H", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Panda Dab 175_6219H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Panda Dab 280", form: "6220H", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Panda Dab 280_6220H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Panda Dab 400", form: "6221H", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Panda Dab 400_6221H", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Panda Dab 700", form: "6222H", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Panda Dab 700_6222H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Parrot Party 140", form: null, count: 230, price: 1, idealProfit: 90, url: null, identifier: "Parrot Party 140_None", profitMargin: 39.1, costBasis: 0.609, hasInformationalFlyer: false},
      {name: "Parrot Party 280", form: null, count: 445, price: 1, idealProfit: 165, url: null, identifier: "Parrot Party 280_None", profitMargin: 37.1, costBasis: 0.629, hasInformationalFlyer: false},
      {name: "Patriot Bingo 140", form: "5096W", count: 200, price: 1, idealProfit: 60, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C5097W.PDF", identifier: "Patriot Bingo 140_5096W", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Patriot Bingo 280", form: "5097W", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C5097W.PDF", identifier: "Patriot Bingo 280_5097W", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Patriot Bingo 599", form: "5340W", count: 840, price: 1, idealProfit: 241, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C5097W.PDF", identifier: "Patriot Bingo 599_5340W", profitMargin: 28.7, costBasis: 0.713, hasInformationalFlyer: true},
      {name: "Paws for the Cause 200", form: null, count: 300, price: 1, idealProfit: 100, url: null, identifier: "Paws for the Cause 200_None", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: false},
      {name: "Pot of Gold 140", form: "7319D", count: 230, price: 1, idealProfit: 90, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7319D.PDF", identifier: "Pot of Gold 140_7319D", profitMargin: 39.1, costBasis: 0.609, hasInformationalFlyer: true},
      {name: "Pot of Gold 280", form: "7320D", count: 440, price: 1, idealProfit: 160, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7319D.PDF", identifier: "Pot of Gold 280_7320D", profitMargin: 36.4, costBasis: 0.636, hasInformationalFlyer: true},
      {name: "Pot of Gold 400", form: "7321D", count: 660, price: 1, idealProfit: 260, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7319D.PDF", identifier: "Pot of Gold 400_7321D", profitMargin: 39.4, costBasis: 0.606, hasInformationalFlyer: true},
      {name: "Purrsuasion 350", form: null, count: 550, price: 1, idealProfit: 200, url: null, identifier: "Purrsuasion 350_None", profitMargin: 36.4, costBasis: 0.636, hasInformationalFlyer: false},
      {name: "Quad Runner 100", form: "7357M", count: 150, price: 1, idealProfit: 50, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF", identifier: "Quad Runner 100_7357M", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Quad Runner 130", form: "7358M", count: 200, price: 1, idealProfit: 70, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF", identifier: "Quad Runner 130_7358M", profitMargin: 35.0, costBasis: 0.65, hasInformationalFlyer: true},
      {name: "Quad Runner 140", form: "7359M", count: 200, price: 1, idealProfit: 60, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF", identifier: "Quad Runner 140_7359M", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Quad Runner 165", form: "7361M", count: 250, price: 1, idealProfit: 85, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF", identifier: "Quad Runner 165_7361M", profitMargin: 34.0, costBasis: 0.66, hasInformationalFlyer: true},
      {name: "Quad Runner 175", form: "7360M", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF", identifier: "Quad Runner 175_7360M", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Quad Runner 210", form: null, count: 325, price: 1, idealProfit: 115, url: null, identifier: "Quad Runner 210_None", profitMargin: 35.4, costBasis: 0.646, hasInformationalFlyer: false},
      {name: "Quad Runner 260", form: "7363M", count: 400, price: 1, idealProfit: 140, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF", identifier: "Quad Runner 260_7363M", profitMargin: 35.0, costBasis: 0.65, hasInformationalFlyer: true},
      {name: "Quad Runner 280", form: "7362M", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF", identifier: "Quad Runner 280_7362M", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Quad Runner 390", form: "7364M", count: 600, price: 1, idealProfit: 210, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF", identifier: "Quad Runner 390_7364M", profitMargin: 35.0, costBasis: 0.65, hasInformationalFlyer: true},
      {name: "Quad Runner 500", form: null, count: 775, price: 1, idealProfit: 275, url: null, identifier: "Quad Runner 500_None", profitMargin: 35.5, costBasis: 0.645, hasInformationalFlyer: false},
      {name: "Race Horse Downs 250", form: "354GA", count: 1000, price: 1, idealProfit: 330, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C354GA.PDF", identifier: "Race Horse Downs 250_354GA", profitMargin: 33.0, costBasis: 0.67, hasInformationalFlyer: true},
      {name: "Race Horse Downs 521", form: "353GA", count: 2040, price: 1, idealProfit: 615, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C354GA.PDF", identifier: "Race Horse Downs 521_353GA", profitMargin: 30.1, costBasis: 0.699, hasInformationalFlyer: true},
      {name: "Red Hot Cardinals 140", form: null, count: 230, price: 1, idealProfit: 90, url: null, identifier: "Red Hot Cardinals 140_None", profitMargin: 39.1, costBasis: 0.609, hasInformationalFlyer: false},
      {name: "Rockin' Robin 140", form: "7348J", count: 230, price: 1, idealProfit: 90, url: null, identifier: "Rockin' Robin 140_7348J", profitMargin: 39.1, costBasis: 0.609, hasInformationalFlyer: false},
      {name: "Roulette 175", form: "6916M", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Roulette 175_6916M", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Roulette 200", form: "6779P", count: 300, price: 1, idealProfit: 100, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Roulette 200_6779P", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Roulette 280", form: "6917M", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Roulette 280_6917M", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Roulette 400", form: "6918M", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Roulette 400_6918M", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Roulette 599", form: "6919M", count: 840, price: 1, idealProfit: 241, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Roulette 599_6919M", profitMargin: 28.7, costBasis: 0.713, hasInformationalFlyer: true},
      {name: "Roulette 700", form: "6268P", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Roulette 700_6268P", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Shake it Off 200", form: null, count: 300, price: 1, idealProfit: 100, url: null, identifier: "Shake it Off 200_None", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: false},
      {name: "Slots 175", form: "6916M", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Slots 175_6916M", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Slots 200", form: "6779P", count: 300, price: 1, idealProfit: 100, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Slots 200_6779P", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Slots 280", form: "6917M", count: 400, price: 1, idealProfit: 120, url: null, identifier: "Slots 280_6917M", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: false},
      {name: "Slots 400", form: "6918M", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Slots 400_6918M", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Slots 599", form: "6919M", count: 840, price: 1, idealProfit: 241, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Slots 599_6919M", profitMargin: 28.7, costBasis: 0.713, hasInformationalFlyer: true},
      {name: "Slots 700", form: "6268P", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Slots 700_6268P", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Smack Dab 270", form: null, count: 450, price: 1, idealProfit: 180, url: null, identifier: "Smack Dab 270_None", profitMargin: 40.0, costBasis: 0.6, hasInformationalFlyer: false},
      {name: "Small Ball 175", form: "6916M", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Small Ball 175_6916M", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Small Ball 200", form: "6779P", count: 300, price: 1, idealProfit: 100, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Small Ball 200_6779P", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Small Ball 280", form: "6917M", count: 400, price: 1, idealProfit: 120, url: null, identifier: "Small Ball 280_6917M", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: false},
      {name: "Small Ball 400", form: "6918M", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Small Ball 400_6918M", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Small Ball 599", form: "6919M", count: 840, price: 1, idealProfit: 241, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Small Ball 599_6919M", profitMargin: 28.7, costBasis: 0.713, hasInformationalFlyer: true},
      {name: "Small Ball 700", form: "6268P", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF", identifier: "Small Ball 700_6268P", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Snap Crackle Pop 270", form: null, count: 450, price: 1, idealProfit: 180, url: null, identifier: "Snap Crackle Pop 270_None", profitMargin: 40.0, costBasis: 0.6, hasInformationalFlyer: false},
      {name: "Stones 599", form: "7728H", count: 960, price: 1, idealProfit: 361, url: null, identifier: "Stones 599_7728H", profitMargin: 37.6, costBasis: 0.624, hasInformationalFlyer: false},
      {name: "Tiger Dab 175", form: "6219H", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Tiger Dab 175_6219H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Tiger Dab 280", form: "6220H", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Tiger Dab 280_6220H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Tiger Dab 400", form: "6221H", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Tiger Dab 400_6221H", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Tiger Dab 700", form: "6222H", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF", identifier: "Tiger Dab 700_6222H", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Triple Twist 110", form: "6080J", count: 150, price: 1, idealProfit: 40, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6080J.PDF", identifier: "Triple Twist 110_6080J", profitMargin: 26.7, costBasis: 0.733, hasInformationalFlyer: true},
      {name: "Triple Twist 175", form: "6081J", count: 250, price: 1, idealProfit: 75, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6080J.PDF", identifier: "Triple Twist 175_6081J", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Triple Twist 280", form: "6082J", count: 400, price: 1, idealProfit: 120, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6080J.PDF", identifier: "Triple Twist 280_6082J", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true},
      {name: "Triple Twist 400", form: "6083J", count: 600, price: 1, idealProfit: 200, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6080J.PDF", identifier: "Triple Twist 400_6083J", profitMargin: 33.3, costBasis: 0.667, hasInformationalFlyer: true},
      {name: "Triple Twist 700", form: "6084J", count: 1000, price: 1, idealProfit: 300, url: "https://www.arrowinternational.com/db/grafix/AIPDF/C6080J.PDF", identifier: "Triple Twist 700_6084J", profitMargin: 30.0, costBasis: 0.7, hasInformationalFlyer: true}
    ],
    adminFeatures: {
      allowCustomGames: true,
      allowPriceModification: true,
      allowProfitAdjustment: true,
      requireUrlValidation: false,
      supportsBulkImport: true,
      supportsExport: true,
      auditTrail: true
    }
  };
}

/**
 * Get default session games structure
 */
function getDefaultSessionGames() {
  return {
    "5-1": {
      sessionName: "1st/5th Monday",
      totalGames: 17,
      categories: {
        earlyBird: {
          description: "Early Bird Games - Hard Way Bingo (No Free Space)",
          games: [
            {gameNumber: 1, category: "Early Bird", pattern: "Hard Way Bingo - No Free Space", payout: 100, description: "Hard Way Bingo with no free space allowed", order: 1},
            {gameNumber: 2, category: "Early Bird", pattern: "Diagonal & Outside Corners", payout: 100, description: "Cover both diagonals and all four outside corners", order: 2},
            {gameNumber: 3, category: "Early Bird", pattern: "Small Picture Frame", payout: 100, description: "Cover the outside border of the bingo card", order: 3}
          ]
        },
        regular: {
          description: "Regular Session Games",
          preIntermission: [
            {gameNumber: 4, category: "Regular", pattern: "Straight Line", payout: 100, description: "Any horizontal, vertical, or diagonal line", order: 4},
            {gameNumber: 5, category: "Regular", pattern: "Four Corners", payout: 150, description: "Cover all four corners of the bingo card", order: 5},
            {gameNumber: 6, category: "Regular", pattern: "Letter X", payout: 200, description: "Cover both diagonals to form an X", order: 6},
            {gameNumber: 7, category: "Regular", pattern: "Letter T", payout: 200, description: "Cover the top row and middle column", order: 7},
            {gameNumber: 8, category: "Regular", pattern: "Postage Stamp", payout: 250, description: "Cover a 2x2 square in any corner", order: 8}
          ],
          postIntermission: [
            {gameNumber: 10, category: "Regular", pattern: "Letter L", payout: 150, description: "Cover the bottom row and left column", order: 10},
            {gameNumber: 11, category: "Regular", pattern: "Arrow", payout: 150, description: "Cover numbers forming an arrow pattern", order: 11},
            {gameNumber: 12, category: "Regular", pattern: "Picture Frame", payout: 150, description: "Cover the entire outside border", order: 12}
          ],
          postProgressive: [
            {gameNumber: 14, category: "Regular", pattern: "Kite", payout: 150, description: "Cover numbers forming a kite pattern", order: 14},
            {gameNumber: 15, category: "Regular", pattern: "Double Line", payout: 200, description: "Cover any two complete lines", order: 15},
            {gameNumber: 16, category: "Regular", pattern: "Letter U", payout: 300, description: "Cover the bottom row and both side columns", order: 16},
            {gameNumber: 17, category: "Regular", pattern: "Coverall", payout: 500, description: "Cover all numbers on the bingo card", order: 17}
          ]
        },
        specialEvent: {
          description: "Special Event Games",
          games: [
            {gameNumber: 9, category: "Special Event", pattern: "Pull-Tab Special", payout: "Variable", description: "Pot of Gold or other special pull-tab game", order: 9, pullTabGame: true, pullTabDetails: {defaultGame: "Pot of Gold", alternateGames: ["Lucky 7s", "Money Tree", "Cash Bonanza"]}}
          ]
        },
        progressive: {
          description: "Progressive Games with Jackpot",
          games: [
            {gameNumber: 13, category: "Progressive", pattern: "Progressive Diamond", payout: "Progressive Jackpot", description: "Diamond pattern with progressive jackpot rules", order: 13, progressiveRules: {startingJackpot: 500, increment: 25, maxCalls: {"50": "Full Jackpot", "55": "75% Jackpot", "60": "50% Jackpot", "65": "25% Jackpot", "over65": "Consolation Prize $100"}}}
          ]
        }
      }
    },
    "6-2": {
      sessionName: "2nd Monday",
      totalGames: 17,
      categories: {
        earlyBird: {
          description: "Early Bird Games - Hard Way Bingo (No Free Space)",
          games: [
            {gameNumber: 1, category: "Early Bird", pattern: "Hard Way Bingo - No Free Space", payout: 100, description: "Hard Way Bingo with no free space allowed", order: 1},
            {gameNumber: 2, category: "Early Bird", pattern: "Diagonal & Outside Corners", payout: 100, description: "Cover both diagonals and all four outside corners", order: 2},
            {gameNumber: 3, category: "Early Bird", pattern: "Small Picture Frame", payout: 100, description: "Cover the outside border of the bingo card", order: 3}
          ]
        },
        regular: {
          description: "Regular Session Games",
          preIntermission: [
            {gameNumber: 4, category: "Regular", pattern: "Straight Line", payout: 125, description: "Any horizontal, vertical, or diagonal line", order: 4},
            {gameNumber: 5, category: "Regular", pattern: "Four Corners", payout: 175, description: "Cover all four corners of the bingo card", order: 5},
            {gameNumber: 6, category: "Regular", pattern: "Letter X", payout: 225, description: "Cover both diagonals to form an X", order: 6},
            {gameNumber: 7, category: "Regular", pattern: "Letter H", payout: 225, description: "Cover both side columns and middle row", order: 7},
            {gameNumber: 8, category: "Regular", pattern: "Plus Sign", payout: 275, description: "Cover the middle row and middle column", order: 8}
          ],
          postIntermission: [
            {gameNumber: 10, category: "Regular", pattern: "Letter C", payout: 150, description: "Cover left column, top and bottom rows", order: 10},
            {gameNumber: 11, category: "Regular", pattern: "Bow Tie", payout: 150, description: "Cover numbers forming a bow tie pattern", order: 11},
            {gameNumber: 12, category: "Regular", pattern: "Block of 9", payout: 150, description: "Cover a 3x3 block anywhere on the card", order: 12}
          ],
          postProgressive: [
            {gameNumber: 14, category: "Regular", pattern: "Letter Z", payout: 150, description: "Cover top row, diagonal, and bottom row", order: 14},
            {gameNumber: 15, category: "Regular", pattern: "Triple Line", payout: 225, description: "Cover any three complete lines", order: 15},
            {gameNumber: 16, category: "Regular", pattern: "Big Picture Frame", payout: 325, description: "Cover two complete outer borders", order: 16},
            {gameNumber: 17, category: "Regular", pattern: "Coverall", payout: 600, description: "Cover all numbers on the bingo card", order: 17}
          ]
        },
        specialEvent: {
          description: "Special Event Games",
          games: [
            {gameNumber: 9, category: "Special Event", pattern: "Pull-Tab Special", payout: "Variable", description: "Lucky Streak or other special pull-tab game", order: 9, pullTabGame: true, pullTabDetails: {defaultGame: "Lucky Streak", alternateGames: ["Hot Shot", "Big Money", "Winner's Circle"]}}
          ]
        },
        progressive: {
          description: "Progressive Games with Jackpot",
          games: [
            {gameNumber: 13, category: "Progressive", pattern: "Progressive Diamond", payout: "Progressive Jackpot", description: "Diamond pattern with progressive jackpot rules", order: 13, progressiveRules: {startingJackpot: 600, increment: 30, maxCalls: {"50": "Full Jackpot", "55": "75% Jackpot", "60": "50% Jackpot", "65": "25% Jackpot", "over65": "Consolation Prize $125"}}}
          ]
        }
      }
    },
    "7-3": {
      sessionName: "3rd Monday",
      totalGames: 17,
      categories: {
        earlyBird: {
          description: "Early Bird Games - Hard Way Bingo (No Free Space)",
          games: [
            {gameNumber: 1, category: "Early Bird", pattern: "Hard Way Bingo - No Free Space", payout: 100, description: "Hard Way Bingo with no free space allowed", order: 1},
            {gameNumber: 2, category: "Early Bird", pattern: "Diagonal & Outside Corners", payout: 100, description: "Cover both diagonals and all four outside corners", order: 2},
            {gameNumber: 3, category: "Early Bird", pattern: "Small Picture Frame", payout: 100, description: "Cover the outside border of the bingo card", order: 3}
          ]
        },
        regular: {
          description: "Regular Session Games",
          preIntermission: [
            {gameNumber: 4, category: "Regular", pattern: "Straight Line", payout: 100, description: "Any horizontal, vertical, or diagonal line", order: 4},
            {gameNumber: 5, category: "Regular", pattern: "Four Corners", payout: 150, description: "Cover all four corners of the bingo card", order: 5},
            {gameNumber: 6, category: "Regular", pattern: "Letter X", payout: 200, description: "Cover both diagonals to form an X", order: 6},
            {gameNumber: 7, category: "Regular", pattern: "Letter I", payout: 200, description: "Cover the middle column completely", order: 7},
            {gameNumber: 8, category: "Regular", pattern: "Diamond", payout: 250, description: "Cover numbers forming a diamond pattern", order: 8}
          ],
          postIntermission: [
            {gameNumber: 10, category: "Regular", pattern: "Letter O", payout: 150, description: "Cover the outside border forming an O", order: 10},
            {gameNumber: 11, category: "Regular", pattern: "Six Pack", payout: 150, description: "Cover any 2x3 block on the card", order: 11},
            {gameNumber: 12, category: "Regular", pattern: "Crazy T", payout: 150, description: "Cover any row and any column intersection", order: 12}
          ],
          postProgressive: [
            {gameNumber: 14, category: "Regular", pattern: "Letter N", payout: 150, description: "Cover both side columns and one diagonal", order: 14},
            {gameNumber: 15, category: "Regular", pattern: "Cross", payout: 250, description: "Cover middle row and middle column", order: 15},
            {gameNumber: 16, category: "Regular", pattern: "Double Postage Stamp", payout: 350, description: "Cover two 2x2 squares in opposite corners", order: 16},
            {gameNumber: 17, category: "Regular", pattern: "Full House", payout: 600, description: "Cover all numbers on the bingo card", order: 17}
          ]
        },
        specialEvent: {
          description: "Special Event Games",
          games: [
            {gameNumber: 9, category: "Special Event", pattern: "Pull-Tab Special", payout: "Variable", description: "Money Tree or other special pull-tab game", order: 9, pullTabGame: true, pullTabDetails: {defaultGame: "Money Tree", alternateGames: ["Cash Cow", "Golden Ticket", "Jackpot Junction"]}}
          ]
        },
        progressive: {
          description: "Progressive Games with Jackpot",
          games: [
            {gameNumber: 13, category: "Progressive", pattern: "Progressive Diamond", payout: "Progressive Jackpot", description: "Diamond pattern with progressive jackpot rules", order: 13, progressiveRules: {startingJackpot: 550, increment: 25, maxCalls: {"50": "Full Jackpot", "55": "75% Jackpot", "60": "50% Jackpot", "65": "25% Jackpot", "over65": "Consolation Prize $110"}}}
          ]
        }
      }
    },
    "8-4": {
      sessionName: "4th Monday",
      totalGames: 17,
      categories: {
        earlyBird: {
          description: "Early Bird Games - Hard Way Bingo (No Free Space)",
          games: [
            {gameNumber: 1, category: "Early Bird", pattern: "Hard Way Bingo - No Free Space", payout: 100, description: "Hard Way Bingo with no free space allowed", order: 1},
            {gameNumber: 2, category: "Early Bird", pattern: "Diagonal & Outside Corners", payout: 100, description: "Cover both diagonals and all four outside corners", order: 2},
            {gameNumber: 3, category: "Early Bird", pattern: "Small Picture Frame", payout: 100, description: "Cover the outside border of the bingo card", order: 3}
          ]
        },
        regular: {
          description: "Regular Session Games",
          preIntermission: [
            {gameNumber: 4, category: "Regular", pattern: "Straight Line", payout: 150, description: "Any horizontal, vertical, or diagonal line", order: 4},
            {gameNumber: 5, category: "Regular", pattern: "Four Corners", payout: 200, description: "Cover all four corners of the bingo card", order: 5},
            {gameNumber: 6, category: "Regular", pattern: "Letter X", payout: 250, description: "Cover both diagonals to form an X", order: 6},
            {gameNumber: 7, category: "Regular", pattern: "Letter V", payout: 250, description: "Cover numbers forming a V pattern", order: 7},
            {gameNumber: 8, category: "Regular", pattern: "Postage Stamp", payout: 300, description: "Cover a 2x2 square in any corner", order: 8}
          ],
          postIntermission: [
            {gameNumber: 10, category: "Regular", pattern: "Letter E", payout: 150, description: "Cover left column and top, middle, bottom rows", order: 10},
            {gameNumber: 11, category: "Regular", pattern: "Airplane", payout: 150, description: "Cover numbers forming an airplane pattern", order: 11},
            {gameNumber: 12, category: "Regular", pattern: "Champagne Glass", payout: 150, description: "Cover numbers forming a champagne glass", order: 12}
          ],
          postProgressive: [
            {gameNumber: 14, category: "Regular", pattern: "Letter B", payout: 150, description: "Cover left column and specific pattern for B", order: 14},
            {gameNumber: 15, category: "Regular", pattern: "Layer Cake", payout: 275, description: "Cover three complete horizontal rows", order: 15},
            {gameNumber: 16, category: "Regular", pattern: "Crazy L", payout: 400, description: "Cover any row and any column in L formation", order: 16},
            {gameNumber: 17, category: "Regular", pattern: "Coverall", payout: 750, description: "Cover all numbers on the bingo card", order: 17}
          ]
        },
        specialEvent: {
          description: "Special Event Games",
          games: [
            {gameNumber: 9, category: "Special Event", pattern: "Pull-Tab Special", payout: "Variable", description: "Big Bucks or other special pull-tab game", order: 9, pullTabGame: true, pullTabDetails: {defaultGame: "Big Bucks", alternateGames: ["Super 7", "Cash Bonanza", "Lucky Strike"]}}
          ]
        },
        progressive: {
          description: "Progressive Games with Jackpot",
          games: [
            {gameNumber: 13, category: "Progressive", pattern: "Progressive Diamond", payout: "Progressive Jackpot", description: "Diamond pattern with progressive jackpot rules", order: 13, progressiveRules: {startingJackpot: 700, increment: 35, maxCalls: {"50": "Full Jackpot", "55": "75% Jackpot", "60": "50% Jackpot", "65": "25% Jackpot", "over65": "Consolation Prize $150"}}}
          ]
        }
      }
    }
  };
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