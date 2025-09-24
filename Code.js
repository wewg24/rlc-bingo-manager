/**
 * RLC BINGO MANAGER - NEW CLEAN BACKEND
 * Version: 12.0.0
 *
 * CLEAN ARCHITECTURE:
 * - Pure JSON storage in Google Drive
 * - Simple, focused API endpoints
 * - Zero Google Sheets dependencies
 * - Complete data preservation
 */

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
  DRIVE_FOLDER_ID: '13y-jTy3lcFazALyI4DrmeaQx8kLkCY-a',
  OCCASIONS_FOLDER: 'occasions',
  FILES: {
    OCCASIONS_INDEX: 'occasions-index.json',
    PULL_TAB_LIBRARY: 'pull-tab-library.json'
  }
};

// ==========================================
// WEB APP ENTRY POINTS
// ==========================================

function doGet(e) {
  const path = e.parameter.path || 'status';

  try {
    const storage = new JsonStorage();

    switch(path) {
      case 'status':
        return jsonResponse({
          success: true,
          message: 'RLC Bingo API v12.0 - Clean JSON Storage',
          version: '12.0.0',
          timestamp: new Date().toISOString()
        });

      case 'occasions':
        return jsonResponse(storage.getOccasionsList());

      case 'occasion':
        const id = e.parameter.id;
        if (!id) return jsonResponse({ success: false, error: 'ID required' });
        return jsonResponse(storage.getOccasion(id));

      case 'session-games':
        const sessionType = e.parameter.sessionType || '5-1';
        return jsonResponse(getSessionGames(sessionType));

      case 'pulltabs':
        return jsonResponse(storage.getPullTabLibrary());

      default:
        return jsonResponse({
          success: false,
          error: 'Invalid path: ' + path,
          availablePaths: ['status', 'occasions', 'occasion', 'session-games', 'pulltabs']
        });
    }
  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.toString(),
      stack: error.stack
    });
  }
}

function doPost(e) {
  try {
    console.log('doPost called with:', JSON.stringify(e, null, 2));

    const storage = new JsonStorage();
    let requestData = {};
    let action = '';

    // Handle JSON request body from frontend
    if (e.postData && e.postData.contents) {
      try {
        const jsonData = JSON.parse(e.postData.contents);
        action = jsonData.action;
        requestData = jsonData.data || {};
        console.log('Parsed JSON request:', { action, requestData });
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return jsonResponse({
          success: false,
          error: 'Invalid JSON in request body'
        });
      }
    } else {
      // Fallback to URL parameters
      action = e.parameter.action;
      requestData = e.parameter.data ? JSON.parse(e.parameter.data) : {};
    }

    switch(action) {
      case 'saveOccasion':
        console.log('Calling saveOccasion with:', requestData);
        return jsonResponse(storage.saveOccasion(requestData));

      case 'deleteOccasion':
        const id = e.parameter.id || requestData.id;
        if (!id) return jsonResponse({ success: false, error: 'ID required' });
        return jsonResponse(storage.deleteOccasion(id));

      default:
        return jsonResponse({
          success: false,
          error: 'Invalid action: ' + action,
          availableActions: ['saveOccasion', 'deleteOccasion']
        });
    }
  } catch (error) {
    console.error('doPost error:', error);
    return jsonResponse({
      success: false,
      error: error.toString(),
      stack: error.stack
    });
  }
}

// ==========================================
// JSON STORAGE CLASS
// ==========================================

class JsonStorage {
  constructor() {
    this.driveFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    this.occasionsFolder = this.getOrCreateFolder(CONFIG.OCCASIONS_FOLDER);
  }

  // ==========================================
  // FOLDER OPERATIONS
  // ==========================================

  getOrCreateFolder(name) {
    const existing = this.driveFolder.getFoldersByName(name);
    if (existing.hasNext()) {
      return existing.next();
    }
    return this.driveFolder.createFolder(name);
  }

  // ==========================================
  // FILE OPERATIONS
  // ==========================================

