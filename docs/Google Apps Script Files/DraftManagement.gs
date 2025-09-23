// DraftManagement.gs - Handle draft occasions
function saveDraft(draftData) {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName('Occasions');
    
    draftData.status = 'Draft';
    draftData.id = draftData.id || Utilities.getUuid();
    
    // Save to a temporary cache for quick retrieval
    const cache = CacheService.getUserCache();
    cache.put(`draft_${draftData.id}`, JSON.stringify(draftData), 3600); // Cache for 1 hour
    
    // Also save to sheet for persistence
    saveOccasion(draftData);
    
    return { success: true, id: draftData.id };
}

function getDraft(draftId) {
    // Try cache first
    const cache = CacheService.getUserCache();
    const cachedData = cache.get(`draft_${draftId}`);
    
    if (cachedData) {
        return JSON.parse(cachedData);
    }
    
    // Fall back to sheet
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName('Occasions');
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === draftId && data[i][3] === 'Draft') {
            // Reconstruct draft data
            return reconstructDraftData(draftId);
        }
    }
    
    return null;
}

function getAllDrafts() {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName('Occasions');
    
    if (sheet.getLastRow() <= 1) {
        return [];
    }
    
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    
    return data
        .filter(row => row[3] === 'Draft')
        .map(row => ({
            id: row[0],
            date: row[1],
            sessionType: row[2],
            status: row[3],
            createdAt: row[4],
            totalRevenue: row[6],
            totalPrizes: row[7]
        }));
}