// DataPersistence.gs - Ensure proper data saving
function saveOccasion(occasionData) {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const occasionId = occasionData.id || Utilities.getUuid();
    
    try {
        // Begin transaction-like operation
        const lock = LockService.getScriptLock();
        lock.waitLock(30000); // Wait up to 30 seconds
        
        // Save main occasion data
        saveOccasionRecord(spreadsheet, occasionId, occasionData);
        
        // Save related data
        if (occasionData.doorSales) {
            saveDoorSales(occasionId, occasionData.doorSales);
        }
        
        if (occasionData.sessionGames) {
            saveSessionGames(occasionId, occasionData.sessionGames);
        }
        
        if (occasionData.pullTabs) {
            savePullTabUsage(occasionId, occasionData.pullTabs);
        }
        
        if (occasionData.moneyCount) {
            saveMoneyCount(occasionId, occasionData.moneyCount);
        }
        
        // Calculate and save metrics
        calculateAndSaveMetrics(occasionId, occasionData);
        
        lock.releaseLock();
        
        return {
            success: true,
            occasionId: occasionId,
            message: 'Occasion saved successfully'
        };
        
    } catch (error) {
        Logger.log('Error saving occasion: ' + error.toString());
        throw error;
    }
}

function saveOccasionRecord(spreadsheet, occasionId, data) {
    const sheet = spreadsheet.getSheetByName('Occasions');
    const timestamp = new Date();
    
    const row = [
        occasionId,
        data.mondayDate,
        data.sessionType,
        data.status || 'Draft',
        timestamp,
        timestamp,
        data.totalRevenue || 0,
        data.totalPrizes || 0,
        data.netProfit || 0,
        Occasion.getActiveUser().getEmail(),
        data.notes || ''
    ];
    
    // Check if updating existing record
    const existingRowIndex = findRowByOccasionId(sheet, occasionId);
    
    if (existingRowIndex > 0) {
        // Update existing row
        sheet.getRange(existingRowIndex, 1, 1, row.length).setValues([row]);
    } else {
        // Add new row
        sheet.appendRow(row);
    }
}

function findRowByOccasionId(sheet, occasionId) {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) { // Skip header row
        if (data[i][0] === occasionId) {
            return i + 1; // Return 1-indexed row number
        }
    }
    return -1;

}

