// src/components/games-sheet.js
class GamesSheet {
  constructor(sessionType) {
    this.sessionType = sessionType;
    this.games = this.getGamesForSession(sessionType);
    this.results = [];
  }

  getGamesForSession(sessionType) {
    const gameConfigs = {
      '5-1': [
        {num: 1, color: 'Early Bird', game: 'Hard Way Bingo', prize: 100},
        {num: 2, color: 'Early Bird', game: 'Diagonal & Corners', prize: 100},
        {num: 3, color: 'Early Bird', game: 'Small Picture Frame', prize: 100},
        {num: 4, color: 'Blue', game: 'Block of 9', prize: 100},
        {num: 5, color: 'Orange', game: '$250 Number 7', prize: 250},
        {num: 6, color: 'Green', game: 'Small Diamond', prize: 100},
        {num: 7, color: 'Yellow', game: 'Razor Blade', prize: 100},
        {num: 8, color: 'Pink', game: '$250 Letter X', prize: 250},
        {num: 9, color: 'Event', game: 'Special Event', prize: 0},
        {num: 10, color: 'Gray', game: '5 Around Corner', prize: 150},
        {num: 11, color: 'Olive', game: 'Double Postage', prize: 150},
        {num: 12, color: 'Brown', game: 'Outside Line', prize: 150},
        {num: 13, color: 'Progressive', game: 'Diamond', prize: 0},
        {num: 14, color: 'Red', game: 'Checkmark', prize: 150},
        {num: 15, color: 'Purple', game: 'Regular Bingo', prize: 150},
        {num: 16, color: 'Black', game: '3 Top & Bottom', prize: 150},
        {num: 17, color: 'Aqua', game: '$500 Coverall', prize: 500}
      ],
      '6-2': [
        {num: 1, color: 'Early Bird', game: 'Letter T', prize: 100},
        {num: 2, color: 'Early Bird', game: 'Four Corners', prize: 100},
        {num: 3, color: 'Early Bird', game: 'Small Frame', prize: 100},
        {num: 4, color: 'Blue', game: 'Letter H', prize: 100},
        {num: 5, color: 'Orange', game: '$250 Cross', prize: 250},
        {num: 6, color: 'Green', game: 'Letter Z', prize: 100},
        {num: 7, color: 'Yellow', game: 'Arrow', prize: 100},
        {num: 8, color: 'Pink', game: '$250 Kite', prize: 250},
        {num: 9, color: 'Event', game: 'Special Event', prize: 0},
        {num: 10, color: 'Gray', game: 'Six Pack', prize: 150},
        {num: 11, color: 'Olive', game: 'Layer Cake', prize: 150},
        {num: 12, color: 'Brown', game: 'Railroad', prize: 150},
        {num: 13, color: 'Progressive', game: 'Large Frame', prize: 0},
        {num: 14, color: 'Red', game: 'Lucky 7', prize: 150},
        {num: 15, color: 'Purple', game: 'Any Line', prize: 150},
        {num: 16, color: 'Black', game: 'Crazy L', prize: 150},
        {num: 17, color: 'Aqua', game: '$500 Blackout', prize: 500}
      ],
      '7-3': [
        // Similar structure for 3rd Monday
        {num: 1, color: 'Early Bird', game: 'Small Diamond', prize: 100},
        // ... continue pattern
        {num: 17, color: 'Aqua', game: '$500 Full Card', prize: 500}
      ],
      '8-4': [
        // Similar structure for 4th Monday
        {num: 1, color: 'Early Bird', game: 'Postage Stamp', prize: 100},
        // ... continue pattern
        {num: 17, color: 'Aqua', game: '$500 Coverall', prize: 500}
      ]
    };

    return gameConfigs[sessionType] || gameConfigs['5-1'];
  }

  render() {
    return `
      <div class="games-sheet">
        <div class="sheet-header">
          <h3>Session Games Record - ${this.getSessionName()}</h3>
          <p class="sheet-date">Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <table class="games-table data-table">
          <thead>
            <tr>
              <th width="60">#</th>
              <th width="120">Color</th>
              <th width="200">Game Pattern</th>
              <th width="100">Prize</th>
              <th width="80">Winners</th>
              <th width="120">Total Paid</th>
              <th width="150">Winner Info</th>
              <th width="100">Balls Called</th>
            </tr>
          </thead>
          <tbody>
            ${this.games.map(game => this.renderGameRow(game)).join('')}
          </tbody>
          <tfoot>
            <tr class="totals-row">
              <td colspan="5" class="text-right"><strong>Session Totals:</strong></td>
              <td><strong id="totalPaid">$0.00</strong></td>
              <td colspan="2">
                <span id="totalWinners">0 Winners</span>
              </td>
            </tr>
          </tfoot>
        </table>
        
        <div class="form-actions">
          <button type="button" class="btn btn-primary" onclick="gamesSheet.save()">
            <i class="material-icons">save</i>
            Save Games Data
          </button>
          <button type="button" class="btn btn-secondary" onclick="gamesSheet.calculate()">
            <i class="material-icons">calculate</i>
            Recalculate Totals
          </button>
        </div>
      </div>
    `;
  }

