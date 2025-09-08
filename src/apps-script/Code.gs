/**
 * RLC BINGO MANAGER - COMPLETE GOOGLE APPS SCRIPT BACKEND
 * Handles all bingo occasion reporting, pull-tab management, and Missouri Gaming Commission reporting
 * Version: 3.0 - PRODUCTION READY
 * 
 * This system provides complete tracking for:
 * - Bingo sessions with all games ($250 Letter X, $250 Number 7, $500 Coverall)
 * - Progressive jackpots with balls called tracking
 * - Pull-tab sales with cash turn-in reporting
 * - Offage tracking (separate and combined)
 * - Birthday BOGO promotional sales
 * - Missouri Gaming Commission Form 104 compliance
 */

// ==========================================
// SPREADSHEET CONFIGURATION
// ==========================================
const SPREADSHEET_ID = '1pmJO2WFi--TJs4kr1pFhKxBXEw4AiZdmrTIQ1_HBrVM';

// Sheet names - ensure these match your Google Sheet tabs
const SHEETS = {
  BINGO_SESSIONS: 'BingoSessions',
  DOOR_SALES: 'DoorSales', 
  PULL_TABS: 'PullTabs',
  PULL_TAB_LIBRARY: 'PullTabLibrary',
  BINGO_GAMES: 'BingoGames',
  CASH_RECONCILIATION: 'CashReconciliation',
  OFFAGE_TRACKING: 'OffageTracking',
  USERS: 'Users',
  REPORTS: 'Reports',
  AUDIT_LOG: 'AuditLog',
  MGC_REPORTS: 'MGCReports'
};

// ==========================================
// WEB APP ENTRY POINT
// ==========================================
function doGet(e) {
  const page = e.parameter.page || 'main';
  const user = Session.getActiveUser().getEmail();
  
  // Log access
  logAccess(user, page);
  
  try {
    let html;
    switch(page) {
      case 'occasion':
        html = HtmlService.createHtmlOutputFromFile('occasion');
        break;
      case 'pulltab':
        html = HtmlService.createHtmlOutputFromFile('pullTabManager');
        break;
      case 'doorsales':
        html = HtmlService.createHtmlOutputFromFile('doorSales');
        break;
      case 'cashclose':
        html = HtmlService.createHtmlOutputFromFile('cashClose');
        break;
      case 'reports':
        html = HtmlService.createHtmlOutputFromFile('reports');
        break;
      default:
        html = HtmlService.createHtmlOutputFromFile('index');
    }
    
    return html
      .setTitle('RLC Bingo Manager')
      .setFaviconUrl('https://www.rollalions.org/favicon.ico')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return HtmlService.createHtmlOutput('<h1>Error loading page</h1><p>' + error.toString() + '</p>');
  }
}

// ==========================================
// BINGO SESSION MANAGEMENT - COMPLETE
// ==========================================

/**
 * Create a complete bingo session with all required data including special games
 */
function createBingoSession(sessionData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_SESSIONS);
  
  // Generate session ID
  const sessionId = 'BS' + Date.now();
  
  // Complete session data structure matching MGC Form 104
  const fullSessionData = {
    // Basic Information
    sessionId: sessionId,
    organizationName: sessionData.organizationName || 'Rolla Lions Club',
    bingoLicenseNumber: sessionData.bingoLicenseNumber || 'B-0001',
    date: sessionData.date,
    dayOfWeek: sessionData.dayOfWeek || getDayOfWeek(sessionData.date),
    startTime: sessionData.startTime,
    endTime: sessionData.endTime,
    
    // Personnel
    closetWorker: sessionData.closetWorker,
    lionInChargePullTabs: sessionData.lionInChargePullTabs,
    preparer: sessionData.preparer,
    
    // Player Information
    totalPlayers: sessionData.totalPlayers || 0,
    birthdayBOGOs: sessionData.birthdayBOGOs || 0,
    numberOfBingoGames: sessionData.numberOfBingoGames || 27,
    
    // Progressive Game 1
    progressive1Jackpot: sessionData.progressive1Jackpot || 0,
    progressive1BallsToWin: sessionData.progressive1BallsToWin || 48,
    progressive1ConsolationOffered: sessionData.progressive1ConsolationOffered || 100,
    progressive1ActualPrize: sessionData.progressive1ActualPrize || 0,
    progressive1ActualBallsCalled: sessionData.progressive1ActualBallsCalled || 0,
    
    // Progressive Game 2
    progressive2Jackpot: sessionData.progressive2Jackpot || 0,
    progressive2BallsToWin: sessionData.progressive2BallsToWin || 52,
    progressive2ConsolationOffered: sessionData.progressive2ConsolationOffered || 100,
    progressive2ActualPrize: sessionData.progressive2ActualPrize || 0,
    progressive2ActualBallsCalled: sessionData.progressive2ActualBallsCalled || 0,
    
    // Special Games - $250 Letter X
    letterXPrizeOffered: 250,
    letterXActualPrize: sessionData.letterXActualPrize || 0,
    letterXBallsCalled: sessionData.letterXBallsCalled || 0,
    letterXWinner: sessionData.letterXWinner || '',
    
    // Special Games - $250 Number 7
    number7PrizeOffered: 250,
    number7ActualPrize: sessionData.number7ActualPrize || 0,
    number7BallsCalled: sessionData.number7BallsCalled || 0,
    number7Winner: sessionData.number7Winner || '',
    
    // Special Games - $500 Coverall
    coverallPrizeOffered: 500,
    coverallActualPrize: sessionData.coverallActualPrize || 0,
    coverallBallsCalled: sessionData.coverallBallsCalled || 0,
    coverallWinner: sessionData.coverallWinner || '',
    
    // Financial Summary (calculated later)
    totalBingoCardSales: 0,
    totalPullTabGross: 0,
    miscellaneousReceipts: 0,
    startingCash: sessionData.startingCash || 0,
    totalGrossReceipts: 0,
    totalBingoPrizesAwarded: 0,
    totalPullTabPrizesAwarded: 0,
    totalPrizesAwarded: 0,
    netReceipts: 0,
    actualAmountDeposited: 0,
    
    // Offage Tracking
    bingoOffage: 0,
    pullTabOffage: 0,
    combinedOffage: 0,
    offageExplanation: '',
    
    // Metadata
    createdAt: new Date(),
    createdBy: Session.getActiveUser().getEmail(),
    modifiedAt: new Date(),
    modifiedBy: Session.getActiveUser().getEmail(),
    status: 'OPEN',
    notes: sessionData.notes || ''
  };
  
  // Append to sheet
  const headers = Object.keys(fullSessionData);
  const values = headers.map(key => fullSessionData[key]);
  
  // Check if headers exist, if not create them
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  
  sheet.appendRow(values);
  
  // Log the action
  logAction('CREATE', 'BingoSession', sessionId, fullSessionData);
  
  return {
    success: true,
    sessionId: sessionId,
    data: fullSessionData
  };
}

