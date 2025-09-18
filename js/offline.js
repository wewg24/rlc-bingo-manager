// Offline functionality - Complete implementation
// Version 11.0.4 - Fixed all syntax errors and missing functions

class OfflineManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.initDB();
    }
    
    async initDB() {
        return new Promise((resolve, reject) => {
            // Clear old database if version mismatch
            const deleteReq = indexedDB.deleteDatabase('RLCBingo');
            
            deleteReq.onsuccess = () => {
                const request = indexedDB.open('RLCBingo', 2); // Use version 2
                
                request.onerror = () => {
                    console.error('Database error:', request.error);
                    reject(request.error);
                };
                
                request.onsuccess = () => {
                    this.db = request.result;
                    this.isInitialized = true;
                    console.log('IndexedDB initialized successfully');
                    resolve();
                };
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    
                    // Create object stores
                    if (!db.objectStoreNames.contains('occasions')) {
                        const occasionStore = db.createObjectStore('occasions', { keyPath: 'occasionId' });
                        occasionStore.createIndex('date', 'date', { unique: false });
                    }
                    
                    if (!db.objectStoreNames.contains('drafts')) {
                        db.createObjectStore('drafts', { keyPath: 'id' });
                    }
                    
                    if (!db.objectStoreNames.contains('sync_queue')) {
                        const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
                        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                    
                    if (!db.objectStoreNames.contains('pull_tab_library')) {
                        db.createObjectStore('pull_tab_library', { keyPath: 'id' });
                    }
                };
            };
            
            deleteReq.onerror = () => {
                console.warn('Could not delete old database, proceeding with current version');
                // Try to open existing database
                const request = indexedDB.open('RLCBingo', 2);
                
                request.onsuccess = () => {
                    this.db = request.result;
                    this.isInitialized = true;
                    resolve();
                };
                
                request.onerror = () => reject(request.error);
            };
        });
    }
    
    // Wait for database to be ready
    async waitForDB() {
        while (!this.isInitialized || !this.db) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return this.db;
    }
    
    async saveOccasion(data) {
        await this.waitForDB();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['occasions'], 'readwrite');
                const store = transaction.objectStore('occasions');
                
                // Ensure occasionId exists
                if (!data.occasionId) {
                    data.occasionId = 'OCC_' + Date.now();
                }
                
                const request = store.put(data); // Use put instead of add to allow updates
                
                request.onsuccess = () => {
                    console.log('Occasion saved successfully:', data.occasionId);
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.error('Error saving occasion:', request.error);
                    reject(request.error);
                };
                
                transaction.onerror = () => {
                    console.error('Transaction error:', transaction.error);
                    reject(transaction.error);
                };
                
            } catch (error) {
                console.error('Error in saveOccasion:', error);
                reject(error);
            }
        });
    }
    
    async getOccasions() {
        await this.waitForDB();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['occasions'], 'readonly');
                const store = transaction.objectStore('occasions');
                const request = store.getAll();
                
                request.onsuccess = () => {
                    console.log('Retrieved occasions:', request.result.length);
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.error('Error getting occasions:', request.error);
                    reject(request.error);
                };
                
            } catch (error) {
                console.error('Error in getOccasions:', error);
                reject(error);
            }
        });
    }
    
    async getOccasion(occasionId) {
        await this.waitForDB();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['occasions'], 'readonly');
                const store = transaction.objectStore('occasions');
                const request = store.get(occasionId);
                
                request.onsuccess = () => {
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    reject(request.error);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    async saveDraft(data) {
        await this.waitForDB();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['drafts'], 'readwrite');
                const store = transaction.objectStore('drafts');
                const draftData = { 
                    id: 'current', 
                    data: data, 
                    timestamp: new Date().toISOString() 
                };
                const request = store.put(draftData);
                
                request.onsuccess = () => {
                    console.log('Draft saved successfully');
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.error('Error saving draft:', request.error);
                    reject(request.error);
                };
                
            } catch (error) {
                console.error('Error in saveDraft:', error);
                reject(error);
            }
        });
    }
    
    async getDraft() {
        await this.waitForDB();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['drafts'], 'readonly');
                const store = transaction.objectStore('drafts');
                const request = store.get('current');
                
                request.onsuccess = () => {
                    const result = request.result;
                    if (result) {
                        console.log('Draft loaded from:', result.timestamp);
                        resolve(result);
                    } else {
                        console.log('No draft found');
                        resolve(null);
                    }
                };
                
                request.onerror = () => {
                    console.error('Error getting draft:', request.error);
                    reject(request.error);
                };
                
            } catch (error) {
                console.error('Error in getDraft:', error);
                reject(error);
            }
        });
    }
    
    async clearDraft() {
        await this.waitForDB();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['drafts'], 'readwrite');
                const store = transaction.objectStore('drafts');
                const request = store.delete('current');
                
                request.onsuccess = () => {
                    console.log('Draft cleared');
                    resolve();
                };
                
                request.onerror = () => {
                    console.error('Error clearing draft:', request.error);
                    reject(request.error);
                };
                
            } catch (error) {
                console.error('Error in clearDraft:', error);
                reject(error);
            }
        });
    }
    
    async addToSyncQueue(item) {
        await this.waitForDB();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['sync_queue'], 'readwrite');
                const store = transaction.objectStore('sync_queue');
                
                // Add timestamp and unique ID if not present
                if (!item.timestamp) {
                    item.timestamp = new Date().toISOString();
                }
                if (!item.id) {
                    item.id = Date.now() + '_' + Math.random();
                }
                
                const request = store.add(item);
                
                request.onsuccess = () => {
                    console.log('Added to sync queue:', item.action);
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.error('Error adding to sync queue:', request.error);
                    reject(request.error);
                };
                
            } catch (error) {
                console.error('Error in addToSyncQueue:', error);
                reject(error);
            }
        });
    }
    
    async getSyncQueue() {
        await this.waitForDB();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['sync_queue'], 'readonly');
                const store = transaction.objectStore('sync_queue');
                const request = store.getAll();
                
                request.onsuccess = () => {
                    console.log('Sync queue items:', request.result.length);
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.error('Error getting sync queue:', request.error);
                    reject(request.error);
                };
                
            } catch (error) {
                console.error('Error in getSyncQueue:', error);
                reject(error);
            }
        });
    }
    
    async removeFromSyncQueue(id) {
        await this.waitForDB();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['sync_queue'], 'readwrite');
                const store = transaction.objectStore('sync_queue');
                const request = store.delete(id);
                
                request.onsuccess = () => {
                    console.log('Removed from sync queue:', id);
                    resolve();
                };
                
                request.onerror = () => {
                    console.error('Error removing from sync queue:', request.error);
                    reject(request.error);
                };
                
            } catch (error) {
                console.error('Error in removeFromSyncQueue:', error);
                reject(error);
            }
        });
    }
    
    async clearSyncQueue() {
        await this.waitForDB();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['sync_queue'], 'readwrite');
                const store = transaction.objectStore('sync_queue');
                const request = store.clear();
                
                request.onsuccess = () => {
                    console.log('Sync queue cleared');
                    resolve();
                };
                
                request.onerror = () => {
                    console.error('Error clearing sync queue:', request.error);
                    reject(request.error);
                };
                
            } catch (error) {
                console.error('Error in clearSyncQueue:', error);
                reject(error);
            }
        });
    }
    
    async savePullTabLibrary(library) {
        await this.waitForDB();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['pull_tab_library'], 'readwrite');
                const store = transaction.objectStore('pull_tab_library');
                
                // Clear existing library
                const clearRequest = store.clear();
                
                clearRequest.onsuccess = () => {
                    // Add all library items
                    let completed = 0;
                    const total = library.length;
                    
                    if (total === 0) {
                        resolve();
                        return;
                    }
                    
                    library.forEach((game, index) => {
                        const addRequest = store.add({
                            id: game.Game || index,
                            ...game
                        });
                        
                        addRequest.onsuccess = () => {
                            completed++;
                            if (completed === total) {
                                console.log('Pull-tab library saved:', total, 'games');
                                resolve();
                            }
                        };
                        
                        addRequest.onerror = () => {
                            console.error('Error saving game:', game);
                            reject(addRequest.error);
                        };
                    });
                };
                
                clearRequest.onerror = () => {
                    reject(clearRequest.error);
                };
                
            } catch (error) {
                console.error('Error in savePullTabLibrary:', error);
                reject(error);
            }
        });
    }
    
    async getPullTabLibrary() {
        await this.waitForDB();
        
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['pull_tab_library'], 'readonly');
                const store = transaction.objectStore('pull_tab_library');
                const request = store.getAll();
                
                request.onsuccess = () => {
                    console.log('Retrieved pull-tab library:', request.result.length, 'games');
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.error('Error getting pull-tab library:', request.error);
                    reject(request.error);
                };
                
            } catch (error) {
                console.error('Error in getPullTabLibrary:', error);
                reject(error);
            }
        });
    }
    
    // Utility method to check if online
    isOnline() {
        return navigator.onLine;
    }
    
    // Get storage usage information
    async getStorageInfo() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                return {
                    used: estimate.usage,
                    available: estimate.quota,
                    usedMB: Math.round(estimate.usage / (1024 * 1024) * 100) / 100,
                    availableMB: Math.round(estimate.quota / (1024 * 1024) * 100) / 100
                };
            } catch (error) {
                console.warn('Storage estimate not available:', error);
                return null;
            }
        }
        return null;
    }
}

