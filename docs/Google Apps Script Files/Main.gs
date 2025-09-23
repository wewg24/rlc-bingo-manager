/**
 * RLC BINGO MANAGER - COMPLETE BACKEND
 * Version: 11.0.0
 * 
 * ARCHITECTURE:
 * - Wizard-based data entry workflow
 * - Complete data preservation from original HTML forms
 * - Modern API design with comprehensive error handling
 */

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
  SPREADSHEET_ID: '1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc',
  DRIVE_FOLDER_ID: '13y-jTy3lcFazALyI4DrmeaQx8kLkCY-a',
  PHOTO_FOLDER_ID: '1GalEnCnNtEPe5dv2FeKg6B0Aucamo04c',
  REPORTS_FOLDER_ID: '1KiT6GB8onDmXxwNYpi9npsBzxOvDvxz4',
  
  SHEETS: {
    OCCASIONS: 'Occasions',
    SESSION_GAMES: 'SessionGames',
    PULL_TAB_LIBRARY: 'PullTabLibrary',
    PULL_TAB_USAGE: 'PullTabUsage',
    PAPER_BINGO: 'PaperBingo',
    POS_DOOR_SALES: 'POSDoorSales',
    ELECTRONIC: 'Electronic',
    MONEY_COUNT: 'MoneyCount',
    FINANCIAL_SUMMARY: 'FinancialSummary',
    METRICS: 'Metrics'
  }
};

// ==========================================
// WEB APP ENTRY POINTS
// ==========================================

