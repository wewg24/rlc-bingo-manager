/**
 * One-time script to upload corrected session-games.json to Google Drive
 * Run this from the Apps Script editor or via clasp
 */

function uploadCorrectedSessionGames() {
  const SESSIONGAMES_FOLDER_ID = '1SOm-WDAjEgdZtjHF229ASROX3e2k-ll5';
  const FILE_NAME = 'session-games.json';

  // The corrected session games data with full structure
  const correctedData = {
    "metadata": {
      "version": "1.0",
      "lastUpdated": new Date().toISOString(),
      "description": "RLC Bingo Session Games - Complete structure with categories and timing"
    },
    "sessionTypes": {
      "5-1": {
        "sessionName": "1st/5th Monday",
        "totalGames": 17,
        "games": [
        {"gameNumber": 1, "color": "Early Bird", "pattern": "Hard Way Bingo No Free Space", "payout": 100},
        {"gameNumber": 2, "color": "Early Bird", "pattern": "Diagonal & Outside Corners", "payout": 100},
        {"gameNumber": 3, "color": "Early Bird", "pattern": "Small Picture Frame", "payout": 100},
        {"gameNumber": 4, "color": "Blue", "pattern": "Regular Bingo or Outside 4 Corners", "payout": 100},
        {"gameNumber": 5, "color": "Orange", "pattern": "Number 7", "payout": 250},
        {"gameNumber": 6, "color": "Green", "pattern": "Small Diamond", "payout": 100},
        {"gameNumber": 7, "color": "Yellow", "pattern": "Crazy Picture Frame", "payout": 100},
        {"gameNumber": 8, "color": "Pink", "pattern": "Letter X", "payout": 250},
        {"gameNumber": 9, "color": "Special Event", "pattern": "Pull-Tab Event Game - Pot of Gold, etc.", "payout": "Varies", "isSpecialEvent": true},
        {"gameNumber": 10, "color": "Gray", "pattern": "Baseball Diamond", "payout": 150},
        {"gameNumber": 11, "color": "Olive", "pattern": "6 Pack Anywhere", "payout": 150},
        {"gameNumber": 12, "color": "Brown", "pattern": "Top or Bottom Line", "payout": 150},
        {"gameNumber": 13, "color": "Progressive", "pattern": "Progressive Diamond", "payout": "Varies", "isProgressive": true},
        {"gameNumber": 14, "color": "Red", "pattern": "3 on Top Row and 3 on Bottom Row", "payout": 150},
        {"gameNumber": 15, "color": "Purple", "pattern": "Double Postage Stamp", "payout": 150},
        {"gameNumber": 16, "color": "Black", "pattern": "Small Kite", "payout": 150},
        {"gameNumber": 17, "color": "Aqua", "pattern": "Coverall", "payout": 500}
      ]
    },
    "6-2": {
      "sessionName": "2nd Monday",
      "totalGames": 17,
      "games": [
        {"gameNumber": 1, "color": "Early Bird", "pattern": "Hard Way Bingo No Free Space", "payout": 100},
        {"gameNumber": 2, "color": "Early Bird", "pattern": "Diagonal & Outside Corners", "payout": 100},
        {"gameNumber": 3, "color": "Early Bird", "pattern": "Small Picture Frame", "payout": 100},
        {"gameNumber": 4, "color": "Blue", "pattern": "Block of 9", "payout": 100},
        {"gameNumber": 5, "color": "Orange", "pattern": "Number 7", "payout": 250},
        {"gameNumber": 6, "color": "Green", "pattern": "Small Diamond", "payout": 100},
        {"gameNumber": 7, "color": "Yellow", "pattern": "Razor Blade", "payout": 100},
        {"gameNumber": 8, "color": "Pink", "pattern": "Letter X", "payout": 250},
        {"gameNumber": 9, "color": "Special Event", "pattern": "Pull-Tab Event Game - Pot of Gold, etc.", "payout": "Varies", "isSpecialEvent": true},
        {"gameNumber": 10, "color": "Gray", "pattern": "5 Around Any Corner", "payout": 150},
        {"gameNumber": 11, "color": "Olive", "pattern": "Double Postage Stamp", "payout": 150},
        {"gameNumber": 12, "color": "Brown", "pattern": "Outside Line", "payout": 150},
        {"gameNumber": 13, "color": "Progressive", "pattern": "Progressive Diamond", "payout": "Varies", "isProgressive": true},
        {"gameNumber": 14, "color": "Red", "pattern": "Checkmark", "payout": 150},
        {"gameNumber": 15, "color": "Purple", "pattern": "Regular Bingo No Corners", "payout": 150},
        {"gameNumber": 16, "color": "Black", "pattern": "3 on Top Row and 3 on Bottom Row", "payout": 150},
        {"gameNumber": 17, "color": "Aqua", "pattern": "Coverall", "payout": 500}
      ]
    },
    "7-3": {
      "sessionName": "3rd Monday",
      "totalGames": 17,
      "games": [
        {"gameNumber": 1, "color": "Early Bird", "pattern": "Hard Way Bingo No Free Space", "payout": 100},
        {"gameNumber": 2, "color": "Early Bird", "pattern": "Diagonal & Outside Corners", "payout": 100},
        {"gameNumber": 3, "color": "Early Bird", "pattern": "Small Picture Frame", "payout": 100},
        {"gameNumber": 4, "color": "Blue", "pattern": "6 Pack Anywhere", "payout": 100},
        {"gameNumber": 5, "color": "Orange", "pattern": "Number 7", "payout": 250},
        {"gameNumber": 6, "color": "Green", "pattern": "Pyramid", "payout": 100},
        {"gameNumber": 7, "color": "Yellow", "pattern": "Champagne Glass", "payout": 100},
        {"gameNumber": 8, "color": "Pink", "pattern": "Letter X", "payout": 250},
        {"gameNumber": 9, "color": "Special Event", "pattern": "Pull-Tab Event Game - Pot of Gold, etc.", "payout": "Varies", "isSpecialEvent": true},
        {"gameNumber": 10, "color": "Gray", "pattern": "Bow Tie", "payout": 150},
        {"gameNumber": 11, "color": "Olive", "pattern": "Outside Line", "payout": 150},
        {"gameNumber": 12, "color": "Brown", "pattern": "L For Lions", "payout": 150},
        {"gameNumber": 13, "color": "Progressive", "pattern": "Progressive Diamond", "payout": "Varies", "isProgressive": true},
        {"gameNumber": 14, "color": "Red", "pattern": "Checkmark", "payout": 150},
        {"gameNumber": 15, "color": "Purple", "pattern": "5 Around Any Corner", "payout": 150},
        {"gameNumber": 16, "color": "Black", "pattern": "Small Kite", "payout": 150},
        {"gameNumber": 17, "color": "Aqua", "pattern": "Coverall", "payout": 500}
      ]
    },
    "8-4": {
      "sessionName": "4th Monday",
      "totalGames": 17,
      "games": [
        {"gameNumber": 1, "color": "Early Bird", "pattern": "Hard Way Bingo No Free Space", "payout": 100},
        {"gameNumber": 2, "color": "Early Bird", "pattern": "Diagonal & Outside Corners", "payout": 100},
        {"gameNumber": 3, "color": "Early Bird", "pattern": "Small Picture Frame", "payout": 100},
        {"gameNumber": 4, "color": "Blue", "pattern": "Block of 9", "payout": 100},
        {"gameNumber": 5, "color": "Orange", "pattern": "Number 7", "payout": 250},
        {"gameNumber": 6, "color": "Green", "pattern": "Small Diamond", "payout": 100},
        {"gameNumber": 7, "color": "Yellow", "pattern": "Razor Blade", "payout": 100},
        {"gameNumber": 8, "color": "Pink", "pattern": "Letter X", "payout": 250},
        {"gameNumber": 9, "color": "Special Event", "pattern": "Pull-Tab Event Game - Pot of Gold, etc.", "payout": "Varies", "isSpecialEvent": true},
        {"gameNumber": 10, "color": "Gray", "pattern": "5 Around Any Corner", "payout": 150},
        {"gameNumber": 11, "color": "Olive", "pattern": "Double Postage Stamp", "payout": 150},
        {"gameNumber": 12, "color": "Brown", "pattern": "Outside Line", "payout": 150},
        {"gameNumber": 13, "color": "Progressive", "pattern": "Progressive Diamond", "payout": "Varies", "isProgressive": true},
        {"gameNumber": 14, "color": "Red", "pattern": "Checkmark", "payout": 150},
        {"gameNumber": 15, "color": "Purple", "pattern": "Regular Bingo No Corners", "payout": 150},
        {"gameNumber": 16, "color": "Black", "pattern": "3 on Top Row and 3 on Bottom Row", "payout": 150},
        {"gameNumber": 17, "color": "Aqua", "pattern": "Coverall", "payout": 500}
      ]
    }
  } // Close sessionTypes
}; // Close correctedData

  try {
    const folder = DriveApp.getFolderById(SESSIONGAMES_FOLDER_ID);

    // Delete old file if it exists
    const files = folder.getFilesByName(FILE_NAME);
    while (files.hasNext()) {
      const oldFile = files.next();
      Logger.log('Deleting old file: ' + oldFile.getId());
      oldFile.setTrashed(true);
    }

    // Create new file with corrected data
    const jsonContent = JSON.stringify(correctedData, null, 2);
    const newFile = folder.createFile(FILE_NAME, jsonContent, MimeType.PLAIN_TEXT);

    Logger.log('✅ Successfully uploaded corrected session-games.json');
    Logger.log('File ID: ' + newFile.getId());
    Logger.log('File URL: ' + newFile.getUrl());

    return {
      success: true,
      message: 'Corrected session-games.json uploaded successfully',
      fileId: newFile.getId(),
      fileUrl: newFile.getUrl()
    };

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
