// MoneyCount.gs - Fix money count data persistence
function saveMoneyCount(occasionId, moneyCountData) {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName('MoneyCount');
    
    if (!sheet) {
        throw new Error('MoneyCount sheet not found');
    }
    
    const timestamp = new Date();
    const rows = [];
    
    // Process bills
    const bills = [100, 50, 20, 10, 5, 2, 1];
    bills.forEach(denomination => {
        const count = moneyCountData[`bill_${denomination}`] || 0;
        if (count > 0) {
            rows.push([
                Utilities.getUuid(),
                occasionId,
                denomination,
                count,
                denomination * count,
                'Bill',
                timestamp
            ]);
        }
    });
    
    // Process coins
    const coins = [
        { name: 'Quarters', value: 0.25, field: 'quarters' },
        { name: 'Dimes', value: 0.10, field: 'dimes' },
        { name: 'Nickels', value: 0.05, field: 'nickels' },
        { name: 'Pennies', value: 0.01, field: 'pennies' }
    ];
    
    coins.forEach(coin => {
        const count = moneyCountData[coin.field] || 0;
        if (count > 0) {
            rows.push([
                Utilities.getUuid(),
                occasionId,
                coin.name,
                count,
                coin.value * count,
                'Coin',
                timestamp
            ]);
        }
    });
    
    // Process rolled coins
    if (moneyCountData.rolledCoins && moneyCountData.rolledCoins > 0) {
        rows.push([
            Utilities.getUuid(),
            occasionId,
            'Rolled Coins',
            1,
            moneyCountData.rolledCoins,
            'Rolled',
            timestamp
        ]);
    }
    
    // Process checks
    if (moneyCountData.checks && moneyCountData.checks.length > 0) {
        moneyCountData.checks.forEach(check => {
            rows.push([
                Utilities.getUuid(),
                occasionId,
                `Check #${check.number}`,
                1,
                check.amount,
                'Check',
                timestamp
            ]);
        });
    }
    
    // Append all rows at once
    if (rows.length > 0) {
        const lastRow = sheet.getLastRow();
        sheet.getRange(lastRow + 1, 1, rows.length, 7).setValues(rows);
    }
    
    return { success: true, rowsAdded: rows.length };
}