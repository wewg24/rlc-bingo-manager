// Main Application Logic
class RLCBingoApp {
  constructor() {
    this.db = null;
    this.user = null;
    this.currentOccasion = null;
    this.isOnline = navigator.onLine;
    
    this.init();
  }
  
  async init() {
    // Initialize database
    this.db = await this.initDB();
    
    // Check authentication
    this.user = this.getStoredUser();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
    
    // Render initial UI
    this.render();
    
    // Start sync if online
    if (this.isOnline) {
      this.syncData();
    }
  }
  
  async initDB() {
    return await localforage.createInstance({
      name: 'RLCBingo',
      version: 1.0,
      storeName: 'data'
    });
  }
  
  getStoredUser() {
    const userStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  async loadPullTabs() {
    try {
      const response = await fetch(CONFIG.API_URL + '?path=pulltab-library');
      const data = await response.json();
      
      if (data.success && data.games) {
        // Populate dropdown
        const select = document.querySelector('select[name="gameName"]');
        if (select) {
          select.innerHTML = '<option value="">Select game...</option>';
          
          data.games.forEach(game => {
            const option = document.createElement('option');
            option.value = game.Name;
            option.textContent = `${game.Name} ($${game.TopPrize})`;
            option.dataset.form = game.FormNumber;
            option.dataset.ideal = game.IdealProfit;
            select.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load pull-tabs:', error);
      // Use offline cached data if available
      await this.loadCachedPullTabs();
    }
  }

  
  renderGamesSheet() {
    const sessionType = document.querySelector('select[name="sessionType"]').value;
    if (!sessionType) return;
    
    const games = CONFIG.GAMES[sessionType] || [];
    const tbody = document.querySelector('#gamesTable tbody');
    
    tbody.innerHTML = games.map((game, index) => `
      <tr>
        <td>${game.num}</td>
        <td>${game.color}</td>
        <td>${game.game}</td>
        <td>$${game.prize}</td>
        <td><input type="text" class="form-control" placeholder="Winners"></td>
        <td><input type="number" class="form-control" placeholder="Total"></td>
        <td><input type="checkbox"></td>
      </tr>
    `).join('');
  }
  
  setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateConnectionStatus();
      this.syncData();
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
  }
  
  render() {
    const app = document.getElementById('app');
    
    if (!this.user) {
      app.innerHTML = this.renderLogin();
    } else {
      app.innerHTML = this.renderMain();
      this.loadCurrentTab();
    }
  }
  
  renderLogin() {
    return `
      <div class="container">
        <div class="card" style="max-width: 400px; margin: 100px auto;">
          <div class="card-header">
            <h2>Login to RLC Bingo Manager</h2>
          </div>
          <div class="card-body">
            <form id="loginForm">
              <div class="form-group">
                <label class="form-label">Username</label>
                <input type="text" class="form-control" name="username" required>
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" name="password" required>
              </div>
              <button type="submit" class="btn btn-primary">Login</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }
  
  renderMain() {
    return `
      <header class="header">
        <div class="header-content">
          <div class="logo">
            <i class="material-icons">casino</i>
            <span>RLC Bingo Manager</span>
          </div>
          <div class="sync-indicator">
            <span class="${this.isOnline ? 'status-online' : 'status-offline'}">
              ${this.isOnline ? '● Online' : '○ Offline'}
            </span>
          </div>
        </div>
      </header>
      
      <nav class="nav-tabs">
        <button class="nav-tab active" data-tab="occasion">
          <i class="material-icons">event</i>
          <span>Occasion</span>
        </button>
        <button class="nav-tab" data-tab="games">
          <i class="material-icons">grid_on</i>
          <span>Games</span>
        </button>
        <button class="nav-tab" data-tab="pulltabs">
          <i class="material-icons">confirmation_number</i>
          <span>Pull-Tabs</span>
        </button>
        <button class="nav-tab" data-tab="money">
          <i class="material-icons">attach_money</i>
          <span>Money</span>
        </button>
        <button class="nav-tab" data-tab="photos">
          <i class="material-icons">photo_camera</i>
          <span>Photos</span>
        </button>
        <button class="nav-tab" data-tab="reports">
          <i class="material-icons">assessment</i>
          <span>Reports</span>
        </button>
      </nav>
      
      <div class="container">
        <div id="tabContent"></div>
      </div>
    `;
  }
  
  loadCurrentTab() {
    // Tab switching logic
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.loadTab(e.currentTarget.dataset.tab);
      });
    });
    
    // Load default tab
    this.loadTab('occasion');
  }
  
  loadTab(tabName) {
    const content = document.getElementById('tabContent');
    
    switch(tabName) {
      case 'occasion':
        content.innerHTML = this.renderOccasionTab();
        break;
      case 'games':
        content.innerHTML = this.renderGamesTab();
        break;
      case 'pulltabs':
        content.innerHTML = this.renderPullTabsTab();
        break;
      case 'money':
        content.innerHTML = this.renderMoneyTab();
        break;
      case 'photos':
        content.innerHTML = this.renderPhotosTab();
        break;
      case 'reports':
        content.innerHTML = this.renderReportsTab();
        break;
    }
  }
  
  renderOccasionTab() {
    return `
      <div class="card">
        <div class="card-header">
          <h3>Bingo Occasion Report</h3>
        </div>
        <div class="card-body">
          <form id="occasionForm">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-control" name="date" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Session Type</label>
                <select class="form-control" name="sessionType" required>
                  <option value="">Select...</option>
                  ${Object.entries(CONFIG.SESSION_TYPES).map(([key, value]) => 
                    `<option value="${key}">${value}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Lion in Charge</label>
                <input type="text" class="form-control" name="lionInCharge" required>
              </div>
              <div class="form-group">
                <label class="form-label">Total Players</label>
                <input type="number" class="form-control" name="totalPlayers" min="0" required>
              </div>
            </div>
            
            <div class="card" style="margin-top: 20px; background: #f0f8ff;">
              <div class="card-body">
                <h4>Progressive Game</h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Jackpot</label>
                    <input type="number" class="form-control" name="progJackpot" step="1">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Balls to Win</label>
                    <input type="number" class="form-control" name="progBalls" min="1" max="75">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Consolation</label>
                    <input type="number" class="form-control" name="progConsolation" value="200">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Actual Balls</label>
                    <input type="number" class="form-control" name="progActualBalls" min="0" max="75">
                  </div>
                </div>
              </div>
            </div>
            
            <div style="margin-top: 20px;">
              <button type="submit" class="btn btn-primary">Save Occasion</button>
              <button type="button" class="btn btn-secondary" onclick="app.printBlankForm('occasion')">Print Blank Form</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
  
  renderGamesTab() {
    const sessionType = this.currentOccasion?.sessionType || '5-1';
    const games = CONFIG.GAMES[sessionType] || CONFIG.GAMES['5-1'];
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>Session Games Sheet</h3>
        </div>
        <div class="card-body">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Color</th>
                <th>Game</th>
                <th>Prize</th>
                <th>Winners</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${games.map(game => `
                <tr>
                  <td>${game.num}</td>
                  <td>${game.color}</td>
                  <td>${game.game}</td>
                  <td>$${game.prize}</td>
                  <td><input type="number" class="form-control" value="1" min="1" style="width: 60px;"></td>
                  <td>$${game.prize}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <button class="btn btn-primary" onclick="app.saveGames()">Save Games</button>
        </div>
      </div>
    `;
  }
  
  renderPullTabsTab() {
    return `
      <div class="card">
        <div class="card-header">
          <h3>Pull-Tab Summary</h3>
        </div>
        <div class="card-body">
          <button class="btn btn-primary" onclick="app.addPullTabGame()">Add Game</button>
          <div id="pullTabGames" style="margin-top: 20px;">
            <!-- Games will be added here -->
          </div>
        </div>
      </div>
    `;
  }
  
  renderMoneyTab() {
    return `
      <div class="card">
        <div class="card-header">
          <h3>Money Count Sheet</h3>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">$100 Bills</label>
              <input type="number" class="form-control money-input" data-denom="100" min="0" onchange="app.calculateMoney()">
            </div>
            <div class="form-group">
              <label class="form-label">$50 Bills</label>
              <input type="number" class="form-control money-input" data-denom="50" min="0" onchange="app.calculateMoney()">
            </div>
            <div class="form-group">
              <label class="form-label">$20 Bills</label>
              <input type="number" class="form-control money-input" data-denom="20" min="0" onchange="app.calculateMoney()">
            </div>
            <div class="form-group">
              <label class="form-label">$10 Bills</label>
              <input type="number" class="form-control money-input" data-denom="10" min="0" onchange="app.calculateMoney()">
            </div>
            <div class="form-group">
              <label class="form-label">$5 Bills</label>
              <input type="number" class="form-control money-input" data-denom="5" min="0" onchange="app.calculateMoney()">
            </div>
            <div class="form-group">
              <label class="form-label">$1 Bills</label>
              <input type="number" class="form-control money-input" data-denom="1" min="0" onchange="app.calculateMoney()">
            </div>
          </div>
          <div class="card" style="margin-top: 20px; background: #f8f9fa;">
            <div class="card-body">
              <h3>Total: <span id="moneyTotal">$0.00</span></h3>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  renderPhotosTab() {
    return `
      <div class="card">
        <div class="card-header">
          <h3>Photo Documentation</h3>
        </div>
        <div class="card-body">
          <div class="photo-upload" onclick="app.selectPhoto()">
            <i class="material-icons" style="font-size: 48px; color: #bdc3c7;">add_photo_alternate</i>
            <p>Click to upload photos</p>
            <input type="file" id="photoInput" accept="image/*" multiple style="display: none;" onchange="app.handlePhotos(event)">
          </div>
          <div class="photo-preview" id="photoPreview">
            <!-- Photos will appear here -->
          </div>
        </div>
      </div>
    `;
  }
  
  renderReportsTab() {
    return `
      <div class="card">
        <div class="card-header">
          <h3>Reports & Analytics</h3>
        </div>
        <div class="card-body">
          <button class="btn btn-primary" onclick="app.generatePDF()">Generate PDF Report</button>
          <button class="btn btn-success" onclick="app.generateMGCForm()">MGC Form 104</button>
          <button class="btn btn-warning" onclick="app.exportData()">Export Data</button>
        </div>
      </div>
    `;
  }
  
  // Data operations
  async saveOccasion(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Add metadata
    data.id = 'OCC_' + Date.now();
    data.timestamp = new Date().toISOString();
    data.userId = this.user.id;
    
    // Save locally
    await this.db.setItem(data.id, data);
    
    // Queue for sync
    await this.queueForSync('occasion', data);
    
    this.currentOccasion = data;
    
    // Show success message
    this.showToast('Occasion saved successfully!');
    
    // Try to sync if online
    if (this.isOnline) {
      this.syncData();
    }
  }
  
  async queueForSync(type, data) {
    const queue = await this.db.getItem('syncQueue') || [];
    queue.push({
      type: type,
      data: data,
      timestamp: Date.now()
    });
    await this.db.setItem('syncQueue', queue);
  }
  
  async syncData() {
    const queue = await this.db.getItem('syncQueue') || [];
    if (queue.length === 0) return;
    
    for (const item of queue) {
      try {
        const response = await fetch(CONFIG.API_URL + '?path=sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.getToken()
          },
          body: JSON.stringify(item)
        });
        
        if (response.ok) {
          // Remove from queue
          const newQueue = queue.filter(q => q !== item);
          await this.db.setItem('syncQueue', newQueue);
        }
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }
  
  calculateMoney() {
    let total = 0;
    document.querySelectorAll('.money-input').forEach(input => {
      const count = parseInt(input.value) || 0;
      const denom = parseInt(input.dataset.denom);
      total += count * denom;
    });
    document.getElementById('moneyTotal').textContent = '$' + total.toFixed(2);
  }
  
  selectPhoto() {
    document.getElementById('photoInput').click();
  }
  
  async handlePhotos(event) {
    const files = event.target.files;
    const preview = document.getElementById('photoPreview');
    
    for (const file of files) {
      // Compress and display
      const compressed = await compressImage(file);
      
      // Display thumbnail
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'photo-thumb';
        preview.appendChild(img);
      };
      reader.readAsDataURL(compressed);
      
      // Queue for upload
      await this.queuePhotoUpload(compressed);
    }
  }
  
  async queuePhotoUpload(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const photoData = {
        id: 'PHOTO_' + Date.now(),
        occasionId: this.currentOccasion?.id,
        data: e.target.result,
        timestamp: new Date().toISOString()
      };
      
      await this.queueForSync('photo', photoData);
    };
    reader.readAsDataURL(file);
  }
  
  generatePDF() {
    // Use pdfmake to generate PDF
    const docDefinition = {
      content: [
        { text: 'RLC Bingo Occasion Report', style: 'header' },
        { text: `Date: ${this.currentOccasion?.date || 'N/A'}` },
        { text: `Session: ${this.currentOccasion?.sessionType || 'N/A'}` },
        // Add more content
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        }
      }
    };
    
    pdfMake.createPdf(docDefinition).download('occasion-report.pdf');
  }
  
  printBlankForm(type) {
    window.print();
  }
  
  showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 9999;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  
  updateConnectionStatus() {
    const indicator = document.querySelector('.sync-indicator span');
    if (indicator) {
      indicator.className = this.isOnline ? 'status-online' : 'status-offline';
      indicator.textContent = this.isOnline ? '● Online' : '○ Offline';
    }
  }
  
  getToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN) || '';
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new RLCBingoApp();
});
