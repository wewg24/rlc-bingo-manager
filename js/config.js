// RLC Bingo Manager Configuration
// Version: 11.0.4
// Single source of truth for all configuration settings

// Remove any conflicting CONFIG declarations from other files
const CONFIG = {
    // Core API Configuration
    API_URL: 'https://script.google.com/macros/s/AKfycbzQj-363T7fBf198d6e5uooia0fTLq1dNcdaVcjABZNz9EElL4cZhLXEz2DdfH0YzAYcA/exec',
    VERSION: '11.0.4',
    
    // Google Sheets Configuration
    SPREADSHEET_ID: '1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc',
    DRIVE_FOLDER_ID: '13y-jTy3lcFazALyI4DrmeaQx8kLkCY-a',
    PHOTO_FOLDER_ID: '1g0lfGUqI_dCeqv41ZxLaTyZqDAXt5Iyv',
    REPORTS_FOLDER_ID: '1KiT6GB8onDmXxwNYpi9npsBzxOvDvxz4',
    
    // Sheet Names
    SHEET_NAMES: {
        occasions: 'Occasions',
        sessionGames: 'SessionGames',
        pullTabUsage: 'PullTabUsage',
        pullTabLibrary: 'PullTabLibrary',
        paperBingo: 'PaperBingo',
        posDoorSales: 'POSDoorSales',
        electronic: 'Electronic',
        moneyCount: 'MoneyCount',
        financialSummary: 'FinancialSummary',
        metrics: 'Metrics'
    },
    
    // Local Storage Keys
    STORAGE_KEYS: {
        DRAFT: 'rlc_bingo_draft',
        SYNC_QUEUE: 'rlc_bingo_sync_queue',
        PULL_TAB_LIBRARY: 'rlc_bingo_pull_tab_library',
        OFFLINE_DATA: 'rlc_bingo_offline_data',
        THEME: 'rlc_bingo_theme',
        LAST_SYNC: 'rlc_bingo_last_sync'
    },
    
    // Session Types Configuration
    SESSION_TYPES: {
        '5-1': 'Monday Session 5-1',
        '6-2': 'Monday Session 6-2',
        'SATURDAY': 'Saturday',
        'SUNDAY': 'Sunday',
        'SPECIAL': 'Special Event'
    },
    
    // POS Items Configuration
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
    },
    
    // Progressive Configuration
    PROGRESSIVE: {
        DEFAULT_JACKPOT: 1500,
        DEFAULT_BALLS: 48,
        CONSOLATION_PRIZE: 200,
        MAX_BALLS: 75
    },
    
    // UI Configuration
    UI: {
        THEME_STORAGE_KEY: 'rlc_bingo_theme',
        MOBILE_BREAKPOINT: 768,
        TOUCH_TARGET_SIZE: 44
    },
    
    // Sync Configuration
    SYNC: {
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
        AUTO_SYNC_INTERVAL: 300000, // 5 minutes
        OFFLINE_QUEUE_LIMIT: 100
    }
};

// Prevent redeclaration by checking if already exists
if (typeof window !== 'undefined') {
    // Browser environment
    if (window.CONFIG) {
        console.warn('CONFIG already exists, merging configurations');
        Object.assign(window.CONFIG, CONFIG);
    } else {
        window.CONFIG = CONFIG;
    }
} else if (typeof global !== 'undefined') {
    // Node.js environment
    global.CONFIG = CONFIG;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Log configuration load
console.log(`RLC Bingo Manager Config v${CONFIG.VERSION} loaded`);
