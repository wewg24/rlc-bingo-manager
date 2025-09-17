// Configuration
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbzQj-363T7fBf198d6e5uooia0fTLq1dNcdaVcjABZNz9EElL4cZhLXEz2DdfH0YzAYcA/exec',
    APP_NAME: 'RLC Bingo Manager',
    VERSION: '11.0.4',
    
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
        { id: '6face', name: '6 Face', price: 10 },
        { id: '9solid', name: '9 Face Solid', price: 15 },
        { id: '9stripe', name: '9 Face Stripe', price: 10 },
        { id: 'birthday', name: 'Birthday Pack (BOGO)', price: 0 },
        { id: 'prog18', name: 'Progressive 18 Face', price: 5 },
        { id: 'prog3', name: 'Progressive 3 Face', price: 1 },
        { id: 'letterx', name: 'Letter X Extra', price: 1 },
        { id: 'number7', name: 'Number 7 Extra', price: 1 },
        { id: 'coverall', name: 'Coverall Extra', price: 1 },
        { id: 'ebd', name: 'Early Bird Double', price: 5 }
    ]
};
