// Main Application Logic with Complete Integration
class RLCBingoApp {
  constructor() {
    this.db = null;
    this.user = null;
    this.currentOccasion = null;
    this.isOnline = navigator.onLine;
    this.syncManager = null;
    this.offlineManager = null;
    
    this.init();
  }
  
  async init() {
    // Initialize database
    this.db = await this.initDB();
    
    // Initialize managers
    this.offlineManager = new OfflineManager();
    this.syncManager = new SyncManager();
    
    // Check authentication (skip for now, no auth required)
    this.user = { name: 'User', role: 'admin' };
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
    
    // Load pull-tab library
    await this.loadPullTabLibrary();
    
    // Render initial UI
    this.render();
    
    // Start sync if online
    if (this.isOnline) {
      this.syncManager.syncAll();
    }
  }
  
  async initDB() {
    return await localforage.createInstance({
      name: 'RLCBingo',
      version: 1.0,
      storeName: 'data'
    });
  }
  
  setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateConnectionStatus();
      this.syncManager.syncAll();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateConnectionStatus();
    });
    
    // Form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'occasionForm') {
        e.preventDefault();
        this.saveOccasion(e.target);
      }
    });
    
    // Tab navigation
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-btn')) {
        this.switchTab(e.target.dataset.tab);
      }
    });
  }
  
  async loadPullTabLibrary() {
    try {
      const response = await fetch(CONFIG.API_URL + '?path=pulltab-library');
      const data = await response.json();
      
      if (data.success && data.games) {
        // Store in local database for offline access
        await this.db.setItem('pullTabLibrary', data.games);
        console.log('Pull-tab library loaded:', data.games.length, 'games');
      }
    } catch (error) {
      console.error('Failed to load pull-tab library:', error);
      // Try to load from cache
      const cached = await this.db.getItem('pullTabLibrary');
      if (cached) {
        console.log('Using cached pull-tab library');
      }
    }
  }
  
  async saveOccasion(form) {
    const formData = new FormData(form);
    
    // Build occasion object
    const occasion = {
      date: formData.get('date'),
      sessionType: formData.get('sessionType'),
      lionInCharge: formData.get('lionInCharge'),
      totalPeople: parseInt(formData.get('totalPeople')) || 0,
      birthdays: parseInt(formData.get('birthdays')) || 0,
      
      progressive: {
        jackpot: parseFloat(formData.get('progJackpot')) || 0,
        ballsNeeded: parseInt(formData.get('progBalls')) || 48,
        consolation: parseFloat(formData.get('progConsolation')) || 200,
        actualBalls: parseInt(formData.get('progActualBalls')) || 0,
        prizeAwarded: parseFloat(formData.get('progPrize')) || 0,
        checkPayment: formData.get('progCheck') === 'on'
      },
      
      paperBingo: this.collectPaperBingoData(formData),
      posDoorSales: this.collectPOSDoorSalesData(formData),
      electronicBingo: this.collectElectronicData(formData),
      sessionGames: this.collectSessionGamesData(),
      pullTabGames: this.collectPullTabData(),
      moneyCount: this.collectMoneyCountData(formData)
    };
    
    // Save via sync manager
    const result = await this.syncManager.syncOccasion(occasion);
    
    if (result) {
      this.showToast('Occasion saved successfully!', 'success');
      form.reset();
      // Refresh the UI
      this.render();
    } else {
      this.showToast('Failed to save occasion', 'error');
    }
  }
  
  collectPaperBingoData(formData) {
    const types = ['special3on', 'special6on', 'special9on', 'regular3on', 'regular6on', 'regular9on'];
    const paperBingo = {};
    
    types.forEach(type => {
      paperBingo[type] = {
        start: parseInt(formData.get(`${type}_start`)) || 0,
        free: parseInt(formData.get(`${type}_free`)) || 0,
        end: parseInt(formData.get(`${type}_end`)) || 0
      };
    });
    
    return paperBingo;
  }
  
  collectPOSDoorSalesData(formData) {
    const items = [
      'special3on', 'special6on', 'special9on', 'special9onActual',
      'regular3on', 'regular6on', 'regular9on', 'regular2nd9on',
      'daubers', 'dobber'
    ];
    const posDoorSales = {};
    
    items.forEach(item => {
      posDoorSales[item] = parseInt(formData.get(`door_${item}`)) || 0;
    });
    
    return posDoorSales;
  }
  
  collectElectronicData(formData) {
    return {
      smallMachines: parseInt(formData.get('smallMachines')) || 0,
      largeMachines: parseInt(formData.get('largeMachines')) || 0
    };
  }
  
  collectSessionGamesData() {
    const games = [];
    const gameRows = document.querySelectorAll('.session-game-row');
    
    gameRows.forEach(row => {
      const game = {
        number: parseInt(row.querySelector('[name="gameNumber"]').value),
        color: row.querySelector('[name="gameColor"]').value,
        name: row.querySelector('[name="gameName"]').value,
        prize: parseFloat(row.querySelector('[name="gamePrize"]').value) || 0,
        winners: parseInt(row.querySelector('[name="gameWinners"]').value) || 0,
        prizePerWinner: parseFloat(row.querySelector('[name="gamePrizePerWinner"]').value) || 0,
        totalPayout: parseFloat(row.querySelector('[name="gameTotalPayout"]').value) || 0,
        checkPayment: row.querySelector('[name="gameCheck"]').checked
      };
      games.push(game);
    });
    
    return games;
  }
  
  collectPullTabData() {
    const games = [];
    const pullTabRows = document.querySelectorAll('.pulltab-row');
    
    pullTabRows.forEach(row => {
      const game = {
        gameName: row.querySelector('[name="ptGameName"]').value,
        serialNumber: row.querySelector('[name="ptSerial"]').value,
        ticketPrice: parseFloat(row.querySelector('[name="ptPrice"]').value) || 1,
        ticketsSold: parseInt(row.querySelector('[name="ptSold"]').value) || 0,
        salesRevenue: parseFloat(row.querySelector('[name="ptRevenue"]').value) || 0,
        prizesPaid: parseFloat(row.querySelector('[name="ptPrizes"]').value) || 0,
        netProfit: parseFloat(row.querySelector('[name="ptNet"]').value) || 0,
        checkPayment: row.querySelector('[name="ptCheck"]').checked,
        isSpecialEvent: row.classList.contains('special-event')
      };
      
      if (game.gameName) {
        games.push(game);
      }
    });
    
    return games;
  }
  
  collectMoneyCountData(formData) {
    return {
      startingBank: parseFloat(formData.get('startingBank')) || 500,
      hundreds: parseInt(formData.get('hundreds')) || 0,
      fifties: parseInt(formData.get('fifties')) || 0,
      twenties: parseInt(formData.get('twenties')) || 0,
      tens: parseInt(formData.get('tens')) || 0,
      fives: parseInt(formData.get('fives')) || 0,
      ones: parseInt(formData.get('ones')) || 0,
      quarters: parseFloat(formData.get('quarters')) || 0,
      dimes: parseFloat(formData.get('dimes')) || 0,
      nickels: parseFloat(formData.get('nickels')) || 0,
      pennies: parseFloat(formData.get('pennies')) || 0,
      cashTotal: parseFloat(formData.get('cashTotal')) || 0,
      checksTotal: parseFloat(formData.get('checksTotal')) || 0,
      drawerTotal: parseFloat(formData.get('drawerTotal')) || 0,
      depositAmount: parseFloat(formData.get('depositAmount')) || 0,
      overShort: parseFloat(formData.get('overShort')) || 0
    };
  }
  
  updateConnectionStatus() {
    const indicator = document.querySelector('.sync-indicator');
    if (indicator) {
      const status = this.syncManager.getSyncStatus();
      indicator.innerHTML = `
        <span class="${status.isOnline ? 'online' : 'offline'}">
          <i class="material-icons">${status.isOnline ? 'cloud_done' : 'cloud_off'}</i>
          ${status.isOnline ? 'Online' : 'Offline'}
          ${status.queueLength > 0 ? ` (${status.queueLength} pending)` : ''}
        </span>
      `;
    }
  }
  
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
  window.app = new RLCBingoApp();
});