// ==========================================
// DOOR SALES MANAGEMENT - COMPLETE
// ==========================================

/**
 * Record door sales with all paper and electronic items including Birthday BOGOs
 */
function recordDoorSales(salesData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.DOOR_SALES);
  
  // Generate sale ID
  const saleId = 'DS' + Date.now();
  
  // Complete door sales structure matching MGC Form 104 Bingo Card Sales section
  const fullSalesData = {
    saleId: saleId,
    sessionId: salesData.sessionId || getCurrentSessionId(),
    date: salesData.date || new Date(),
    worker: salesData.worker,
    
    // Bingo Card Sales (Lines A-L from Form 104)
    // A. 9on20 1st pack
    nineOn20FirstBeginning: salesData.nineOn20FirstBeginning || 150,
    nineOn20FirstEnding: salesData.nineOn20FirstEnding || 0,
    nineOn20FirstSold: 0, // calculated
    nineOn20FirstPrice: 15.00,
    nineOn20FirstTotal: 0, // calculated
    
    // B. 9on20 additional
    nineOn20AddBeginning: salesData.nineOn20AddBeginning || 150,
    nineOn20AddEnding: salesData.nineOn20AddEnding || 0,
    nineOn20AddSold: 0, // calculated
    nineOn20AddPrice: 10.00,
    nineOn20AddTotal: 0, // calculated
    
    // C. 6on6 early birds
    sixOn6EarlyBeginning: salesData.sixOn6EarlyBeginning || 85,
    sixOn6EarlyEnding: salesData.sixOn6EarlyEnding || 0,
    sixOn6EarlySold: 0, // calculated
    sixOn6EarlyPrice: 5.00,
    sixOn6EarlyTotal: 0, // calculated
    
    // D. 3on yellow special
    threeOnYellowBeginning: salesData.threeOnYellowBeginning || 75,
    threeOnYellowEnding: salesData.threeOnYellowEnding || 0,
    threeOnYellowSold: 0, // calculated
    threeOnYellowPrice: 1.00,
    threeOnYellowTotal: 0, // calculated
    
    // E. 3on orange special
    threeOnOrangeBeginning: salesData.threeOnOrangeBeginning || 75,
    threeOnOrangeEnding: salesData.threeOnOrangeEnding || 0,
    threeOnOrangeSold: 0, // calculated
    threeOnOrangePrice: 1.00,
    threeOnOrangeTotal: 0, // calculated
    
    // F. 3on blue special
    threeOnBlueBeginning: salesData.threeOnBlueBeginning || 75,
    threeOnBlueEnding: salesData.threeOnBlueEnding || 0,
    threeOnBlueSold: 0, // calculated
    threeOnBluePrice: 1.00,
    threeOnBlueTotal: 0, // calculated
    
    // G. 9on progressive
    nineOnProgressiveBeginning: salesData.nineOnProgressiveBeginning || 175,
    nineOnProgressiveEnding: salesData.nineOnProgressiveEnding || 0,
    nineOnProgressiveSold: 0, // calculated
    nineOnProgressivePrice: 5.00,
    nineOnProgressiveTotal: 0, // calculated
    
    // H. 3on progressive
    threeOnProgressiveBeginning: salesData.threeOnProgressiveBeginning || 50,
    threeOnProgressiveEnding: salesData.threeOnProgressiveEnding || 0,
    threeOnProgressiveSold: 0, // calculated
    threeOnProgressivePrice: 2.00,
    threeOnProgressiveTotal: 0, // calculated
    
    // Special Games Extra Sheets
    letterXExtraSheets: salesData.letterXExtraSheets || 0,
    letterXExtraPrice: 1.00,
    letterXExtraTotal: 0, // calculated
    
    number7ExtraSheets: salesData.number7ExtraSheets || 0,
    number7ExtraPrice: 1.00,
    number7ExtraTotal: 0, // calculated
    
    coverallExtraSheets: salesData.coverallExtraSheets || 0,
    coverallExtraPrice: 2.00,
    coverallExtraTotal: 0, // calculated
    
    // Birthday BOGO Promotional
    birthdayBOGOCount: salesData.birthdayBOGOCount || 0,
    birthdayBOGOValue: salesData.birthdayBOGOValue || 0, // Value given away
    
    // Electronic Sales
    electronicMachinesSold40: salesData.electronicMachinesSold40 || 0,
    electronicMachines40Price: 40.00,
    electronicMachines40Total: 0, // calculated
    
    electronicMachinesSold65: salesData.electronicMachinesSold65 || 0,
    electronicMachines65Price: 65.00,
    electronicMachines65Total: 0, // calculated
    
    // Miscellaneous Sales
    daubersSold: salesData.daubersSold || 0,
    dauberPrice: 2.00,
    daubersTotal: 0, // calculated
    
    glueSticksSold: salesData.glueSticksSold || 0,
    glueStickPrice: 1.00,
    glueSticksTotal: 0, // calculated
    
    // Totals (calculated)
    totalBingoCardSales: 0,
    miscellaneousReceipts: 0,
    grandTotal: 0,
    
    // Metadata
    createdAt: new Date(),
    createdBy: Session.getActiveUser().getEmail()
  };
  
  // Calculate sold quantities and totals
  fullSalesData.nineOn20FirstSold = fullSalesData.nineOn20FirstBeginning - fullSalesData.nineOn20FirstEnding;
  fullSalesData.nineOn20FirstTotal = fullSalesData.nineOn20FirstSold * fullSalesData.nineOn20FirstPrice;
  
  fullSalesData.nineOn20AddSold = fullSalesData.nineOn20AddBeginning - fullSalesData.nineOn20AddEnding;
  fullSalesData.nineOn20AddTotal = fullSalesData.nineOn20AddSold * fullSalesData.nineOn20AddPrice;
  
  fullSalesData.sixOn6EarlySold = fullSalesData.sixOn6EarlyBeginning - fullSalesData.sixOn6EarlyEnding;
  fullSalesData.sixOn6EarlyTotal = fullSalesData.sixOn6EarlySold * fullSalesData.sixOn6EarlyPrice;
  
  fullSalesData.threeOnYellowSold = fullSalesData.threeOnYellowBeginning - fullSalesData.threeOnYellowEnding;
  fullSalesData.threeOnYellowTotal = fullSalesData.threeOnYellowSold * fullSalesData.threeOnYellowPrice;
  
  fullSalesData.threeOnOrangeSold = fullSalesData.threeOnOrangeBeginning - fullSalesData.threeOnOrangeEnding;
  fullSalesData.threeOnOrangeTotal = fullSalesData.threeOnOrangeSold * fullSalesData.threeOnOrangePrice;
  
  fullSalesData.threeOnBlueSold = fullSalesData.threeOnBlueBeginning - fullSalesData.threeOnBlueEnding;
  fullSalesData.threeOnBlueTotal = fullSalesData.threeOnBlueSold * fullSalesData.threeOnBluePrice;
  
  fullSalesData.nineOnProgressiveSold = fullSalesData.nineOnProgressiveBeginning - fullSalesData.nineOnProgressiveEnding;
  fullSalesData.nineOnProgressiveTotal = fullSalesData.nineOnProgressiveSold * fullSalesData.nineOnProgressivePrice;
  
  fullSalesData.threeOnProgressiveSold = fullSalesData.threeOnProgressiveBeginning - fullSalesData.threeOnProgressiveEnding;
  fullSalesData.threeOnProgressiveTotal = fullSalesData.threeOnProgressiveSold * fullSalesData.threeOnProgressivePrice;
  
  // Special games extra sheets
  fullSalesData.letterXExtraTotal = fullSalesData.letterXExtraSheets * fullSalesData.letterXExtraPrice;
  fullSalesData.number7ExtraTotal = fullSalesData.number7ExtraSheets * fullSalesData.number7ExtraPrice;
  fullSalesData.coverallExtraTotal = fullSalesData.coverallExtraSheets * fullSalesData.coverallExtraPrice;
  
  // Electronic sales
  fullSalesData.electronicMachines40Total = fullSalesData.electronicMachinesSold40 * fullSalesData.electronicMachines40Price;
  fullSalesData.electronicMachines65Total = fullSalesData.electronicMachinesSold65 * fullSalesData.electronicMachines65Price;
  
  // Miscellaneous
  fullSalesData.daubersTotal = fullSalesData.daubersSold * fullSalesData.dauberPrice;
  fullSalesData.glueSticksTotal = fullSalesData.glueSticksSold * fullSalesData.glueStickPrice;
  
  // Calculate totals
  fullSalesData.totalBingoCardSales = 
    fullSalesData.nineOn20FirstTotal + 
    fullSalesData.nineOn20AddTotal + 
    fullSalesData.sixOn6EarlyTotal +
    fullSalesData.threeOnYellowTotal +
    fullSalesData.threeOnOrangeTotal +
    fullSalesData.threeOnBlueTotal +
    fullSalesData.nineOnProgressiveTotal +
    fullSalesData.threeOnProgressiveTotal +
    fullSalesData.letterXExtraTotal +
    fullSalesData.number7ExtraTotal +
    fullSalesData.coverallExtraTotal +
    fullSalesData.electronicMachines40Total +
    fullSalesData.electronicMachines65Total;
  
  fullSalesData.miscellaneousReceipts = fullSalesData.daubersTotal + fullSalesData.glueSticksTotal;
  fullSalesData.grandTotal = fullSalesData.totalBingoCardSales + fullSalesData.miscellaneousReceipts;
  
  // Append to sheet
  const headers = Object.keys(fullSalesData);
  const values = headers.map(key => fullSalesData[key]);
  
  // Check if headers exist, if not create them
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  
  sheet.appendRow(values);
  
  // Update session totals
  updateSessionBingoTotals(fullSalesData.sessionId, fullSalesData.totalBingoCardSales, fullSalesData.miscellaneousReceipts);
  
  // Log the action
  logAction('CREATE', 'DoorSales', saleId, fullSalesData);
  
  return {
    success: true,
    saleId: saleId,
    data: fullSalesData
  };
}

