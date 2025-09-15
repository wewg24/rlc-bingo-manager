// Data synchronization manager with complete offline support
class SyncManager {
  constructor() {
    this.apiUrl = CONFIG.API_URL;
    this.syncInProgress = false;
    this.syncQueue = [];
    this.offlineManager = null;
    this.lastSync = null;
    this.init();
  }
  
  async init() {
    // Initialize offline manager
    this.offlineManager = window.offlineManager || new OfflineManager();
    
    // Load sync queue from storage
    await this.loadSyncQueue();
    
    // Start periodic sync
    this.startPeriodicSync();
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }
  
  async loadSyncQueue() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE);
    if (stored) {
      try {
        this.syncQueue = JSON.parse(stored);
      } catch (e) {
        this.syncQueue = [];
      }
    }
  }
  
  async saveSyncQueue() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(this.syncQueue));
  }
  
  handleOnline() {
    console.log('Connection restored - starting sync');
    this.syncAll();
  }
  
  handleOffline() {
    console.log('Connection lost - switching to offline mode');
  }
  
  startPeriodicSync() {
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncAll();
      }
    }, CONFIG.SYNC_INTERVAL);
  }
  
  async syncAll() {
    if (this.syncInProgress || !navigator.onLine) {
      return false;
    }
    
    this.syncInProgress = true;
    console.log('Starting sync process...');
    
    try {
      // Get all offline data
      const offlineData = await this.offlineManager.getOfflineData();
      
      if (offlineData.length === 0 && this.syncQueue.length === 0) {
        this.syncInProgress = false;
        this.lastSync = new Date();
        return true;
      }
      
      // Prepare batch data
      const batchData = {
        occasions: [],
        timestamp: Date.now(),
        deviceId: this.getDeviceId()
      };
      
      // Add offline data to batch
      offlineData.forEach(item => {
        if (item.key.startsWith('OCCASION_')) {
          batchData.occasions.push(item.data);
        }
      });
      
      // Add queued items to batch
      this.syncQueue.forEach(item => {
        if (!batchData.occasions.find(o => o.id === item.id)) {
          batchData.occasions.push(item);
        }
      });
      
      // Send to server
      const response = await fetch(this.apiUrl + '?path=sync-offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(batchData)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Clear synced items
          for (const item of offlineData) {
            await this.offlineManager.markSynced(item.key);
          }
          
          // Clear sync queue
          this.syncQueue = [];
          await this.saveSyncQueue();
          
          // Clean up synced items
          await this.offlineManager.clearSynced();
          
          console.log('Sync completed successfully');
          this.showNotification('Data synchronized successfully', 'success');
          
          this.lastSync = new Date();
          this.syncInProgress = false;
          return true;
        }
      }
      
    } catch (error) {
      console.error('Sync failed:', error);
      this.showNotification('Sync failed - will retry', 'error');
    }
    
    this.syncInProgress = false;
    return false;
  }
  
  async syncOccasion(occasion) {
    if (!navigator.onLine) {
      // Save offline
      const key = 'OCCASION_' + (occasion.id || Date.now());
      await this.offlineManager.saveOffline(key, occasion);
      
      // Add to sync queue
      this.syncQueue.push(occasion);
      await this.saveSyncQueue();
      
      this.showNotification('Saved offline - will sync when online', 'info');
      return true;
    }
    
    try {
      const response = await fetch(this.apiUrl + '?path=save-occasion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(occasion)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          this.showNotification('Occasion saved successfully', 'success');
          return result;
        }
      }
      
      throw new Error('Save failed');
      
    } catch (error) {
      console.error('Failed to save occasion:', error);
      
      // Save offline as fallback
      const key = 'OCCASION_' + (occasion.id || Date.now());
      await this.offlineManager.saveOffline(key, occasion);
      
      // Add to sync queue
      this.syncQueue.push(occasion);
      await this.saveSyncQueue();
      
      this.showNotification('Saved offline - will sync when online', 'warning');
      return true;
    }
  }
  
  getDeviceId() {
    let deviceId = localStorage.getItem('rlc_device_id');
    if (!deviceId) {
      deviceId = 'DEV_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('rlc_device_id', deviceId);
    }
    return deviceId;
  }
  
  showNotification(message, type = 'info') {
    // Use app notification system if available
    if (window.app && window.app.showToast) {
      window.app.showToast(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }
  
  getSyncStatus() {
    return {
      isOnline: navigator.onLine,
      syncInProgress: this.syncInProgress,
      queueLength: this.syncQueue.length,
      lastSync: this.lastSync
    };
  }
}

// Initialize and export
window.syncManager = new SyncManager();
