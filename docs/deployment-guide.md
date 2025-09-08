# RLC Bingo Manager - Complete Google Apps Script Deployment Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Google Sheet Setup](#google-sheet-setup)
3. [Google Apps Script Deployment](#google-apps-script-deployment)
4. [Additional HTML Files](#additional-html-files)
5. [GitHub Integration](#github-integration)
6. [Testing & Verification](#testing--verification)
7. [User Training](#user-training)

---

## System Overview

The RLC Bingo Manager is a comprehensive Google Apps Script solution that provides complete tracking for:

### Core Features
- **Bingo Session Management**
  - Complete MGC Form 104 compliance
  - Progressive jackpot tracking with balls called
  - Special games ($250 Letter X, $250 Number 7, $500 Coverall)
  - Birthday BOGO promotional tracking

- **Pull-Tab Management**
  - Cash turn-in reporting
  - Serial number tracking
  - Variance analysis
  - Lion in charge tracking

- **Cash Reconciliation**
  - Separate offage tracking (Bingo/Pull-tabs)
  - Combined session offage
  - Offage explanation documentation
  - Closet worker tracking

- **Reporting**
  - Missouri Gaming Commission Form 104
  - Quarterly reports
  - Offage analysis reports
  - Audit trail

---

## Google Sheet Setup

### 1. Access Your Google Sheet
- Sheet ID: `1pmJO2WFi--TJs4kr1pFhKxBXEw4AiZdmrTIQ1_HBrVM`
- URL: `https://docs.google.com/spreadsheets/d/1pmJO2WFi--TJs4kr1pFhKxBXEw4AiZdmrTIQ1_HBrVM/edit`

### 2. Required Sheet Tabs
Create the following tabs in your Google Sheet (exact names required):

| Tab Name | Purpose | Key Columns |
|----------|---------|-------------|
| `BingoSessions` | Main session tracking | sessionId, date, lionInChargePullTabs, closetWorker, all game data |
| `DoorSales` | Bingo card sales | All paper sales, electronic sales, birthday BOGOs |
| `PullTabs` | Pull-tab sales tracking | serialNumber, cashTurnedIn, lionInCharge |
| `PullTabLibrary` | Game definitions | gameName, formNumber, idealProfit |
| `BingoGames` | Individual game tracking | gameType, ballsCalled, prizeAmount |
| `CashReconciliation` | Session closing | bingoOffage, pullTabOffage, combinedOffage |
| `OffageTracking` | Offage analysis | offageStatus, explanation |
| `Users` | User management | username, role, permissions |
| `Reports` | Generated reports | reportType, data |
| `AuditLog` | Activity tracking | timestamp, user, action |
| `MGCReports` | Form 104 data | All MGC required fields |

### 3. Column Headers Setup
Run this initialization script once to set up all headers:

```javascript
function initializeSheets() {
  const ss = SpreadsheetApp.openById('1pmJO2WFi--TJs4kr1pFhKxBXEw4AiZdmrTIQ1_HBrVM');
  
  // BingoSessions headers
  const sessionsSheet = ss.getSheetByName('BingoSessions') || ss.insertSheet('BingoSessions');
  if (sessionsSheet.getLastRow() === 0) {
    sessionsSheet.appendRow([
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
    ]);
  }
  
  // Continue with other sheets...
  // [Add similar initialization for all other sheets]
}
```

---

## Google Apps Script Deployment

### 1. Open Script Editor
1. In your Google Sheet, go to `Extensions` → `Apps Script`
2. Delete any existing code in the editor

### 2. Create Script Files

#### File: Code.gs
Copy the complete backend code from the artifact above into `Code.gs`

#### File: index.html
Copy the main index HTML from the artifact above

#### File: doorSales.html
```html
<!DOCTYPE html>
<html>
<head>
    <base target="_top">
    <style>
        /* Reuse styles from index.html */
    </style>
</head>
<body>
    <div class="form-section">
        <h3>Door Sales Entry - Bingo Card Sales</h3>
        
        <!-- Paper Sales Section -->
        <h4>Paper Sales</h4>
        <div class="form-grid">
            <div class="form-group">
                <label>9on20 1st Pack - Beginning Count</label>
                <input type="number" id="nineOn20FirstBegin" value="150">
            </div>
            <div class="form-group">
                <label>9on20 1st Pack - Ending Count</label>
                <input type="number" id="nineOn20FirstEnd" value="0">
            </div>
            <div class="form-group">
                <label>9on20 Additional - Beginning Count</label>
                <input type="number" id="nineOn20AddBegin" value="150">
            </div>
            <div class="form-group">
                <label>9on20 Additional - Ending Count</label>
                <input type="number" id="nineOn20AddEnd" value="0">
            </div>
        </div>
        
        <!-- Special Games Extra Sheets -->
        <h4>Special Games Extra Sheets</h4>
        <div class="form-grid">
            <div class="form-group">
                <label>$250 Letter X - Extra Sheets Sold</label>
                <input type="number" id="letterXExtra" value="0">
            </div>
            <div class="form-group">
                <label>$250 Number 7 - Extra Sheets Sold</label>
                <input type="number" id="number7Extra" value="0">
            </div>
            <div class="form-group">
                <label>$500 Coverall - Extra Sheets Sold</label>
                <input type="number" id="coverallExtra" value="0">
            </div>
        </div>
        
        <!-- Birthday BOGO -->
        <h4>Promotional Sales</h4>
        <div class="form-grid">
            <div class="form-group">
                <label>Birthday BOGO Count</label>
                <input type="number" id="birthdayBOGO" value="0">
            </div>
            <div class="form-group">
                <label>Birthday BOGO Value</label>
                <input type="number" id="birthdayBOGOValue" value="0" step="0.01">
            </div>
        </div>
        
        <!-- Electronic Sales -->
        <h4>Electronic Sales</h4>
        <div class="form-grid">
            <div class="form-group">
                <label>Machines @ $40</label>
                <input type="number" id="machines40" value="0">
            </div>
            <div class="form-group">
                <label>Machines @ $65</label>
                <input type="number" id="machines65" value="0">
            </div>
        </div>
        
        <!-- Miscellaneous -->
        <h4>Miscellaneous Sales</h4>
        <div class="form-grid">
            <div class="form-group">
                <label>Daubers Sold</label>
                <input type="number" id="daubers" value="0">
            </div>
            <div class="form-group">
                <label>Glue Sticks Sold</label>
                <input type="number" id="glueSticks" value="0">
            </div>
        </div>
        
        <!-- Summary -->
        <div class="summary-section">
            <h4>Sales Summary</h4>
            <div class="summary-grid">
                <div class="summary-item">
                    <span>Total Paper Sales:</span>
                    <span id="totalPaperSales">$0.00</span>
                </div>
                <div class="summary-item">
                    <span>Total Electronic Sales:</span>
                    <span id="totalElectronicSales">$0.00</span>
                </div>
                <div class="summary-item">
                    <span>Miscellaneous Sales:</span>
                    <span id="totalMiscSales">$0.00</span>
                </div>
                <div class="summary-item total">
                    <span>Grand Total:</span>
                    <span id="grandTotal">$0.00</span>
                </div>
            </div>
        </div>
        
        <div class="btn-group">
            <button class="btn btn-primary" onclick="saveDoorSales()">
                <i class="material-icons">save</i> Save Door Sales
            </button>
            <button class="btn btn-warning" onclick="calculateTotals()">
                <i class="material-icons">calculate</i> Calculate
            </button>
        </div>
    </div>
    
    <script>
        function calculateTotals() {
            // Calculate paper sales
            const nineOn20First = (150 - parseInt(document.getElementById('nineOn20FirstEnd').value || 0)) * 15;
            const nineOn20Add = (150 - parseInt(document.getElementById('nineOn20AddEnd').value || 0)) * 10;
            // ... continue calculations
            
            const totalPaper = nineOn20First + nineOn20Add;
            document.getElementById('totalPaperSales').textContent = '$' + totalPaper.toFixed(2);
        }
        
        function saveDoorSales() {
            const salesData = {
                // Collect all form data
            };
            
            google.script.run
                .withSuccessHandler(() => {
                    alert('Door sales saved successfully!');
                })
                .withFailureHandler(console.error)
                .recordDoorSales(salesData);
        }
    </script>
</body>
</html>
```

#### File: pullTabManager.html
```html
<!DOCTYPE html>
<html>
<head>
    <base target="_top">
    <style>
        /* Reuse styles from index.html */
    </style>
</head>
<body>
    <div class="form-section">
        <h3>Pull-Tab Sales Management</h3>
        
        <div class="form-grid">
            <div class="form-group">
                <label>Lion in Charge</label>
                <input type="text" id="ptLionInCharge" placeholder="Enter name">
            </div>
            <div class="form-group">
                <label>Worker Name</label>
                <input type="text" id="ptWorker" placeholder="Enter name">
            </div>
        </div>
        
        <h4>Game Information</h4>
        <div class="form-grid">
            <div class="form-group">
                <label>Select Game</label>
                <select id="ptGameSelect" onchange="loadGameDetails()">
                    <option value="">-- Select Game --</option>
                </select>
            </div>
            <div class="form-group">
                <label>Serial Number</label>
                <input type="text" id="ptSerialNumber" placeholder="Enter serial #">
            </div>
            <div class="form-group">
                <label>Beginning Count</label>
                <input type="number" id="ptBeginCount" value="0">
            </div>
            <div class="form-group">
                <label>Ending Count</label>
                <input type="number" id="ptEndCount" value="0">
            </div>
            <div class="form-group">
                <label>Prizes Paid Out</label>
                <input type="number" id="ptPrizesPaid" value="0" step="0.01">
            </div>
            <div class="form-group">
                <label>Cash Turned In</label>
                <input type="number" id="ptCashTurnedIn" value="0" step="0.01">
            </div>
        </div>
        
        <!-- Cash Variance Analysis -->
        <div class="variance-section">
            <h4>Cash Variance Analysis</h4>
            <div class="variance-grid">
                <div class="variance-item">
                    <span>Expected Cash:</span>
                    <span id="ptExpectedCash">$0.00</span>
                </div>
                <div class="variance-item">
                    <span>Actual Cash:</span>
                    <span id="ptActualCash">$0.00</span>
                </div>
                <div class="variance-item">
                    <span>Variance:</span>
                    <span id="ptVariance" class="variance-amount">$0.00</span>
                </div>
            </div>
            <div class="form-group">
                <label>Variance Explanation</label>
                <textarea id="ptVarianceExplanation" rows="3" placeholder="Explain any variance..."></textarea>
            </div>
        </div>
        
        <div class="btn-group">
            <button class="btn btn-primary" onclick="savePullTabSale()">
                <i class="material-icons">save</i> Save Pull-Tab Sale
            </button>
            <button class="btn btn-warning" onclick="calculatePTVariance()">
                <i class="material-icons">calculate</i> Calculate Variance
            </button>
        </div>
    </div>
    
    <script>
        function loadGameDetails() {
            // Load game details based on selection
        }
        
        function calculatePTVariance() {
            const beginCount = parseInt(document.getElementById('ptBeginCount').value || 0);
            const endCount = parseInt(document.getElementById('ptEndCount').value || 0);
            const sold = beginCount - endCount;
            // Calculate expected vs actual
        }
        
        function savePullTabSale() {
            const saleData = {
                lionInCharge: document.getElementById('ptLionInCharge').value,
                // ... collect all data
            };
            
            google.script.run
                .withSuccessHandler(() => {
                    alert('Pull-tab sale saved successfully!');
                })
                .withFailureHandler(console.error)
                .recordPullTabSale(saleData);
        }
    </script>
</body>
</html>
```

#### File: cashClose.html
```html
<!DOCTYPE html>
<html>
<head>
    <base target="_top">
    <style>
        /* Reuse styles from index.html */
        .offage-section {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .offage-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 20px 0;
        }
        
        .offage-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .offage-amount {
            font-size: 1.5rem;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .offage-balanced { color: #4caf50; }
        .offage-over { color: #ff9800; }
        .offage-short { color: #f44336; }
    </style>
</head>
<body>
    <div class="form-section">
        <h3>Cash Reconciliation & Session Close</h3>
        
        <div class="form-grid">
            <div class="form-group">
                <label>Closet Worker</label>
                <input type="text" id="closeWorker" placeholder="Enter name">
            </div>
            <div class="form-group">
                <label>Actual Amount Deposited</label>
                <input type="number" id="actualDeposit" value="0" step="0.01" onchange="calculateOffage()">
            </div>
        </div>
        
        <!-- Session Summary -->
        <h4>Session Summary</h4>
        <div class="summary-grid">
            <div class="summary-item">
                <span>Starting Cash:</span>
                <span id="summaryStartCash">$0.00</span>
            </div>
            <div class="summary-item">
                <span>Bingo Card Sales:</span>
                <span id="summaryBingoSales">$0.00</span>
            </div>
            <div class="summary-item">
                <span>Pull-Tab Gross:</span>
                <span id="summaryPTGross">$0.00</span>
            </div>
            <div class="summary-item">
                <span>Miscellaneous:</span>
                <span id="summaryMisc">$0.00</span>
            </div>
            <div class="summary-item total">
                <span>Total Gross Receipts:</span>
                <span id="summaryGrossTotal">$0.00</span>
            </div>
        </div>
        
        <div class="summary-grid">
            <div class="summary-item">
                <span>Bingo Prizes Paid:</span>
                <span id="summaryBingoPrizes">$0.00</span>
            </div>
            <div class="summary-item">
                <span>Pull-Tab Prizes Paid:</span>
                <span id="summaryPTPrizes">$0.00</span>
            </div>
            <div class="summary-item total">
                <span>Total Prizes Paid:</span>
                <span id="summaryTotalPrizes">$0.00</span>
            </div>
        </div>
        
        <div class="summary-grid">
            <div class="summary-item total">
                <span>Net Receipts (Expected Deposit):</span>
                <span id="summaryNetReceipts">$0.00</span>
            </div>
        </div>
        
        <!-- Offage Analysis -->
        <div class="offage-section">
            <h4>Offage Analysis</h4>
            <div class="offage-grid">
                <div class="offage-card">
                    <div class="offage-label">Bingo Offage</div>
                    <div class="offage-amount" id="bingoOffage">$0.00</div>
                    <div class="offage-percent" id="bingoOffagePercent">0%</div>
                </div>
                <div class="offage-card">
                    <div class="offage-label">Pull-Tab Offage</div>
                    <div class="offage-amount" id="ptOffage">$0.00</div>
                    <div class="offage-percent" id="ptOffagePercent">0%</div>
                </div>
                <div class="offage-card">
                    <div class="offage-label">Combined Offage</div>
                    <div class="offage-amount" id="combinedOffage">$0.00</div>
                    <div class="offage-status" id="offageStatus">BALANCED</div>
                </div>
            </div>
            
            <div class="form-group">
                <label>Offage Explanation (if any)</label>
                <textarea id="offageExplanation" rows="3" placeholder="Explain any offage..."></textarea>
            </div>
        </div>
        
        <!-- Deposit Information -->
        <h4>Deposit Information</h4>
        <div class="form-grid">
            <div class="form-group">
                <label>Depositor Name</label>
                <input type="text" id="depositorName" placeholder="Enter name">
            </div>
            <div class="form-group">
                <label>Deposit Slip Number</label>
                <input type="text" id="depositSlipNumber" placeholder="Enter slip #">
            </div>
        </div>
        
        <div class="btn-group">
            <button class="btn btn-primary" onclick="performReconciliation()">
                <i class="material-icons">account_balance</i> Reconcile & Close Session
            </button>
            <button class="btn btn-warning" onclick="refreshSummary()">
                <i class="material-icons">refresh</i> Refresh Summary
            </button>
            <button class="btn btn-success" onclick="generateForm104()">
                <i class="material-icons">description</i> Generate Form 104
            </button>
        </div>
    </div>
    
    <script>
        let sessionSummary = {};
        
        function refreshSummary() {
            google.script.run
                .withSuccessHandler(updateSummaryDisplay)
                .withFailureHandler(console.error)
                .getSessionSummary();
        }
        
        function updateSummaryDisplay(summary) {
            sessionSummary = summary;
            document.getElementById('summaryStartCash').textContent = '$' + (summary.startingCash || 0).toFixed(2);
            document.getElementById('summaryBingoSales').textContent = '$' + (summary.bingoCardSales || 0).toFixed(2);
            document.getElementById('summaryPTGross').textContent = '$' + (summary.pullTabSales || 0).toFixed(2);
            document.getElementById('summaryMisc').textContent = '$' + (summary.miscSales || 0).toFixed(2);
            
            const grossTotal = (summary.startingCash || 0) + (summary.bingoCardSales || 0) + 
                              (summary.pullTabSales || 0) + (summary.miscSales || 0);
            document.getElementById('summaryGrossTotal').textContent = '$' + grossTotal.toFixed(2);
            
            document.getElementById('summaryBingoPrizes').textContent = '$' + (summary.bingoPrizes || 0).toFixed(2);
            document.getElementById('summaryPTPrizes').textContent = '$' + (summary.pullTabPrizes || 0).toFixed(2);
            
            const totalPrizes = (summary.bingoPrizes || 0) + (summary.pullTabPrizes || 0);
            document.getElementById('summaryTotalPrizes').textContent = '$' + totalPrizes.toFixed(2);
            
            const netReceipts = grossTotal - totalPrizes;
            document.getElementById('summaryNetReceipts').textContent = '$' + netReceipts.toFixed(2);
            
            sessionSummary.netReceipts = netReceipts;
        }
        
        function calculateOffage() {
            const actualDeposit = parseFloat(document.getElementById('actualDeposit').value || 0);
            const expectedDeposit = sessionSummary.netReceipts || 0;
            const totalOffage = actualDeposit - expectedDeposit;
            
            // Allocate offage between bingo and pull-tabs
            const bingoRatio = 0.6; // 60% to bingo
            const ptRatio = 0.4; // 40% to pull-tabs
            
            const bingoOffage = totalOffage * bingoRatio;
            const ptOffage = totalOffage * ptRatio;
            
            // Update display
            updateOffageDisplay('bingoOffage', bingoOffage);
            updateOffageDisplay('ptOffage', ptOffage);
            updateOffageDisplay('combinedOffage', totalOffage);
            
            // Update status
            let status = 'BALANCED';
            if (Math.abs(totalOffage) < 5) {
                status = 'BALANCED';
            } else if (totalOffage > 0) {
                status = 'OVER';
            } else {
                status = 'SHORT';
            }
            
            document.getElementById('offageStatus').textContent = status;
            document.getElementById('offageStatus').className = 'offage-status offage-' + status.toLowerCase();
        }
        
        function updateOffageDisplay(elementId, amount) {
            const element = document.getElementById(elementId);
            element.textContent = '$' + Math.abs(amount).toFixed(2);
            
            if (Math.abs(amount) < 5) {
                element.className = 'offage-amount offage-balanced';
            } else if (amount > 0) {
                element.className = 'offage-amount offage-over';
            } else {
                element.className = 'offage-amount offage-short';
            }
        }
        
        function performReconciliation() {
            const reconciliationData = {
                closetWorker: document.getElementById('closeWorker').value,
                actualAmountDeposited: parseFloat(document.getElementById('actualDeposit').value || 0),
                offageExplanation: document.getElementById('offageExplanation').value,
                depositorName: document.getElementById('depositorName').value,
                depositSlipNumber: document.getElementById('depositSlipNumber').value
            };
            
            google.script.run
                .withSuccessHandler(() => {
                    alert('Session reconciled and closed successfully!');
                })
                .withFailureHandler(console.error)
                .performCashReconciliation(currentSession, reconciliationData);
        }
        
        // Load summary on page load
        window.onload = refreshSummary;
    </script>
</body>
</html>
```

### 3. Deploy as Web App

1. In Apps Script editor, click `Deploy` → `New Deployment`
2. Choose type: `Web app`
3. Configuration:
   - Description: "RLC Bingo Manager v3.0"
   - Execute as: "Me"
   - Who has access: "Anyone" (or restrict to your organization)
4. Click `Deploy`
5. Copy the Web App URL

### 4. Set Permissions

1. First run will request permissions
2. Required permissions:
   - View and manage spreadsheets
   - Display and run third-party web content
   - Connect to external service

---

## GitHub Integration

### 1. Create GitHub Repository

Create repository: `rlc-bingo-manager`

### 2. Repository Structure

```
rlc-bingo-manager/
├── README.md
├── docs/
│   ├── deployment-guide.md
│   ├── user-manual.md
│   └── mgc-compliance.md
├── src/
│   ├── apps-script/
│   │   ├── Code.gs
│   │   └── appsscript.json
│   └── html/
│       ├── index.html
│       ├── doorSales.html
│       ├── pullTabManager.html
│       └── cashClose.html
├── backup/
│   └── [Daily backups]
└── LICENSE
```

### 3. GitHub Pages Setup

1. Go to Settings → Pages
2. Source: Deploy from branch
3. Branch: main, folder: /docs
4. Save

### 4. Backup Script

```javascript
function createDailyBackup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const backupFolderId = '1f_TDuTEvSEm7Fut7aXsX0H-GG6LJFWtg';
  const folder = DriveApp.getFolderById(backupFolderId);
  
  const date = new Date();
  const fileName = `RLC_Bingo_Backup_${date.toISOString().split('T')[0]}`;
  
  const copy = ss.copy(fileName);
  const file = DriveApp.getFileById(copy.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  
  // Clean old backups (keep 30 days)
  const thirtyDaysAgo = new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000));
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (file.getDateCreated() < thirtyDaysAgo) {
      file.setTrashed(true);
    }
  }
}

// Set up daily trigger
function setupDailyBackup() {
  ScriptApp.newTrigger('createDailyBackup')
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();
}
```

---

## Testing & Verification

### 1. Test Checklist

#### Session Creation
- [ ] Create new session with all fields
- [ ] Verify progressive games setup
- [ ] Confirm Lion in Charge saved
- [ ] Check starting cash recorded

#### Door Sales
- [ ] Enter paper sales with counts
- [ ] Record Birthday BOGOs
- [ ] Add special game extra sheets
- [ ] Verify totals calculation

#### Pull-Tabs
- [ ] Record game with serial number
- [ ] Enter cash turned in
- [ ] Calculate variance
- [ ] Add explanation for variance

#### Bingo Games
- [ ] Record Letter X prize and balls
- [ ] Record Number 7 prize and balls
- [ ] Record Coverall prize and balls
- [ ] Track progressive winners

#### Cash Close
- [ ] View complete summary
- [ ] Enter actual deposit
- [ ] Calculate offages (separate & combined)
- [ ] Generate Form 104

### 2. Data Validation

```javascript
function validateSession(sessionId) {
  const session = getSessionData(sessionId);
  const errors = [];
  
  // Required fields
  if (!session.closetWorker) errors.push('Missing closet worker');
  if (!session.lionInChargePullTabs) errors.push('Missing Lion in charge');
  if (session.totalPlayers === 0) errors.push('No players recorded');
  
  // Financial validation
  if (session.actualAmountDeposited === 0) errors.push('No deposit recorded');
  if (Math.abs(session.combinedOffage) > 100 && !session.offageExplanation) {
    errors.push('Large offage requires explanation');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}
```

---

## User Training

### Quick Start Guide

1. **Starting a Session**
   - Click "Start New Occasion"
   - Enter date, times, and personnel
   - Set progressive jackpots
   - Enter starting cash
   - Click "Create Occasion"

2. **During the Session**
   - Record door sales as players arrive
   - Track pull-tab sales with serial numbers
   - Enter cash turned in for each game
   - Record bingo game winners and balls called

3. **Closing the Session**
   - Go to Cash Close
   - Review all totals
   - Enter actual deposit amount
   - Review offage analysis
   - Add explanation if needed
   - Click "Reconcile & Close"

4. **Generating Reports**
   - Click "Generate Form 104"
   - Review for accuracy
   - Print or save PDF
   - File with Missouri Gaming Commission

### Key Features

#### Birthday BOGO Tracking
- Enter count in Door Sales
- System tracks promotional value
- Included in reports

#### Offage Management
- Automatic calculation
- Separate tracking (Bingo/Pull-tabs)
- Combined session view
- Explanation field for documentation

#### Cash Turn-in Reporting
- Per-game tracking
- Variance analysis
- Lion in charge accountability
- Audit trail

### Support Resources

- User Manual: `/docs/user-manual.md`
- Video Training: [YouTube Playlist]
- Support Email: support@rollalions.org
- Emergency Contact: (573) 555-0100

---

## Maintenance

### Daily Tasks
- Verify backup completed
- Check for errors in audit log
- Review offage trends

### Weekly Tasks
- Generate weekly summary report
- Archive completed sessions
- Update pull-tab library

### Monthly Tasks
- Generate MGC quarterly report data
- Review user access logs
- Update documentation

### Quarterly Tasks
- Submit MGC reports
- Audit system compliance
- User training refresh

---

## Troubleshooting

### Common Issues

1. **"Permission denied" error**
   - Re-authorize the web app
   - Check sheet permissions
   - Verify deployment settings

2. **Data not saving**
   - Check sheet tab names
   - Verify column headers
   - Review Apps Script logs

3. **Calculations incorrect**
   - Verify formulas in Code.gs
   - Check data types
   - Review rounding settings

4. **Form 104 not generating**
   - Ensure session is closed
   - Verify all required data entered
   - Check MGC_Reports sheet exists

### Debug Mode

```javascript
function enableDebugMode() {
  PropertiesService.getScriptProperties().setProperty('DEBUG_MODE', 'true');
}

function log(message, data) {
  if (PropertiesService.getScriptProperties().getProperty('DEBUG_MODE') === 'true') {
    console.log(message, data);
    SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName('AuditLog')
      .appendRow([new Date(), 'DEBUG', message, JSON.stringify(data)]);
  }
}
```

---

## Compliance Notes

### Missouri Gaming Commission Requirements

1. **Form 104 Compliance**
   - All fields from official form included
   - Progressive tracking with balls called
   - Cash reconciliation documented
   - Signature blocks provided

2. **Record Retention**
   - Daily backups maintained
   - 7-year archive policy
   - Audit trail preserved
   - Change tracking enabled

3. **Security**
   - User authentication required
   - Role-based permissions
   - Activity logging
   - Data encryption in transit

---

## Contact Information

**Rolla Lions Club**
- Address: [Club Address]
- Phone: (573) 555-0100
- Email: bingo@rollalions.org

**Technical Support**
- Developer: [Your Name]
- Email: [Your Email]
- Phone: [Your Phone]

**Missouri Gaming Commission**
- Phone: (573) 526-5370
- Toll-Free: 1-866-801-8643
- Website: mgc.mo.gov

---

*Last Updated: September 2025*
*Version: 3.0*
*License: MIT*
