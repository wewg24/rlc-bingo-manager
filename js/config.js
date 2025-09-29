// Configuration - Make CONFIG globally available
window.CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbycm0NuPj3Y_7LZU7HaB54KB87hLHbDW8e3AQ8QwSrVXktKsiP9eusYK6z_whwuxL024A/exec',
    APP_NAME: 'RLC Bingo Manager',
    VERSION: '11.8.3',
    
    STORAGE_KEYS: {
        CURRENT_SESSION: 'rlc_current_session',
        DRAFT_DATA: 'rlc_draft_data',
        SYNC_QUEUE: 'rlc_sync_queue',
        THEME: 'rlc_theme',
        PULL_TAB_LIBRARY: 'rlc_pulltab_library'
    },
    
    SESSION_TYPES: {
        '5-1': '1st/5th Monday',
        '6-2': '2nd Monday',
        '7-3': '3rd Monday',
        '8-4': '4th Monday'
    },
    
    PAPER_TYPES: [
        { id: 'eb', name: 'Early Birds', hasFree: true },
        { id: '6f', name: '6 Face', hasFree: true },
        { id: '9fs', name: '9 Face Solid Border', hasFree: false },
        { id: '9fst', name: '9 Face Stripe Border', hasFree: false },
        { id: 'p3', name: 'Progressive 3 Face ($1)', hasFree: false },
        { id: 'p18', name: 'Progressive 18 Face ($5)', hasFree: false }
    ],
    
    POS_ITEMS: [
        // Miscellaneous category
        { id: 'dauber', name: 'Dauber', price: 2, category: 'Miscellaneous' },

        // Paper category (alphabetical)
        { id: 'birthday', name: 'Birthday Pack', price: 0, category: 'Paper' },
        { id: 'coverall', name: 'Coverall Extra', price: 1, category: 'Paper' },
        { id: 'double-action', name: 'Early Bird Double', price: 5, category: 'Paper' },
        { id: 'letter-x', name: 'Letter X Extra', price: 1, category: 'Paper' },
        { id: 'number7', name: 'Number 7 Extra', price: 1, category: 'Paper' },
        { id: '18-face-prog', name: 'Progressive 18 Face', price: 5, category: 'Paper' },
        { id: '3-face-prog', name: 'Progressive 3 Face', price: 1, category: 'Paper' },
        { id: '6-face', name: 'Six Face', price: 10, category: 'Paper' },
        { id: '9-face-solid', name: 'Nine Face Solid', price: 15, category: 'Paper' },
        { id: '9-face-stripe', name: 'Nine Face Stripe', price: 10, category: 'Paper' }
    ],

    MANUAL_COUNT_ITEMS: [
        { id: 'eb', name: 'Early Birds', hasFree: true },
        { id: '6f', name: '6 Face', hasFree: true },
        { id: '9fs', name: '9 Face Solid Border', hasFree: false },
        { id: '9fst', name: '9 Face Stripe Border', hasFree: false },
        { id: 'p3', name: 'Progressive 3 Face ($1)', hasFree: false },
        { id: 'p18', name: 'Progressive 18 Face ($5)', hasFree: false }
    ]
};
