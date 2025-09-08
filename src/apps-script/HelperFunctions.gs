/**
 * RLC BINGO MANAGER - ADDITIONAL HELPER FUNCTIONS
 * Complete backend functionality for reports, statistics, and data management
 * 
 * Add this code to a new file: HelperFunctions.gs in your Google Apps Script project
 */

// ==========================================
// REPORT GENERATION FUNCTIONS
// ==========================================

/**
 * Get session by date
 */
function getSessionByDate(date) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_SESSIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const targetDate = new Date(date).toDateString();
  
  for (let i = 1; i < data.length; i++) {
    const sessionDate = new Date(data[i][headers.indexOf('date')]).toDateString();
    if (sessionDate === targetDate) {
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
 * Get quarterly data for MGC reporting
 */
function getQuarterlyData(quarter, year) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_SESSIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Determine quarter months
  const quarterMonths = {
    'Q1': [0, 1, 2],    // Jan, Feb, Mar
    'Q2': [3, 4, 5],    // Apr, May, Jun
    'Q3': [6, 7, 8],    // Jul, Aug, Sep
    'Q4': [9, 10, 11]   // Oct, Nov, Dec
  };
  
  const months = quarterMonths[quarter];
  const monthlyData = {};
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Initialize monthly data
  months.forEach(month => {
    monthlyData[monthNames[month]] = {
      month: monthNames[month],
      occasions: 0,
      players: 0,
      gross: 0,
      prizes: 0,
      net: 0,
      deposited: 0,
      sessions: []
    };
  });
  
  // Process sessions
  for (let i = 1; i < data.length; i++) {
    const sessionDate = new Date(data[i][headers.indexOf('date')]);
    if (sessionDate.getFullYear() == year && months.includes(sessionDate.getMonth())) {
      const monthName = monthNames[sessionDate.getMonth()];
      const month = monthlyData[monthName];
      
      month.occasions++;
      month.players += data[i][headers.indexOf('totalPlayers')] || 0;
      month.gross += data[i][headers.indexOf('totalGrossReceipts')] || 0;
      month.prizes += data[i][headers.indexOf('totalPrizesAwarded')] || 0;
      month.net += data[i][headers.indexOf('netReceipts')] || 0;
      month.deposited += data[i][headers.indexOf('actualAmountDeposited')] || 0;
      
      month.sessions.push({
        date: sessionDate,
        players: data[i][headers.indexOf('totalPlayers')],
        deposit: data[i][headers.indexOf('actualAmountDeposited')]
      });
    }
  }
  
  // Calculate totals
  let totals = {
    totalOccasions: 0,
    totalPlayers: 0,
    totalGross: 0,
    totalPrizes: 0,
    totalNet: 0,
    totalDeposited: 0,
    monthlyData: []
  };
  
  Object.values(monthlyData).forEach(month => {
    totals.totalOccasions += month.occasions;
    totals.totalPlayers += month.players;
    totals.totalGross += month.gross;
    totals.totalPrizes += month.prizes;
    totals.totalNet += month.net;
    totals.totalDeposited += month.deposited;
    totals.monthlyData.push(month);
  });
  
  return totals;
}

/**
 * Get offage data for analysis
 */
function getOffageData(startDate, endDate) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.OFFAGE_TRACKING);
  
  if (!sheet) {
    return {
      avgBingoOffage: 0,
      avgPTOffage: 0,
      avgTotalOffage: 0,
      balancedPercent: 0,
      sessions: []
    };
  }
  
  const data = sheet.getDataRange().getValues();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let sessions = [];
  let totalBingoOffage = 0;
  let totalPTOffage = 0;
  let totalCombinedOffage = 0;
  let balancedCount = 0;
  
  for (let i = 1; i < data.length; i++) {
    const sessionDate = new Date(data[i][0]);
    if (sessionDate >= start && sessionDate <= end) {
      const session = {
        date: data[i][0],
        sessionId: data[i][1],
        closetWorker: data[i][2],
        bingoOffage: data[i][3] || 0,
        bingoOffagePercent: data[i][4] || 0,
        ptOffage: data[i][5] || 0,
        ptOffagePercent: data[i][6] || 0,
        combinedOffage: data[i][7] || 0,
        combinedOffagePercent: data[i][8] || 0,
        status: data[i][9],
        explanation: data[i][10]
      };
      
      sessions.push(session);
      totalBingoOffage += Math.abs(session.bingoOffage);
      totalPTOffage += Math.abs(session.ptOffage);
      totalCombinedOffage += Math.abs(session.combinedOffage);
      
      if (session.status === 'BALANCED') {
        balancedCount++;
      }
    }
  }
  
  const count = sessions.length;
  
  return {
    avgBingoOffage: count > 0 ? totalBingoOffage / count : 0,
    avgPTOffage: count > 0 ? totalPTOffage / count : 0,
    avgTotalOffage: count > 0 ? totalCombinedOffage / count : 0,
    balancedPercent: count > 0 ? (balancedCount / count * 100) : 0,
    sessions: sessions,
    chartData: prepareOffageChartData(sessions)
  };
}