// ==========================================
// PULL-TAB MANAGEMENT WITH CASH TURN-IN
// ==========================================

/**
 * Record pull-tab sales with complete cash turn-in reporting
 */
function recordPullTabSale(saleData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.PULL_TABS);
  
  // Generate sale ID
  const saleId = 'PT' + Date.now();
  
  // Complete pull-tab sale data matching Schedule A and Schedule C
  const fullSaleData = {
    saleId: saleId,
    sessionId: saleData.sessionId || getCurrentSessionId(),
    date: saleData.date || new Date(),
    
    // Personnel
    worker: saleData.worker,
    lionInCharge: saleData.lionInCharge, // Lion in charge of pull tabs
    
    // Game Information (Schedule A columns)
    nameOfDeal: saleData.nameOfDeal,
    serialNumber: saleData.serialNumber,
    salesPrice: saleData.salesPrice, // $0.25, $0.50, or $1.00
    manufacturer: saleData.manufacturer,
    formNumber: saleData.formNumber,
    
    // Ticket Tracking
    beginningCount: saleData.beginningCount,
    endingCount: saleData.endingCount,
    pullTabsSold: 0, // calculated
    
    // Financial
    grossSales: 0, // calculated
    prizesPaidOut: saleData.prizesPaidOut || 0,
    netReceipts: 0, // calculated
    idealProfit: saleData.idealProfit || 0,
    profitVariance: 0, // calculated
    profitVariancePercent: 0, // calculated
    
    // Cash Turn-in Reporting
    cashTurnedIn: saleData.cashTurnedIn || 0,
    cashVariance: 0, // calculated
    cashVarianceExplanation: saleData.cashVarianceExplanation || '',
    
    // Game Details
    topPrize: saleData.topPrize || 0,
    totalPayout: saleData.totalPayout || 0,
    ticketCount: saleData.ticketCount || 0,
    sealType: saleData.sealType || '',
    
    // Prize Tracking (Schedule C)
    prizesAwarded: saleData.prizesAwarded || [], // Array of {amount, winner, time}
    
    // Metadata
    createdAt: new Date(),
    createdBy: Session.getActiveUser().getEmail(),
    status: 'ACTIVE',
    notes: saleData.notes || ''
  };
  
  // Calculate values
  fullSaleData.pullTabsSold = fullSaleData.beginningCount - fullSaleData.endingCount;
  fullSaleData.grossSales = fullSaleData.pullTabsSold * fullSaleData.salesPrice;
  fullSaleData.netReceipts = fullSaleData.grossSales - fullSaleData.prizesPaidOut;
  fullSaleData.profitVariance = fullSaleData.netReceipts - fullSaleData.idealProfit;
  fullSaleData.profitVariancePercent = fullSaleData.idealProfit > 0 ? 
    (fullSaleData.profitVariance / fullSaleData.idealProfit * 100) : 0;
  fullSaleData.cashVariance = fullSaleData.cashTurnedIn - fullSaleData.netReceipts;
  
  // Append to sheet
  const headers = Object.keys(fullSaleData).filter(key => key !== 'prizesAwarded');
  const values = headers.map(key => {
    if (key === 'prizesAwarded') {
      return JSON.stringify(fullSaleData[key]);
    }
    return fullSaleData[key];
  });
  
  // Check if headers exist, if not create them
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  
  sheet.appendRow(values);
  
  // Update session pull-tab totals
  updateSessionPullTabTotals(fullSaleData.sessionId, fullSaleData.grossSales, fullSaleData.prizesPaidOut, fullSaleData.cashTurnedIn);
  
  // Log the action
  logAction('CREATE', 'PullTabSale', saleId, fullSaleData);
  
  return {
    success: true,
    saleId: saleId,
    data: fullSaleData
  };
}

