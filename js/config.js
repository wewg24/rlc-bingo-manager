// Configuration - Make CONFIG globally available
window.CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbzuXre-DUU_4a1fbl_RyYR9SeBs_BNij6hneRgxP-Mlc08J3hzLWhIG5Fun4krB3iABlw/exec',
    APP_NAME: 'RLC Bingo Manager',
    VERSION: '12.3.1',
    
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
        { id: '6f', name: '6 Packs', hasFree: true },
        { id: '9fs', name: 'Solid Border 9', hasFree: false },
        { id: '9fst', name: 'Stripe Border 9', hasFree: false },
        { id: 'p3', name: '$1.00 Progressives', hasFree: false },
        { id: 'p18', name: '$5.00 Progressives', hasFree: false }
    ],
    
    POS_ITEMS: [
        // Electronic Machines (at top for door sales entry order)
        { id: 'small-machine', name: '27reg/18pro (Small Machine)', price: 40, category: 'Electronic' },
        { id: 'large-machine', name: '45reg/36pro (Large Machine)', price: 65, category: 'Electronic' },

        // Miscellaneous category
        { id: 'dauber', name: 'Dauber', price: 2, category: 'Miscellaneous' },

        // Paper category (alphabetical, with 6/9-face before birthday)
        { id: '6-face', name: '6 Face', price: 10, category: 'Paper' },
        { id: '9-face-solid', name: '9 Face Solid', price: 15, category: 'Paper' },
        { id: '9-face-stripe', name: '9 Face Stripe', price: 10, category: 'Paper' },
        { id: 'birthday', name: 'Birthday Pack', price: 0, category: 'Paper' },
        { id: 'coverall', name: 'Coverall Extra', price: 1, category: 'Paper' },
        { id: 'double-action', name: 'Early Bird Double', price: 5, category: 'Paper' },
        { id: 'letter-x', name: 'Letter X Extra', price: 1, category: 'Paper' },
        { id: 'number7', name: 'Number 7 Extra', price: 1, category: 'Paper' },
        { id: '18-face-prog', name: 'Progressive 18 Face', price: 5, category: 'Paper' },
        { id: '3-face-prog', name: 'Progressive 3 Face', price: 1, category: 'Paper' }
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
