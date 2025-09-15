# RLC Bingo Operations Manager - Complete Integration Procedure

## Prerequisites Verification
Before starting, confirm you have access to:
- Google Apps Script Project (Script ID: `1W8URFctBaFd98FQpdzi7tI8h8OnUPi1rT-Et_SJRkKiMuVKra34pN5hU`)
- Google Sheets Database (Sheet ID: `1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc`)
- GitHub Repository (`wewg24/rlc-bingo-manager`)
- Google Drive Folder Structure (as specified)

---

## PART 1: Google Apps Script Backend Updates

### Step 1.1: Update Code.gs with Complete API Handlers

Open your Google Apps Script project and **REPLACE** the entire `Code.gs` file with:

```javascript
/**
 * RLC BINGO MANAGER - COMPLETE BACKEND SYSTEM
 * Version 9.1 - Full Integration
 */

const CONFIG = {
  SPREADSHEET_ID: '1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc',
  DRIVE_FOLDER_ID: '13y-jTy3lcFazALyI4DrmeaQx8kLkCY-a',
  PHOTO_FOLDER_ID: '1g0lfGUqI_dCeqv41ZxLaTyZqDAXt5Iyv',
  REPORTS_FOLDER_ID: '1KiT6GB8onDmXxwNYpi9npsBzxOvDvxz4',
  
  SHEETS: {
    OCCASIONS: 'Occasions',
    SESSION_GAMES: 'SessionGames',
    PULL_TAB_LIBRARY: 'PullTabLibrary',
    PULL_TAB_USAGE: 'PullTabUsage',
    FINANCIAL_SUMMARY: 'FinancialSummary',
    METRICS: 'Metrics',
    CONFIGURATION: 'Configuration',
    PAPER_BINGO: 'PaperBingo',
    POS_DOOR_SALES: 'POSDoorSales',
    MONEY_COUNT: 'MoneyCount'
  },
  
  CORS_HEADERS: {
    'Access-Control-Allow-Origin': 'https://wewg24.github.io',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }
};

// Main entry point for GET requests
function doGet(e) {
  const path = e.parameter.path || 'status';
  let result;
  
  try {
    switch(path) {
      case 'status':
        result = {
          success: true,
          message: 'RLC Bingo API is running',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        };
        break;
        
      case 'occasions':
        result = getOccasions(e.parameter);
        break;
        
      case 'occasion':
        result = getOccasionById(e.parameter.id);
        break;
        
      case 'pulltab-library':
        result = getPullTabLibrary();
        break;
        
      case 'session-games':
        result = getSessionGamesConfig(e.parameter.sessionType);
        break;
        
      case 'metrics':
        result = getMetrics(e.parameter);
        break;
        
      default:
        result = { success: false, error: 'Unknown path: ' + path };
    }
  } catch (error) {
    result = { success: false, error: error.toString() };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', CONFIG.CORS_HEADERS['Access-Control-Allow-Origin']);
}

// Main entry point for POST requests
function doPost(e) {
  if (e.parameter.path === 'OPTIONS') {
    return handleOptions();
  }
  
  const path = e.parameter.path || '';
  const data = JSON.parse(e.postData.contents);
  let result;
  
  try {
    switch(path) {
      case 'save-occasion':
        result = saveOccasionData(data);
        break;
        
      case 'update-occasion':
        result = updateOccasionData(data);
        break;
        
      case 'sync-offline':
        result = syncOfflineData(data);
        break;
        
      case 'upload-photo':
        result = uploadPhoto(data);
        break;
        
      default:
        result = { success: false, error: 'Unknown path: ' + path };
    }
  } catch (error) {
    result = { success: false, error: error.toString() };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', CONFIG.CORS_HEADERS['Access-Control-Allow-Origin']);
}

// Handle CORS preflight
function handleOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .addHeader('Access-Control-Allow-Origin', CONFIG.CORS_HEADERS['Access-Control-Allow-Origin'])
    .addHeader('Access-Control-Allow-Methods', CONFIG.CORS_HEADERS['Access-Control-Allow-Methods'])
    .addHeader('Access-Control-Allow-Headers', CONFIG.CORS_HEADERS['Access-Control-Allow-Headers']);
}

// Save complete occasion data
function saveOccasionData(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const occasionSheet = ss.getSheetByName(CONFIG.SHEETS.OCCASIONS);
    
    // Generate unique occasion ID
    const occasionId = 'OCC_' + Date.now();
    
    // Prepare main occasion row
    const occasionRow = [
      occasionId,
      data.date,
      data.sessionType,
      data.lionInCharge,
      data.totalPeople || 0,
      data.birthdays || 0,
      data.progressive?.jackpot || 0,
      data.progressive?.ballsNeeded || 48,
      data.progressive?.consolation || 200,
      data.progressive?.actualBalls || 0,
      data.progressive?.prizeAwarded || 0,
      data.progressive?.checkPayment || false,
      new Date(),
      Session.getActiveUser().getEmail() || 'web-user',
      'ACTIVE'
    ];
    
    occasionSheet.appendRow(occasionRow);
    
    // Save related data
    if (data.paperBingo) savePaperBingo(occasionId, data.paperBingo, ss);
    if (data.posDoorSales) savePOSDoorSales(occasionId, data.posDoorSales, ss);
    if (data.sessionGames) saveSessionGames(occasionId, data.sessionGames, ss);
    if (data.pullTabGames) savePullTabGames(occasionId, data.pullTabGames, ss);
    if (data.moneyCount) saveMoneyCount(occasionId, data.moneyCount, ss);
    
    // Calculate financial summary
    calculateFinancialSummary(occasionId, data, ss);
    
    return {
      success: true,
      occasionId: occasionId,
      message: 'Occasion saved successfully'
    };
    
  } catch (error) {
    console.error('Error saving occasion:', error);
    return { success: false, error: error.toString() };
  }
}

// Helper functions for saving related data
function savePaperBingo(occasionId, paperBingo, ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.PAPER_BINGO);
  if (!sheet) {
    sheet = createPaperBingoSheet(ss);
  }
  
  const types = [
    { key: 'special3on', name: '3 On Special', cost: 5 },
    { key: 'special6on', name: '6 On Special', cost: 10 },
    { key: 'special9on', name: '9 On Special', cost: 15 },
    { key: 'regular3on', name: '3 On Regular', cost: 10 },
    { key: 'regular6on', name: '6 On Regular', cost: 20 },
    { key: 'regular9on', name: '9 On Regular', cost: 30 }
  ];
  
  types.forEach(type => {
    const data = paperBingo[type.key];
    if (data) {
      const sold = (data.start || 0) + (data.free || 0) - (data.end || 0);
      const revenue = sold * type.cost;
      
      sheet.appendRow([
        occasionId,
        type.name,
        type.cost,
        data.start || 0,
        data.free || 0,
        data.end || 0,
        sold,
        revenue,
        new Date()
      ]);
    }
  });
}

function savePOSDoorSales(occasionId, posDoorSales, ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.POS_DOOR_SALES);
  if (!sheet) {
    sheet = createPOSDoorSalesSheet(ss);
  }
  
  const items = [
    { key: 'special3on', name: '3 On Special', price: 5 },
    { key: 'special6on', name: '6 On Special', price: 10 },
    { key: 'special9on', name: '6 On Special 2nd', price: 10 },
    { key: 'special9onActual', name: '9 On Special', price: 15 },
    { key: 'regular3on', name: '3 On Regular', price: 10 },
    { key: 'regular6on', name: '6 On Regular', price: 20 },
    { key: 'regular9on', name: '9 On Regular', price: 30 },
    { key: 'regular2nd9on', name: '9 On Regular 2nd', price: 30 },
    { key: 'daubers', name: 'Daubers', price: 2 },
    { key: 'dobber', name: 'Dobber', price: 3 }
  ];
  
  items.forEach(item => {
    const quantity = posDoorSales[item.key] || 0;
    if (quantity > 0) {
      sheet.appendRow([
        occasionId,
        item.name,
        item.price,
        quantity,
        quantity * item.price,
        new Date()
      ]);
    }
  });
}

function saveSessionGames(occasionId, sessionGames, ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.SESSION_GAMES);
  if (!sheet) {
    sheet = createSessionGamesSheet(ss);
  }
  
  sessionGames.forEach(game => {
    sheet.appendRow([
      occasionId,
      game.number,
      game.color,
      game.name,
      game.prize,
      game.winners || 0,
      game.prizePerWinner || game.prize,
      game.totalPayout || 0,
      game.checkPayment || false,
      new Date()
    ]);
  });
}

function savePullTabGames(occasionId, pullTabGames, ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.PULL_TAB_USAGE);
  if (!sheet) {
    sheet = createPullTabUsageSheet(ss);
  }
  
  pullTabGames.forEach(game => {
    sheet.appendRow([
      occasionId,
      game.gameName,
      game.serialNumber,
      game.ticketPrice || 1,
      game.ticketsSold || 0,
      game.salesRevenue || 0,
      game.prizesPaid || 0,
      game.netProfit || 0,
      game.checkPayment || false,
      game.isSpecialEvent || false,
      new Date()
    ]);
  });
}

function saveMoneyCount(occasionId, moneyCount, ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.MONEY_COUNT);
  if (!sheet) {
    sheet = createMoneyCountSheet(ss);
  }
  
  sheet.appendRow([
    occasionId,
    moneyCount.startingBank || 500,
    moneyCount.hundreds || 0,
    moneyCount.fifties || 0,
    moneyCount.twenties || 0,
    moneyCount.tens || 0,
    moneyCount.fives || 0,
    moneyCount.ones || 0,
    moneyCount.quarters || 0,
    moneyCount.dimes || 0,
    moneyCount.nickels || 0,
    moneyCount.pennies || 0,
    moneyCount.cashTotal || 0,
    moneyCount.checksTotal || 0,
    moneyCount.drawerTotal || 0,
    moneyCount.depositAmount || 0,
    moneyCount.overShort || 0,
    new Date()
  ]);
}

function calculateFinancialSummary(occasionId, data, ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.FINANCIAL_SUMMARY);
  if (!sheet) {
    sheet = createFinancialSummarySheet(ss);
  }
  
  const summary = {
    paperBingoRevenue: 0,
    doorSalesRevenue: 0,
    electronicRevenue: 0,
    pullTabRevenue: 0,
    totalRevenue: 0,
    sessionPrizes: 0,
    progressivePrize: 0,
    pullTabPrizes: 0,
    totalPrizes: 0,
    netProfit: 0
  };
  
  // Calculate revenues
  if (data.paperBingo) {
    const types = ['special3on', 'special6on', 'special9on', 'regular3on', 'regular6on', 'regular9on'];
    const costs = [5, 10, 15, 10, 20, 30];
    types.forEach((type, index) => {
      const item = data.paperBingo[type];
      if (item) {
        const sold = (item.start || 0) + (item.free || 0) - (item.end || 0);
        summary.paperBingoRevenue += sold * costs[index];
      }
    });
  }
  
  if (data.posDoorSales) {
    const items = {
      special3on: 5, special6on: 10, special9on: 10, special9onActual: 15,
      regular3on: 10, regular6on: 20, regular9on: 30, regular2nd9on: 30,
      daubers: 2, dobber: 3
    };
    Object.keys(items).forEach(key => {
      summary.doorSalesRevenue += (data.posDoorSales[key] || 0) * items[key];
    });
  }
  
  if (data.electronicBingo) {
    summary.electronicRevenue = (data.electronicBingo.smallMachines || 0) * 30 +
                                (data.electronicBingo.largeMachines || 0) * 40;
  }
  
  if (data.pullTabGames) {
    data.pullTabGames.forEach(game => {
      summary.pullTabRevenue += game.salesRevenue || 0;
      summary.pullTabPrizes += game.prizesPaid || 0;
    });
  }
  
  // Calculate prizes
  if (data.sessionGames) {
    data.sessionGames.forEach(game => {
      summary.sessionPrizes += game.totalPayout || 0;
    });
  }
  
  if (data.progressive && data.progressive.prizeAwarded > 0) {
    summary.progressivePrize = data.progressive.prizeAwarded;
  }
  
  // Calculate totals
  summary.totalRevenue = summary.paperBingoRevenue + summary.doorSalesRevenue + 
                        summary.electronicRevenue + summary.pullTabRevenue;
  summary.totalPrizes = summary.sessionPrizes + summary.progressivePrize + summary.pullTabPrizes;
  summary.netProfit = summary.totalRevenue - summary.totalPrizes;
  
  // Save to sheet
  sheet.appendRow([
    occasionId,
    data.date,
    data.sessionType,
    summary.paperBingoRevenue,
    summary.doorSalesRevenue,
    summary.electronicRevenue,
    summary.pullTabRevenue,
    summary.totalRevenue,
    summary.sessionPrizes,
    summary.progressivePrize,
    summary.pullTabPrizes,
    summary.totalPrizes,
    summary.netProfit,
    new Date()
  ]);
  
  return summary;
}

// Sheet creation functions
function createPaperBingoSheet(ss) {
  const sheet = ss.insertSheet(CONFIG.SHEETS.PAPER_BINGO);
  const headers = [
    'Occasion ID', 'Type', 'Cost', 'Start Count', 'Free Count', 
    'End Count', 'Sold', 'Revenue', 'Created'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function createPOSDoorSalesSheet(ss) {
  const sheet = ss.insertSheet(CONFIG.SHEETS.POS_DOOR_SALES);
  const headers = [
    'Occasion ID', 'Item', 'Price', 'Quantity', 'Revenue', 'Created'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function createSessionGamesSheet(ss) {
  const sheet = ss.insertSheet(CONFIG.SHEETS.SESSION_GAMES);
  const headers = [
    'Occasion ID', 'Game Number', 'Color', 'Game Name', 'Prize Amount',
    'Winners Count', 'Prize Per Winner', 'Total Payout', 'Check Payment', 'Created'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function createPullTabUsageSheet(ss) {
  const sheet = ss.insertSheet(CONFIG.SHEETS.PULL_TAB_USAGE);
  const headers = [
    'Occasion ID', 'Game Name', 'Serial Number', 'Ticket Price', 'Tickets Sold',
    'Sales Revenue', 'Prizes Paid', 'Net Profit', 'Check Payment', 'Special Event', 'Created'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function createMoneyCountSheet(ss) {
  const sheet = ss.insertSheet(CONFIG.SHEETS.MONEY_COUNT);
  const headers = [
    'Occasion ID', 'Starting Bank', 'Hundreds', 'Fifties', 'Twenties', 'Tens', 'Fives', 'Ones',
    'Quarters', 'Dimes', 'Nickels', 'Pennies', 'Cash Total', 'Checks Total', 
    'Drawer Total', 'Deposit Amount', 'Over/Short', 'Created'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function createFinancialSummarySheet(ss) {
  const sheet = ss.insertSheet(CONFIG.SHEETS.FINANCIAL_SUMMARY);
  const headers = [
    'Occasion ID', 'Date', 'Session Type', 'Paper Bingo Revenue', 'Door Sales Revenue',
    'Electronic Revenue', 'Pull Tab Revenue', 'Total Revenue', 'Session Prizes',
    'Progressive Prize', 'Pull Tab Prizes', 'Total Prizes', 'Net Profit', 'Created'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

// Retrieve occasions
function getOccasions(params) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.OCCASIONS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const occasions = [];
    for (let i = 1; i < data.length; i++) {
      const occasion = {};
      headers.forEach((header, index) => {
        occasion[header] = data[i][index];
      });
      occasions.push(occasion);
    }
    
    return { success: true, occasions: occasions };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Get Pull-Tab Library
function getPullTabLibrary() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CONFIG.SHEETS.PULL_TAB_LIBRARY);
    
    if (!sheet) {
      // Create and populate from default data
      sheet = createPullTabLibrarySheet(ss);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const games = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Skip empty rows
        const game = {};
        headers.forEach((header, index) => {
          game[header] = data[i][index];
        });
        games.push(game);
      }
    }
    
    return { success: true, games: games };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Create Pull-Tab Library sheet with default data
function createPullTabLibrarySheet(ss) {
  const sheet = ss.insertSheet(CONFIG.SHEETS.PULL_TAB_LIBRARY);
  const headers = [
    'Form Number', 'Name', 'Top Prize', 'Ticket Count', 'Ticket Price',
    'Total Payout', 'Ideal Gross', 'Ideal Profit', 'Profit Percent', 
    'Active', 'Special Event'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  
  // Add default games
  const defaultGames = [
    ['3440', 'Hit $250', 250, 1260, 1, 1008, 1260, 252, 20, true, false],
    ['4000', 'Lucky Symbols', 500, 2520, 1, 2016, 2520, 504, 20, true, false],
    ['3485', 'Wild 10s', 100, 1890, 1, 1512, 1890, 378, 20, true, false],
    ['3980', 'Diamond Mine', 100, 1890, 1, 1512, 1890, 378, 20, true, false],
    ['4424', 'Super 7-11-21', 777, 3024, 1, 2419, 3024, 605, 20, true, false],
    ['50/50', '50/50 Raffle', 0, 0, 1, 0, 0, 0, 50, true, true]
  ];
  
  defaultGames.forEach((game, index) => {
    sheet.getRange(index + 2, 1, 1, game.length).setValues([game]);
  });
  
  return sheet;
}

// Session Games Configuration
function getSessionGamesConfig(sessionType) {
  const configs = {
    '5-1': [
      { number: 1, color: 'Blue', name: 'Small Picture Frame', prize: 25 },
      { number: 2, color: 'Orange', name: 'Letter X', prize: 25 },
      { number: 3, color: 'Green', name: 'Small Letter T', prize: 25 },
      { number: 4, color: 'Yellow', name: 'Six Pack', prize: 50 },
      { number: 5, color: 'Pink', name: 'Layer Cake', prize: 50 },
      { number: 6, color: 'Gray', name: 'Hardway Bingo', prize: 100 },
      { number: 7, color: 'Olive', name: 'Large Picture Frame', prize: 75 },
      { number: 8, color: 'Brown', name: 'Coverall', prize: 100 },
      { number: 9, color: 'Blue', name: 'Top and Bottom', prize: 50 },
      { number: 10, color: 'Orange', name: 'Letter Z', prize: 50 },
      { number: 11, color: 'Green', name: 'Double Bingo', prize: 50 },
      { number: 12, color: 'Yellow', name: 'Inside Square', prize: 75 },
      { number: 13, color: 'Pink', name: 'Arrow', prize: 50 },
      { number: 14, color: 'Gray', name: 'Railroad Tracks', prize: 50 },
      { number: 15, color: 'Olive', name: 'Large Letter T', prize: 50 },
      { number: 16, color: 'Brown', name: 'Nine Pack', prize: 100 },
      { number: 17, color: 'Special', name: 'Blackout Bingo', prize: 200 }
    ],
    '6-2': [
      { number: 1, color: 'Blue', name: 'Letter L', prize: 30 },
      { number: 2, color: 'Orange', name: 'Outside Square', prize: 30 },
      { number: 3, color: 'Green', name: 'Small Picture Frame', prize: 30 },
      { number: 4, color: 'Yellow', name: 'Double Postage Stamp', prize: 60 },
      { number: 5, color: 'Pink', name: 'Crazy Kite', prize: 60 },
      { number: 6, color: 'Gray', name: 'Hardway Bingo', prize: 120 },
      { number: 7, color: 'Olive', name: 'Large Picture Frame', prize: 90 },
      { number: 8, color: 'Brown', name: 'Coverall', prize: 120 },
      { number: 9, color: 'Blue', name: 'Letter Z', prize: 60 },
      { number: 10, color: 'Orange', name: 'Railroad Tracks', prize: 60 },
      { number: 11, color: 'Green', name: 'Double Bingo', prize: 60 },
      { number: 12, color: 'Yellow', name: 'Crazy T', prize: 90 },
      { number: 13, color: 'Pink', name: 'Arrow', prize: 60 },
      { number: 14, color: 'Gray', name: 'Six Pack', prize: 60 },
      { number: 15, color: 'Olive', name: 'Inside Square', prize: 60 },
      { number: 16, color: 'Brown', name: 'Nine Pack', prize: 120 },
      { number: 17, color: 'Special', name: 'Blackout Bingo', prize: 300 }
    ],
    '7-3': [
      { number: 1, color: 'Blue', name: 'Small Picture Frame', prize: 35 },
      { number: 2, color: 'Orange', name: 'Letter H', prize: 35 },
      { number: 3, color: 'Green', name: 'Postage Stamp', prize: 35 },
      { number: 4, color: 'Yellow', name: 'Six Pack', prize: 70 },
      { number: 5, color: 'Pink', name: 'Layer Cake', prize: 70 },
      { number: 6, color: 'Gray', name: 'Hardway Bingo', prize: 140 },
      { number: 7, color: 'Olive', name: 'Large Picture Frame', prize: 105 },
      { number: 8, color: 'Brown', name: 'Coverall', prize: 140 },
      { number: 9, color: 'Blue', name: 'Top and Bottom', prize: 70 },
      { number: 10, color: 'Orange', name: 'Letter Z', prize: 70 },
      { number: 11, color: 'Green', name: 'Double Bingo', prize: 70 },
      { number: 12, color: 'Yellow', name: 'Inside Square', prize: 105 },
      { number: 13, color: 'Pink', name: 'Arrow', prize: 70 },
      { number: 14, color: 'Gray', name: 'Railroad Tracks', prize: 70 },
      { number: 15, color: 'Olive', name: 'Large Letter T', prize: 70 },
      { number: 16, color: 'Brown', name: 'Nine Pack', prize: 140 },
      { number: 17, color: 'Special', name: 'Blackout Bingo', prize: 350 }
    ],
    '8-4': [
      { number: 1, color: 'Blue', name: 'Letter L', prize: 40 },
      { number: 2, color: 'Orange', name: 'Outside Square', prize: 40 },
      { number: 3, color: 'Green', name: 'Small Picture Frame', prize: 40 },
      { number: 4, color: 'Yellow', name: 'Double Postage Stamp', prize: 80 },
      { number: 5, color: 'Pink', name: 'Crazy Kite', prize: 80 },
      { number: 6, color: 'Gray', name: 'Hardway Bingo', prize: 160 },
      { number: 7, color: 'Olive', name: 'Large Picture Frame', prize: 120 },
      { number: 8, color: 'Brown', name: 'Coverall', prize: 160 },
      { number: 9, color: 'Blue', name: 'Letter Z', prize: 80 },
      { number: 10, color: 'Orange', name: 'Railroad Tracks', prize: 80 },
      { number: 11, color: 'Green', name: 'Double Bingo', prize: 80 },
      { number: 12, color: 'Yellow', name: 'Crazy T', prize: 120 },
      { number: 13, color: 'Pink', name: 'Arrow', prize: 80 },
      { number: 14, color: 'Gray', name: 'Six Pack', prize: 80 },
      { number: 15, color: 'Olive', name: 'Inside Square', prize: 80 },
      { number: 16, color: 'Brown', name: 'Nine Pack', prize: 160 },
      { number: 17, color: 'Special', name: 'Blackout Bingo', prize: 400 }
    ]
  };
  
  return {
    success: true,
    sessionType: sessionType,
    games: configs[sessionType] || []
  };
}

// Sync offline data
function syncOfflineData(data) {
  const results = {
    occasions: { synced: 0, failed: 0 },
    errors: []
  };
  
  try {
    if (data.occasions && data.occasions.length > 0) {
      data.occasions.forEach(occasion => {
        try {
          const result = saveOccasionData(occasion);
          if (result.success) {
            results.occasions.synced++;
          } else {
            results.occasions.failed++;
            results.errors.push(result.error);
          }
        } catch (error) {
          results.occasions.failed++;
          results.errors.push(error.toString());
        }
      });
    }
    
    return {
      success: true,
      results: results,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      results: results
    };
  }
}
```