  readJsonFile(fileName, folder = null) {
    try {
      const searchFolder = folder || this.driveFolder;
      const files = searchFolder.getFilesByName(fileName);

      if (!files.hasNext()) return null;

      const file = files.next();
      const content = file.getBlob().getDataAsString();
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading ${fileName}:`, error);
      return null;
    }
  }

  writeJsonFile(fileName, data, folder = null) {
    try {
      const targetFolder = folder || this.driveFolder;
      const jsonContent = JSON.stringify(data, null, 2);

      // Check if file exists
      const files = targetFolder.getFilesByName(fileName);
      if (files.hasNext()) {
        // Update existing
        const file = files.next();
        file.setContent(jsonContent);
        return file;
      } else {
        // Create new
        return targetFolder.createFile(fileName, jsonContent, 'application/json');
      }
    } catch (error) {
      console.error(`Error writing ${fileName}:`, error);
      throw error;
    }
  }

  deleteFile(fileName, folder = null) {
    try {
      const searchFolder = folder || this.driveFolder;
      const files = searchFolder.getFilesByName(fileName);

      if (files.hasNext()) {
        files.next().setTrashed(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting ${fileName}:`, error);
      return false;
    }
  }

  // ==========================================
  // OCCASION OPERATIONS
  // ==========================================

  saveOccasion(data) {
    try {
      console.log('Saving occasion (CLEAN BACKEND):', JSON.stringify(data, null, 2));

      // Generate ID if new occasion
      const isUpdate = data.id && data.id.startsWith('OCC_');
      const occasionId = isUpdate ? data.id : 'OCC_' + Date.now();

      // Create clean occasion object
      const occasion = {
        id: occasionId,
        created: isUpdate ? this.getExistingCreated(occasionId) : new Date().toISOString(),
        modified: new Date().toISOString(),

        // Basic info
        date: data.date,
        sessionType: data.sessionType,
        lionInCharge: data.lionInCharge,
        totalPlayers: parseInt(data.totalPlayers) || 0,
        birthdays: parseInt(data.birthdays) || 0,

        // Progressive
        progressive: {
          jackpot: parseFloat(data.progressiveJackpot) || 1000,
          ballsNeeded: parseInt(data.progressiveBalls) || 48,
          consolation: parseFloat(data.progressiveConsolation) || 200,
          actualBalls: parseInt(data.progressiveActual) || 0,
          prizeAwarded: parseFloat(data.progressivePrize) || 0,
          paidByCheck: data.progressiveCheck || false
        },

        // Complete wizard data
        paperBingo: data.paperBingo || {},
        posSales: data.posSales || {},
        electronic: data.electronic || {},
        games: data.games || [],
        pullTabs: data.pullTabs || [],
        moneyCount: data.moneyCount || {},

        status: data.status || 'Active'
      };

      // Save to JSON file
      const fileName = `${occasionId}.json`;
      this.writeJsonFile(fileName, occasion, this.occasionsFolder);

      // Update index
      this.updateIndex(occasionId, {
        id: occasionId,
        date: occasion.date,
        sessionType: occasion.sessionType,
        lionInCharge: occasion.lionInCharge,
        totalPlayers: occasion.totalPlayers,
        status: occasion.status,
        modified: occasion.modified
      });

      console.log('✅ SAVED TO JSON:', occasionId);

      return {
        success: true,
        id: occasionId,
        message: isUpdate ? 'Occasion updated in JSON storage' : 'Occasion saved to JSON storage'
      };

    } catch (error) {
      console.error('❌ SAVE ERROR:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  getOccasion(id) {
    try {
      console.log('Getting occasion from JSON:', id);

      const fileName = `${id}.json`;
      const data = this.readJsonFile(fileName, this.occasionsFolder);

      if (!data) {
        return {
          success: false,
          error: `Occasion ${id} not found in JSON storage`
        };
      }

      console.log('✅ LOADED FROM JSON:', id);

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('❌ LOAD ERROR:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  getOccasionsList() {
    try {
      const index = this.readJsonFile(CONFIG.FILES.OCCASIONS_INDEX) || [];

      return {
        success: true,
        occasions: index.sort((a, b) => new Date(b.date) - new Date(a.date))
      };

    } catch (error) {
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  deleteOccasion(id) {
    try {
      const fileName = `${id}.json`;
      const deleted = this.deleteFile(fileName, this.occasionsFolder);

      if (deleted) {
        this.removeFromIndex(id);
        return {
          success: true,
          message: 'Occasion deleted from JSON storage'
        };
      } else {
        return {
          success: false,
          error: 'Occasion file not found'
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  // ==========================================
  // INDEX MANAGEMENT
  // ==========================================

  updateIndex(id, summary) {
    try {
      let index = this.readJsonFile(CONFIG.FILES.OCCASIONS_INDEX) || [];

      // Remove existing entry
      index = index.filter(item => item.id !== id);

      // Add new entry
      index.push(summary);

      // Sort by date (newest first)
      index.sort((a, b) => new Date(b.date) - new Date(a.date));

      this.writeJsonFile(CONFIG.FILES.OCCASIONS_INDEX, index);

    } catch (error) {
      console.error('Error updating index:', error);
    }
  }

  removeFromIndex(id) {
    try {
      let index = this.readJsonFile(CONFIG.FILES.OCCASIONS_INDEX) || [];
      index = index.filter(item => item.id !== id);
      this.writeJsonFile(CONFIG.FILES.OCCASIONS_INDEX, index);
    } catch (error) {
      console.error('Error removing from index:', error);
    }
  }

  getExistingCreated(id) {
    try {
      const fileName = `${id}.json`;
      const existing = this.readJsonFile(fileName, this.occasionsFolder);
      return existing?.created || new Date().toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  // ==========================================
  // PULL-TAB LIBRARY
  // ==========================================

  getPullTabLibrary() {
    try {
      const library = this.readJsonFile(CONFIG.FILES.PULL_TAB_LIBRARY);

      if (library) {
        return {
          success: true,
          games: library.games || [],
          count: (library.games || []).length
        };
      }

      // Create default library
      const defaultLibrary = {
        lastUpdated: new Date().toISOString(),
        games: [
          { name: 'Lucky 7s', form: 'A', count: 300, price: 1, profit: 45 },
          { name: 'Cash Cow', form: 'B', count: 280, price: 2, profit: 84 },
          { name: 'Aces High', form: 'C', count: 320, price: 1, profit: 48 }
        ]
      };

      this.writeJsonFile(CONFIG.FILES.PULL_TAB_LIBRARY, defaultLibrary);

      return {
        success: true,
        games: defaultLibrary.games,
        count: defaultLibrary.games.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.toString()
      };
    }
  }
}

// ==========================================
// SESSION GAMES CONFIGURATION
// ==========================================

function getSessionGames(sessionType) {
  const configs = {
    '5-1': [
      {num: 1, color: 'Early Bird', game: 'Hard Way Bingo No Free Space', prize: 100},
      {num: 2, color: 'Early Bird', game: 'Diagonal & Outside Corners', prize: 100},
      {num: 3, color: 'Early Bird', game: 'Small Picture Frame', prize: 100},
      {num: 4, color: 'Blue', game: 'Regular Bingo or Outside 4 Corners', prize: 100},
      {num: 5, color: 'Orange', game: '$250 Number 7', prize: 250},
      {num: 6, color: 'Green', game: 'Small Diamond', prize: 100},
      {num: 7, color: 'Yellow', game: 'Crazy Picture Frame', prize: 100},
      {num: 8, color: 'Pink', game: '$250 Letter X', prize: 250},
      {num: 10, color: 'Gray', game: 'Baseball Diamond', prize: 150},
      {num: 11, color: 'Olive', game: '6 Pack Anywhere', prize: 150},
      {num: 12, color: 'Brown', game: 'Top or Bottom Line', prize: 150},
      {num: 13, color: 'Progressive', game: 'Diamond', prize: 0, progressive: true},
      {num: 14, color: 'Red', game: '3 on Top Row and 3 on Bottom Row', prize: 150},
      {num: 15, color: 'Purple', game: 'Double Postage Stamp - Anywhere', prize: 150},
      {num: 16, color: 'Black', game: 'Small Kite', prize: 150},
      {num: 17, color: 'Aqua', game: '$500 Coverall', prize: 500}
    ]
  };

  return {
    success: true,
    games: configs[sessionType] || configs['5-1']
  };
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function jsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data, null, 2));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}