// Main Application Logic
class BingoApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.data = {
            occasion: {},
            paperBingo: {},
            posSales: {},
            electronic: {},
            games: [],
            pullTabs: [],
            moneyCount: {
                bingo: {},
                pullTab: {}
            },
            financial: {}
        };
        this.pullTabLibrary = [];
        this.isDarkMode = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) === 'dark';
        this.isOnline = navigator.onLine;
        
        this.init();
    }
    
    async init() {
        // Load saved draft if exists
        this.loadDraft();
        
        // Initialize UI
        this.initializeTheme();
        this.initializeEventListeners();
        this.initializeDateField();
        this.initializePaperSalesTable();
        this.initializePOSSalesTable();
        
        // Load pull-tab library
        await this.loadPullTabLibrary();
        
        // Setup online/offline detection
        this.setupConnectionMonitoring();
        
        // Check for sync queue
        await this.processSyncQueue();
    }
    
    initializeTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('theme-toggle').innerHTML = '<span class="theme-icon">☀️</span>';
        }
    }
    
    initializeEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Menu toggle
        document.getElementById('menu-toggle')?.addEventListener('click', () => this.openMenu());
        
        // Session type change
        document.getElementById('session-type')?.addEventListener('change', (e) => this.loadSessionGames(e.target.value));
        
        // Birthday BOGO calculation
        document.getElementById('birthdays')?.addEventListener('input', (e) => this.calculateBirthdayBOGO(e.target.value));
        
        // Progressive calculations
        document.getElementById('prog-actual-balls')?.addEventListener('input', () => this.calculateProgressivePrize());
        
        // Money count calculations
        document.querySelectorAll('[id^="bingo-"], [id^="pt-"]').forEach(input => {
            input.addEventListener('input', () => this.calculateMoneyTotals());
        });
        
        // Electronic sales
        document.getElementById('small-machines')?.addEventListener('input', () => this.calculateElectronicSales());
        document.getElementById('large-machines')?.addEventListener('input', () => this.calculateElectronicSales());
        
        // Auto-save on input
        document.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('change', () => this.saveDraft());
        });
    }
    
    initializeDateField() {
        const dateField = document.getElementById('session-date');
        if (dateField) {
            const today = new Date().toISOString().split('T')[0];
            dateField.value = today;
            this.determineSession(today);
        }
    }
    
    initializePaperSalesTable() {
        const tbody = document.getElementById('paper-sales-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        CONFIG.PAPER_TYPES.forEach(type => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${type.name}</td>
                <td><input type="number" id="${type.id}-start" min="0" data-type="${type.id}"></td>
                <td>${type.hasFree ? `<input type="number" id="${type.id}-free" readonly>` : '-'}</td>
                <td><input type="number" id="${type.id}-end" min="0" data-type="${type.id}"></td>
                <td id="${type.id}-sold">0</td>
            `;
            
            // Add event listeners for calculations
            row.querySelectorAll('input[type="number"]:not([readonly])').forEach(input => {
                input.addEventListener('input', () => this.calculatePaperSales(type.id));
            });
        });
    }
    
    initializePOSSalesTable() {
        const tbody = document.getElementById('pos-sales-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        CONFIG.POS_ITEMS.forEach(item => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td><input type="number" id="${item.id}-qty" min="0" value="0" data-item="${item.id}"></td>
                <td id="${item.id}-total">$0.00</td>
            `;
            
            const input = row.querySelector('input');
            input.addEventListener('input', () => this.calculatePOSSales(item.id, item.price));
        });
    }
    
    determineSession(dateString) {
        const date = new Date(dateString);
        if (date.getDay() !== 1) return; // Not Monday
        
        const firstMonday = new Date(date.getFullYear(), date.getMonth(), 1);
        while (firstMonday.getDay() !== 1) {
            firstMonday.setDate(firstMonday.getDate() + 1);
        }
        
        const weekNumber = Math.ceil((date.getDate() - firstMonday.getDate() + 1) / 7) + 1;
        
        let session;
        switch(weekNumber) {
            case 1:
            case 5:
                session = '5-1';
                break;
            case 2:
                session = '6-2';
                break;
            case 3:
                session = '7-3';
                break;
            case 4:
                session = '8-4';
                break;
            default:
                session = '5-1';
        }
        
        const sessionSelect = document.getElementById('session-type');
        if (sessionSelect) {
            sessionSelect.value = session;
            this.loadSessionGames(session);
        }
    }
    
    async loadSessionGames(sessionType) {
        if (!sessionType) return;
        
        try {
            const response = await fetch(CONFIG.API_URL + '?path=session-games&sessionType=' + sessionType);
            const data = await response.json();
            
            if (data.success && data.games) {
                this.renderGamesTable(data.games);
            }
        } catch (error) {
            console.error('Error loading session games:', error);
            // Use default games if API fails
            this.renderGamesTable(this.getDefaultGames(sessionType));
        }
    }
    
    renderGamesTable(games) {
        const tbody = document.getElementById('games-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        games.forEach(game => {
            const row = tbody.insertRow();
            row.className = game.progressive ? 'progressive-row' : '';
            
            row.innerHTML = `
                <td>${game.num}</td>
                <td>${game.color}</td>
                <td>${game.game}</td>
                <td>$<span class="game-prize">${game.progressive ? '0' : game.prize}</span></td>
                <td><input type="number" class="winner-count" value="1" min="1" data-game="${game.num}"></td>
                <td>$<input type="number" class="prize-per" value="${game.progressive ? '0' : game.prize}" 
                    ${game.progressive ? 'readonly' : ''} data-game="${game.num}"></td>
                <td class="game-total">$${game.progressive ? '0.00' : game.prize + '.00'}</td>
                <td><input type="checkbox" class="check-payment" data-game="${game.num}"></td>
            `;
            
            // Add event listeners
            const winnersInput = row.querySelector('.winner-count');
            const prizeInput = row.querySelector('.prize-per');
            
            winnersInput.addEventListener('input', () => this.calculateGamePrize(game.num));
            if (!game.progressive) {
                prizeInput.addEventListener('input', () => this.calculateGamePrize(game.num));
            }
        });
        
        this.data.games = games;
    }
    
    calculateBirthdayBOGO(birthdays) {
        const count = parseInt(birthdays) || 0;
        
        // Update free counts
        const ebFree = document.getElementById('eb-free');
        const sixFree = document.getElementById('6f-free');
        const birthdayQty = document.getElementById('birthday-qty');
        
        if (ebFree) ebFree.value = count * 2; // 2 Early Birds per birthday
        if (sixFree) sixFree.value = count * 1; // 1 Six Face per birthday  
        if (birthdayQty) birthdayQty.value = count;
        
        this.calculatePaperSales('eb');
        this.calculatePaperSales('6f');
        this.calculatePOSSales('birthday', 0);
    }
    
    calculatePaperSales(typeId) {
        const start = parseInt(document.getElementById(`${typeId}-start`)?.value) || 0;
        const end = parseInt(document.getElementById(`${typeId}-end`)?.value) || 0;
        const free = parseInt(document.getElementById(`${typeId}-free`)?.value) || 0;
        
        const sold = Math.max(0, start - end - free);
        const soldElement = document.getElementById(`${typeId}-sold`);
        if (soldElement) {
            soldElement.textContent = sold;
        }
        
        // Store in data
        this.data.paperBingo[typeId] = { start, end, free, sold };
    }
    
    calculatePOSSales(itemId, price) {
        const qty = parseInt(document.getElementById(`${itemId}-qty`)?.value) || 0;
        const total = qty * price;
        
        const totalElement = document.getElementById(`${itemId}-total`);
        if (totalElement) {
            totalElement.textContent = `$${total.toFixed(2)}`;
        }
        
        // Store in data
        this.data.posSales[itemId] = { price, quantity: qty, total };
        
        // Update total
        this.calculateTotalPaperSales();
    }
    
    calculateTotalPaperSales() {
        let total = 0;
        Object.values(this.data.posSales).forEach(item => {
            total += item.total || 0;
        });
        
        const totalElement = document.getElementById('total-paper-sales');
        if (totalElement) {
            totalElement.textContent = `$${total.toFixed(2)}`;
        }
    }
    
    calculateElectronicSales() {
        const small = parseInt(document.getElementById('small-machines')?.value) || 0;
        const large = parseInt(document.getElementById('large-machines')?.value) || 0;
        
        const smallTotal = small * 40;
        const largeTotal = large * 65;
        const total = smallTotal + largeTotal;
        
        this.data.electronic = {
            smallMachines: small,
            largeMachines: large,
            smallTotal,
            largeTotal,
            total
        };
    }
    
    calculateProgressivePrize() {
        const jackpot = parseFloat(document.getElementById('prog-jackpot')?.value) || 0;
        const ballsNeeded = parseInt(document.getElementById('prog-balls')?.value) || 0;
        const actualBalls = parseInt(document.getElementById('prog-actual-balls')?.value) || 0;
        const consolation = parseFloat(document.getElementById('prog-consolation')?.value) || 200;
        
        let prize = 0;
        if (actualBalls > 0 && ballsNeeded > 0) {
            prize = actualBalls <= ballsNeeded ? jackpot : consolation;
        }
        
        const prizeField = document.getElementById('prog-prize');
        if (prizeField) {
            prizeField.value = prize;
        }
        
        // Update progressive game in games table
        this.updateProgressiveGame(prize);
    }
    
    updateProgressiveGame(prize) {
        const progRow = document.querySelector('.progressive-row');
        if (progRow) {
            progRow.querySelector('.game-prize').textContent = prize;
            progRow.querySelector('.prize-per').value = prize;
            progRow.querySelector('.game-total').textContent = `$${prize.toFixed(2)}`;
        }
    }
    
    calculateGamePrize(gameNum) {
        const row = document.querySelector(`[data-game="${gameNum}"]`).closest('tr');
        const winners = parseInt(row.querySelector('.winner-count').value) || 1;
        const prizePerWinner = parseFloat(row.querySelector('.prize-per').value) || 0;
        const total = winners * prizePerWinner;
        
        row.querySelector('.game-total').textContent = `$${total.toFixed(2)}`;
        this.calculateTotalBingoPrizes();
    }
    
    calculateTotalBingoPrizes() {
        let total = 0;
        let checkTotal = 0;
        
        document.querySelectorAll('.game-total').forEach(cell => {
            const amount = parseFloat(cell.textContent.replace('$', '')) || 0;
            total += amount;
            
            const checkBox = cell.parentElement.querySelector('.check-payment');
            if (checkBox?.checked) {
                checkTotal += amount;
            }
        });
        
        const totalElement = document.getElementById('total-bingo-prizes');
        if (totalElement) {
            totalElement.textContent = `$${total.toFixed(2)}`;
        }
        
        this.data.financial.bingoPrizesPaid = total;
        this.data.financial.prizesPaidByCheck = checkTotal;
    }
    
    calculateMoneyTotals() {
        // Calculate Bingo drawer
        let bingoTotal = 0;
        ['100', '50', '20', '10', '5', '2', '1', 'coins', 'checks'].forEach(denom => {
            const value = parseFloat(document.getElementById(`bingo-${denom}`)?.value) || 0;
            bingoTotal += value;
            this.data.moneyCount.bingo[denom] = value;
        });
        
        const bingoTotalElement = document.getElementById('bingo-total');
        if (bingoTotalElement) {
            bingoTotalElement.textContent = `$${bingoTotal.toFixed(2)}`;
        }
        
        // Calculate Pull-tab drawer
        let ptTotal = 0;
        ['100', '50', '20', '10', '5', '2', '1', 'coins'].forEach(denom => {
            const value = parseFloat(document.getElementById(`pt-${denom}`)?.value) || 0;
            ptTotal += value;
            this.data.moneyCount.pullTab[denom] = value;
        });
        
        const ptTotalElement = document.getElementById('pt-total');
        if (ptTotalElement) {
            ptTotalElement.textContent = `$${ptTotal.toFixed(2)}`;
        }
        
        // Calculate deposit summary
        const totalDeposit = bingoTotal + ptTotal;
        const currency = totalDeposit - (this.data.moneyCount.bingo.coins || 0) - (this.data.moneyCount.pullTab.coins || 0);
        const coins = (this.data.moneyCount.bingo.coins || 0) + (this.data.moneyCount.pullTab.coins || 0);
        const checks = this.data.moneyCount.bingo.checks || 0;
        
        document.getElementById('deposit-currency').textContent = `$${currency.toFixed(2)}`;
        document.getElementById('deposit-coins').textContent = `$${coins.toFixed(2)}`;
        document.getElementById('deposit-checks').textContent = `$${checks.toFixed(2)}`;
        document.getElementById('deposit-total').textContent = `$${totalDeposit.toFixed(2)}`;
        
        const netDeposit = totalDeposit - 1000; // Less startup cash
        document.getElementById('net-deposit').textContent = `$${netDeposit.toFixed(2)}`;
        
        this.data.financial.totalCashDeposit = totalDeposit;
        this.data.financial.actualProfit = netDeposit;
    }
    
    async loadPullTabLibrary() {
        try {
            if (this.isOnline) {
                const response = await fetch(CONFIG.API_URL + '?path=pulltabs');
                const data = await response.json();
                
                if (data.success && data.games) {
                    this.pullTabLibrary = data.games;
                    localStorage.setItem(CONFIG.STORAGE_KEYS.PULL_TAB_LIBRARY, JSON.stringify(data.games));
                    return;
                }
            }
            
            // Load from cache
            const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.PULL_TAB_LIBRARY);
            if (cached) {
                this.pullTabLibrary = JSON.parse(cached);
            }
        } catch (error) {
            console.error('Error loading pull-tab library:', error);
        }
    }
    
    getDefaultGames(sessionType) {
        // Default games if API fails
        const defaults = {
            '5-1': [
                {num: 1, color: 'Early Bird', game: 'Hard Way Bingo', prize: 100},
                {num: 2, color: 'Blue', game: 'Regular Bingo', prize: 100},
                // Add more default games...
            ]
        };
        return defaults[sessionType] || defaults['5-1'];
    }
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode');
        
        const themeIcon = document.getElementById('theme-toggle');
        if (themeIcon) {
            themeIcon.innerHTML = this.isDarkMode ? 
                '<span class="theme-icon">☀️</span>' : 
                '<span class="theme-icon">🌙</span>';
        }
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, this.isDarkMode ? 'dark' : 'light');
    }
    
    openMenu() {
        document.getElementById('side-menu')?.classList.add('active');
        document.getElementById('overlay')?.classList.add('active');
    }
    
    closeMenu() {
        document.getElementById('side-menu')?.classList.remove('active');
        document.getElementById('overlay')?.classList.remove('active');
    }
    
    setupConnectionMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            document.getElementById('status-indicator').className = 'status-online';
            document.getElementById('status-text').textContent = 'Online';
            this.processSyncQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            document.getElementById('status-indicator').className = 'status-offline';
            document.getElementById('status-text').textContent = 'Offline';
        });
    }
    
    saveDraft() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.DRAFT_DATA, JSON.stringify(this.data));
    }
    
    loadDraft() {
        const draft = localStorage.getItem(CONFIG.STORAGE_KEYS.DRAFT_DATA);
        if (draft) {
            this.data = JSON.parse(draft);
            // Populate form fields with draft data
            this.populateFormFromData();
        }
    }
    
    populateFormFromData() {
        // Populate occasion fields
        if (this.data.occasion.date) {
            document.getElementById('session-date').value = this.data.occasion.date;
        }
        // Add more field population logic...
    }
    
    async processSyncQueue() {
        if (!this.isOnline) return;
        
        const queue = localStorage.getItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE);
        if (!queue) return;
        
        const items = JSON.parse(queue);
        const failed = [];
        
        for (const item of items) {
            try {
                const response = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    body: new URLSearchParams({
                        action: item.action,
                        data: JSON.stringify(item.data)
                    })
                });
                
                if (!response.ok) {
                    failed.push(item);
                }
            } catch (error) {
                failed.push(item);
            }
        }
        
        if (failed.length > 0) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(failed));
        } else {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE);
        }
    }
}

// Global functions for onclick handlers
function closeMenu() {
    window.app?.closeMenu();
}

function showOccasions() {
    window.app?.closeMenu();
    // Navigate to occasions view
}

function showReports() {
    window.app?.closeMenu();
    // Navigate to reports view
}

function showPullTabLibrary() {
    window.app?.closeMenu();
    // Navigate to pull-tab library
}

function showAdmin() {
    window.app?.closeMenu();
    // Navigate to admin panel
}

function showHelp() {
    window.app?.closeMenu();
    // Show help documentation
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BingoApp();
});