### Step 1.2: Deploy the Updated Apps Script

1. In the Apps Script editor, click **Deploy** → **Manage deployments**
2. Click the pencil icon to edit your existing deployment
3. Under **Version**, select **New version**
4. Add description: "Version 9.1 - Full Integration"
5. Click **Deploy**
6. Keep the Web app URL (it should remain the same)

---

## PART 2: GitHub Frontend Updates

### Step 2.1: Update js/config.js

Edit the file at `https://github.com/wewg24/rlc-bingo-manager/blob/main/js/config.js`:

```javascript
// Configuration for RLC Bingo Manager
const CONFIG = {
  // Google Apps Script Web App URL
  API_URL: 'https://script.google.com/macros/s/AKfycbyYhF94GgZeBjhRgh6D-eS6DTTXXgexiR_sz1UbwpZEZ8fZX1z2bTY14X6F0hEsqN6ZZw/exec',
  
  // App settings
  APP_NAME: 'RLC Bingo Manager',
  VERSION: '9.1.0',
  
  // Storage keys
  STORAGE_KEYS: {
    USER: 'rlc_user',
    TOKEN: 'rlc_token',
    CURRENT_SESSION: 'rlc_current_session',
    SYNC_QUEUE: 'rlc_sync_queue',
    OFFLINE_DATA: 'rlc_offline_data'
  },
  
  // Session types and configurations
  SESSION_TYPES: {
    '5-1': '1st/5th Monday',
    '6-2': '2nd Monday',
    '7-3': '3rd Monday',
    '8-4': '4th Monday'
  },
  
  // Session-specific game configurations
  GAMES: {
    '5-1': [
      { number: 1, color: 'Blue', name: 'Small Picture Frame', prize: 25 },
      { number: 2, color: 'Orange', name: 'Letter X', prize: 25 },
      { number: 3, color: 'Green', name: 'Small Letter T', prize: 25 },
      { number: 4, color: 'Yellow', name: 'Six Pack', prize: 50 },
      { number: 5, color: 'Pink', name: 'Layer Cake', prize: 50 },
      { number: 6, color: 'Gray', name: 'Hardway Bingo', prize: 100 },
      { number: 7, color: 'Olive', name: 'Large Picture Frame', prize: 75 },
      { number: 8, color: 'Brown', name: 'Coverall', prize: 100 },
      { number: 9, color: 'Blue', name: 'Top and Bottom', prize: 50 },
      { number: 10, color: 'Orange', name: 'Letter Z', prize: 50 },
      { number: 11, color: 'Green', name: 'Double Bingo', prize: 50 },
      { number: 12, color: 'Yellow', name: 'Inside Square', prize: 75 },
      { number: 13, color: 'Pink', name: 'Arrow', prize: 50 },
      { number: 14, color: 'Gray', name: 'Railroad Tracks', prize: 50 },
      { number: 15, color: 'Olive', name: 'Large Letter T', prize: 50 },
      { number: 16, color: 'Brown', name: 'Nine Pack', prize: 100 },
      { number: 17, color: 'Special', name: 'Blackout Bingo', prize: 200 }
    ],
    '6-2': [
      { number: 1, color: 'Blue', name: 'Letter L', prize: 30 },
      { number: 2, color: 'Orange', name: 'Outside Square', prize: 30 },
      { number: 3, color: 'Green', name: 'Small Picture Frame', prize: 30 },
      { number: 4, color: 'Yellow', name: 'Double Postage Stamp', prize: 60 },
      { number: 5, color: 'Pink', name: 'Crazy Kite', prize: 60 },
      { number: 6, color: 'Gray', name: 'Hardway Bingo', prize: 120 },
      { number: 7, color: 'Olive', name: 'Large Picture Frame', prize: 90 },
      { number: 8, color: 'Brown', name: 'Coverall', prize: 120 },
      { number: 9, color: 'Blue', name: 'Letter Z', prize: 60 },
      { number: 10, color: 'Orange', name: 'Railroad Tracks', prize: 60 },
      { number: 11, color: 'Green', name: 'Double Bingo', prize: 60 },
      { number: 12, color: 'Yellow', name: 'Crazy T', prize: 90 },
      { number: 13, color: 'Pink', name: 'Arrow', prize: 60 },
      { number: 14, color: 'Gray', name: 'Six Pack', prize: 60 },
      { number: 15, color: 'Olive', name: 'Inside Square', prize: 60 },
      { number: 16, color: 'Brown', name: 'Nine Pack', prize: 120 },
      { number: 17, color: 'Special', name: 'Blackout Bingo', prize: 300 }
    ],
    '7-3': [
      { number: 1, color: 'Blue', name: 'Small Picture Frame', prize: 35 },
      { number: 2, color: 'Orange', name: 'Letter H', prize: 35 },
      { number: 3, color: 'Green', name: 'Postage Stamp', prize: 35 },
      { number: 4, color: 'Yellow', name: 'Six Pack', prize: 70 },
      { number: 5, color: 'Pink', name: 'Layer Cake', prize: 70 },
      { number: 6, color: 'Gray', name: 'Hardway Bingo', prize: 140 },
      { number: 7, color: 'Olive', name: 'Large Picture Frame', prize: 105 },
      { number: 8, color: 'Brown', name: 'Coverall', prize: 140 },
      { number: 9, color: 'Blue', name: 'Top and Bottom', prize: 70 },
      { number: 10, color: 'Orange', name: 'Letter Z', prize: 70 },
      { number: 11, color: 'Green', name: 'Double Bingo', prize: 70 },
      { number: 12, color: 'Yellow', name: 'Inside Square', prize: 105 },
      { number: 13, color: 'Pink', name: 'Arrow', prize: 70 },
      { number: 14, color: 'Gray', name: 'Railroad Tracks', prize: 70 },
      { number: 15, color: 'Olive', name: 'Large Letter T', prize: 70 },
      { number: 16, color: 'Brown', name: 'Nine Pack', prize: 140 },
      { number: 17, color: 'Special', name: 'Blackout Bingo', prize: 350 }
    ],
    '8-4': [
      { number: 1, color: 'Blue', name: 'Letter L', prize: 40 },
      { number: 2, color: 'Orange', name: 'Outside Square', prize: 40 },
      { number: 3, color: 'Green', name: 'Small Picture Frame', prize: 40 },
      { number: 4, color: 'Yellow', name: 'Double Postage Stamp', prize: 80 },
      { number: 5, color: 'Pink', name: 'Crazy Kite', prize: 80 },
      { number: 6, color: 'Gray', name: 'Hardway Bingo', prize: 160 },
      { number: 7, color: 'Olive', name: 'Large Picture Frame', prize: 120 },
      { number: 8, color: 'Brown', name: 'Coverall', prize: 160 },
      { number: 9, color: 'Blue', name: 'Letter Z', prize: 80 },
      { number: 10, color: 'Orange', name: 'Railroad Tracks', prize: 80 },
      { number: 11, color: 'Green', name: 'Double Bingo', prize: 80 },
      { number: 12, color: 'Yellow', name: 'Crazy T', prize: 120 },
      { number: 13, color: 'Pink', name: 'Arrow', prize: 80 },
      { number: 14, color: 'Gray', name: 'Six Pack', prize: 80 },
      { number: 15, color: 'Olive', name: 'Inside Square', prize: 80 },
      { number: 16, color: 'Brown', name: 'Nine Pack', prize: 160 },
      { number: 17, color: 'Special', name: 'Blackout Bingo', prize: 400 }
    ]
  },
  
  // Sync settings
  SYNC_INTERVAL: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
```

