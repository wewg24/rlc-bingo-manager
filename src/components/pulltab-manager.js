// src/components/pulltab-manager.js
class PullTabManager {
  constructor() {
    this.games = [];
    this.currentGameId = 0;
  }

  render() {
    return `
      <div class="pulltab-manager">
        <div class="manager-header">
          <h3>Pull-Tab Game Management</h3>
          <button class="btn btn-primary" onclick="pullTabManager.addGame()">
            <i class="material-icons">add</i>
            Add Pull-Tab Game
          </button>
        </div>
        
        <div id="pullTabGames" class="games-container">
          ${this.games.length === 0 ? 
            '<p class="no-games">No pull-tab games added yet. Click "Add Pull-Tab Game" to start.</p>' :
            this.games.map(game => this.renderGame(game)).join('')
          }
        </div>
        
        <div class="pulltab-summary">
          <h4>Session Summary</h4>
          <div class="summary-grid">
            <div class="summary-item">
              <label>Total Sales:</label>
              <span id="pullTabTotalSales">$0.00</span>
            </div>
            <div class="summary-item">
              <label>Total Prizes:</label>
              <span id="pullTabTotalPrizes">$0.00</span>
            </div>
            <div class="summary-item">
              <label>Net Revenue:</label>
              <span id="pullTabNetRevenue">$0.00</span>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-primary" onclick="pullTabManager.save()">
            <i class="material-icons">save</i>
            Save Pull-Tab Data
          </button>
          <button type="button" class="btn btn-secondary" onclick="pullTabManager.printReport()">
            <i class="material-icons">print</i>
            Print Report
          </button>
        </div>
      </div>
    `;
  }