// Service Worker Registration with proper error handling
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Detect if we're on GitHub Pages and adjust path accordingly
        const swPath = window.location.hostname === 'wewg24.github.io' 
            ? '/rlc-bingo-manager/sw.js' 
            : '/sw.js';
            
        navigator.serviceWorker.register(swPath)
            .then(registration => {
                console.log('SW registered successfully:', registration.scope);
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    console.log('Service worker update found');
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New content available, will refresh on next visit');
                        }
                    });
                });
            })
            .catch(error => {
                console.warn('SW registration failed:', error);
            });
    });
}

// Global offline manager instance
let offlineManagerInstance = null;

// Initialize offline manager when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    try {
        if (!offlineManagerInstance) {
            offlineManagerInstance = new OfflineManager();
            await offlineManagerInstance.waitForDB();
            
            // Make available globally
            window.offlineManager = offlineManagerInstance;
            window.OfflineManager = OfflineManager;
            
            console.log('Offline manager initialized successfully');
            
            // Update online/offline status
            updateConnectionStatus();
            
            // Listen for connection changes
            window.addEventListener('online', updateConnectionStatus);
            window.addEventListener('offline', updateConnectionStatus);
        }
    } catch (error) {
        console.error('Failed to initialize offline manager:', error);
    }
});

// Connection status management
function updateConnectionStatus() {
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    
    if (navigator.onLine) {
        if (statusIndicator) {
            statusIndicator.style.color = '#28a745';
            statusIndicator.textContent = '●';
        }
        if (statusText) {
            statusText.textContent = 'Online';
        }
        console.log('Connection: Online');
        
        // Trigger sync when coming back online
        if (window.syncManager && typeof window.syncManager.syncData === 'function') {
            setTimeout(() => {
                window.syncManager.syncData();
            }, 1000);
        }
    } else {
        if (statusIndicator) {
            statusIndicator.style.color = '#dc3545';
            statusIndicator.textContent = '●';
        }
        if (statusText) {
            statusText.textContent = 'Offline';
        }
        console.log('Connection: Offline');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfflineManager;
}