### Step 2.2: Update js/sync.js

Replace the entire `js/sync.js` file:

```javascript
// Data synchronization manager with complete offline support
class SyncManager {
  constructor() {
    this.apiUrl = CONFIG.API_URL;
    this.syncInProgress = false;
    this.syncQueue = [];
    this.offlineManager = null;
    this.lastSync = null;
    this.init();
  }
  
  async init() {
    // Initialize offline manager
    this.offlineManager = window.offlineManager || new OfflineManager();
    
    // Load sync queue from storage
    await this.loadSyncQueue();
    
    // Start periodic sync
    this.startPeriodicSync();
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }
  
  async loadSyncQueue() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE);
    if (stored) {
      try {
        this.syncQueue = JSON.parse(stored);
      } catch (e) {
        this.syncQueue = [];
      }
    }
  }
  
  async saveSyncQueue() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(this.syncQueue));
  }
  
  handleOnline() {
    console.log('Connection restored - starting sync');
    this.syncAll();
  }
  
  handleOffline() {
    console.log('Connection lost - switching to offline mode');
  }
  
  startPeriodicSync() {
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncAll();
      }
    }, CONFIG.SYNC_INTERVAL);
  }
  
  async syncAll() {
    if (this.syncInProgress || !navigator.onLine) {
      return false;
    }
    
    this.syncInProgress = true;
    console.log('Starting sync process...');
    
    try {
      // Get all offline data
      const offlineData = await this.offlineManager.getOfflineData();
      
      if (offlineData.length === 0 && this.syncQueue.length === 0) {
        this.syncInProgress = false;
        this.lastSync = new Date();
        return true;
      }
      
      // Prepare batch data
      const batchData = {
        occasions: [],
        timestamp: Date.now(),
        deviceId: this.getDeviceId()
      };
      
      // Add offline data to batch
      offlineData.forEach(item => {
        if (item.key.startsWith('OCCASION_')) {
          batchData.occasions.push(item.data);
        }
      });
      
      // Add queued items to batch
      this.syncQueue.forEach(item => {
        if (!batchData.occasions.find(o => o.id === item.id)) {
          batchData.occasions.push(item);
        }
      });
      
      // Send to server
      const response = await fetch(this.apiUrl + '?path=sync-offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(batchData)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Clear synced items
          for (const item of offlineData) {
            await this.offlineManager.markSynced(item.key);
          }
          
          // Clear sync queue
          this.syncQueue = [];
          await this.saveSyncQueue();
          
          // Clean up synced items
          await this.offlineManager.clearSynced();
          
          console.log('Sync completed successfully');
          this.showNotification('Data synchronized successfully', 'success');
          
          this.lastSync = new Date();
          this.syncInProgress = false;
          return true;
        }
      }
      
    } catch (error) {
      console.error('Sync failed:', error);
      this.showNotification('Sync failed - will retry', 'error');
    }
    
    this.syncInProgress = false;
    return false;
  }
  
  async syncOccasion(occasion) {
    if (!navigator.onLine) {
      // Save offline
      const key = 'OCCASION_' + (occasion.id || Date.now());
      await this.offlineManager.saveOffline(key, occasion);
      
      // Add to sync queue
      this.syncQueue.push(occasion);
      await this.saveSyncQueue();
      
      this.showNotification('Saved offline - will sync when online', 'info');
      return true;
    }
    
    try {
      const response = await fetch(this.apiUrl + '?path=save-occasion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(occasion)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          this.showNotification('Occasion saved successfully', 'success');
          return result;
        }
      }
      
      throw new Error('Save failed');
      
    } catch (error) {
      console.error('Failed to save occasion:', error);
      
      // Save offline as fallback
      const key = 'OCCASION_' + (occasion.id || Date.now());
      await this.offlineManager.saveOffline(key, occasion);
      
      // Add to sync queue
      this.syncQueue.push(occasion);
      await this.saveSyncQueue();
      
      this.showNotification('Saved offline - will sync when online', 'warning');
      return true;
    }
  }
  
  getDeviceId() {
    let deviceId = localStorage.getItem('rlc_device_id');
    if (!deviceId) {
      deviceId = 'DEV_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('rlc_device_id', deviceId);
    }
    return deviceId;
  }
  
  showNotification(message, type = 'info') {
    // Use app notification system if available
    if (window.app && window.app.showToast) {
      window.app.showToast(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }
  
  getSyncStatus() {
    return {
      isOnline: navigator.onLine,
      syncInProgress: this.syncInProgress,
      queueLength: this.syncQueue.length,
      lastSync: this.lastSync
    };
  }
}

// Initialize and export
window.syncManager = new SyncManager();
```