// ==========================================
// CASH RECONCILIATION WITH OFFAGE TRACKING
// ==========================================

/**
 * Perform complete cash reconciliation with separate and combined offage tracking
 */
function performCashReconciliation(sessionId, reconciliationData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.CASH_RECONCILIATION);
  
  // Get all session data
  const sessionData = getSessionData(sessionId);
  const pullTabSummary = getPullTabCashSummary(sessionId);
  const doorSalesSummary = getDoorSalesSummary(sessionId);
  const bingoGamesSummary = getBingoGamesPrizesSummary(sessionId);
  
  // Complete reconciliation structure
  const reconciliation = {
    reconciliationId: 'CR' + Date.now(),
    sessionId: sessionId,
    date: new Date(),
    closetWorker: reconciliationData.closetWorker,
    
    // Starting Cash (Line 6 on Form 104)
    startingCash: sessionData.startingCash || 0,
    
    // Gross Receipts
    pullTabGrossReceipts: pullTabSummary.totalGrossReceipts || 0, // Line 3
    bingoCardSales: doorSalesSummary.totalBingoCardSales || 0, // Line 4
    miscellaneousReceipts: doorSalesSummary.miscellaneousReceipts || 0, // Line 5
    totalGrossReceipts: 0, // calculated
    
    // Prizes Awarded
    pullTabPrizesAwarded: pullTabSummary.totalPrizesAwarded || 0, // Line 7
    bingoPrizesAwarded: bingoGamesSummary.totalPrizesAwarded || 0, // Line 8
    totalPrizesAwarded: 0, // calculated
    
    // Net Receipts
    netReceipts: 0, // Line 9 - calculated
    
    // Actual Deposit
    actualAmountDeposited: reconciliationData.actualAmountDeposited || 0, // Line 10
    
    // Cash Turn-in from Pull-Tabs
    pullTabCashTurnedIn: pullTabSummary.totalCashTurnedIn || 0,
    pullTabCashExpected: pullTabSummary.totalNetReceipts || 0,
    
    // Offage Tracking (Separate)
    bingoOffage: 0, // calculated
    bingoOffagePercent: 0, // calculated
    pullTabOffage: 0, // calculated
    pullTabOffagePercent: 0, // calculated
    
    // Combined Offage
    combinedOffage: 0, // calculated
    combinedOffagePercent: 0, // calculated
    offageStatus: '', // BALANCED, OVER, SHORT
    
    // Offage Explanation
    offageExplanation: reconciliationData.offageExplanation || '',
    
    // Verification
    depositorName: reconciliationData.depositorName || '',
    depositSlipNumber: reconciliationData.depositSlipNumber || '',
    bankVerified: false,
    
    // Metadata
    createdAt: new Date(),
    createdBy: Session.getActiveUser().getEmail(),
    approved: false,
    approvedBy: '',
    approvedAt: null
  };
  
  // Calculate totals
  reconciliation.totalGrossReceipts = 
    reconciliation.pullTabGrossReceipts + 
    reconciliation.bingoCardSales + 
    reconciliation.miscellaneousReceipts + 
    reconciliation.startingCash;
  
  reconciliation.totalPrizesAwarded = 
    reconciliation.pullTabPrizesAwarded + 
    reconciliation.bingoPrizesAwarded;
  
  reconciliation.netReceipts = 
    reconciliation.totalGrossReceipts - 
    reconciliation.totalPrizesAwarded;
  
  // Calculate offages
  const expectedDeposit = reconciliation.netReceipts;
  const actualDeposit = reconciliation.actualAmountDeposited;
  const totalOffage = actualDeposit - expectedDeposit;
  
  // Allocate offage between bingo and pull-tabs based on their proportion of gross receipts
  const bingoGross = reconciliation.bingoCardSales + reconciliation.miscellaneousReceipts;
  const totalOperationalGross = bingoGross + reconciliation.pullTabGrossReceipts;
  
  if (totalOperationalGross > 0) {
    const bingoRatio = bingoGross / totalOperationalGross;
    const pullTabRatio = reconciliation.pullTabGrossReceipts / totalOperationalGross;
    
    reconciliation.bingoOffage = totalOffage * bingoRatio;
    reconciliation.bingoOffagePercent = bingoGross > 0 ? (reconciliation.bingoOffage / bingoGross * 100) : 0;
    
    // Pull-tab offage also considers cash turn-in variance
    const pullTabTurnInVariance = reconciliation.pullTabCashTurnedIn - reconciliation.pullTabCashExpected;
    reconciliation.pullTabOffage = (totalOffage * pullTabRatio) + pullTabTurnInVariance;
    reconciliation.pullTabOffagePercent = reconciliation.pullTabGrossReceipts > 0 ? 
      (reconciliation.pullTabOffage / reconciliation.pullTabGrossReceipts * 100) : 0;
  }
  
  reconciliation.combinedOffage = totalOffage;
  reconciliation.combinedOffagePercent = expectedDeposit > 0 ? (totalOffage / expectedDeposit * 100) : 0;
  
  // Determine offage status
  if (Math.abs(totalOffage) < 5) {
    reconciliation.offageStatus = 'BALANCED';
  } else if (totalOffage > 0) {
    reconciliation.offageStatus = 'OVER';
  } else {
    reconciliation.offageStatus = 'SHORT';
  }
  
  // Save to reconciliation sheet
  const headers = Object.keys(reconciliation);
  const values = headers.map(key => reconciliation[key]);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  
  sheet.appendRow(values);
  
  // Update session with reconciliation data
  updateSessionReconciliation(sessionId, reconciliation);
  
  // Track offage in separate sheet for analysis
  trackOffage(reconciliation);
  
  // Log the action
  logAction('RECONCILE', 'CashReconciliation', reconciliation.reconciliationId, reconciliation);
  
  return {
    success: true,
    reconciliationId: reconciliation.reconciliationId,
    data: reconciliation
  };
}

