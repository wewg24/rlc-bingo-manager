// Offline functionality management
class OfflineManager {
  constructor() {
    this.db = null;
    this.init();
  }
  
  async init() {
    // Initialize local database
    this.db = await localforage.createInstance({
      name: 'RLCBingoOffline',
      version: 1.0,
      storeName: 'offline'
    });
    
    // Set up background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('sync-data');
      });
    }
  }
  
  async saveOffline(key, data) {
    try {
      await this.db.setItem(key, {
        data: data,
        timestamp: Date.now(),
        synced: false
      });
      return true;
    } catch (error) {
      console.error('Failed to save offline:', error);
      return false;
    }
  }
  
  async getOfflineData() {
    const keys = await this.db.keys();
    const data = [];
    
    for (const key of keys) {
      const item = await this.db.getItem(key);
      if (!item.synced) {
        data.push({
          key: key,
          ...item
        });
      }
    }
    
    return data;
  }
  
  async markSynced(key) {
    const item = await this.db.getItem(key);
    if (item) {
      item.synced = true;
      await this.db.setItem(key, item);
    }
  }
  
  async clearSynced() {
    const keys = await this.db.keys();
    
    for (const key of keys) {
      const item = await this.db.getItem(key);
      if (item && item.synced) {
        await this.db.removeItem(key);
      }
    }
  }
}

// Export for use in other modules
window.OfflineManager = OfflineManager;