function doGet(e) {
  console.log('GET request:', e.parameter);
  
  const path = e.parameter.path || 'status';
  const response = { success: false };
  
  try {
    const dm = new DataManager();
    
    switch(path) {
      case 'status':
        response.success = true;
        response.message = 'RLC Bingo API is running';
        response.version = '11.0.0';
        response.timestamp = new Date().toISOString();
        break;
        
      case 'pulltabs':
      case 'pulltab-library':
        const libraryResult = dm.getPullTabLibrary();
        response.success = libraryResult.success;
        response.games = libraryResult.games || [];
        response.count = libraryResult.count || 0;
        break;
        
      case 'session-games':
      case 'session-games':
        const sessionType = e.parameter.sessionType || e.parameter.sessionType || e.parameter.session;
        const gamesResult = dm.getSessionGames(sessionType);
        response.success = gamesResult.success;
        response.games = gamesResult.games || [];
        break;
        
      case 'occasions':
        const occasionsResult = dm.getOccasions(e.parameter);
        response.success = occasionsResult.success;
        response.occasions = occasionsResult.occasions || [];
        break;
        
      case 'occasion':
        const occasionId = e.parameter.id;
        if (!occasionId) {
          response.error = 'Occasion ID required';
        } else {
          const occasionResult = dm.getOccasionComplete(occasionId);
          response.success = occasionResult.success;
          response.data = occasionResult.data;
        }
        break;
        
      default:
        response.error = 'Invalid path: ' + path;
        response.availablePaths = [
          'status', 'pulltabs', 'session-games', 'occasions', 'occasion'
        ];
    }
  } catch (error) {
    console.error('Error in doGet:', error);
    response.error = error.toString();
    response.stack = error.stack;
  }
  
  const output = ContentService.createTextOutput(JSON.stringify(response));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function doPost(e) {
  console.log('POST request:', e.parameter);
  
  const action = e.parameter.action;
  const response = { success: false };
  
  try {
    const dm = new DataManager();
    const data = e.parameter.data ? JSON.parse(e.parameter.data) : {};
    
    switch(action) {
      case 'save-occasion':
        response.data = dm.saveOccasionComplete(data);
        response.success = response.data.success;
        break;

      case 'update-occasion':
        response.data = dm.updateOccasion(data.occasionId, data);
        response.success = response.data.success;
        break;

      case 'save-occasion':
        response.data = dm.saveOccasion(data);
        response.success = response.data.success;
        break;

      case 'get-occasions':
        response.data = dm.getOccasions();
        response.success = true;
        break;

      case 'delete-occasion':
        response.data = dm.deleteOccasion(e.parameter.occasionId);
        response.success = response.data.success;
        break;

      case 'get-library':
        response.data = dm.getPullTabLibrary();
        response.success = response.data.success;
        break;

      case 'upload-photo':
        response.data = dm.uploadPhoto(data);
        response.success = response.data.success;
        break;

      default:
        response.error = 'Invalid action: ' + action;
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    response.error = error.toString();
    response.stack = error.stack;
  }
  
  const output = ContentService.createTextOutput(JSON.stringify(response));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ==========================================
// DATA MANAGER CLASS
// ==========================================

class DataManager {
  constructor() {
    this.ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  
  /**
   * Get complete pull-tab library
   */
  getPullTabLibrary() {
    try {
      const sheet = this.ss.getSheetByName(CONFIG.SHEETS.PULL_TAB_LIBRARY);
      if (!sheet) {
        // Create and populate if doesn't exist
        const newSheet = this.createPullTabLibrarySheet();
        const result = PullTabLibrary.populateSheet(newSheet);
        if (!result.success) {
          return { success: false, error: result.message };
        }
      }
      
      const data = sheet.getDataRange().getValues();
      const headers = data.shift();
      
      const games = data.map(row => ({
        name: row[0],
        form: row[1],
        count: row[2],
        price: row[3],
        profit: row[4],
        url: row[5]
      }));
      
      return {
        success: true,
        games: games,
        count: games.length
      };
    } catch (error) {
      console.error('Error getting pull-tab library:', error);
      return { success: false, error: error.toString() };
    }
  }
  
  /**
   * Get session games configuration
   */
  getOccasionGames(sessionType) {
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
      ],
      '6-2': [
        {num: 1, color: 'Early Bird', game: 'Hard Way Bingo No Free Space', prize: 100},
        {num: 2, color: 'Early Bird', game: 'Diagonal and Outside Corners', prize: 100},
        {num: 3, color: 'Early Bird', game: 'Small Picture Frame', prize: 100},
        {num: 4, color: 'Blue', game: 'Block of 9', prize: 100},
        {num: 5, color: 'Orange', game: '$250 Number 7', prize: 250},
        {num: 6, color: 'Green', game: 'Small Diamond', prize: 100},
        {num: 7, color: 'Yellow', game: 'Razor Blade', prize: 100},
        {num: 8, color: 'Pink', game: '$250 Letter X', prize: 250},
        {num: 10, color: 'Gray', game: '5 Around Any Corner', prize: 150},
        {num: 11, color: 'Olive', game: 'Double Postage Stamps', prize: 150},
        {num: 12, color: 'Brown', game: 'Outside Single Line', prize: 150},
        {num: 13, color: 'Progressive', game: 'Diamond', prize: 0, progressive: true},
        {num: 14, color: 'Red', game: 'Checkmark', prize: 150},
        {num: 15, color: 'Purple', game: 'Regular Bingo No Corners', prize: 150},
        {num: 16, color: 'Black', game: 'Any 3 on Top Row and 3 on Bottom Row', prize: 150},
        {num: 17, color: 'Aqua', game: '$500 Coverall', prize: 500}
      ],
      '7-3': [
        {num: 1, color: 'Early Bird', game: 'Hard Way Bingo No Free Space', prize: 100},
        {num: 2, color: 'Early Bird', game: 'Diagonal and Outside Corners', prize: 100},
        {num: 3, color: 'Early Bird', game: 'Small Picture Frame', prize: 100},
        {num: 4, color: 'Blue', game: '6 Pack Anywhere', prize: 100},
        {num: 5, color: 'Orange', game: '$250 Number 7', prize: 250},
        {num: 6, color: 'Green', game: 'Pyramid', prize: 100},
        {num: 7, color: 'Yellow', game: 'Champagne Glass', prize: 100},
        {num: 8, color: 'Pink', game: '$250 Letter X', prize: 250},
        {num: 10, color: 'Gray', game: 'Bow Tie', prize: 150},
        {num: 11, color: 'Olive', game: 'Outside Line', prize: 150},
        {num: 12, color: 'Brown', game: 'L For Lions', prize: 150},
        {num: 13, color: 'Progressive', game: 'Diamond', prize: 0, progressive: true},
        {num: 14, color: 'Red', game: 'Checkmark', prize: 150},
        {num: 15, color: 'Purple', game: '5 Around Any Corner', prize: 150},
        {num: 16, color: 'Black', game: 'Small Kite', prize: 150},
        {num: 17, color: 'Aqua', game: '$500 Coverall', prize: 500}
      ],
      '8-4': [
        {num: 1, color: 'Early Bird', game: 'Hard Way Bingo No Free Space', prize: 100},
        {num: 2, color: 'Early Bird', game: 'Diagonal and Outside Corners', prize: 100},
        {num: 3, color: 'Early Bird', game: 'Small Picture Frame', prize: 100},
        {num: 4, color: 'Blue', game: 'Block of 9', prize: 100},
        {num: 5, color: 'Orange', game: '$250 Number 7', prize: 250},
        {num: 6, color: 'Green', game: 'Diamond', prize: 100},
        {num: 7, color: 'Yellow', game: 'Razor Blade', prize: 100},
        {num: 8, color: 'Pink', game: '$250 Letter X', prize: 250},
        {num: 10, color: 'Gray', game: '5 Around Any Corner', prize: 150},
        {num: 11, color: 'Olive', game: 'Double Postage Stamp', prize: 150},
        {num: 12, color: 'Brown', game: 'Outside Single Line', prize: 150},
        {num: 13, color: 'Progressive', game: 'Diamond', prize: 0, progressive: true},
        {num: 14, color: 'Red', game: 'Checkmark', prize: 150},
        {num: 15, color: 'Purple', game: 'Regular Bingo', prize: 150},
        {num: 16, color: 'Black', game: 'Any 3 on Top Row and 3 on Bottom Row', prize: 150},
        {num: 17, color: 'Aqua', game: '$500 Coverall', prize: 500}
      ]
    };
    
    return {
      success: true,
      games: configs[sessionType] || configs['5-1']
    };
  }
  
  /**
   * Save complete occasion data (all forms)
   * Updated to handle frontend nested data structure
   */
  saveOccasionComplete(data) {
    try {
      const occasionId = 'OCC_' + new Date().getTime();
      console.log('Saving occasion data:', JSON.stringify(data, null, 2));

      // Extract occasion data from nested structure
      const occasion = data.occasion || {};

      // 1. Save main occasion record with proper header mapping
      const occasionSheet = this.getOrCreateSheet(CONFIG.SHEETS.OCCASIONS);
      occasionSheet.appendRow([
        occasionId,                                    // Occasion ID
        occasion.date || occasion.mondayDate,          // Date
        occasion.sessionType || occasion.sessionType, // Session Type
        occasion.lionInCharge,                         // Lion in Charge
        parseInt(occasion.totalPlayers) || 0,          // Total Players
        parseInt(occasion.birthdays) || 0,             // Birthdays
        parseFloat(occasion.progressiveJackpot) || 1000, // Progressive Jackpot
        parseInt(occasion.progressiveBalls) || 48,     // Progressive Balls
        parseFloat(occasion.progressiveConsolation) || 200, // Progressive Consolation
        parseInt(occasion.progressiveActual) || 0,     // Progressive Actual
        parseFloat(occasion.progressivePrize) || 0,    // Progressive Prize
        occasion.checkPayment === 'true' || false,     // Check Payment
        new Date(),                                    // Created
        'Frontend User',                               // Created By
        'Active'                                       // Status
      ]);
      
      // 2. Save paper bingo counts
      if (data.paperBingo) {
        const paperSheet = this.getOrCreateSheet(CONFIG.SHEETS.PAPER_BINGO);
        Object.entries(data.paperBingo).forEach(([type, values]) => {
          paperSheet.appendRow([
            occasionId,
            type,
            values.start || 0,
            values.free || 0,
            values.end || 0,
            values.sold || 0
          ]);
        });
      }
      
      // 3. Save POS door sales
      if (data.posSales) {
        const posSheet = this.getOrCreateSheet(CONFIG.SHEETS.POS_DOOR_SALES);
        Object.entries(data.posSales).forEach(([item, values]) => {
          posSheet.appendRow([
            occasionId,
            item,
            values.price || 0,
            values.quantity || 0,
            values.total || 0
          ]);
        });
      }
      
      // 4. Save electronic sales
      if (data.electronic) {
        const electronicSheet = this.getOrCreateSheet(CONFIG.SHEETS.ELECTRONIC);
        electronicSheet.appendRow([
          occasionId,
          data.electronic.smallMachines || 0,
          data.electronic.largeMachines || 0,
          data.electronic.smallTotal || 0,
          data.electronic.largeTotal || 0,
          data.electronic.total || 0
        ]);
      }
      
      // 5. Save game results
      if (data.games && data.games.length > 0) {
        const gamesSheet = this.getOrCreateSheet(CONFIG.SHEETS.SESSION_GAMES);
        data.games.forEach(game => {
          gamesSheet.appendRow([
            occasionId,
            game.number,
            game.color,
            game.name,
            game.prize,
            game.winners || 1,
            game.prizePerWinner || game.prize,
            game.totalPayout || game.prize,
            game.checkPayment || false
          ]);
        });
      }
      
      // 6. Save pull-tab usage
      if (data.pullTabs && data.pullTabs.length > 0) {
        const pullTabSheet = this.getOrCreateSheet(CONFIG.SHEETS.PULL_TAB_USAGE);
        data.pullTabs.forEach(pt => {
          pullTabSheet.appendRow([
            occasionId,
            pt.gameName,
            pt.serialNumber,
            pt.price || 1,
            pt.tickets || 0,
            pt.sales || 0,
            pt.idealProfit || 0,
            pt.prizesPaid || 0,
            pt.netProfit || 0,
            pt.isSpecialEvent || false,
            pt.checkPayment || false
          ]);
        });
      }
      
      // 7. Save money count
      if (data.moneyCount) {
        const moneySheet = this.getOrCreateSheet(CONFIG.SHEETS.MONEY_COUNT);
        const mc = data.moneyCount;
        
        // Save bingo drawer
        moneySheet.appendRow([
          occasionId,
          'BINGO',
          mc.bingo?.hundreds || 0,
          mc.bingo?.fifties || 0,
          mc.bingo?.twenties || 0,
          mc.bingo?.tens || 0,
          mc.bingo?.fives || 0,
          mc.bingo?.twos || 0,
          mc.bingo?.ones || 0,
          mc.bingo?.coins || 0,
          mc.bingo?.checks || 0,
          mc.bingo?.total || 0
        ]);
        
        // Save pull-tab drawer
        moneySheet.appendRow([
          occasionId,
          'PULLTAB',
          mc.pullTab?.hundreds || 0,
          mc.pullTab?.fifties || 0,
          mc.pullTab?.twenties || 0,
          mc.pullTab?.tens || 0,
          mc.pullTab?.fives || 0,
          mc.pullTab?.twos || 0,
          mc.pullTab?.ones || 0,
          mc.pullTab?.coins || 0,
          0, // No checks for pull-tabs
          mc.pullTab?.total || 0
        ]);
      }
      
      // 8. Save financial summary
      if (data.financial) {
        const financialSheet = this.getOrCreateSheet(CONFIG.SHEETS.FINANCIAL_SUMMARY);
        const f = data.financial;
        financialSheet.appendRow([
          occasionId,
          f.totalBingoSales || 0,
          f.pullTabSales || 0,
          f.specialEventSales || 0,
          f.grossSales || 0,
          f.bingoPrizesPaid || 0,
          f.pullTabPrizesPaid || 0,
          f.specialEventPrizesPaid || 0,
          f.totalPrizesPaid || 0,
          f.prizesPaidByCheck || 0,
          f.totalCashDeposit || 0,
          f.lessStartupCash || 1000,
          f.actualProfit || 0,
          f.idealProfit || 0,
          f.overShort || 0
        ]);
      }
      
      return {
        success: true,
        occasionId: occasionId,
        message: 'Occasion saved successfully'
      };
      
    } catch (error) {
      console.error('Error saving occasion:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * Get complete occasion data
   */
  getOccasionComplete(occasionId) {
    try {
      const result = {
        occasion: {},
        paperBingo: {},
        posSales: {},
        electronic: {},
        games: [],
        pullTabs: [],
        moneyCount: {},
        financial: {}
      };
      
      // Get main occasion data
      const occasionSheet = this.ss.getSheetByName(CONFIG.SHEETS.OCCASIONS);
      const occasionData = occasionSheet.getDataRange().getValues();
      const occasionHeaders = occasionData.shift();
      
      const occasionRow = occasionData.find(row => row[0] === occasionId);
      if (!occasionRow) {
        return { success: false, error: 'Occasion not found' };
      }
      
      occasionHeaders.forEach((header, index) => {
        result.occasion[header] = occasionRow[index];
      });
      
      // Get paper bingo data
      const paperSheet = this.ss.getSheetByName(CONFIG.SHEETS.PAPER_BINGO);
      if (paperSheet) {
        const paperData = paperSheet.getDataRange().getValues();
        paperData.shift(); // Remove headers
        paperData.filter(row => row[0] === occasionId).forEach(row => {
          result.paperBingo[row[1]] = {
            start: row[2],
            free: row[3],
            end: row[4],
            sold: row[5]
          };
        });
      }
      
      // Get POS sales data
      const posSheet = this.ss.getSheetByName(CONFIG.SHEETS.POS_DOOR_SALES);
      if (posSheet) {
        const posData = posSheet.getDataRange().getValues();
        posData.shift();
        posData.filter(row => row[0] === occasionId).forEach(row => {
          result.posSales[row[1]] = {
            price: row[2],
            quantity: row[3],
            total: row[4]
          };
        });
      }
      
      // Get game results
      const gamesSheet = this.ss.getSheetByName(CONFIG.SHEETS.SESSION_GAMES);
      if (gamesSheet) {
        const gamesData = gamesSheet.getDataRange().getValues();
        gamesData.shift();
        result.games = gamesData.filter(row => row[0] === occasionId).map(row => ({
          number: row[1],
          color: row[2],
          name: row[3],
          prize: row[4],
          winners: row[5],
          prizePerWinner: row[6],
          totalPayout: row[7],
          checkPayment: row[8]
        }));
      }
      
      // Get pull-tab data
      const pullTabSheet = this.ss.getSheetByName(CONFIG.SHEETS.PULL_TAB_USAGE);
      if (pullTabSheet) {
        const ptData = pullTabSheet.getDataRange().getValues();
        ptData.shift();
        result.pullTabs = ptData.filter(row => row[0] === occasionId).map(row => ({
          gameName: row[1],
          serialNumber: row[2],
          price: row[3],
          tickets: row[4],
          sales: row[5],
          idealProfit: row[6],
          prizesPaid: row[7],
          netProfit: row[8],
          isSpecialEvent: row[9],
          checkPayment: row[10]
        }));
      }
      
      // Get money count
      const moneySheet = this.ss.getSheetByName(CONFIG.SHEETS.MONEY_COUNT);
      if (moneySheet) {
        const moneyData = moneySheet.getDataRange().getValues();
        moneyData.shift();
        moneyData.filter(row => row[0] === occasionId).forEach(row => {
          const drawer = row[1].toLowerCase();
          result.moneyCount[drawer] = {
            hundreds: row[2],
            fifties: row[3],
            twenties: row[4],
            tens: row[5],
            fives: row[6],
            twos: row[7],
            ones: row[8],
            coins: row[9],
            checks: row[10],
            total: row[11]
          };
        });
      }
      
      // Get financial summary
      const financialSheet = this.ss.getSheetByName(CONFIG.SHEETS.FINANCIAL_SUMMARY);
      if (financialSheet) {
        const finData = financialSheet.getDataRange().getValues();
        finData.shift();
        const finRow = finData.find(row => row[0] === occasionId);
        if (finRow) {
          result.financial = {
            totalBingoSales: finRow[1],
            pullTabSales: finRow[2],
            specialEventSales: finRow[3],
            grossSales: finRow[4],
            bingoPrizesPaid: finRow[5],
            pullTabPrizesPaid: finRow[6],
            specialEventPrizesPaid: finRow[7],
            totalPrizesPaid: finRow[8],
            prizesPaidByCheck: finRow[9],
            totalCashDeposit: finRow[10],
            lessStartupCash: finRow[11],
            actualProfit: finRow[12],
            idealProfit: finRow[13],
            overShort: finRow[14]
          };
        }
      }
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      console.error('Error getting occasion:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * Get occasions list with filters
   */
  getOccasions(params = {}) {
    try {
      const sheet = this.ss.getSheetByName(CONFIG.SHEETS.OCCASIONS);
      const data = sheet.getDataRange().getValues();
      const headers = data.shift();
      
      let occasions = data.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      
      // Apply filters
      if (params.startDate) {
        occasions = occasions.filter(o => o['Date'] >= new Date(params.startDate));
      }
      if (params.endDate) {
        occasions = occasions.filter(o => o['Date'] <= new Date(params.endDate));
      }
      if (params.sessionType) {
        occasions = occasions.filter(o => o['Session Type'] === params.sessionType);
      }
      if (params.status) {
        occasions = occasions.filter(o => o['Status'] === params.status);
      }
      
      return {
        success: true,
        occasions: occasions
      };
      
    } catch (error) {
      console.error('Error getting occasions:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  /**
   * Helper method to get or create a sheet
   */
  getOrCreateSheet(sheetName) {
    let sheet = this.ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = this.ss.insertSheet(sheetName);
      
      // Add appropriate headers based on sheet type
      switch(sheetName) {
        case CONFIG.SHEETS.PAPER_BINGO:
          sheet.getRange(1, 1, 1, 6).setValues([
            ['Occasion ID', 'Type', 'Start', 'Free', 'End', 'Sold']
          ]);
          break;
          
        case CONFIG.SHEETS.POS_DOOR_SALES:
          sheet.getRange(1, 1, 1, 5).setValues([
            ['Occasion ID', 'Item', 'Price', 'Quantity', 'Total']
          ]);
          break;
          
        case CONFIG.SHEETS.ELECTRONIC:
          sheet.getRange(1, 1, 1, 6).setValues([
            ['Occasion ID', 'Small Machines', 'Large Machines', 'Small Total', 'Large Total', 'Total']
          ]);
          break;
          
        case CONFIG.SHEETS.MONEY_COUNT:
          sheet.getRange(1, 1, 1, 12).setValues([
            ['Occasion ID', 'Drawer', '100s', '50s', '20s', '10s', '5s', '2s', '1s', 'Coins', 'Checks', 'Total']
          ]);
          break;
          
        case CONFIG.SHEETS.FINANCIAL_SUMMARY:
          sheet.getRange(1, 1, 1, 15).setValues([
            ['Occasion ID', 'Bingo Sales', 'PT Sales', 'SE Sales', 'Gross Sales',
             'Bingo Prizes', 'PT Prizes', 'SE Prizes', 'Total Prizes', 'Check Prizes',
             'Cash Deposit', 'Startup', 'Actual Profit', 'Ideal Profit', 'Over/Short']
          ]);
          break;
      }
      
      sheet.setFrozenRows(1);
    }
    return sheet;
  }
  
  /**
   * Create pull-tab library sheet
   */
  createPullTabLibrarySheet() {
    const sheet = this.ss.insertSheet(CONFIG.SHEETS.PULL_TAB_LIBRARY);
    const result = PullTabLibrary.populateSheet(sheet);
    if (!result.success) {
      console.error('Failed to populate pull-tab library:', result.message);
    }
    return sheet;
  }
  
  /**
   * Upload photo to Drive
   */
  uploadPhoto(data) {
    try {
      const folder = DriveApp.getFolderById(CONFIG.PHOTO_FOLDER_ID);
      
      if (data.base64) {
        const blob = Utilities.newBlob(
          Utilities.base64Decode(data.base64.split(',')[1]),
          'image/jpeg',
          data.filename || 'photo_' + Date.now() + '.jpg'
        );
        
        const file = folder.createFile(blob);
        
        return {
          success: true,
          photoId: file.getId(),
          url: file.getUrl()
        };
      }
      
      return {
        success: false,
        error: 'No photo data provided'
      };
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  /**
   * Save a simple occasion record for admin interface
   */
  saveOccasion(data) {
    try {
      const occasionId = 'SES_' + new Date().getTime();
      const sheet = this.getOrCreateSheet(CONFIG.SHEETS.OCCASIONS);

      // Add occasion with basic info
      sheet.appendRow([
        occasionId,                    // Occasion ID
        data.date,                    // Date
        data.sessionType,             // Session Type
        data.lionInCharge,            // Lion in Charge
        data.totalPlayers || 0,       // Total Players
        0,                           // Birthdays
        0,                           // Progressive Jackpot
        0,                           // Progressive Balls
        0,                           // Progressive Consolation
        0,                           // Progressive Actual
        0,                           // Progressive Prize
        false,                       // Progressive Check
        data.status || 'Draft',      // Status
        new Date(),                  // Created
        new Date(),                  // Modified
        data.totalRevenue || 0,      // Total Revenue
        data.netProfit || 0,         // Net Profit
        Occasion.getActiveUser().getEmail(), // User
        ''                          // Notes
      ]);

      return {
        success: true,
        occasionId: occasionId,
        message: 'Occasion saved successfully'
      };
    } catch (error) {
      console.error('Error saving occasion:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  /**
   * Get all occasions for admin interface
   */
  getOccasions() {
    try {
      const sheet = this.ss.getSheetByName(CONFIG.SHEETS.OCCASIONS);
      if (!sheet) {
        return { success: true, occasions: [] };
      }

      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return { success: true, occasions: [] };
      }

      const headers = data.shift();
      const occasions = data.map(row => {
        return {
          id: row[0],
          date: row[1],
          sessionType: row[2],
          lionInCharge: row[3],
          totalPlayers: row[4] || 0,
          totalRevenue: row[15] || 0,
          netProfit: row[16] || 0,
          status: row[12] || 'Draft'
        };
      });

      return { success: true, occasions: occasions };
    } catch (error) {
      console.error('Error getting occasions:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  /**
   * Delete a occasion
   */
  deleteOccasion(occasionId) {
    try {
      const sheet = this.ss.getSheetByName(CONFIG.SHEETS.OCCASIONS);
      if (!sheet) {
        return { success: false, error: 'Occasions sheet not found' };
      }

      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === occasionId) {
          sheet.deleteRow(i + 1);
          return {
            success: true,
            message: 'Occasion deleted successfully'
          };
        }
      }

      return {
        success: false,
        error: 'Occasion not found'
      };
    } catch (error) {
      console.error('Error deleting occasion:', error);
      return {
        success: false,
        error: error.toString()
      };
    }
  }
}

// ==========================================
// SETUP FUNCTION
// ==========================================

function setup() {
  console.log('Starting RLC Bingo Manager setup...');
  
  try {
    const dm = new DataManager();
    const ss = dm.ss;
    const requiredSheets = Object.values(CONFIG.SHEETS);
    const existingSheets = ss.getSheets().map(s => s.getName());
    
    requiredSheets.forEach(sheetName => {
      if (!existingSheets.includes(sheetName)) {
        console.log('Creating sheet: ' + sheetName);
        dm.getOrCreateSheet(sheetName);
      }
    });
    
    // Ensure pull-tab library is populated
    const ptSheet = ss.getSheetByName(CONFIG.SHEETS.PULL_TAB_LIBRARY);
    if (ptSheet.getLastRow() <= 1) {
      console.log('Populating pull-tab library...');
      PullTabLibrary.populateSheet(ptSheet);
    }
    
    console.log('Setup completed successfully!');
    return { success: true, message: 'Setup completed' };
    
  } catch (error) {
    console.error('Setup error:', error);
    return { success: false, error: error.toString() };
  }
}

// NOTE: Sheet initialization is handled by Initialize.js
// Removed duplicate initializeSheets function to avoid conflicts