/**
 * Prepare offage chart data
 */
function prepareOffageChartData(sessions) {
  return sessions.map(session => ({
    date: new Date(session.date).toLocaleDateString(),
    bingoOffage: session.bingoOffage,
    ptOffage: session.ptOffage,
    combinedOffage: session.combinedOffage
  }));
}

/**
 * Get comprehensive statistics
 */
function getStatistics(startDate, endDate) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BINGO_SESSIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let stats = {
    totalSessions: 0,
    totalPlayers: 0,
    totalGross: 0,
    totalPrizes: 0,
    totalNet: 0,
    bestDay: '',
    mostPlayers: 0,
    highestGross: 0,
    highestProfit: 0,
    progressivesWon: 0,
    totalBOGOs: 0,
    totalBallsCalled: 0,
    gamesWithWinners: 0,
    dayTotals: {}
  };
  
  // Get pull-tab statistics
  const ptStats = getPullTabStatistics(startDate, endDate);
  
  for (let i = 1; i < data.length; i++) {
    const sessionDate = new Date(data[i][headers.indexOf('date')]);
    if (sessionDate >= start && sessionDate <= end) {
      stats.totalSessions++;
      
      const players = data[i][headers.indexOf('totalPlayers')] || 0;
      const gross = data[i][headers.indexOf('totalGrossReceipts')] || 0;
      const prizes = data[i][headers.indexOf('totalPrizesAwarded')] || 0;
      const net = data[i][headers.indexOf('netReceipts')] || 0;
      const bogos = data[i][headers.indexOf('birthdayBOGOs')] || 0;
      const dayOfWeek = data[i][headers.indexOf('dayOfWeek')];
      
      stats.totalPlayers += players;
      stats.totalGross += gross;
      stats.totalPrizes += prizes;
      stats.totalNet += net;
      stats.totalBOGOs += bogos;
      
      // Track best performers
      if (players > stats.mostPlayers) {
        stats.mostPlayers = players;
      }
      
      if (gross > stats.highestGross) {
        stats.highestGross = gross;
      }
      
      if (net > stats.highestProfit) {
        stats.highestProfit = net;
      }
      
      // Track progressives won
      if (data[i][headers.indexOf('progressive1ActualPrize')] > 100) {
        stats.progressivesWon++;
      }
      if (data[i][headers.indexOf('progressive2ActualPrize')] > 100) {
        stats.progressivesWon++;
      }
      
      // Track balls called
      const prog1Balls = data[i][headers.indexOf('progressive1ActualBallsCalled')] || 0;
      const prog2Balls = data[i][headers.indexOf('progressive2ActualBallsCalled')] || 0;
      const letterXBalls = data[i][headers.indexOf('letterXBallsCalled')] || 0;
      const number7Balls = data[i][headers.indexOf('number7BallsCalled')] || 0;
      const coverallBalls = data[i][headers.indexOf('coverallBallsCalled')] || 0;
      
      if (prog1Balls > 0) {
        stats.totalBallsCalled += prog1Balls;
        stats.gamesWithWinners++;
      }
      if (prog2Balls > 0) {
        stats.totalBallsCalled += prog2Balls;
        stats.gamesWithWinners++;
      }
      if (letterXBalls > 0) {
        stats.totalBallsCalled += letterXBalls;
        stats.gamesWithWinners++;
      }
      if (number7Balls > 0) {
        stats.totalBallsCalled += number7Balls;
        stats.gamesWithWinners++;
      }
      if (coverallBalls > 0) {
        stats.totalBallsCalled += coverallBalls;
        stats.gamesWithWinners++;
      }
      
      // Track by day of week
      if (!stats.dayTotals[dayOfWeek]) {
        stats.dayTotals[dayOfWeek] = {
          sessions: 0,
          totalNet: 0
        };
      }
      stats.dayTotals[dayOfWeek].sessions++;
      stats.dayTotals[dayOfWeek].totalNet += net;
    }
  }
  
  // Calculate averages and percentages
  if (stats.totalSessions > 0) {
    stats.avgPlayers = Math.round(stats.totalPlayers / stats.totalSessions);
    stats.avgProfit = stats.totalNet / stats.totalSessions;
    stats.profitMargin = (stats.totalNet / stats.totalGross * 100);
  }
  
  if (stats.gamesWithWinners > 0) {
    stats.avgBallsForWin = Math.round(stats.totalBallsCalled / stats.gamesWithWinners);
  }
  
  // Determine best day
  let bestDayProfit = 0;
  Object.keys(stats.dayTotals).forEach(day => {
    const avgDayProfit = stats.dayTotals[day].totalNet / stats.dayTotals[day].sessions;
    if (avgDayProfit > bestDayProfit) {
      bestDayProfit = avgDayProfit;
      stats.bestDay = day;
    }
  });
  
  // Add pull-tab statistics
  stats.ptProfitPercent = ptStats.profitPercent;
  
  return stats;
}

