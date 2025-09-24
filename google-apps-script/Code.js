/**
 * RLC Bingo Manager - Google Apps Script Backend
 * Handles JSON file storage in Google Drive
 */

// Configuration
const CONFIG = {
  FOLDER_NAME: 'RLC Bingo Data',
  OCCASIONS_FILE: 'occasions.json',
  BACKUP_FOLDER: 'RLC Bingo Backups'
};

/**
 * Main entry point for web app requests
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    switch (data.action) {
      case 'saveOccasion':
        return handleSaveOccasion(data.data);
      case 'loadOccasions':
        return handleLoadOccasions();
      case 'deleteOccasion':
        return handleDeleteOccasion(data.occasionId);
      default:
        throw new Error('Unknown action: ' + data.action);
    }

  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for loading data)
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'loadOccasions';

    if (action === 'loadOccasions') {
      return handleLoadOccasions();
    }

    throw new Error('Unknown GET action: ' + action);

  } catch (error) {
    console.error('Error in doGet:', error);
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

    // Remove existing entry if updating
    occasions = occasions.filter(o => o.id !== occasionId);

    // Add new entry
    occasions.push(occasionData);

    // Sort by date (newest first)
    occasions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Prepare data structure
    const fileData = {
      lastUpdated: new Date().toISOString(),
      count: occasions.length,
      occasions: occasions
    };

    // Save to file
    const jsonContent = JSON.stringify(fileData, null, 2);

    if (existingFile) {
      existingFile.setContent(jsonContent);
    } else {
      folder.createFile(CONFIG.OCCASIONS_FILE, jsonContent, MimeType.PLAIN_TEXT);
    }

    // Create backup
    createBackup(fileData);

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
    throw error;
  }
}

/**
 * Load all occasions from JSON file
 */
function handleLoadOccasions() {
  try {
    const folder = getOrCreateFolder(CONFIG.FOLDER_NAME);
    const file = getFileInFolder(folder, CONFIG.OCCASIONS_FILE);

    if (!file) {
      // Return empty structure if no file exists
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          lastUpdated: new Date().toISOString(),
          count: 0,
          occasions: []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const content = file.getBlob().getDataAsString();
    const data = JSON.parse(content);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        ...data
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error loading occasions:', error);
    throw error;
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
    throw error;
  }
}

/**
 * Get or create a folder in Drive
 */
function getOrCreateFolder(folderName, parentFolder = null) {
  const parent = parentFolder || DriveApp.getRootFolder();
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
 * Create a backup of the data
 */
function createBackup(data) {
  try {
    const backupFolder = getOrCreateFolder(CONFIG.BACKUP_FOLDER);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `occasions-backup-${timestamp}.json`;

    backupFolder.createFile(backupFileName, JSON.stringify(data, null, 2), MimeType.PLAIN_TEXT);

    // Keep only last 10 backups
    const backups = backupFolder.getFiles();
    const backupFiles = [];

    while (backups.hasNext()) {
      backupFiles.push(backups.next());
    }

    // Sort by creation date, newest first
    backupFiles.sort((a, b) => b.getDateCreated() - a.getDateCreated());

    // Delete old backups (keep 10 most recent)
    for (let i = 10; i < backupFiles.length; i++) {
      backupFiles[i].setTrashed(true);
    }

  } catch (error) {
    console.error('Error creating backup:', error);
    // Don't throw - backup failure shouldn't stop the main operation
  }
}