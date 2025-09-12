// src/js/sync.js
// Comprehensive Data Synchronization Manager with conflict resolution and retry logic

class SyncManager {
  constructor(apiUrl) {
    this.apiUrl = apiUrl || CONFIG.API_URL;
    this.syncInProgress = false;
    this.offlineManager = null;
    this.syncStats = {
      lastSync: null,
      pendingItems: 0,
      failedItems: 0,
      conflicts: 0
    };
    this.retryConfig = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000
    };
    this.init();
  }
  
  async init() {
    // Initialize offline manager if not already created
    if (!window.offlineManager) {
      window.offlineManager = new OfflineManager();
    }
    this.offlineManager = window.offlineManager;
    
    // Load sync stats from localStorage
    this.loadSyncStats();
    
    // Set up periodic sync
    this.setupPeriodicSync();
    
    // Listen for sync events
    this.setupSyncEventListeners();
  }
  
  loadSyncStats() {
    const saved = localStorage.getItem('syncStats');
    if (saved) {
      try {
        this.syncStats = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load sync stats:', e);
      }
    }
  }
  
  saveSyncStats() {
    localStorage.setItem('syncStats', JSON.stringify(this.syncStats));
  }
  
  setupPeriodicSync() {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncAll();
      }
    }, 5 * 60 * 1000);
    
    // Immediate sync when coming online
    window.addEventListener('online', () => {
      console.log('Connection restored - starting sync');
      setTimeout(() => this.syncAll(), 1000);
    });
  }
  
  setupSyncEventListeners() {
    // Listen for manual sync requests
    document.addEventListener('requestSync', () => {
      this.syncAll();
    });
    
    // Listen for service worker sync events
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_REQUESTED') {
          this.syncAll();
        }
      });
    }
  }
  
  // Main sync orchestration
  async syncAll() {
    if (this.syncInProgress || !navigator.onLine) {
      return {
        success: false,
        reason: this.syncInProgress ? 'Sync already in progress' : 'Device is offline'
      };
    }
    
    this.syncInProgress = true;
    this.updateSyncUI('syncing');
    
    const results = {
      occasions: { synced: 0, failed: 0, conflicts: 0 },
      games: { synced: 0, failed: 0 },
      pullTabs: { synced: 0, failed: 0 },
      moneyCount: { synced: 0, failed: 0 },
      photos: { synced: 0, failed: 0 },
      startTime: new Date(),
      endTime: null,
      duration: 0
    };
    
    try {
      // Get all offline data
      const offlineData = await this.offlineManager.getOfflineData();
      
      if (offlineData.length === 0) {
        this.syncInProgress = false;
        this.updateSyncUI('complete');
        return {
          success: true,
          message: 'No data to sync'
        };
      }
      
      console.log(`Starting sync of ${offlineData.length} items`);
      
      // Group data by type
      const groupedData = this.groupDataByType(offlineData);
      
      // Sync in order of priority
      // 1. Occasions (must exist before related data)
      if (groupedData.occasions.length > 0) {
        const occasionResults = await this.syncOccasions(groupedData.occasions);
        results.occasions = occasionResults;
      }
      
      // 2. Games (linked to occasions)
      if (groupedData.games.length > 0) {
        const gameResults = await this.syncGames(groupedData.games);
        results.games = gameResults;
      }
      
      // 3. Pull-tabs (linked to occasions)
      if (groupedData.pullTabs.length > 0) {
        const pullTabResults = await this.syncPullTabs(groupedData.pullTabs);
        results.pullTabs = pullTabResults;
      }
      
      // 4. Money counts (linked to occasions)
      if (groupedData.moneyCount.length > 0) {
        const moneyResults = await this.syncMoneyCounts(groupedData.moneyCount);
        results.moneyCount = moneyResults;
      }
      
      // 5. Photos (can be independent)
      if (groupedData.photos.length > 0) {
        const photoResults = await this.syncPhotos(groupedData.photos);
        results.photos = photoResults;
      }
      
      // Clean up synced items
      await this.offlineManager.clearSynced();
      
      // Update stats
      results.endTime = new Date();
      results.duration = results.endTime - results.startTime;
      
      this.syncStats.lastSync = results.endTime;
      this.syncStats.pendingItems = await this.getPendingCount();
      this.saveSyncStats();
      
      // Log results
      console.log('Sync completed:', results);
      
      this.syncInProgress = false;
      this.updateSyncUI('complete');
      
      // Show summary notification
      this.showSyncSummary(results);
      
      return {
        success: true,
        results: results
      };
      
    } catch (error) {
      console.error('Sync failed:', error);
      this.syncInProgress = false;
      this.updateSyncUI('error');
      
      return {
        success: false,
        error: error.toString()
      };
    }
  }
  
  groupDataByType(offlineData) {
    const grouped = {
      occasions: [],
      games: [],
      pullTabs: [],
      moneyCount: [],
      photos: []
    };
    
    offlineData.forEach(item => {
      const type = this.getItemType(item.key);
      
      switch(type) {
        case 'OCCASION':
          grouped.occasions.push(item);
          break;
        case 'GAMES':
          grouped.games.push(item);
          break;
        case 'PULLTABS':
          grouped.pullTabs.push(item);
          break;
        case 'MONEYCOUNT':
          grouped.moneyCount.push(item);
          break;
        case 'PHOTO':
          grouped.photos.push(item);
          break;
      }
    });
    
    return grouped;
  }
  
  getItemType(key) {
    const prefix = key.split('_')[0].toUpperCase();
    return prefix;
  }
  
  // Sync occasions with conflict detection
  async syncOccasions(occasions) {
    const results = { synced: 0, failed: 0, conflicts: 0 };
    
    for (const item of occasions) {
      try {
        // Check for existing record
        const existing = await this.getServerOccasion(item.data.id);
        
        if (existing) {
          // Conflict detection
          const conflict = await this.detectConflict(item.data, existing);
          
          if (conflict) {
            const resolution = await this.resolveConflict(item.data, existing);
            
            if (resolution.success) {
              const updated = await this.updateOccasion(resolution.data);
              if (updated) {
                results.synced++;
                await this.offlineManager.markSynced(item.key);
              } else {
                results.failed++;
              }
            } else {
              results.conflicts++;
              await this.storeConflict(item);
            }
          } else {
            // No conflict, update server
            const updated = await this.updateOccasion(item.data);
            if (updated) {
              results.synced++;
              await this.offlineManager.markSynced(item.key);
            } else {
              results.failed++;
            }
          }
        } else {
          // New record
          const created = await this.createOccasion(item.data);
          if (created) {
            results.synced++;
            await this.offlineManager.markSynced(item.key);
          } else {
            results.failed++;
          }
        }
      } catch (error) {
        console.error(`Failed to sync occasion ${item.key}:`, error);
        results.failed++;
        
        // Retry logic
        item.attempts = (item.attempts || 0) + 1;
        if (item.attempts < this.retryConfig.maxAttempts) {
          await this.scheduleRetry(item);
        } else {
          await this.offlineManager.markFailed(item.key);
        }
      }
    }
    
    return results;
  }
  
  // Sync games
  async syncGames(games) {
    const results = { synced: 0, failed: 0 };
    
    // Group games by occasion
    const gamesByOccasion = {};
    games.forEach(item => {
      const occasionId = item.data.occasionId;
      if (!gamesByOccasion[occasionId]) {
        gamesByOccasion[occasionId] = [];
      }
      gamesByOccasion[occasionId].push(item);
    });
    
    // Sync each occasion's games
    for (const occasionId in gamesByOccasion) {
      try {
        const gameSet = gamesByOccasion[occasionId];
        const gameData = gameSet.map(g => g.data.games || g.data).flat();
        
        const response = await fetch(this.apiUrl + '?path=games', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.getAuthToken()
          },
          body: JSON.stringify({
            occasionId: occasionId,
            games: gameData
          })
        });
        
        if (response.ok) {
          results.synced += gameData.length;
          
          // Mark all items as synced
          for (const item of gameSet) {
            await this.offlineManager.markSynced(item.key);
          }
        } else {
          results.failed += gameData.length;
        }
      } catch (error) {
        console.error(`Failed to sync games for occasion ${occasionId}:`, error);
        results.failed++;
      }
    }
    
    return results;
  }
  
  // Sync pull-tabs
  async syncPullTabs(pullTabs) {
    const results = { synced: 0, failed: 0 };
    
    // Group by occasion
    const pullTabsByOccasion = {};
    pullTabs.forEach(item => {
      const occasionId = item.data.occasionId;
      if (!pullTabsByOccasion[occasionId]) {
        pullTabsByOccasion[occasionId] = [];
      }
      pullTabsByOccasion[occasionId].push(item);
    });
    
    for (const occasionId in pullTabsByOccasion) {
      try {
        const pullTabSet = pullTabsByOccasion[occasionId];
        const pullTabData = pullTabSet.map(pt => pt.data.games || pt.data).flat();
        
        const response = await fetch(this.apiUrl + '?path=pulltabs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.getAuthToken()
          },
          body: JSON.stringify({
            occasionId: occasionId,
            games: pullTabData
          })
        });
        
        if (response.ok) {
          results.synced += pullTabData.length;
          
          for (const item of pullTabSet) {
            await this.offlineManager.markSynced(item.key);
          }
        } else {
          results.failed += pullTabData.length;
        }
      } catch (error) {
        console.error(`Failed to sync pull-tabs for occasion ${occasionId}:`, error);
        results.failed++;
      }
    }
    
    return results;
  }
  
  // Sync money counts
  async syncMoneyCounts(moneyCounts) {
    const results = { synced: 0, failed: 0 };
    
    for (const item of moneyCounts) {
      try {
        const response = await fetch(this.apiUrl + '?path=moneycount', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.getAuthToken()
          },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          results.synced++;
          await this.offlineManager.markSynced(item.key);
        } else {
          results.failed++;
        }
      } catch (error) {
        console.error(`Failed to sync money count ${item.key}:`, error);
        results.failed++;
      }
    }
    
    return results;
  }
  
  // Sync photos with compression
  async syncPhotos(photos) {
    const results = { synced: 0, failed: 0 };
    
    for (const item of photos) {
      try {
        // Photos may need special handling for base64 data
        const photoData = item.data;
        
        // If photo data is too large, compress it
        if (photoData.data && photoData.data.length > 1024 * 1024) {
          photoData.data = await this.compressPhotoData(photoData.data);
        }
        
        const response = await fetch(this.apiUrl + '?path=photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.getAuthToken()
          },
          body: JSON.stringify(photoData)
        });
        
        if (response.ok) {
          results.synced++;
          await this.offlineManager.markSynced(item.key);
        } else {
          results.failed++;
        }
      } catch (error) {
        console.error(`Failed to sync photo ${item.key}:`, error);
        results.failed++;
      }
    }
    
    return results;
  }
  
  // Conflict detection
  async detectConflict(localData, serverData) {
    // Compare timestamps
    const localTime = new Date(localData.modifiedAt || localData.timestamp);
    const serverTime = new Date(serverData.modifiedAt);
    
    // If server has been modified after local, we have a conflict
    if (serverTime > localTime) {
      return {
        hasConflict: true,
        type: 'SERVER_NEWER',
        localTime: localTime,
        serverTime: serverTime
      };
    }
    
    // Check for data differences
    const hasDataConflict = this.compareData(localData, serverData);
    
    if (hasDataConflict) {
      return {
        hasConflict: true,
        type: 'DATA_MISMATCH',
        differences: hasDataConflict
      };
    }
    
    return null;
  }
  
  compareData(local, server) {
    const differences = [];
    
    // Compare key fields
    const fieldsToCompare = [
      'totalPlayers',
      'sessionType',
      'lionInCharge',
      'progressive'
    ];
    
    fieldsToCompare.forEach(field => {
      if (JSON.stringify(local[field]) !== JSON.stringify(server[field])) {
        differences.push({
          field: field,
          local: local[field],
          server: server[field]
        });
      }
    });
    
    return differences.length > 0 ? differences : null;
  }
  
  // Conflict resolution
  async resolveConflict(localData, serverData) {
    // Default strategy: last-write-wins
    const strategy = localStorage.getItem('conflictResolution') || 'last-write-wins';
    
    switch(strategy) {
      case 'last-write-wins':
        // Use the most recently modified version
        const localTime = new Date(localData.modifiedAt || localData.timestamp);
        const serverTime = new Date(serverData.modifiedAt);
        
        if (localTime > serverTime) {
          return { success: true, data: localData };
        } else {
          // Server wins, don't sync local changes
          return { success: false, reason: 'Server version is newer' };
        }
        
      case 'client-wins':
        // Always use local version
        return { success: true, data: localData };
        
      case 'server-wins':
        // Always use server version
        return { success: false, reason: 'Server version takes precedence' };
        
      case 'merge':
        // Attempt to merge changes
        const merged = await this.mergeData(localData, serverData);
        return { success: true, data: merged };
        
      case 'manual':
        // Store for manual resolution
        await this.storeConflict({
          local: localData,
          server: serverData,
          timestamp: new Date()
        });
        return { success: false, reason: 'Manual resolution required' };
        
      default:
        return { success: false, reason: 'Unknown resolution strategy' };
    }
  }
  
  async mergeData(local, server) {
    // Simple merge strategy - combine non-conflicting changes
    const merged = { ...server };
    
    // Use local values for fields that were modified locally
    const localModFields = this.getModifiedFields(local, server);
    
    localModFields.forEach(field => {
      merged[field] = local[field];
    });
    
    // Update timestamp
    merged.modifiedAt = new Date().toISOString();
    merged.mergedAt = new Date().toISOString();
    
    return merged;
  }
  
  getModifiedFields(local, server) {
    const modified = [];
    
    Object.keys(local).forEach(key => {
      if (JSON.stringify(local[key]) !== JSON.stringify(server[key])) {
        modified.push(key);
      }
    });
    
    return modified;
  }
  
  // Store conflicts for manual resolution
  async storeConflict(conflict) {
    const conflictDb = await localforage.createInstance({
      name: 'RLCBingoConflicts',
      version: 1.0,
      storeName: 'conflicts'
    });
    
    const conflictId = 'CONFLICT_' + Date.now();
    await conflictDb.setItem(conflictId, conflict);
    
    // Notify user
    this.notifyConflict(conflictId);
  }
  
  notifyConflict(conflictId) {
    if (window.app && window.app.showToast) {
      window.app.showToast(
        'Data conflict detected. Manual resolution required.',
        'warning'
      );
    }
    
    // Dispatch event for UI handling
    document.dispatchEvent(new CustomEvent('conflictDetected', {
      detail: { conflictId }
    }));
  }
  
  // Server communication methods
  async getServerOccasion(id) {
    try {
      const response = await fetch(
        `${this.apiUrl}?path=occasion&id=${id}`,
        {
          headers: {
            'Authorization': 'Bearer ' + this.getAuthToken()
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.data || null;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch server occasion:', error);
      return null;
    }
  }
  
  async createOccasion(data) {
    try {
      const response = await fetch(this.apiUrl + '?path=occasion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: JSON.stringify(data)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to create occasion:', error);
      return false;
    }
  }
  
  async updateOccasion(data) {
    try {
      const response = await fetch(this.apiUrl + '?path=occasion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: JSON.stringify({
          ...data,
          id: data.id // Ensure ID is included for update
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to update occasion:', error);
      return false;
    }
  }
  
  // Retry mechanism
  async scheduleRetry(item) {
    const delay = this.calculateRetryDelay(item.attempts || 1);
    
    setTimeout(() => {
      if (navigator.onLine) {
        this.retrySingleItem(item);
      }
    }, delay);
  }
  
  calculateRetryDelay(attempt) {
    // Exponential backoff with jitter
    const baseDelay = this.retryConfig.baseDelay;
    const delay = Math.min(
      baseDelay * Math.pow(2, attempt - 1),
      this.retryConfig.maxDelay
    );
    
    // Add jitter (±25%)
    const jitter = delay * 0.25 * (Math.random() * 2 - 1);
    
    return delay + jitter;
  }
  
  async retrySingleItem(item) {
    const type = this.getItemType(item.key);
    
    try {
      switch(type) {
        case 'OCCASION':
          await this.syncOccasions([item]);
          break;
        case 'GAMES':
          await this.syncGames([item]);
          break;
        case 'PULLTABS':
          await this.syncPullTabs([item]);
          break;
        case 'MONEYCOUNT':
          await this.syncMoneyCounts([item]);
          break;
        case 'PHOTO':
          await this.syncPhotos([item]);
          break;
      }
    } catch (error) {
      console.error(`Retry failed for ${item.key}:`, error);
    }
  }
  
  // Utility methods
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
  
  async getPendingCount() {
    const offlineData = await this.offlineManager.getOfflineData();
    return offlineData.length;
  }
  
  async compressPhotoData(base64Data) {
    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert to blob
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'image/jpeg'});
    
    // Compress using canvas
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (max 800px)
        const maxSize = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert back to base64 with compression
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      img.src = URL.createObjectURL(blob);
    });
  }
  
  // UI update methods
  updateSyncUI(status) {
    // Update sync indicator
    const indicator = document.querySelector('.sync-indicator');
    if (!indicator) return;
    
    const statusElement = indicator.querySelector('span');
    if (!statusElement) return;
    
    switch(status) {
      case 'syncing':
        statusElement.className = 'status-syncing';
        statusElement.innerHTML = '<i class="material-icons spin">sync</i> Syncing...';
        indicator.classList.add('syncing');
        break;
        
      case 'complete':
        statusElement.className = 'status-online';
        statusElement.innerHTML = '<i class="material-icons">cloud_done</i> Synced';
        indicator.classList.remove('syncing');
        
        // Reset to normal after 3 seconds
        setTimeout(() => {
          if (navigator.onLine) {
            statusElement.innerHTML = '<i class="material-icons">cloud</i> Online';
          }
        }, 3000);
        break;
        
      case 'error':
        statusElement.className = 'status-error';
        statusElement.innerHTML = '<i class="material-icons">error</i> Sync Error';
        indicator.classList.remove('syncing');
        break;
        
      default:
        if (navigator.onLine) {
          statusElement.className = 'status-online';
          statusElement.innerHTML = '<i class="material-icons">cloud</i> Online';
        } else {
          statusElement.className = 'status-offline';
          statusElement.innerHTML = '<i class="material-icons">cloud_off</i> Offline';
        }
        indicator.classList.remove('syncing');
    }
  }
  
  showSyncSummary(results) {
    const totalSynced = 
      results.occasions.synced +
      results.games.synced +
      results.pullTabs.synced +
      results.moneyCount.synced +
      results.photos.synced;
    
    const totalFailed =
      results.occasions.failed +
      results.games.failed +
      results.pullTabs.failed +
      results.moneyCount.failed +
      results.photos.failed;
    
    const totalConflicts = results.occasions.conflicts || 0;
    
    let message = `Sync complete: ${totalSynced} items synced`;
    
    if (totalFailed > 0) {
      message += `, ${totalFailed} failed`;
    }
    
    if (totalConflicts > 0) {
      message += `, ${totalConflicts} conflicts`;
    }
    
    const duration = Math.round(results.duration / 1000);
    message += ` (${duration}s)`;
    
    if (window.app && window.app.showToast) {
      window.app.showToast(message, totalFailed > 0 ? 'warning' : 'success');
    }
    
    console.log('Sync Summary:', message);
  }
  
  // Manual sync trigger
  async forceSync() {
    console.log('Manual sync requested');
    return await this.syncAll();
  }
  
  // Get sync status
  getSyncStatus() {
    return {
      inProgress: this.syncInProgress,
      lastSync: this.syncStats.lastSync,
      pendingItems: this.syncStats.pendingItems,
      failedItems: this.syncStats.failedItems,
      conflicts: this.syncStats.conflicts,
      isOnline: navigator.onLine
    };
  }
  
  // Clear all sync data (for debugging)
  async clearSyncData() {
    if (confirm('This will clear all pending sync data. Are you sure?')) {
      await this.offlineManager.clearSynced();
      this.syncStats = {
        lastSync: null,
        pendingItems: 0,
        failedItems: 0,
        conflicts: 0
      };
      this.saveSyncStats();
      
      console.log('Sync data cleared');
      
      if (window.app && window.app.showToast) {
        window.app.showToast('Sync data cleared', 'info');
      }
    }
  }
}

// Export for use
window.SyncManager = SyncManager;

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
  if (!window.syncManager) {
    window.syncManager = new SyncManager(CONFIG.API_URL);
    console.log('SyncManager initialized');
  }
});