/**
 * Get pull-tab statistics
 */
function getPullTabStatistics(startDate, endDate) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.PULL_TABS);
  
  if (!sheet || sheet.getLastRow() <= 1) {
    return {
      totalGross: 0,
      totalPrizes: 0,
      totalNet: 0,
      profitPercent: 0
    };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let totalGross = 0;
  let totalPrizes = 0;
  
  const dateCol = headers.indexOf('date');
  const grossCol = headers.indexOf('grossSales');
  const prizesCol = headers.indexOf('prizesPaidOut');
  
  for (let i = 1; i < data.length; i++) {
    const saleDate = new Date(data[i][dateCol]);
    if (saleDate >= start && saleDate <= end) {
      totalGross += data[i][grossCol] || 0;
      totalPrizes += data[i][prizesCol] || 0;
    }
  }
  
  const totalNet = totalGross - totalPrizes;
  const profitPercent = totalGross > 0 ? (totalNet / totalGross * 100) : 0;
  
  return {
    totalGross: totalGross,
    totalPrizes: totalPrizes,
    totalNet: totalNet,
    profitPercent: profitPercent
  };
}

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

/**
 * Export quarterly report to CSV
 */
function exportQuarterlyToCSV() {
  const quarter = 'Q1'; // Get from current context
  const year = new Date().getFullYear();
  const data = getQuarterlyData(quarter, year);
  
  // Create CSV content
  let csv = 'Month,Occasions,Players,Gross Receipts,Prizes,Net Receipts,Deposited\n';
  
  data.monthlyData.forEach(month => {
    csv += `${month.month},${month.occasions},${month.players},`;
    csv += `${month.gross.toFixed(2)},${month.prizes.toFixed(2)},`;
    csv += `${month.net.toFixed(2)},${month.deposited.toFixed(2)}\n`;
  });
  
  // Add totals row
  csv += `\nTOTALS,${data.totalOccasions},${data.totalPlayers},`;
  csv += `${data.totalGross.toFixed(2)},${data.totalPrizes.toFixed(2)},`;
  csv += `${data.totalNet.toFixed(2)},${data.totalDeposited.toFixed(2)}`;
  
  // Create file
  const blob = Utilities.newBlob(csv, 'text/csv', `Quarterly_Report_${quarter}_${year}.csv`);
  const file = DriveApp.createFile(blob);
  
  // Move to reports folder
  const reportsFolderId = '15raXM8l-oPjvwIXIhMlIgd0DeHIfza2S';
  const folder = DriveApp.getFolderById(reportsFolderId);
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  
  return file.getDownloadUrl();
}

/**
 * Export offage analysis to CSV
 */