// ==========================================
// OFFAGE TRACKING
// ==========================================

/**
 * Track offage patterns for analysis
 */
function trackOffage(reconciliation) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEETS.OFFAGE_TRACKING);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.OFFAGE_TRACKING);
    // Create headers
    sheet.appendRow([
      'Date', 'SessionId', 'ClosetWorker', 
      'BingoOffage', 'BingoOffagePercent',
      'PullTabOffage', 'PullTabOffagePercent', 
      'CombinedOffage', 'CombinedOffagePercent',
      'Status', 'Explanation', 'CreatedAt'
    ]);
  }
  
  sheet.appendRow([
    reconciliation.date,
    reconciliation.sessionId,
    reconciliation.closetWorker,
    reconciliation.bingoOffage,
    reconciliation.bingoOffagePercent,
    reconciliation.pullTabOffage,
    reconciliation.pullTabOffagePercent,
    reconciliation.combinedOffage,
    reconciliation.combinedOffagePercent,
    reconciliation.offageStatus,
    reconciliation.offageExplanation,
    reconciliation.createdAt
  ]);
}

// ==========================================
// BINGO GAMES PRIZE TRACKING
// ==========================================

/**
 * Record bingo game prizes including special games
 */
function recordBingoGamePrize(gameData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_GAMES);
  
  const gameRecord = {
    gameId: 'BG' + Date.now(),
    sessionId: gameData.sessionId || getCurrentSessionId(),
    gameNumber: gameData.gameNumber,
    gameType: gameData.gameType, // REGULAR, SPECIAL, PROGRESSIVE, LETTER_X, NUMBER_7, COVERALL
    gameName: gameData.gameName,
    prizeAmount: gameData.prizeAmount,
    ballsCalled: gameData.ballsCalled,
    winnerName: gameData.winnerName || '',
    winnerCardNumber: gameData.winnerCardNumber || '',
    consolationPaid: gameData.consolationPaid || false,
    createdAt: new Date(),
    createdBy: Session.getActiveUser().getEmail()
  };
  
  const headers = Object.keys(gameRecord);
  const values = headers.map(key => gameRecord[key]);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  
  sheet.appendRow(values);
  
  // Update session game totals
  updateSessionGameData(gameRecord.sessionId, gameRecord.gameType, gameRecord.prizeAmount, gameRecord.ballsCalled);
  
  return {
    success: true,
    gameId: gameRecord.gameId,
    data: gameRecord
  };
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get current session ID
 */
