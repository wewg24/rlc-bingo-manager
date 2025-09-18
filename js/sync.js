// Sync Manager
class SyncManager {
    constructor() {
        this.queue = [];
        this.syncing = false;
        this.syncInProgress = false;
        this.offlineManager = window.offlineManager;
        this.loadQueue();
    }
    
    // FIX: Make loadQueue an async function
    async loadQueue() {
        if (this.syncInProgress || !navigator.onLine) return;
        
        this.syncInProgress = true;
        
        try {
            // Ensure offline manager is available
            if (!this.offlineManager) {
                console.warn('Offline manager not available for sync');
                return;
            }
            
            const queue = await this.offlineManager.getSyncQueue();
            
            for (const item of queue) {
                try {
                    const response = await fetch(CONFIG.API_URL, {
                        method: 'POST',
                        body: new URLSearchParams({
                            action: item.action,
                            data: JSON.stringify(item.data)
                        })
                    });
                    
                    if (response.ok) {
                        // Remove from queue if successful
                        await this.removeFromQueue(item.id);
                    }
                } catch (error) {
                    console.error('Sync error for item:', error);
                }
            }
            
            // Clear successfully synced items
            const remainingQueue = await this.offlineManager.getSyncQueue();
            if (remainingQueue.length === 0) {
                console.log('All items synced successfully');
            }
            
        } catch (error) {
            console.error('Error in loadQueue:', error);
        } finally {
            this.syncInProgress = false;
        }
    }
    
    async removeFromQueue(id) {
        if (!this.offlineManager || !this.offlineManager.db) {
            console.warn('Database not available for queue removal');
            return;
        }
        
        return new Promise((resolve, reject) => {
            const request = this.offlineManager.db
                .transaction(['sync_queue'], 'readwrite')
                .objectStore('sync_queue')
                .delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    // FIX: Make syncData an async function
    async syncData() {
        if (!navigator.onLine || this.syncInProgress) return;
        
        this.syncInProgress = true;
        console.log('Starting sync process...');
        
        try {
            await this.loadQueue();
            console.log('Sync process completed');
        } catch (error) {
            console.error('Sync process failed:', error);
        } finally {
            this.syncInProgress = false;
        }
    }
    
    startAutoSync() {
        // Sync every 5 minutes when online
        setInterval(() => {
            if (navigator.onLine) {
                this.syncData();
            }
        }, 5 * 60 * 1000);
        
        // Sync when coming back online
        window.addEventListener('online', () => {
            setTimeout(() => this.syncData(), 1000);
        });
    }
}

// FIX: Proper initialization with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (!window.syncManager) {
            window.syncManager = new SyncManager();
            window.syncManager.startAutoSync();
        }
    } catch (error) {
        console.error('Failed to initialize sync manager:', error);
    }
});

window.SyncManager = SyncManager;