function exportOffageToCSV() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  const data = getOffageData(startDate.toISOString(), endDate.toISOString());
  
  // Create CSV content
  let csv = 'Date,Session ID,Closet Worker,Bingo Offage,PT Offage,Combined Offage,Status,Explanation\n';
  
  data.sessions.forEach(session => {
    csv += `${new Date(session.date).toLocaleDateString()},${session.sessionId},`;
    csv += `${session.closetWorker},${session.bingoOffage.toFixed(2)},`;
    csv += `${session.ptOffage.toFixed(2)},${session.combinedOffage.toFixed(2)},`;
    csv += `${session.status},"${session.explanation || ''}"\n`;
  });
  
  // Add summary
  csv += `\nSUMMARY\n`;
  csv += `Average Bingo Offage,${data.avgBingoOffage.toFixed(2)}\n`;
  csv += `Average PT Offage,${data.avgPTOffage.toFixed(2)}\n`;
  csv += `Average Combined Offage,${data.avgTotalOffage.toFixed(2)}\n`;
  csv += `Balanced Sessions,${data.balancedPercent.toFixed(1)}%`;
  
  // Create file
  const blob = Utilities.newBlob(csv, 'text/csv', `Offage_Analysis_${new Date().toISOString().split('T')[0]}.csv`);
  const file = DriveApp.createFile(blob);
  
  // Move to reports folder
  const reportsFolderId = '15raXM8l-oPjvwIXIhMlIgd0DeHIfza2S';
  const folder = DriveApp.getFolderById(reportsFolderId);
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  
  return file.getDownloadUrl();
}

/**
 * Export statistics to CSV
 */
function exportStatisticsToCSV() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  
  const stats = getStatistics(startDate.toISOString(), endDate.toISOString());
  
  // Create CSV content
  let csv = 'Statistic,Value\n';
  csv += `Total Sessions,${stats.totalSessions}\n`;
  csv += `Total Players,${stats.totalPlayers}\n`;
  csv += `Average Players per Session,${stats.avgPlayers}\n`;
  csv += `Total Gross Receipts,${stats.totalGross.toFixed(2)}\n`;
  csv += `Total Prizes Paid,${stats.totalPrizes.toFixed(2)}\n`;
  csv += `Total Net Profit,${stats.totalNet.toFixed(2)}\n`;
  csv += `Average Profit per Session,${stats.avgProfit.toFixed(2)}\n`;
  csv += `Profit Margin,${stats.profitMargin.toFixed(1)}%\n`;
  csv += `\nTop Performers\n`;
  csv += `Best Day,${stats.bestDay}\n`;
  csv += `Most Players in Session,${stats.mostPlayers}\n`;
  csv += `Highest Gross,${stats.highestGross.toFixed(2)}\n`;
  csv += `Highest Profit,${stats.highestProfit.toFixed(2)}\n`;
  csv += `\nGame Statistics\n`;
  csv += `Progressive Jackpots Won,${stats.progressivesWon}\n`;
  csv += `Average Balls for Winner,${stats.avgBallsForWin}\n`;
  csv += `Total Birthday BOGOs,${stats.totalBOGOs}\n`;
  csv += `Pull-Tab Profit Percent,${stats.ptProfitPercent.toFixed(1)}%\n`;
  
  // Create file
  const blob = Utilities.newBlob(csv, 'text/csv', `Statistics_${new Date().toISOString().split('T')[0]}.csv`);
  const file = DriveApp.createFile(blob);
  
  // Move to reports folder
  const reportsFolderId = '15raXM8l-oPjvwIXIhMlIgd0DeHIfza2S';
  const folder = DriveApp.getFolderById(reportsFolderId);
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  
  return file.getDownloadUrl();
}

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

/**
 * Validate session before closing
 */