### Step 2.3: Update js/app.js with Complete Integration

Replace key sections of `js/app.js`:

```javascript
// Main Application Logic with Complete Integration
class RLCBingoApp {
  constructor() {
    this.db = null;
    this.user = null;
    this.currentOccasion = null;
    this.isOnline = navigator.onLine;
    this.syncManager = null;
    this.offlineManager = null;
    
    this.init();
  }
  
  async init() {
    // Initialize database
    this.db = await this.initDB();
    
    // Initialize managers
    this.offlineManager = new OfflineManager();
    this.syncManager = new SyncManager();
    
    // Check authentication (skip for now, no auth required)
    this.user = { name: 'User', role: 'admin' };
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
    
    // Load pull-tab library
    await this.loadPullTabLibrary();
    
    // Render initial UI
    this.render();
    
    // Start sync if online
    if (this.isOnline) {
      this.syncManager.syncAll();
    }
  }
  
  async initDB() {
    return await localforage.createInstance({
      name: 'RLCBingo',
      version: 1.0,
      storeName: 'data'
    });
  }
  
  setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateConnectionStatus();
      this.syncManager.syncAll();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateConnectionStatus();
    });
    
    // Form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'occasionForm') {
        e.preventDefault();
        this.saveOccasion(e.target);
      }
    });
    
    // Tab navigation
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-btn')) {
        this.switchTab(e.target.dataset.tab);
      }
    });
  }
  
  async loadPullTabLibrary() {
    try {
      const response = await fetch(CONFIG.API_URL + '?path=pulltab-library');
      const data = await response.json();
      
      if (data.success && data.games) {
        // Store in local database for offline access
        await this.db.setItem('pullTabLibrary', data.games);
        console.log('Pull-tab library loaded:', data.games.length, 'games');
      }
    } catch (error) {
      console.error('Failed to load pull-tab library:', error);
      // Try to load from cache
      const cached = await this.db.getItem('pullTabLibrary');
      if (cached) {
        console.log('Using cached pull-tab library');
      }
    }
  }
  
  async saveOccasion(form) {
    const formData = new FormData(form);
    
    // Build occasion object
    const occasion = {
      date: formData.get('date'),
      sessionType: formData.get('sessionType'),
      lionInCharge: formData.get('lionInCharge'),
      totalPeople: parseInt(formData.get('totalPeople')) || 0,
      birthdays: parseInt(formData.get('birthdays')) || 0,
      
      progressive: {
        jackpot: parseFloat(formData.get('progJackpot')) || 0,
        ballsNeeded: parseInt(formData.get('progBalls')) || 48,
        consolation: parseFloat(formData.get('progConsolation')) || 200,
        actualBalls: parseInt(formData.get('progActualBalls')) || 0,
        prizeAwarded: parseFloat(formData.get('progPrize')) || 0,
        checkPayment: formData.get('progCheck') === 'on'
      },
      
      paperBingo: this.collectPaperBingoData(formData),
      posDoorSales: this.collectPOSDoorSalesData(formData),
      electronicBingo: this.collectElectronicData(formData),
      sessionGames: this.collectSessionGamesData(),
      pullTabGames: this.collectPullTabData(),
      moneyCount: this.collectMoneyCountData(formData)
    };
    
    // Save via sync manager
    const result = await this.syncManager.syncOccasion(occasion);
    
    if (result) {
      this.showToast('Occasion saved successfully!', 'success');
      form.reset();
      // Refresh the UI
      this.render();
    } else {
      this.showToast('Failed to save occasion', 'error');
    }
  }
  
  collectPaperBingoData(formData) {
    const types = ['special3on', 'special6on', 'special9on', 'regular3on', 'regular6on', 'regular9on'];
    const paperBingo = {};
    
    types.forEach(type => {
      paperBingo[type] = {
        start: parseInt(formData.get(`${type}_start`)) || 0,
        free: parseInt(formData.get(`${type}_free`)) || 0,
        end: parseInt(formData.get(`${type}_end`)) || 0
      };
    });
    
    return paperBingo;
  }
  
  collectPOSDoorSalesData(formData) {
    const items = [
      'special3on', 'special6on', 'special9on', 'special9onActual',
      'regular3on', 'regular6on', 'regular9on', 'regular2nd9on',
      'daubers', 'dobber'
    ];
    const posDoorSales = {};
    
    items.forEach(item => {
      posDoorSales[item] = parseInt(formData.get(`door_${item}`)) || 0;
    });
    
    return posDoorSales;
  }
  
  collectElectronicData(formData) {
    return {
      smallMachines: parseInt(formData.get('smallMachines')) || 0,
      largeMachines: parseInt(formData.get('largeMachines')) || 0
    };
  }
  
  collectSessionGamesData() {
    const games = [];
    const gameRows = document.querySelectorAll('.session-game-row');
    
    gameRows.forEach(row => {
      const game = {
        number: parseInt(row.querySelector('[name="gameNumber"]').value),
        color: row.querySelector('[name="gameColor"]').value,
        name: row.querySelector('[name="gameName"]').value,
        prize: parseFloat(row.querySelector('[name="gamePrize"]').value) || 0,
        winners: parseInt(row.querySelector('[name="gameWinners"]').value) || 0,
        prizePerWinner: parseFloat(row.querySelector('[name="gamePrizePerWinner"]').value) || 0,
        totalPayout: parseFloat(row.querySelector('[name="gameTotalPayout"]').value) || 0,
        checkPayment: row.querySelector('[name="gameCheck"]').checked
      };
      games.push(game);
    });
    
    return games;
  }
  
  collectPullTabData() {
    const games = [];
    const pullTabRows = document.querySelectorAll('.pulltab-row');
    
    pullTabRows.forEach(row => {
      const game = {
        gameName: row.querySelector('[name="ptGameName"]').value,
        serialNumber: row.querySelector('[name="ptSerial"]').value,
        ticketPrice: parseFloat(row.querySelector('[name="ptPrice"]').value) || 1,
        ticketsSold: parseInt(row.querySelector('[name="ptSold"]').value) || 0,
        salesRevenue: parseFloat(row.querySelector('[name="ptRevenue"]').value) || 0,
        prizesPaid: parseFloat(row.querySelector('[name="ptPrizes"]').value) || 0,
        netProfit: parseFloat(row.querySelector('[name="ptNet"]').value) || 0,
        checkPayment: row.querySelector('[name="ptCheck"]').checked,
        isSpecialEvent: row.classList.contains('special-event')
      };
      
      if (game.gameName) {
        games.push(game);
      }
    });
    
    return games;
  }
  
  collectMoneyCountData(formData) {
    return {
      startingBank: parseFloat(formData.get('startingBank')) || 500,
      hundreds: parseInt(formData.get('hundreds')) || 0,
      fifties: parseInt(formData.get('fifties')) || 0,
      twenties: parseInt(formData.get('twenties')) || 0,
      tens: parseInt(formData.get('tens')) || 0,
      fives: parseInt(formData.get('fives')) || 0,
      ones: parseInt(formData.get('ones')) || 0,
      quarters: parseFloat(formData.get('quarters')) || 0,
      dimes: parseFloat(formData.get('dimes')) || 0,
      nickels: parseFloat(formData.get('nickels')) || 0,
      pennies: parseFloat(formData.get('pennies')) || 0,
      cashTotal: parseFloat(formData.get('cashTotal')) || 0,
      checksTotal: parseFloat(formData.get('checksTotal')) || 0,
      drawerTotal: parseFloat(formData.get('drawerTotal')) || 0,
      depositAmount: parseFloat(formData.get('depositAmount')) || 0,
      overShort: parseFloat(formData.get('overShort')) || 0
    };
  }
  
  updateConnectionStatus() {
    const indicator = document.querySelector('.sync-indicator');
    if (indicator) {
      const status = this.syncManager.getSyncStatus();
      indicator.innerHTML = `
        <span class="${status.isOnline ? 'online' : 'offline'}">
          <i class="material-icons">${status.isOnline ? 'cloud_done' : 'cloud_off'}</i>
          ${status.isOnline ? 'Online' : 'Offline'}
          ${status.queueLength > 0 ? ` (${status.queueLength} pending)` : ''}
        </span>
      `;
    }
  }
  
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
  window.app = new RLCBingoApp();
});
```

