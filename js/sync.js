// Sync Manager - Complete implementation
// Version 11.0.4 - Fixed all initialization and dependency issues

// Prevent redeclaration errors
if (typeof window.SyncManager === 'undefined') {

class SyncManager {
    constructor() {
        this.queue = [];
        this.syncing = false;
        this.syncInProgress = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        this.maxRetries = 5;
        this.offlineManager = null;
        
        // Wait for offline manager to be ready
        this.initOfflineManager();
    }
    
    async initOfflineManager() {
        // Wait for offline manager to be available
        let attempts = 0;
        while (!window.offlineManager && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.offlineManager) {
            this.offlineManager = window.offlineManager;
            console.log('Sync manager connected to offline manager');
            
            // Load any pending queue items
            this.loadQueue();
        } else {
            console.warn('Offline manager not available for sync after waiting');
        }
    }
    
    async loadQueue() {
        if (this.syncInProgress || !navigator.onLine || !this.offlineManager) {
            return;
        }
        
        this.syncInProgress = true;
        console.log('Starting sync queue processing...');
        
        try {
            // Ensure offline manager is ready
            await this.offlineManager.waitForDB();
            
            const queue = await this.offlineManager.getSyncQueue();
            console.log('Found sync queue items:', queue.length);
            
            if (queue.length === 0) {
                console.log('No items in sync queue');
                return;
            }
            
            let successCount = 0;
            let errorCount = 0;
            
            for (const item of queue) {
                try {
                    console.log('Syncing item:', item.action, item.id);
                    
                    const success = await this.syncItem(item);
                    
                    if (success) {
                        // Remove from queue if successful
                        await this.offlineManager.removeFromSyncQueue(item.id);
                        successCount++;
                        console.log('Successfully synced item:', item.id);
                    } else {
                        errorCount++;
                        console.error('Failed to sync item:', item.id);
                    }
                } catch (error) {
                    errorCount++;
                    console.error('Sync error for item:', item.id, error);
                }
            }
            
            console.log(`Sync completed: ${successCount} successful, ${errorCount} failed`);
            
            // Update UI if available
            this.updateSyncStatus(successCount, errorCount);
            
        } catch (error) {
            console.error('Error in loadQueue:', error);
        } finally {
            this.syncInProgress = false;
        }
    }
    
    async syncItem(item) {
        if (!navigator.onLine) {
            console.log('Cannot sync - offline');
            return false;
        }
        
        const maxRetries = this.maxRetries;
        let retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                console.log(`Syncing attempt ${retryCount + 1}/${maxRetries} for item:`, item.action);
                
                const requestBody = new URLSearchParams();
                requestBody.append('action', item.action);
                requestBody.append('data', JSON.stringify(item.data));
                
                const response = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: requestBody
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        console.log('Sync successful:', item.action);
                        return true;
                    } else {
                        console.error('Sync failed - server error:', result.error);
                        throw new Error(result.error || 'Server returned failure');
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
            } catch (error) {
                retryCount++;
                console.error(`Sync attempt ${retryCount} failed:`, error.message);
                
                if (retryCount < maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, retryCount - 1); // Exponential backoff
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error('Max retries reached for item:', item.action);
                    return false;
                }
            }
        }
        
        return false;
    }
    
    async addToQueue(action, data) {
        if (!this.offlineManager) {
            console.error('Cannot add to queue - offline manager not available');
            return false;
        }
        
        try {
            const queueItem = {
                action: action,
                data: data,
                timestamp: new Date().toISOString(),
                id: Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            };
            
            await this.offlineManager.addToSyncQueue(queueItem);
            console.log('Added to sync queue:', action);
            
            // Try immediate sync if online
            if (navigator.onLine) {
                setTimeout(() => this.syncData(), 100);
            }
            
            return true;
        } catch (error) {
            console.error('Error adding to sync queue:', error);
            return false;
        }
    }
    
    async syncData() {
        if (!navigator.onLine) {
            console.log('Cannot sync - device is offline');
            return;
        }
        
        if (this.syncInProgress) {
            console.log('Sync already in progress');
            return;
        }
        
        console.log('Starting sync process...');
        
        try {
            await this.loadQueue();
            console.log('Sync process completed');
        } catch (error) {
            console.error('Sync process failed:', error);
        }
    }
    
    async forceSyncItem(occasionData) {
        if (!navigator.onLine) {
            console.error('Cannot force sync - device is offline');
            return false;
        }
        
        try {
            const success = await this.syncItem({
                action: 'submit_occasion',
                data: occasionData,
                id: 'force_sync_' + Date.now()
            });
            
            if (success) {
                console.log('Force sync successful');
                return true;
            } else {
                console.error('Force sync failed');
                return false;
            }
        } catch (error) {
            console.error('Error in force sync:', error);
            return false;
        }
    }
    
    startAutoSync() {
        // Sync every 5 minutes when online
        this.autoSyncInterval = setInterval(() => {
            if (navigator.onLine && !this.syncInProgress) {
                this.syncData();
            }
        }, 5 * 60 * 1000);
        
        // Sync when coming back online
        window.addEventListener('online', () => {
            console.log('Device came online - starting sync');
            setTimeout(() => this.syncData(), 1000);
        });
        
        // Log when going offline
        window.addEventListener('offline', () => {
            console.log('Device went offline - queueing changes');
        });
        
        console.log('Auto-sync started');
    }
    
    stopAutoSync() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
            this.autoSyncInterval = null;
            console.log('Auto-sync stopped');
        }
    }
    
    updateSyncStatus(successCount, errorCount) {
        // Update UI elements if they exist
        const statusElement = document.getElementById('sync-status');
        if (statusElement) {
            if (errorCount === 0) {
                statusElement.textContent = `Synced ${successCount} items`;
                statusElement.className = 'sync-status success';
            } else {
                statusElement.textContent = `Synced ${successCount}, ${errorCount} failed`;
                statusElement.className = 'sync-status warning';
            }
            
            // Hide status after 3 seconds
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'sync-status';
            }, 3000);
        }
    }
    
    async getQueueStatus() {
        if (!this.offlineManager) {
            return { count: 0, items: [] };
        }
        
        try {
            const queue = await this.offlineManager.getSyncQueue();
            return {
                count: queue.length,
                items: queue.map(item => ({
                    action: item.action,
                    timestamp: item.timestamp,
                    id: item.id
                }))
            };
        } catch (error) {
            console.error('Error getting queue status:', error);
            return { count: 0, items: [] };
        }
    }
    
    async clearQueue() {
        if (!this.offlineManager) {
            console.warn('Cannot clear queue - offline manager not available');
            return false;
        }
        
        try {
            await this.offlineManager.clearSyncQueue();
            console.log('Sync queue cleared');
            return true;
        } catch (error) {
            console.error('Error clearing sync queue:', error);
            return false;
        }
    }
}

// Global sync manager instance
let syncManagerInstance = null;

// Initialize sync manager when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    try {
        if (!syncManagerInstance) {
            syncManagerInstance = new SyncManager();
            
            // Make available globally
            window.syncManager = syncManagerInstance;
            window.SyncManager = SyncManager;
            
            console.log('Sync manager initialized');
            
            // Start auto-sync
            syncManagerInstance.startAutoSync();
        }
    } catch (error) {
        console.error('Failed to initialize sync manager:', error);
    }
});

// Expose SyncManager class globally (prevent redeclaration)
window.SyncManager = SyncManager;

} else {
    console.log('SyncManager already defined, skipping redefinition');
}

// Utility functions for manual sync operations
window.manualSync = async function() {
    if (window.syncManager) {
        await window.syncManager.syncData();
    } else {
        console.error('Sync manager not available');
    }
};

window.getSyncStatus = async function() {
    if (window.syncManager) {
        return await window.syncManager.getQueueStatus();
    } else {
        return { count: 0, items: [] };
    }
};

window.clearSyncQueue = async function() {
    if (window.syncManager) {
        return await window.syncManager.clearQueue();
    } else {
        return false;
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SyncManager;
}
