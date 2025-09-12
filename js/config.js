const CONFIG = {
  // Update this with your Google Apps Script Web App URL
  API_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
  
  // App settings
  APP_NAME: 'RLC Bingo Manager',
  VERSION: '1.0.0',
  
  // Storage keys
  STORAGE_KEYS: {
    USER: 'rlc_user',
    TOKEN: 'rlc_token',
    CURRENT_SESSION: 'rlc_current_session',
    SYNC_QUEUE: 'rlc_sync_queue'
  },
  
  // Session types
  SESSION_TYPES: {
    '5-1': '1st/5th Monday',
    '6-2': '2nd Monday',
    '7-3': '3rd Monday',
    '8-4': '4th Monday'
  },
  
  // Game definitions by session
  GAMES: {
    '5-1': [
      {num: 1, color: 'Early Bird', game: 'Hard Way Bingo', prize: 100},
      {num: 2, color: 'Early Bird', game: 'Diagonal & Corners', prize: 100},
      {num: 3, color: 'Early Bird', game: 'Small Picture Frame', prize: 100},
      {num: 4, color: 'Blue', game: 'Block of 9', prize: 100},
      {num: 5, color: 'Orange', game: '$250 Number 7', prize: 250},
      {num: 6, color: 'Green', game: 'Small Diamond', prize: 100},
      {num: 7, color: 'Yellow', game: 'Razor Blade', prize: 100},
      {num: 8, color: 'Pink', game: '$250 Letter X', prize: 250},
      {num: 9, color: 'Event', game: 'Special Event', prize: 0},
      {num: 10, color: 'Gray', game: '5 Around Corner', prize: 150},
      {num: 11, color: 'Olive', game: 'Double Postage', prize: 150},
      {num: 12, color: 'Brown', game: 'Outside Line', prize: 150},
      {num: 13, color: 'Progressive', game: 'Diamond', prize: 0},
      {num: 14, color: 'Red', game: 'Checkmark', prize: 150},
      {num: 15, color: 'Purple', game: 'Regular Bingo', prize: 150},
      {num: 16, color: 'Black', game: '3 Top & Bottom', prize: 150},
      {num: 17, color: 'Aqua', game: '$500 Coverall', prize: 500}
    ],
    '6-2': [
      // Same structure for other sessions
    ],
    '7-3': [
      // Same structure
    ],
    '8-4': [
      // Same structure
    ]
  }
};
