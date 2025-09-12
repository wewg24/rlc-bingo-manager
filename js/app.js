
// Initialize IndexedDB
async function initDB() {
  const db = await openDB('RLCBingo', 1, {
    upgrade(db) {
      db.createObjectStore('occasions', { keyPath: 'id' });
      db.createObjectStore('photos', { keyPath: 'id' });
      db.createObjectStore('syncQueue', { keyPath: 'id' });
    }
  });
  return db;
}

// Save locally first
async function saveLocally(data) {
  const db = await initDB();
  await db.put('occasions', data);
  queueForSync(data);
}

// Sync when online
async function syncData() {
  if (!navigator.onLine) return;
  
  const db = await initDB();
  const queue = await db.getAll('syncQueue');
  
  for (const item of queue) {
    try {
      const response = await fetch(API_CONFIG.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      
      if (response.ok) {
        await db.delete('syncQueue', item.id);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