function getCurrentSessionId() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_SESSIONS);
  const lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    const data = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (data[sheet.getLastColumn() - 4] === 'OPEN') { // Check status column
      return data[0]; // Return session ID
    }
  }
  return null;
}

/**
 * Get session data by ID
 */
function getSessionData(sessionId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_SESSIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === sessionId) {
      const sessionData = {};
      headers.forEach((header, index) => {
        sessionData[header] = data[i][index];
      });
      return sessionData;
    }
  }
  return null;
}

/**
 * Get door sales summary for a session
 */
function getDoorSalesSummary(sessionId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.DOOR_SALES);
  const data = sheet.getDataRange().getValues();
  
  let summary = {
    totalBingoCardSales: 0,
    miscellaneousReceipts: 0,
    birthdayBOGOs: 0,
    letterXExtraSheets: 0,
    number7ExtraSheets: 0,
    coverallExtraSheets: 0
  };
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === sessionId) { // sessionId in column 2
      const headers = data[0];
      const totalCol = headers.indexOf('totalBingoCardSales');
      const miscCol = headers.indexOf('miscellaneousReceipts');
      const bogoCol = headers.indexOf('birthdayBOGOCount');
      const letterXCol = headers.indexOf('letterXExtraSheets');
      const number7Col = headers.indexOf('number7ExtraSheets');
      const coverallCol = headers.indexOf('coverallExtraSheets');
      
      summary.totalBingoCardSales += data[i][totalCol] || 0;
      summary.miscellaneousReceipts += data[i][miscCol] || 0;
      summary.birthdayBOGOs += data[i][bogoCol] || 0;
      summary.letterXExtraSheets += data[i][letterXCol] || 0;
      summary.number7ExtraSheets += data[i][number7Col] || 0;
      summary.coverallExtraSheets += data[i][coverallCol] || 0;
    }
  }
  
  return summary;
}

/**
 * Get pull-tab cash summary for a session
 */
function getPullTabCashSummary(sessionId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.PULL_TABS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let summary = {
    totalGrossReceipts: 0,
    totalPrizesAwarded: 0,
    totalNetReceipts: 0,
    totalCashTurnedIn: 0,
    gameCount: 0,
    lionInCharge: ''
  };
  
  const sessionCol = headers.indexOf('sessionId');
  const grossCol = headers.indexOf('grossSales');
  const prizesCol = headers.indexOf('prizesPaidOut');
  const netCol = headers.indexOf('netReceipts');
  const cashCol = headers.indexOf('cashTurnedIn');
  const lionCol = headers.indexOf('lionInCharge');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][sessionCol] === sessionId) {
      summary.totalGrossReceipts += data[i][grossCol] || 0;
      summary.totalPrizesAwarded += data[i][prizesCol] || 0;
      summary.totalNetReceipts += data[i][netCol] || 0;
      summary.totalCashTurnedIn += data[i][cashCol] || 0;
      summary.gameCount++;
      if (!summary.lionInCharge && data[i][lionCol]) {
        summary.lionInCharge = data[i][lionCol];
      }
    }
  }
  
  return summary;
}

/**
 * Get bingo games prizes summary
 */
function getBingoGamesPrizesSummary(sessionId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_GAMES);
  const data = sheet.getDataRange().getValues();
  
  let summary = {
    totalPrizesAwarded: 0,
    regularGamePrizes: 0,
    specialGamePrizes: 0,
    progressivePrizes: 0,
    letterXPrize: 0,
    number7Prize: 0,
    coverallPrize: 0,
    gamesPlayed: 0
  };
  
  if (data.length > 1) {
    const headers = data[0];
    const sessionCol = headers.indexOf('sessionId');
    const typeCol = headers.indexOf('gameType');
    const prizeCol = headers.indexOf('prizeAmount');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][sessionCol] === sessionId) {
        const prizeAmount = data[i][prizeCol] || 0;
        summary.totalPrizesAwarded += prizeAmount;
        summary.gamesPlayed++;
        
        switch(data[i][typeCol]) {
          case 'REGULAR':
            summary.regularGamePrizes += prizeAmount;
            break;
          case 'SPECIAL':
            summary.specialGamePrizes += prizeAmount;
            break;
          case 'PROGRESSIVE':
            summary.progressivePrizes += prizeAmount;
            break;
          case 'LETTER_X':
            summary.letterXPrize += prizeAmount;
            break;
          case 'NUMBER_7':
            summary.number7Prize += prizeAmount;
            break;
          case 'COVERALL':
            summary.coverallPrize += prizeAmount;
            break;
        }
      }
    }
  }
  
  return summary;
}

/**
 * Update session with bingo totals
 */
function updateSessionBingoTotals(sessionId, bingoCardSales, miscReceipts) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_SESSIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const bingoSalesCol = headers.indexOf('totalBingoCardSales');
  const miscCol = headers.indexOf('miscellaneousReceipts');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === sessionId) {
      const currentBingoSales = sheet.getRange(i + 1, bingoSalesCol + 1).getValue() || 0;
      const currentMisc = sheet.getRange(i + 1, miscCol + 1).getValue() || 0;
      
      sheet.getRange(i + 1, bingoSalesCol + 1).setValue(currentBingoSales + bingoCardSales);
      sheet.getRange(i + 1, miscCol + 1).setValue(currentMisc + miscReceipts);
      break;
    }
  }
}