function validateSessionClose(sessionId) {
  const session = getSessionData(sessionId);
  const errors = [];
  const warnings = [];
  
  // Required fields for closing
  if (!session.closetWorker) {
    errors.push('Closet worker name is required');
  }
  
  if (!session.lionInChargePullTabs) {
    errors.push('Lion in charge of pull-tabs is required');
  }
  
  if (session.totalPlayers === 0) {
    warnings.push('No players recorded for this session');
  }
  
  if (session.actualAmountDeposited === 0) {
    errors.push('Actual deposit amount is required');
  }
  
  // Check for large offage without explanation
  if (Math.abs(session.combinedOffage) > 100) {
    if (!session.offageExplanation || session.offageExplanation.trim() === '') {
      errors.push('Offage over $100 requires an explanation');
    }
  }
  
  // Check for missing game data
  if (session.totalBingoPrizesAwarded === 0) {
    warnings.push('No bingo prizes recorded');
  }
  
  // Validate progressive games
  if (session.progressive1Jackpot > 0 && session.progressive1ActualPrize === 0) {
    warnings.push('Progressive 1 has no winner recorded');
  }
  
  if (session.progressive2Jackpot > 0 && session.progressive2ActualPrize === 0) {
    warnings.push('Progressive 2 has no winner recorded');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings
  };
}

/**
 * Audit session data for compliance
 */
