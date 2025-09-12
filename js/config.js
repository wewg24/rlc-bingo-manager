const CONFIG = {
  // Update this with your Google Apps Script Web App URL
  API_URL: 'https://script.google.com/macros/s/AKfycbyYhF94GgZeBjhRgh6D-eS6DTTXXgexiR_sz1UbwpZEZ8fZX1z2bTY14X6F0hEsqN6ZZw/exec',
  
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
  }
};