/**
 * Update session with pull-tab totals
 */
function updateSessionPullTabTotals(sessionId, grossSales, prizesPaid, cashTurnedIn) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_SESSIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const ptGrossCol = headers.indexOf('totalPullTabGross');
  const ptPrizesCol = headers.indexOf('totalPullTabPrizesAwarded');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === sessionId) {
      const currentGross = sheet.getRange(i + 1, ptGrossCol + 1).getValue() || 0;
      const currentPrizes = sheet.getRange(i + 1, ptPrizesCol + 1).getValue() || 0;
      
      sheet.getRange(i + 1, ptGrossCol + 1).setValue(currentGross + grossSales);
      sheet.getRange(i + 1, ptPrizesCol + 1).setValue(currentPrizes + prizesPaid);
      break;
    }
  }
}

/**
 * Update session with game data
 */
function updateSessionGameData(sessionId, gameType, prizeAmount, ballsCalled) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_SESSIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === sessionId) {
      // Update specific game columns based on type
      if (gameType === 'LETTER_X') {
        const prizeCol = headers.indexOf('letterXActualPrize');
        const ballsCol = headers.indexOf('letterXBallsCalled');
        sheet.getRange(i + 1, prizeCol + 1).setValue(prizeAmount);
        sheet.getRange(i + 1, ballsCol + 1).setValue(ballsCalled);
      } else if (gameType === 'NUMBER_7') {
        const prizeCol = headers.indexOf('number7ActualPrize');
        const ballsCol = headers.indexOf('number7BallsCalled');
        sheet.getRange(i + 1, prizeCol + 1).setValue(prizeAmount);
        sheet.getRange(i + 1, ballsCol + 1).setValue(ballsCalled);
      } else if (gameType === 'COVERALL') {
        const prizeCol = headers.indexOf('coverallActualPrize');
        const ballsCol = headers.indexOf('coverallBallsCalled');
        sheet.getRange(i + 1, prizeCol + 1).setValue(prizeAmount);
        sheet.getRange(i + 1, ballsCol + 1).setValue(ballsCalled);
      }
      
      // Update total bingo prizes
      const totalPrizesCol = headers.indexOf('totalBingoPrizesAwarded');
      const currentTotal = sheet.getRange(i + 1, totalPrizesCol + 1).getValue() || 0;
      sheet.getRange(i + 1, totalPrizesCol + 1).setValue(currentTotal + prizeAmount);
      break;
    }
  }
}

/**
 * Update session with reconciliation data
 */
function updateSessionReconciliation(sessionId, reconciliation) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_SESSIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === sessionId) {
      // Update financial columns
      const netCol = headers.indexOf('netReceipts');
      const depositCol = headers.indexOf('actualAmountDeposited');
      const bingoOffageCol = headers.indexOf('bingoOffage');
      const ptOffageCol = headers.indexOf('pullTabOffage');
      const combinedOffageCol = headers.indexOf('combinedOffage');
      const explanationCol = headers.indexOf('offageExplanation');
      const statusCol = headers.indexOf('status');
      
      sheet.getRange(i + 1, netCol + 1).setValue(reconciliation.netReceipts);
      sheet.getRange(i + 1, depositCol + 1).setValue(reconciliation.actualAmountDeposited);
      sheet.getRange(i + 1, bingoOffageCol + 1).setValue(reconciliation.bingoOffage);
      sheet.getRange(i + 1, ptOffageCol + 1).setValue(reconciliation.pullTabOffage);
      sheet.getRange(i + 1, combinedOffageCol + 1).setValue(reconciliation.combinedOffage);
      sheet.getRange(i + 1, explanationCol + 1).setValue(reconciliation.offageExplanation);
      sheet.getRange(i + 1, statusCol + 1).setValue('CLOSED');
      break;
    }
  }
}

/**
 * Get day of week from date
 */
function getDayOfWeek(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(date).getDay()];
}

/**
 * Log user actions for audit trail
 */
function logAction(action, recordType, recordId, data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEETS.AUDIT_LOG);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.AUDIT_LOG);
    sheet.appendRow([
      'Timestamp', 'User', 'Action', 'RecordType', 
      'RecordId', 'Data', 'UserKey'
    ]);
  }
  
  sheet.appendRow([
    new Date(),
    Session.getActiveUser().getEmail(),
    action,
    recordType,
    recordId,
    JSON.stringify(data),
    Session.getTemporaryActiveUserKey()
  ]);
}

/**
 * Log user access
 */
function logAccess(user, page) {
  console.log(`Access: ${user} accessed ${page} at ${new Date()}`);
}

// ==========================================
// MGC FORM 104 REPORT GENERATION
// ==========================================

/**
 * Generate Missouri Gaming Commission Form 104 report
 */
