// Configuration for RLC Bingo Manager
const CONFIG = {
  // Google Apps Script Web App URL
  API_URL: 'https://script.google.com/macros/s/AKfycbzQj-363T7fBf198d6e5uooia0fTLq1dNcdaVcjABZNz9EElL4cZhLXEz2DdfH0YzAYcA/exec',
  
  // App settings
  APP_NAME: 'RLC Bingo Manager',
  VERSION: '9.1.0',
  
  // Storage keys
  STORAGE_KEYS: {
    USER: 'rlc_user',
    TOKEN: 'rlc_token',
    CURRENT_SESSION: 'rlc_current_session',
    SYNC_QUEUE: 'rlc_sync_queue',
    OFFLINE_DATA: 'rlc_offline_data'
  },
  
  // Session types and configurations
  SESSION_TYPES: {
    '5-1': '1st/5th Monday',
    '6-2': '2nd Monday',
    '7-3': '3rd Monday',
    '8-4': '4th Monday'
  },
  
  // Session-specific game configurations
  GAMES: {
    '5-1': [
      { number: 1, color: 'Blue', name: 'Small Picture Frame', prize: 25 },
      { number: 2, color: 'Orange', name: 'Letter X', prize: 25 },
      { number: 3, color: 'Green', name: 'Small Letter T', prize: 25 },
      { number: 4, color: 'Yellow', name: 'Six Pack', prize: 50 },
      { number: 5, color: 'Pink', name: 'Layer Cake', prize: 50 },
      { number: 6, color: 'Gray', name: 'Hardway Bingo', prize: 100 },
      { number: 7, color: 'Olive', name: 'Large Picture Frame', prize: 75 },
      { number: 8, color: 'Brown', name: 'Coverall', prize: 100 },
      { number: 9, color: 'Blue', name: 'Top and Bottom', prize: 50 },
      { number: 10, color: 'Orange', name: 'Letter Z', prize: 50 },
      { number: 11, color: 'Green', name: 'Double Bingo', prize: 50 },
      { number: 12, color: 'Yellow', name: 'Inside Square', prize: 75 },
      { number: 13, color: 'Pink', name: 'Arrow', prize: 50 },
      { number: 14, color: 'Gray', name: 'Railroad Tracks', prize: 50 },
      { number: 15, color: 'Olive', name: 'Large Letter T', prize: 50 },
      { number: 16, color: 'Brown', name: 'Nine Pack', prize: 100 },
      { number: 17, color: 'Special', name: 'Blackout Bingo', prize: 200 }
    ],
    '6-2': [
      { number: 1, color: 'Blue', name: 'Letter L', prize: 30 },
      { number: 2, color: 'Orange', name: 'Outside Square', prize: 30 },
      { number: 3, color: 'Green', name: 'Small Picture Frame', prize: 30 },
      { number: 4, color: 'Yellow', name: 'Double Postage Stamp', prize: 60 },
      { number: 5, color: 'Pink', name: 'Crazy Kite', prize: 60 },
      { number: 6, color: 'Gray', name: 'Hardway Bingo', prize: 120 },
      { number: 7, color: 'Olive', name: 'Large Picture Frame', prize: 90 },
      { number: 8, color: 'Brown', name: 'Coverall', prize: 120 },
      { number: 9, color: 'Blue', name: 'Letter Z', prize: 60 },
      { number: 10, color: 'Orange', name: 'Railroad Tracks', prize: 60 },
      { number: 11, color: 'Green', name: 'Double Bingo', prize: 60 },
      { number: 12, color: 'Yellow', name: 'Crazy T', prize: 90 },
      { number: 13, color: 'Pink', name: 'Arrow', prize: 60 },
      { number: 14, color: 'Gray', name: 'Six Pack', prize: 60 },
      { number: 15, color: 'Olive', name: 'Inside Square', prize: 60 },
      { number: 16, color: 'Brown', name: 'Nine Pack', prize: 120 },
      { number: 17, color: 'Special', name: 'Blackout Bingo', prize: 300 }
    ],
    '7-3': [
      { number: 1, color: 'Blue', name: 'Small Picture Frame', prize: 35 },
      { number: 2, color: 'Orange', name: 'Letter H', prize: 35 },
      { number: 3, color: 'Green', name: 'Postage Stamp', prize: 35 },
      { number: 4, color: 'Yellow', name: 'Six Pack', prize: 70 },
      { number: 5, color: 'Pink', name: 'Layer Cake', prize: 70 },
      { number: 6, color: 'Gray', name: 'Hardway Bingo', prize: 140 },
      { number: 7, color: 'Olive', name: 'Large Picture Frame', prize: 105 },
      { number: 8, color: 'Brown', name: 'Coverall', prize: 140 },
      { number: 9, color: 'Blue', name: 'Top and Bottom', prize: 70 },
      { number: 10, color: 'Orange', name: 'Letter Z', prize: 70 },
      { number: 11, color: 'Green', name: 'Double Bingo', prize: 70 },
      { number: 12, color: 'Yellow', name: 'Inside Square', prize: 105 },
      { number: 13, color: 'Pink', name: 'Arrow', prize: 70 },
      { number: 14, color: 'Gray', name: 'Railroad Tracks', prize: 70 },
      { number: 15, color: 'Olive', name: 'Large Letter T', prize: 70 },
      { number: 16, color: 'Brown', name: 'Nine Pack', prize: 140 },
      { number: 17, color: 'Special', name: 'Blackout Bingo', prize: 350 }
    ],
    '8-4': [
      { number: 1, color: 'Blue', name: 'Letter L', prize: 40 },
      { number: 2, color: 'Orange', name: 'Outside Square', prize: 40 },
      { number: 3, color: 'Green', name: 'Small Picture Frame', prize: 40 },
      { number: 4, color: 'Yellow', name: 'Double Postage Stamp', prize: 80 },
      { number: 5, color: 'Pink', name: 'Crazy Kite', prize: 80 },
      { number: 6, color: 'Gray', name: 'Hardway Bingo', prize: 160 },
      { number: 7, color: 'Olive', name: 'Large Picture Frame', prize: 120 },
      { number: 8, color: 'Brown', name: 'Coverall', prize: 160 },
      { number: 9, color: 'Blue', name: 'Letter Z', prize: 80 },
      { number: 10, color: 'Orange', name: 'Railroad Tracks', prize: 80 },
      { number: 11, color: 'Green', name: 'Double Bingo', prize: 80 },
      { number: 12, color: 'Yellow', name: 'Crazy T', prize: 120 },
      { number: 13, color: 'Pink', name: 'Arrow', prize: 80 },
      { number: 14, color: 'Gray', name: 'Six Pack', prize: 80 },
      { number: 15, color: 'Olive', name: 'Inside Square', prize: 80 },
      { number: 16, color: 'Brown', name: 'Nine Pack', prize: 160 },
      { number: 17, color: 'Special', name: 'Blackout Bingo', prize: 400 }
    ]
  },
  
  // Sync settings
  SYNC_INTERVAL: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