  renderGame(game) {
    return `
      <div class="pulltab-game card" id="pulltab_${game.id}">
        <div class="card-header">
          <h4>Game #${game.id + 1}</h4>
          <button class="btn btn-danger btn-sm" onclick="pullTabManager.removeGame(${game.id})">
            <i class="material-icons">delete</i>
          </button>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Game Name</label>
              <input type="text" 
                     class="form-control" 
                     id="gameName_${game.id}"
                     value="${game.name || ''}"
                     placeholder="e.g., Lucky 7s">
            </div>
            
            <div class="form-group">
              <label class="form-label">Serial Number</label>
              <input type="text" 
                     class="form-control" 
                     id="serialNum_${game.id}"
                     value="${game.serial || ''}"
                     placeholder="Serial #">
            </div>
            
            <div class="form-group">
              <label class="form-label">Price per Tab</label>
              <select class="form-control" id="tabPrice_${game.id}" onchange="pullTabManager.calculate(${game.id})">
                <option value="0.25">$0.25</option>
                <option value="0.50">$0.50</option>
                <option value="1.00" selected>$1.00</option>
                <option value="2.00">$2.00</option>
                <option value="5.00">$5.00</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Starting Count</label>
              <input type="number" 
                     class="form-control" 
                     id="startCount_${game.id}"
                     value="${game.startCount || 0}"
                     min="0"
                     onchange="pullTabManager.calculate(${game.id})">
            </div>
            
            <div class="form-group">
              <label class="form-label">Ending Count</label>
              <input type="number" 
                     class="form-control" 
                     id="endCount_${game.id}"
                     value="${game.endCount || 0}"
                     min="0"
                     onchange="pullTabManager.calculate(${game.id})">
            </div>
            
            <div class="form-group">
              <label class="form-label">Tabs Sold</label>
              <input type="number" 
                     class="form-control" 
                     id="tabsSold_${game.id}"
                     readonly
                     value="0">
            </div>
            
            <div class="form-group">
              <label class="form-label">Gross Sales</label>
              <input type="text" 
                     class="form-control" 
                     id="grossSales_${game.id}"
                     readonly
                     value="$0.00">
            </div>
            
            <div class="form-group">
              <label class="form-label">Prizes Paid</label>
              <input type="number" 
                     class="form-control" 
                     id="prizesPaid_${game.id}"
                     value="${game.prizesPaid || 0}"
                     min="0"
                     step="1"
                     onchange="pullTabManager.calculate(${game.id})">
            </div>
            
            <div class="form-group">
              <label class="form-label">Net Revenue</label>
              <input type="text" 
                     class="form-control" 
                     id="netRevenue_${game.id}"
                     readonly
                     value="$0.00">
            </div>
          </div>
          
          <div class="prize-tracking">
            <h5>Prize Winners</h5>
            <div class="prize-entries" id="prizes_${game.id}">
              <div class="prize-entry">
                <input type="number" placeholder="Amount" class="form-control" style="width: 100px; display: inline-block;">
                <input type="text" placeholder="Winner Name/Info" class="form-control" style="width: 200px; display: inline-block;">
                <button class="btn btn-sm" onclick="pullTabManager.addPrizeEntry(${game.id})">
                  <i class="material-icons">add</i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  addGame() {
    const game = {
      id: this.currentGameId++,
      name: '',
      serial: '',
      tabPrice: 1.00,
      startCount: 0,
      endCount: 0,
      tabsSold: 0,
      grossSales: 0,
      prizesPaid: 0,
      netRevenue: 0,
      prizes: []
    };
    
    this.games.push(game);
    
    const container = document.getElementById('pullTabGames');
    if (this.games.length === 1) {
      container.innerHTML = '';
    }
    
    const gameHtml = this.renderGame(game);
    container.insertAdjacentHTML('beforeend', gameHtml);
    
    this.calculate(game.id);
  }

  removeGame(gameId) {
    if (confirm('Are you sure you want to remove this game?')) {
      this.games = this.games.filter(g => g.id !== gameId);
      document.getElementById(`pulltab_${gameId}`).remove();
      
      if (this.games.length === 0) {
        document.getElementById('pullTabGames').innerHTML = 
          '<p class="no-games">No pull-tab games added yet. Click "Add Pull-Tab Game" to start.</p>';
      }
      
      this.calculateTotals();
    }
  }

  calculate(gameId) {
    const tabPrice = parseFloat(document.getElementById(`tabPrice_${gameId}`).value) || 0;
    const startCount = parseInt(document.getElementById(`startCount_${gameId}`).value) || 0;
    const endCount = parseInt(document.getElementById(`endCount_${gameId}`).value) || 0;
    const prizesPaid = parseFloat(document.getElementById(`prizesPaid_${gameId}`).value) || 0;
    
    const tabsSold = Math.max(0, startCount - endCount);
    const grossSales = tabsSold * tabPrice;
    const netRevenue = grossSales - prizesPaid;
    
    document.getElementById(`tabsSold_${gameId}`).value = tabsSold;
    document.getElementById(`grossSales_${gameId}`).value = `$${grossSales.toFixed(2)}`;
    document.getElementById(`netRevenue_${gameId}`).value = `$${netRevenue.toFixed(2)}`;
    
    // Update game object
    const game = this.games.find(g => g.id === gameId);
    if (game) {
      game.tabsSold = tabsSold;
      game.grossSales = grossSales;
      game.netRevenue = netRevenue;
    }
    
    this.calculateTotals();
  }

  calculateTotals() {
    let totalSales = 0;
    let totalPrizes = 0;
    
    this.games.forEach(game => {
      const grossSales = parseFloat(document.getElementById(`grossSales_${game.id}`).value.replace('$', '')) || 0;
      const prizesPaid = parseFloat(document.getElementById(`prizesPaid_${game.id}`).value) || 0;
      
      totalSales += grossSales;
      totalPrizes += prizesPaid;
    });
    
    const netRevenue = totalSales - totalPrizes;
    
    document.getElementById('pullTabTotalSales').textContent = `$${totalSales.toFixed(2)}`;
    document.getElementById('pullTabTotalPrizes').textContent = `$${totalPrizes.toFixed(2)}`;
    document.getElementById('pullTabNetRevenue').textContent = `$${netRevenue.toFixed(2)}`;
  }

  addPrizeEntry(gameId) {
    const container = document.getElementById(`prizes_${gameId}`);
    const entry = document.createElement('div');
    entry.className = 'prize-entry';
    entry.innerHTML = `
      <input type="number" placeholder="Amount" class="form-control" style="width: 100px; display: inline-block;">
      <input type="text" placeholder="Winner Name/Info" class="form-control" style="width: 200px; display: inline-block;">
      <button class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">
        <i class="material-icons">remove</i>
      </button>
    `;
    container.appendChild(entry);
  }

  save() {
    const data = [];
    
    this.games.forEach(game => {
      const gameData = {
        id: game.id,
        name: document.getElementById(`gameName_${game.id}`).value,
        serial: document.getElementById(`serialNum_${game.id}`).value,
        tabPrice: parseFloat(document.getElementById(`tabPrice_${game.id}`).value),
        startCount: parseInt(document.getElementById(`startCount_${game.id}`).value),
        endCount: parseInt(document.getElementById(`endCount_${game.id}`).value),
        tabsSold: parseInt(document.getElementById(`tabsSold_${game.id}`).value),
        grossSales: parseFloat(document.getElementById(`grossSales_${game.id}`).value.replace('$', '')),
        prizesPaid: parseFloat(document.getElementById(`prizesPaid_${game.id}`).value),
        netRevenue: parseFloat(document.getElementById(`netRevenue_${game.id}`).value.replace('$', '')),
        prizes: this.collectPrizes(game.id),
        timestamp: new Date().toISOString()
      };
      
      data.push(gameData);
    });
    
    const occasionId = app.currentOccasion?.id;
    if (occasionId) {
      app.queueForSync('pulltabs', {
        occasionId: occasionId,
        games: data,
        totals: {
          totalSales: parseFloat(document.getElementById('pullTabTotalSales').textContent.replace('$', '')),
          totalPrizes: parseFloat(document.getElementById('pullTabTotalPrizes').textContent.replace('$', '')),
          netRevenue: parseFloat(document.getElementById('pullTabNetRevenue').textContent.replace('$', ''))
        }
      });
      
      app.showToast('Pull-tab data saved successfully!');
    } else {
      app.showToast('Please save occasion first', 'error');
    }
  }

  collectPrizes(gameId) {
    const prizes = [];
    const container = document.getElementById(`prizes_${gameId}`);
    const entries = container.querySelectorAll('.prize-entry');
    
    entries.forEach(entry => {
      const amount = entry.querySelector('input[type="number"]').value;
      const winner = entry.querySelector('input[type="text"]').value;
      
      if (amount && winner) {
        prizes.push({
          amount: parseFloat(amount),
          winner: winner
        });
      }
    });
    
    return prizes;
  }

  printReport() {
    window.print();
  }

  getData() {
    return this.games;
  }
}
