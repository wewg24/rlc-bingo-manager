// src/js/offline.js
// Offline functionality management with complete sync queue
class OfflineManager {
  constructor() {
    this.db = null;
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.init();
  }
  
  async init() {
    // Initialize local database
    this.db = await localforage.createInstance({
      name: 'RLCBingoOffline',
      version: 1.0,
      storeName: 'offline'
    });
    
    // Initialize sync queue database
    this.queueDb = await localforage.createInstance({
      name: 'RLCBingoQueue',
      version: 1.0,
      storeName: 'syncQueue'
    });
    
    // Set up event listeners
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Set up background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('sync-data');
      });
    }
    
    // Check for pending sync items
    await this.loadSyncQueue();
    
    // Start periodic sync check
    this.startPeriodicSync();
  }
  
  handleOnline() {
    this.isOnline = true;
    console.log('Application is online');
    this.showNotification('Connection restored', 'success');
    
    // Trigger sync
    this.processSyncQueue();
  }
  
  handleOffline() {
    this.isOnline = false;
    console.log('Application is offline');
    this.showNotification('Working offline - data will sync when connection returns', 'warning');
  }
  
  async saveOffline(key, data) {
    try {
      const item = {
        key: key,
        data: data,
        timestamp: Date.now(),
        synced: false,
        attempts: 0,
        lastAttempt: null
      };
      
      await this.db.setItem(key, item);
      await this.addToSyncQueue(item);
      
      return true;
    } catch (error) {
      console.error('Failed to save offline:', error);
      return false;
    }
  }
  
  async addToSyncQueue(item) {
    // Add to in-memory queue
    this.syncQueue.push(item);
    
    // Persist queue
    await this.queueDb.setItem(item.key, item);
    
    // Try to sync if online
    if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }
  }
  
  async loadSyncQueue() {
    const keys = await this.queueDb.keys();
    this.syncQueue = [];
    
    for (const key of keys) {
      const item = await this.queueDb.getItem(key);
      if (item && !item.synced) {
        this.syncQueue.push(item);
      }
    }
    
    console.log(`Loaded ${this.syncQueue.length} items in sync queue`);
  }
  
  async processSyncQueue() {
    if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }
    
    this.syncInProgress = true;
    console.log(`Processing ${this.syncQueue.length} items in sync queue`);
    
    const itemsToSync = [...this.syncQueue];
    const results = {
      success: [],
      failed: [],
      retry: []
    };
    
    for (const item of itemsToSync) {
      try {
        const success = await this.syncItem(item);
        
        if (success) {
          results.success.push(item.key);
          await this.markSynced(item.key);
        } else {
          item.attempts++;
          item.lastAttempt = Date.now();
          
          if (item.attempts >= 3) {
            results.failed.push(item.key);
            await this.markFailed(item.key);
          } else {
            results.retry.push(item.key);
            await this.queueDb.setItem(item.key, item);
          }
        }
      } catch (error) {
        console.error(`Sync failed for ${item.key}:`, error);
        results.retry.push(item.key);
      }
    }
    
    // Remove synced items from queue
    this.syncQueue = this.syncQueue.filter(item => 
      !results.success.includes(item.key) && !results.failed.includes(item.key)
    );
    
    this.syncInProgress = false;
    
    // Show results
    if (results.success.length > 0) {
      this.showNotification(`Synced ${results.success.length} items successfully`, 'success');
    }
    
    if (results.failed.length > 0) {
      this.showNotification(`${results.failed.length} items failed to sync after 3 attempts`, 'error');
    }
    
    console.log('Sync queue processing complete:', results);
    
    return results;
  }
  
  async syncItem(item) {
    const syncManager = new SyncManager(CONFIG.API_URL);
    
    // Determine sync type
    const type = item.key.split('_')[0].toLowerCase();
    
    switch(type) {
      case 'occasion':
        return await syncManager.syncOccasion(item.data);
      
      case 'games':
        return await syncManager.syncGames(item.data);
      
      case 'pulltabs':
        return await syncManager.syncPullTabs(item.data);
      
      case 'moneycount':
        return await syncManager.syncMoneyCount(item.data);
      
      case 'photo':
        return await syncManager.syncPhoto(item.data);
      
      default:
        console.error('Unknown sync type:', type);
        return false;
    }
  }
  
  async markSynced(key) {
    const item = await this.db.getItem(key);
    if (item) {
      item.synced = true;
      item.syncedAt = Date.now();
      await this.db.setItem(key, item);
    }
    
    // Remove from queue database
    await this.queueDb.removeItem(key);
  }
  
  async markFailed(key) {
    const item = await this.db.getItem(key);
    if (item) {
      item.failed = true;
      item.failedAt = Date.now();
      await this.db.setItem(key, item);
    }
    
    // Move to failed items store
    const failedDb = await localforage.createInstance({
      name: 'RLCBingoFailed',
      version: 1.0,
      storeName: 'failed'
    });
    
    await failedDb.setItem(key, item);
    await this.queueDb.removeItem(key);
  }
  
  async getOfflineData() {
    const keys = await this.db.keys();
    const data = [];
    
    for (const key of keys) {
      const item = await this.db.getItem(key);
      if (item && !item.synced) {
        data.push(item);
      }
    }
    
    return data;
  }
  
  async clearSynced() {
    const keys = await this.db.keys();
    let cleared = 0;
    
    for (const key of keys) {
      const item = await this.db.getItem(key);
      if (item && item.synced) {
        await this.db.removeItem(key);
        cleared++;
      }
    }
    
    console.log(`Cleared ${cleared} synced items`);
    return cleared;
  }
  
  async getStorageStats() {
    const stats = {
      offline: { count: 0, size: 0 },
      queue: { count: 0, size: 0 },
      synced: { count: 0, size: 0 },
      failed: { count: 0, size: 0 }
    };
    
    // Get offline data stats
    const offlineKeys = await this.db.keys();
    for (const key of offlineKeys) {
      const item = await this.db.getItem(key);
      const size = JSON.stringify(item).length;
      
      if (item.synced) {
        stats.synced.count++;
        stats.synced.size += size;
      } else if (item.failed) {
        stats.failed.count++;
        stats.failed.size += size;
      } else {
        stats.offline.count++;
        stats.offline.size += size;
      }
    }
    
    // Get queue stats
    const queueKeys = await this.queueDb.keys();
    stats.queue.count = queueKeys.length;
    
    for (const key of queueKeys) {
      const item = await this.queueDb.getItem(key);
      stats.queue.size += JSON.stringify(item).length;
    }
    
    // Convert sizes to MB
    Object.keys(stats).forEach(key => {
      stats[key].sizeMB = (stats[key].size / 1024 / 1024).toFixed(2);
    });
    
    return stats;
  }
  
  startPeriodicSync() {
    // Try to sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress && this.syncQueue.length > 0) {
        console.log('Starting periodic sync...');
        this.processSyncQueue();
      }
    }, 5 * 60 * 1000);
  }
  
  showNotification(message, type = 'info') {
    if (window.app && window.app.showToast) {
      window.app.showToast(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }
  
  async exportOfflineData() {
    const data = {
      offline: await this.getOfflineData(),
      queue: this.syncQueue,
      stats: await this.getStorageStats(),
      exported: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offline-data-${Date.now()}.json`;
    a.click();
    
    return data;
  }
  
  async importOfflineData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Import offline data
          if (data.offline) {
            for (const item of data.offline) {
              await this.saveOffline(item.key, item.data);
            }
          }
          
          console.log(`Imported ${data.offline?.length || 0} offline items`);
          resolve(data);
          
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

// Export for use in other modules
window.OfflineManager = OfflineManager;