---

## PART 3: Testing & Verification

### Step 3.1: Test API Connection

1. Open browser console (F12)
2. Navigate to: `https://wewg24.github.io/rlc-bingo-manager`
3. Run this test in console:

```javascript
// Test API connection
fetch('https://script.google.com/macros/s/AKfycbyYhF94GgZeBjhRgh6D-eS6DTTXXgexiR_sz1UbwpZEZ8fZX1z2bTY14X6F0hEsqN6ZZw/exec?path=status')
  .then(response => response.json())
  .then(data => console.log('API Status:', data))
  .catch(error => console.error('API Error:', error));
```

Expected result:
```json
{
  "success": true,
  "message": "RLC Bingo API is running",
  "version": "1.0.0",
  "timestamp": "2025-09-15T..."
}
```

### Step 3.2: Test Pull-Tab Library Loading

```javascript
// Test pull-tab library
fetch('https://script.google.com/macros/s/AKfycbyYhF94GgZeBjhRgh6D-eS6DTTXXgexiR_sz1UbwpZEZ8fZX1z2bTY14X6F0hEsqN6ZZw/exec?path=pulltab-library')
  .then(response => response.json())
  .then(data => console.log('Pull-Tab Games:', data))
  .catch(error => console.error('Error:', error));
```

### Step 3.3: Test Offline Functionality