function generateMGCForm104(sessionId) {
  const sessionData = getSessionData(sessionId);
  const doorSales = getDoorSalesSummary(sessionId);
  const pullTabs = getPullTabCashSummary(sessionId);
  const bingoGames = getBingoGamesPrizesSummary(sessionId);
  
  const form104 = {
    // Header Information
    organizationName: sessionData.organizationName,
    dayOfOccasion: sessionData.dayOfWeek,
    dateOfOccasion: sessionData.date,
    bingoLicenseNumber: sessionData.bingoLicenseNumber,
    startTime: sessionData.startTime,
    endTime: sessionData.endTime,
    numberOfPlayers: sessionData.totalPlayers,
    numberOfBingoGames: sessionData.numberOfBingoGames,
    
    // Progressive Game Information
    progressive1: {
      jackpotOffered: sessionData.progressive1Jackpot,
      consolationOffered: sessionData.progressive1ConsolationOffered,
      ballsNeededToWin: sessionData.progressive1BallsToWin,
      actualPrizeAwarded: sessionData.progressive1ActualPrize,
      actualBallsCalled: sessionData.progressive1ActualBallsCalled
    },
    progressive2: {
      jackpotOffered: sessionData.progressive2Jackpot,
      consolationOffered: sessionData.progressive2ConsolationOffered,
      ballsNeededToWin: sessionData.progressive2BallsToWin,
      actualPrizeAwarded: sessionData.progressive2ActualPrize,
      actualBallsCalled: sessionData.progressive2ActualBallsCalled
    },
    
    // Gross Receipts
    totalPullTabGrossReceipts: pullTabs.totalGrossReceipts, // Line 3
    totalBingoCardSales: doorSales.totalBingoCardSales, // Line 4
    miscellaneousReceipts: doorSales.miscellaneousReceipts, // Line 5
    startingCash: sessionData.startingCash, // Line 6
    totalGrossReceipts: 0, // calculated
    
    // Prizes Awarded
    totalPullTabPrizesAwarded: pullTabs.totalPrizesAwarded, // Line 7
    totalBingoPrizesAwarded: bingoGames.totalPrizesAwarded, // Line 8
    totalPrizesAwarded: 0, // calculated
    
    // Net Receipts
    netReceipts: 0, // Line 9 - calculated
    actualAmountDeposited: sessionData.actualAmountDeposited, // Line 10
    
    // Signature
    preparer: sessionData.preparer,
    preparerSignature: '',
    dateSignature: new Date()
  };
  
  // Calculate totals
  form104.totalGrossReceipts = 
    form104.totalPullTabGrossReceipts + 
    form104.totalBingoCardSales + 
    form104.miscellaneousReceipts + 
    form104.startingCash;
  
  form104.totalPrizesAwarded = 
    form104.totalPullTabPrizesAwarded + 
    form104.totalBingoPrizesAwarded;
  
  form104.netReceipts = 
    form104.totalGrossReceipts - 
    form104.totalPrizesAwarded;
  
  // Store report
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEETS.MGC_REPORTS);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.MGC_REPORTS);
    const headers = Object.keys(form104);
    sheet.appendRow(headers);
  }
  
  const values = Object.values(form104).map(val => {
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val);
    }
    return val;
  });
  
  sheet.appendRow(values);
  
  return form104;
}

// ==========================================
// API ENDPOINTS FOR FRONTEND
// ==========================================

/**
 * Get active pull-tab games
 */
function getActivePullTabGames() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.PULL_TAB_LIBRARY);
  const data = sheet.getDataRange().getValues();
  
  const games = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][13] === true) { // Active column
      games.push({
        gameName: data[i][0],
        topPrize: data[i][1],
        fullName: data[i][2],
        formNumber: data[i][3],
        manufacturer: data[i][4],
        ticketCount: data[i][5],
        pricePerTicket: data[i][6],
        totalSales: data[i][7],
        totalPayout: data[i][8],
        idealProfit: data[i][9],
        profitPercent: data[i][10],
        sealType: data[i][11]
      });
    }
  }
  
  return games;
}

/**
 * Get session summary for dashboard
 */
function getSessionSummary(sessionId) {
  if (!sessionId) {
    sessionId = getCurrentSessionId();
  }
  
  const sessionData = getSessionData(sessionId);
  const doorSales = getDoorSalesSummary(sessionId);
  const pullTabs = getPullTabCashSummary(sessionId);
  const bingoGames = getBingoGamesPrizesSummary(sessionId);
  
  return {
    sessionId: sessionId,
    date: sessionData.date,
    status: sessionData.status,
    totalPlayers: sessionData.totalPlayers,
    birthdayBOGOs: sessionData.birthdayBOGOs,
    lionInCharge: pullTabs.lionInCharge,
    closetWorker: sessionData.closetWorker,
    
    // Financial Summary
    startingCash: sessionData.startingCash,
    bingoCardSales: doorSales.totalBingoCardSales,
    pullTabSales: pullTabs.totalGrossReceipts,
    miscSales: doorSales.miscellaneousReceipts,
    grossReceipts: 0, // calculated in frontend
    
    bingoPrizes: bingoGames.totalPrizesAwarded,
    pullTabPrizes: pullTabs.totalPrizesAwarded,
    totalPrizes: 0, // calculated in frontend
    
    netReceipts: 0, // calculated in frontend
    actualDeposit: sessionData.actualAmountDeposited || 0,
    
    // Offage
    bingoOffage: sessionData.bingoOffage || 0,
    pullTabOffage: sessionData.pullTabOffage || 0,
    combinedOffage: sessionData.combinedOffage || 0,
    offageStatus: sessionData.offageStatus || 'PENDING'
  };
}

/**
 * Get recent sessions for dashboard
 */
function getRecentSessions(limit = 10) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_SESSIONS);
  const data = sheet.getDataRange().getValues();
  
  const sessions = [];
  const startRow = Math.max(1, data.length - limit);
  
  for (let i = startRow; i < data.length; i++) {
    sessions.push({
      sessionId: data[i][0],
      date: data[i][2],
      status: data[i][data[0].indexOf('status')],
      totalPlayers: data[i][data[0].indexOf('totalPlayers')],
      netReceipts: data[i][data[0].indexOf('netReceipts')],
      actualDeposit: data[i][data[0].indexOf('actualAmountDeposited')]
    });
  }
  
  return sessions.reverse();
}

/**
 * Close session
 */
function closeSession(sessionId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_SESSIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const statusCol = headers.indexOf('status');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === sessionId) {
      sheet.getRange(i + 1, statusCol + 1).setValue('CLOSED');
      logAction('CLOSE', 'BingoSession', sessionId, {status: 'CLOSED'});
      return {success: true};
    }
  }
  
  return {success: false, error: 'Session not found'};
}
