// Data synchronization manager
class SyncManager {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.syncInProgress = false;
    this.offlineManager = new OfflineManager();
  }
  
  async syncAll() {
    if (this.syncInProgress || !navigator.onLine) {
      return false;
    }
    
    this.syncInProgress = true;
    
    try {
      // Get all offline data
      const offlineData = await this.offlineManager.getOfflineData();
      
      if (offlineData.length === 0) {
        this.syncInProgress = false;
        return true;
      }
      
      // Batch sync
      const batchData = {
        occasions: [],
        games: [],
        pullTabs: [],
        photos: []
      };
      
      offlineData.forEach(item => {
        const type = item.key.split('_')[0].toLowerCase();
        if (batchData[type + 's']) {
          batchData[type + 's'].push(item.data);
        }
      });
      
      // Send to server
      const response = await fetch(this.apiUrl + '?path=sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: JSON.stringify({
          deviceId: this.getDeviceId(),
          timestamp: Date.now(),
          data: batchData
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Mark items as synced
        for (const item of offlineData) {
          await this.offlineManager.markSynced(item.key);
        }
        
        // Clean up synced items
        await this.offlineManager.clearSynced();
        
        this.syncInProgress = false;
        return true;
      }
      
    } catch (error) {
      console.error('Sync failed:', error);
    }
    
    this.syncInProgress = false;
    return false;
  }
  
  getAuthToken() {
    return localStorage.getItem('rlc_token') || '';
  }
  
  getDeviceId() {
    let deviceId = localStorage.getItem('rlc_device_id');
    if (!deviceId) {
      deviceId = 'DEV_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('rlc_device_id', deviceId);
    }
    return deviceId;
  }
  
  async syncOccasion(occasion) {
    if (!navigator.onLine) {
      return await this.offlineManager.saveOffline('OCCASION_' + occasion.id, occasion);
    }
    
    try {
      const response = await fetch(this.apiUrl + '?path=occasion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: JSON.stringify(occasion)
      });
      
      return response.ok;
    } catch (error) {
      // Save offline if request fails
      return await this.offlineManager.saveOffline('OCCASION_' + occasion.id, occasion);
    }
  }
}

// Export for use
window.SyncManager = SyncManager;
