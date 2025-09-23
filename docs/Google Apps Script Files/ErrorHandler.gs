// ErrorHandler.js - Comprehensive error handling
function handleError(error, context) {
    const errorLog = {
        timestamp: new Date().toISOString(),
        context: context,
        error: error.toString(),
        stack: error.stack,
        user: Occasion.getActiveUser().getEmail()
    };
    
    // Log to console
    console.error('Error in ' + context, errorLog);
    
    // Log to sheet for debugging
    try {
        const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
        let errorSheet = spreadsheet.getSheetByName('ErrorLog');
        
        if (!errorSheet) {
            errorSheet = spreadsheet.insertSheet('ErrorLog');
            errorSheet.appendRow(['Timestamp', 'Context', 'Error', 'Stack', 'User']);
        }
        
        errorSheet.appendRow([
            errorLog.timestamp,
            errorLog.context,
            errorLog.error,
            errorLog.stack,
            errorLog.user
        ]);
    } catch (logError) {
        console.error('Failed to log error to sheet:', logError);
    }
    
    // Return user-friendly error message
    return {
        success: false,
        error: 'An error occurred: ' + error.toString(),
        context: context
    };
}

// Wrap all backend functions with error handling
function withErrorHandling(fn, context) {
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            return handleError(error, context);
        }
    };
}

