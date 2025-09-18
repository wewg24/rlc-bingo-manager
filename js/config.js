// Remove any existing CONFIG declaration and use this single source
const CONFIG = {
    SPREADSHEET_ID: '1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc',
    SHEET_NAMES: {
        occasions: 'Occasions',
        sessionGames: 'SessionGames',
        pullTabUsage: 'PullTabUsage',
        pullTabLibrary: 'PullTabLibrary',
        doorSales: 'DoorSales',
        moneyCount: 'MoneyCount',
        metrics: 'Metrics'
    },
    SESSION_TYPES: {
        MONDAY: 'Monday',
        SATURDAY: 'Saturday',
        SUNDAY: 'Sunday',
        SPECIAL: 'Special'
    },
    // POS Items configuration with proper categorization
    POS_ITEMS: {
        ELECTRONIC: [
            { name: 'Units - Small Blue', price: 5.00, category: 'Electronic' },
            { name: 'Units - Large Blue', price: 10.00, category: 'Electronic' },
            { name: 'Units - Large Green', price: 20.00, category: 'Electronic' },
            { name: 'Units - Large Orange', price: 30.00, category: 'Electronic' },
            { name: 'Units - Large Pink', price: 50.00, category: 'Electronic' }
        ],
        MISCELLANEOUS: [
            { name: 'Daubers', price: 3.00, category: 'Miscellaneous' },
            { name: 'Lapboards', price: 2.00, category: 'Miscellaneous' },
            { name: 'Markers', price: 1.00, category: 'Miscellaneous' }
        ],
        PAPER: [
            { name: 'Booklets - Single', price: 1.00, category: 'Paper' },
            { name: 'Booklets - Double', price: 2.00, category: 'Paper' },
            { name: 'Booklets - Triple', price: 3.00, category: 'Paper' },
            { name: 'Quickies - 3 on 1', price: 1.00, category: 'Paper' },
            { name: 'Quickies - 3 on 3', price: 3.00, category: 'Paper' },
            { name: 'Quickies - 3 on 6', price: 5.00, category: 'Paper' },
            { name: 'Quickies - 3 on 9', price: 10.00, category: 'Paper' }
        ]
    }
};

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