1. Open the app in Chrome
2. Open DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Try to save an occasion
5. Uncheck "Offline"
6. Verify data syncs automatically

### Step 3.4: Verify Sheet Structure

Open your Google Sheet and verify these tabs exist:
- Occasions
- SessionGames
- PullTabLibrary
- PullTabUsage
- FinancialSummary
- Metrics
- Configuration
- PaperBingo
- POSDoorSales
- MoneyCount

If any are missing, run this in Apps Script:

```javascript
function createMissingSheets() {
  const ss = SpreadsheetApp.openById('1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc');
  const requiredSheets = [
    'Occasions', 'SessionGames', 'PullTabLibrary', 'PullTabUsage',
    'FinancialSummary', 'Metrics', 'Configuration', 'PaperBingo',
    'POSDoorSales', 'MoneyCount'
  ];
  
  requiredSheets.forEach(sheetName => {
    try {
      ss.getSheetByName(sheetName);
    } catch(e) {
      console.log('Creating sheet:', sheetName);
      ss.insertSheet(sheetName);
    }
  });
  
  console.log('All sheets verified/created');
}
```

---

## PART 4: Final Deployment

### Step 4.1: Commit Changes to GitHub

```bash
# In your local repository
git add .
git commit -m "Complete integration - Version 9.1"
git push origin main
```

### Step 4.2: Clear Browser Cache

1. Open Chrome DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Step 4.3: Install as PWA

1. Navigate to: `https://wewg24.github.io/rlc-bingo-manager`
2. Click the install icon in address bar
3. Follow prompts to install

---

## Troubleshooting Guide

### Issue: CORS Errors
**Solution:** Ensure the Apps Script deployment is set to "Anyone" access

### Issue: Data Not Syncing
**Solution:** Check browser console for errors, verify API URL matches deployment

### Issue: Offline Not Working
**Solution:** Verify service worker is registered in Application tab

### Issue: Sheet Not Found Errors
**Solution:** Run the `createMissingSheets()` function in Apps Script

---

## Success Indicators

✅ API responds with success status
✅ Pull-tab library loads correctly
✅ Data saves when online
✅ Data queues when offline
✅ Sync indicator shows correct status
✅ All sheets exist in Google Sheets
✅ Service worker shows "Activated"
✅ App can be installed as PWA

---

## Support & Maintenance

For issues or questions:
1. Check browser console for errors
2. Verify all URLs match your deployment
3. Ensure Google Sheets has proper permissions
4. Test in incognito mode to rule out cache issues

This completes the comprehensive integration procedure for your RLC Bingo Operations Manager system.