  renderGameRow(game) {
    const rowId = `game_${game.num}`;
    const isSpecial = game.color === 'Event' || game.color === 'Progressive';
    
    return `
      <tr id="${rowId}" class="${isSpecial ? 'special-game' : ''}">
        <td class="game-number">${game.num}</td>
        <td class="game-color">
          <span class="color-badge" style="background: ${this.getColorHex(game.color)}">
            ${game.color}
          </span>
        </td>
        <td class="game-name">${game.game}</td>
        <td class="game-prize">
          ${isSpecial ? 
            `<input type="number" 
                    class="form-control prize-input" 
                    data-game="${game.num}"
                    value="${game.prize}" 
                    min="0" 
                    step="1"
                    onchange="gamesSheet.updatePrize(${game.num})">` :
            `$${game.prize}`
          }
        </td>
        <td>
          <input type="number" 
                 class="form-control winners-input" 
                 data-game="${game.num}"
                 value="0" 
                 min="0" 
                 max="50"
                 onchange="gamesSheet.updateWinners(${game.num})">
        </td>
        <td class="total-paid" data-game="${game.num}">$0.00</td>
        <td>
          <input type="text" 
                 class="form-control winner-info" 
                 data-game="${game.num}"
                 placeholder="Name/Table#">
        </td>
        <td>
          <input type="number" 
                 class="form-control balls-called" 
                 data-game="${game.num}"
                 min="1" 
                 max="75"
                 placeholder="Balls">
        </td>
      </tr>
    `;
  }

  getColorHex(color) {
    const colors = {
      'Early Bird': '#FFD700',
      'Blue': '#3498DB',
      'Orange': '#E67E22',
      'Green': '#27AE60',
      'Yellow': '#F1C40F',
      'Pink': '#E91E63',
      'Event': '#9C27B0',
      'Gray': '#95A5A6',
      'Olive': '#808000',
      'Brown': '#795548',
      'Progressive': '#FF5722',
      'Red': '#E74C3C',
      'Purple': '#8E44AD',
      'Black': '#2C3E50',
      'Aqua': '#00BCD4'
    };
    return colors[color] || '#95A5A6';
  }

  getSessionName() {
    const names = {
      '5-1': '1st/5th Monday',
      '6-2': '2nd Monday',
      '7-3': '3rd Monday',
      '8-4': '4th Monday'
    };
    return names[this.sessionType] || 'Unknown Session';
  }

  updateWinners(gameNum) {
    const winnersInput = document.querySelector(`.winners-input[data-game="${gameNum}"]`);
    const prizeCell = winnersInput.closest('tr').querySelector('.game-prize');
    const totalCell = document.querySelector(`.total-paid[data-game="${gameNum}"]`);
    
    const winners = parseInt(winnersInput.value) || 0;
    let prize = 0;
    
    // Check if it's a special game with input field
    const prizeInput = prizeCell.querySelector('input');
    if (prizeInput) {
      prize = parseFloat(prizeInput.value) || 0;
    } else {
      prize = parseFloat(prizeCell.textContent.replace('$', '')) || 0;
    }
    
    const total = winners * prize;
    totalCell.textContent = `$${total.toFixed(2)}`;
    
    this.calculate();
  }

  updatePrize(gameNum) {
    this.updateWinners(gameNum);
  }

  calculate() {
    let totalPaid = 0;
    let totalWinners = 0;
    
    document.querySelectorAll('.winners-input').forEach(input => {
      const winners = parseInt(input.value) || 0;
      totalWinners += winners;
      
      const gameNum = input.dataset.game;
      const totalCell = document.querySelector(`.total-paid[data-game="${gameNum}"]`);
      const amount = parseFloat(totalCell.textContent.replace('$', '')) || 0;
      totalPaid += amount;
    });
    
    document.getElementById('totalPaid').textContent = `$${totalPaid.toFixed(2)}`;
    document.getElementById('totalWinners').textContent = `${totalWinners} Winners`;
  }

  save() {
    const data = [];
    
    this.games.forEach(game => {
      const winnersInput = document.querySelector(`.winners-input[data-game="${game.num}"]`);
      const winnerInfo = document.querySelector(`.winner-info[data-game="${game.num}"]`);
      const ballsCalled = document.querySelector(`.balls-called[data-game="${game.num}"]`);
      const totalCell = document.querySelector(`.total-paid[data-game="${game.num}"]`);
      
      const winners = parseInt(winnersInput.value) || 0;
      
      if (winners > 0) {
        data.push({
          gameNum: game.num,
          color: game.color,
          gameName: game.game,
          prize: game.prize,
          winners: winners,
          totalPaid: parseFloat(totalCell.textContent.replace('$', '')) || 0,
          winnerInfo: winnerInfo.value,
          ballsCalled: parseInt(ballsCalled.value) || 0,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Save to local storage
    const occasionId = app.currentOccasion?.id;
    if (occasionId) {
      app.queueForSync('games', {
        occasionId: occasionId,
        games: data,
        totals: {
          totalPaid: parseFloat(document.getElementById('totalPaid').textContent.replace('$', '')),
          totalWinners: parseInt(document.getElementById('totalWinners').textContent)
        }
      });
      
      app.showToast('Games data saved successfully!');
    } else {
      app.showToast('Please save occasion first', 'error');
    }
  }

  getData() {
    return this.results;
  }
}
