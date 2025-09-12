class SyncManager {
  constructor() {
    this.apiUrl = CONFIG.API_URL;
    this.isOnline = navigator.onLine;
    this.syncInterval = null;
  }
  
  async syncAll() {
    if (!this.isOnline) return;
    
    const queue = await localforage.getItem('syncQueue') || [];
    const results = { synced: 0, failed: 0 };
    
    for (const item of queue) {
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.getAuthToken()
          },
          body: JSON.stringify({
            path: item.type,
            ...item.data
          })
        });
        
        if (response.ok) {
          results.synced++;
          // Remove from queue
          await this.removeFromQueue(item.id);
        } else {
          results.failed++;
        }
      } catch (error) {
        console.error('Sync failed:', error);
        results.failed++;
      }
    }
    
    return results;
  }
  
  startAutoSync() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncAll();
      }
    }, 30000); // Every 30 seconds
  }
}