function auditSession(sessionId) {
  const session = getSessionData(sessionId);
  const doorSales = getDoorSalesSummary(sessionId);
  const pullTabs = getPullTabCashSummary(sessionId);
  const bingoGames = getBingoGamesPrizesSummary(sessionId);
  
  const audit = {
    sessionId: sessionId,
    date: session.date,
    auditDate: new Date(),
    findings: []
  };
  
  // Check gross receipts calculation
  const calculatedGross = (session.startingCash || 0) + 
                          (doorSales.totalBingoCardSales || 0) + 
                          (pullTabs.totalGrossReceipts || 0) + 
                          (doorSales.miscellaneousReceipts || 0);
  
  if (Math.abs(calculatedGross - session.totalGrossReceipts) > 0.01) {
    audit.findings.push({
      type: 'ERROR',
      category: 'GROSS_RECEIPTS',
      message: `Gross receipts mismatch. Expected: $${calculatedGross.toFixed(2)}, Recorded: $${session.totalGrossReceipts.toFixed(2)}`
    });
  }
  
  // Check prizes calculation
  const calculatedPrizes = (bingoGames.totalPrizesAwarded || 0) + 
                           (pullTabs.totalPrizesAwarded || 0);
  
  if (Math.abs(calculatedPrizes - session.totalPrizesAwarded) > 0.01) {
    audit.findings.push({
      type: 'ERROR',
      category: 'PRIZES',
      message: `Prizes mismatch. Expected: $${calculatedPrizes.toFixed(2)}, Recorded: $${session.totalPrizesAwarded.toFixed(2)}`
    });
  }
  
  // Check net receipts calculation
  const calculatedNet = calculatedGross - calculatedPrizes;
  if (Math.abs(calculatedNet - session.netReceipts) > 0.01) {
    audit.findings.push({
      type: 'ERROR',
      category: 'NET_RECEIPTS',
      message: `Net receipts mismatch. Expected: $${calculatedNet.toFixed(2)}, Recorded: $${session.netReceipts.toFixed(2)}`
    });
  }
  
  // Check for birthday BOGOs without documentation
  if (doorSales.birthdayBOGOs > 0 && !session.birthdayBOGOs) {
    audit.findings.push({
      type: 'WARNING',
      category: 'PROMOTIONAL',
      message: `${doorSales.birthdayBOGOs} Birthday BOGOs recorded in door sales but not in session summary`
    });
  }
  
  // Check pull-tab cash turn-in variance
  if (Math.abs(pullTabs.totalCashTurnedIn - pullTabs.totalNetReceipts) > 50) {
    audit.findings.push({
      type: 'WARNING',
      category: 'PULL_TABS',
      message: `Large pull-tab cash variance: $${Math.abs(pullTabs.totalCashTurnedIn - pullTabs.totalNetReceipts).toFixed(2)}`
    });
  }
  
  // Save audit results
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const auditSheet = ss.getSheetByName('SessionAudits') || ss.insertSheet('SessionAudits');
  
  if (auditSheet.getLastRow() === 0) {
    auditSheet.appendRow(['Audit Date', 'Session ID', 'Session Date', 'Finding Type', 'Category', 'Message']);
  }
  
  audit.findings.forEach(finding => {
    auditSheet.appendRow([
      audit.auditDate,
      audit.sessionId,
      audit.date,
      finding.type,
      finding.category,
      finding.message
    ]);
  });
  
  return audit;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Format currency
 */
function formatCurrency(amount) {
  return '$' + (amount || 0).toFixed(2);
}

/**
 * Format percentage
 */
function formatPercentage(value, decimals = 1) {
  return (value || 0).toFixed(decimals) + '%';
}

/**
 * Calculate date range
 */
function getDateRange(period) {
  const end = new Date();
  const start = new Date();
  
  switch(period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }
  
  return {
    start: start,
    end: end
  };
}

/**
 * Send email notification
 */
function sendNotification(recipient, subject, body) {
  try {
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: body
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Generate session summary email
 */
function generateSessionSummaryEmail(sessionId) {
  const session = getSessionData(sessionId);
  const summary = getSessionSummary(sessionId);
  
  const html = `
    <h2>Bingo Session Summary - ${new Date(session.date).toLocaleDateString()}</h2>
    
    <h3>Session Information</h3>
    <table style="border-collapse: collapse; width: 100%;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Session ID:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${session.sessionId}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Players:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${session.totalPlayers}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Closet Worker:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${session.closetWorker}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Lion in Charge (PT):</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${session.lionInChargePullTabs}</td>
      </tr>
    </table>
    
    <h3>Financial Summary</h3>
    <table style="border-collapse: collapse; width: 100%;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Gross Receipts:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(session.totalGrossReceipts)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Prizes:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(session.totalPrizesAwarded)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Net Receipts:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(session.netReceipts)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Actual Deposit:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(session.actualAmountDeposited)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Offage:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd; color: ${session.combinedOffage >= 0 ? 'green' : 'red'}">
          ${formatCurrency(session.combinedOffage)}
        </td>
      </tr>
    </table>
    
    <p style="margin-top: 20px; color: #666;">
      This is an automated summary from the RLC Bingo Manager system.
    </p>
  `;
  
  return html;
}

/**
 * Initialize all sheets with headers
 */
function initializeAllSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Define all sheet structures
  const sheetStructures = {
    'BingoSessions': [
      'sessionId', 'organizationName', 'bingoLicenseNumber', 'date', 'dayOfWeek',
      'startTime', 'endTime', 'closetWorker', 'lionInChargePullTabs', 'preparer',
      'totalPlayers', 'birthdayBOGOs', 'numberOfBingoGames',
      'progressive1Jackpot', 'progressive1BallsToWin', 'progressive1ConsolationOffered',
      'progressive1ActualPrize', 'progressive1ActualBallsCalled',
      'progressive2Jackpot', 'progressive2BallsToWin', 'progressive2ConsolationOffered',
      'progressive2ActualPrize', 'progressive2ActualBallsCalled',
      'letterXPrizeOffered', 'letterXActualPrize', 'letterXBallsCalled', 'letterXWinner',
      'number7PrizeOffered', 'number7ActualPrize', 'number7BallsCalled', 'number7Winner',
      'coverallPrizeOffered', 'coverallActualPrize', 'coverallBallsCalled', 'coverallWinner',
      'totalBingoCardSales', 'totalPullTabGross', 'miscellaneousReceipts', 'startingCash',
      'totalGrossReceipts', 'totalBingoPrizesAwarded', 'totalPullTabPrizesAwarded',
      'totalPrizesAwarded', 'netReceipts', 'actualAmountDeposited',
      'bingoOffage', 'pullTabOffage', 'combinedOffage', 'offageExplanation',
      'createdAt', 'createdBy', 'modifiedAt', 'modifiedBy', 'status', 'notes'
    ],
    'DoorSales': [
      'saleId', 'sessionId', 'date', 'worker',
      'nineOn20FirstBeginning', 'nineOn20FirstEnding', 'nineOn20FirstSold', 'nineOn20FirstPrice', 'nineOn20FirstTotal',
      'nineOn20AddBeginning', 'nineOn20AddEnding', 'nineOn20AddSold', 'nineOn20AddPrice', 'nineOn20AddTotal',
      'sixOn6EarlyBeginning', 'sixOn6EarlyEnding', 'sixOn6EarlySold', 'sixOn6EarlyPrice', 'sixOn6EarlyTotal',
      'threeOnYellowBeginning', 'threeOnYellowEnding', 'threeOnYellowSold', 'threeOnYellowPrice', 'threeOnYellowTotal',
      'threeOnOrangeBeginning', 'threeOnOrangeEnding', 'threeOnOrangeSold', 'threeOnOrangePrice', 'threeOnOrangeTotal',
      'threeOnBlueBeginning', 'threeOnBlueEnding', 'threeOnBlueSold', 'threeOnBluePrice', 'threeOnBlueTotal',
      'nineOnProgressiveBeginning', 'nineOnProgressiveEnding', 'nineOnProgressiveSold', 'nineOnProgressivePrice', 'nineOnProgressiveTotal',
      'threeOnProgressiveBeginning', 'threeOnProgressiveEnding', 'threeOnProgressiveSold', 'threeOnProgressivePrice', 'threeOnProgressiveTotal',
      'letterXExtraSheets', 'letterXExtraPrice', 'letterXExtraTotal',
      'number7ExtraSheets', 'number7ExtraPrice', 'number7ExtraTotal',
      'coverallExtraSheets', 'coverallExtraPrice', 'coverallExtraTotal',
      'birthdayBOGOCount', 'birthdayBOGOValue',
      'electronicMachinesSold40', 'electronicMachines40Price', 'electronicMachines40Total',
      'electronicMachinesSold65', 'electronicMachines65Price', 'electronicMachines65Total',
      'daubersSold', 'dauberPrice', 'daubersTotal',
      'glueSticksSold', 'glueStickPrice', 'glueSticksTotal',
      'totalBingoCardSales', 'miscellaneousReceipts', 'grandTotal',
      'createdAt', 'createdBy'
    ],
    'PullTabs': [
      'saleId', 'sessionId', 'date', 'worker', 'lionInCharge',
      'nameOfDeal', 'serialNumber', 'salesPrice', 'manufacturer', 'formNumber',
      'beginningCount', 'endingCount', 'pullTabsSold',
      'grossSales', 'prizesPaidOut', 'netReceipts', 'idealProfit', 'profitVariance', 'profitVariancePercent',
      'cashTurnedIn', 'cashVariance', 'cashVarianceExplanation',
      'topPrize', 'totalPayout', 'ticketCount', 'sealType',
      'createdAt', 'createdBy', 'status', 'notes'
    ],
    'BingoGames': [
      'gameId', 'sessionId', 'gameNumber', 'gameType', 'gameName',
      'prizeAmount', 'ballsCalled', 'winnerName', 'winnerCardNumber',
      'consolationPaid', 'createdAt', 'createdBy'
    ],
    'CashReconciliation': [
      'reconciliationId', 'sessionId', 'date', 'closetWorker',
      'startingCash', 'bingoCardSales', 'electronicSales', 'miscellaneousSales', 'totalBingoIncome',
      'pullTabGrossReceipts', 'pullTabCashTurnedIn',
      'totalGrossReceipts', 'bingoPrizesPaid', 'pullTabPrizesPaid', 'totalPrizesPaid',
      'netReceipts', 'actualAmountDeposited',
      'bingoOffage', 'bingoOffagePercent', 'pullTabOffage', 'pullTabOffagePercent',
      'combinedOffage', 'combinedOffagePercent', 'offageStatus', 'offageExplanation',
      'depositorName', 'depositSlipNumber', 'bankVerified',
      'createdAt', 'createdBy', 'approved', 'approvedBy', 'approvedAt'
    ],
    'OffageTracking': [
      'date', 'sessionId', 'closetWorker',
      'bingoOffage', 'bingoOffagePercent', 'pullTabOffage', 'pullTabOffagePercent',
      'combinedOffage', 'combinedOffagePercent', 'status', 'explanation', 'createdAt'
    ],
    'AuditLog': [
      'timestamp', 'user', 'action', 'recordType', 'recordId', 'data', 'userKey'
    ]
  };
  
  // Create or update each sheet
  Object.keys(sheetStructures).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(sheetStructures[sheetName]);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, sheetStructures[sheetName].length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f0f0f0');
      headerRange.setBorder(true, true, true, true, true, true);
    }
  });
  
  return 'All sheets initialized successfully';
}
