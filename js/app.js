// Main Application Logic for RLC Bingo Manager
// Version 11.0.4 - Fixed syntax errors and pull tab library integration

class BingoApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        
        // Initialize comprehensive data structure
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
        
        // Pull Tab Library array - will be populated from Excel data
        this.pullTabLibrary = [];
        
        // Application state
        this.isDarkMode = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) === 'dark';
        this.isOnline = navigator.onLine;
        
        // Initialize the application
        this.init();
    }
    
    /**
     * Display the occasions list view
     * Stores current wizard state and loads historical occasions
     */
    showOccasions() {
        this.closeMenu();
        
        // Store current wizard state for recovery
        sessionStorage.setItem('wizardState', JSON.stringify({
            step: this.currentStep || 1,
            data: this.data
        }));
        
        // Create occasions view interface
        const container = document.querySelector('.wizard-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="occasions-view">
                <div class="view-header">
                    <h2>Recent Occasions</h2>
                    <button class="button secondary" onclick="window.app.returnToWizard()">Back to Entry</button>
                </div>
                <div class="occasions-list">
                    <p>Loading occasions...</p>
                </div>
            </div>
        `;
        
        this.loadOccasionsList();
    }
    
    /**
     * Load and display occasions from the backend
     */
    async loadOccasionsList() {
        try {
            const response = await fetch(CONFIG.API_URL + '?path=occasions');
            const data = await response.json();
            
            const listContainer = document.querySelector('.occasions-list');
            if (data.success && data.occasions) {
                listContainer.innerHTML = data.occasions.map(occ => `
                    <div class="occasion-item">
                        <strong>${occ.Date}</strong> - ${occ['Session Type']} - ${occ['Lion in Charge']}
                        <span class="occasion-status">${occ.Status}</span>
                    </div>
                `).join('');
            } else {
                listContainer.innerHTML = '<p>No occasions found or unable to load.</p>';
            }
        } catch (error) {
            console.error('Error loading occasions:', error);
            document.querySelector('.occasions-list').innerHTML = '<p>Error loading occasions. Check connection.</p>';
        }
    }
    
    /**
     * Display reports generation interface
     */
    showReports() {
        this.closeMenu();
        
        const container = document.querySelector('.wizard-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="view-container">
                <div class="view-header">
                    <h2>Reports</h2>
                    <button class="button primary" onclick="window.app.returnToWizard()">Back to Entry</button>
                </div>
                <div class="reports-content">
                    <div class="report-card">
                        <h3>MGC Form 104</h3>
                        <p>Generate official Missouri Gaming Commission report</p>
                        <button class="button" onclick="alert('MGC Form generation coming soon')">Generate</button>
                    </div>
                    <div class="report-card">
                        <h3>Session Summary</h3>
                        <p>Complete financial summary of current session</p>
                        <button class="button" onclick="window.print()">Print Current</button>
                    </div>
                    <div class="report-card">
                        <h3>Monthly Report</h3>
                        <p>Aggregate report for board meetings</p>
                        <button class="button" onclick="alert('Monthly report coming soon')">Generate</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Display pull-tab library with proper Excel data mapping
     * Maps Excel columns: Game, Form, Count, Price, IdealProfit
     */
    showPullTabLibrary() {
        this.closeMenu();
        
        const container = document.querySelector('.wizard-container');
        if (!container) return;
        
        // Generate library table HTML with proper field mapping
        const libraryHTML = this.pullTabLibrary && this.pullTabLibrary.length > 0
            ? this.pullTabLibrary.slice(0, 50).map(game => {
                // Map Excel column names to display values
                const gameName = game.Game || game.name || '';
                const formNumber = game.Form || game.form || '';
                const ticketCount = game[' Count '] || game.Count || game.count || 0;
                const ticketPrice = game.Price || game.price || 1;
                const idealProfit = game.IdealProfit || game.profit || 0;
                
                return `
                    <tr>
                        <td>${gameName}</td>
                        <td>${formNumber}</td>
                        <td>${ticketCount}</td>
                        <td>$${ticketPrice.toFixed(2)}</td>
                        <td>$${idealProfit.toFixed(2)}</td>
                    </tr>
                `;
            }).join('')
            : '<tr><td colspan="5">No games loaded</td></tr>';
        
        // CRITICAL FIX: Properly close the template literal with backtick
        container.innerHTML = `
            <div class="view-container">
                <div class="view-header">
                    <h2>Pull-Tab Game Library</h2>
                    <button class="button primary" onclick="window.app.returnToWizard()">Back to Entry</button>
                </div>
                <div class="library-info">
                    <p>Total Games in Library: ${this.pullTabLibrary ? this.pullTabLibrary.length : 0}</p>
                    <p class="info-note">Displaying first 50 games of ${this.pullTabLibrary.length} total</p>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Game Name</th>
                                <th>Form #</th>
                                <th>Ticket Count</th>
                                <th>Price</th>
                                <th>Ideal Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${libraryHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        `; // FIXED: Properly closed template literal with backtick
    }
    
    /**
     * Display admin interface for system management
     */
    showAdmin() {
        this.closeMenu();
        
        const container = document.querySelector('.wizard-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="admin-view">
                <div class="view-header">
                    <h2>Administration</h2>
                    <button class="button secondary" onclick="window.app.returnToWizard()">Back to Entry</button>
                </div>
                <div class="admin-sections">
                    <div class="admin-section">
                        <h3>Data Management</h3>
                        <button class="button" onclick="window.app.exportAllData()">Export All Data</button>
                        <button class="button danger" onclick="window.app.clearLocalData()">Clear Local Storage</button>
                    </div>
                    <div class="admin-section">
                        <h3>System Status</h3>
                        <button class="button" onclick="window.app.checkForUpdates()">Check for Updates</button>
                        <button class="button" onclick="window.app.viewSyncQueue()">View Sync Queue</button>
                        <button class="button" onclick="window.app.reloadPullTabLibrary()">Reload Pull-Tab Library</button>
                    </div>
                    <div class="admin-section">
                        <h3>Version Information</h3>
                        <p>Version: ${CONFIG.VERSION}</p>
                        <p>Cache Version: v11.0.4</p>
                        <p>API URL: ${CONFIG.API_URL ? 'Configured' : 'Not configured'}</p>
                        <p>Library Games: ${this.pullTabLibrary.length}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Display help documentation interface
     */
    showHelp() {
        this.closeMenu();
        
        const container = document.querySelector('.wizard-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="view-container">
                <div class="view-header">
                    <h2>Help & Support</h2>
                    <button class="button primary" onclick="window.app.returnToWizard()">Back to Entry</button>
                </div>
                <div class="help-content">
                    <section>
                        <h3>Using the Wizard</h3>
                        <p>The RLC Bingo Manager uses a 6-step wizard to guide you through recording each bingo session. 
                           Each step validates your entries before allowing you to proceed, ensuring complete and accurate data collection.</p>
                    </section>
                    
                    <section>
                        <h3>The Six Steps</h3>
                        <div class="help-steps">
                            <div class="help-step">
                                <strong>1. Session Info:</strong> Enter the date, session type, attendance, and progressive game details.
                            </div>
                            <div class="help-step">
                                <strong>2. Paper Sales:</strong> Record beginning and ending inventory counts, POS sales, and electronic rentals.
                            </div>
                            <div class="help-step">
                                <strong>3. Game Results:</strong> Enter winner counts for each of the 17 session games.
                            </div>
                            <div class="help-step">
                                <strong>4. Pull-Tabs:</strong> Track each pull-tab game opened with serial numbers and prizes paid.
                            </div>
                            <div class="help-step">
                                <strong>5. Money Count:</strong> Count both cash drawers and calculate the deposit.
                            </div>
                            <div class="help-step">
                                <strong>6. Review:</strong> Verify all totals and submit the completed occasion.
                            </div>
                        </div>
                    </section>
                    
                    <section>
                        <h3>Tips for Success</h3>
                        <ul style="text-align: left; max-width: 600px; margin: 0 auto;">
                            <li>The system auto-saves your progress locally as you type</li>
                            <li>You can work completely offline - data syncs when connected</li>
                            <li>Click any completed step number to go back and review</li>
                            <li>Use dark mode (moon icon) for evening sessions</li>
                            <li>Pull-tab library contains ${this.pullTabLibrary.length} games for quick selection</li>
                        </ul>
                    </section>
                    
                    <section>
                        <h3>Support</h3>
                        <p>For technical support, contact: wewg24@github.com</p>
                        <p>Version: ${CONFIG.VERSION}</p>
                        <p>Last Library Update: ${localStorage.getItem('lastLibraryUpdate') || 'Never'}</p>
                    </section>
                </div>
            </div>
        `;
    }
    
    /**
     * Return to wizard from any view
     * Restores saved wizard state
     */
    returnToWizard() {
        // Restore wizard state if available
        const savedState = sessionStorage.getItem('wizardState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.data = state.data;
            this.currentStep = state.step;
        }
        
        // Reload to restore full wizard (simplest approach for now)
        window.location.reload();
    }
    
    /**
     * Export all application data for backup
     */
    exportAllData() {
        const exportData = {
            version: CONFIG.VERSION,
            exportDate: new Date().toISOString(),
            currentSession: this.data,
            localStorage: { ...localStorage },
            pullTabLibrary: this.pullTabLibrary,
            syncQueue: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE) || '[]')
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rlc-bingo-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('Data exported successfully!');
    }
    
    /**
     * Clear all local storage data with confirmation
     */
    clearLocalData() {
        if (confirm('This will clear all local data including drafts and sync queue. Are you sure?')) {
            if (confirm('This action cannot be undone. Continue?')) {
                localStorage.clear();
                sessionStorage.clear();
                alert('Local data cleared. Refreshing...');
                window.location.reload();
            }
        }
    }
    
    /**
     * View pending sync queue items
     */
    viewSyncQueue() {
        const queue = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE) || '[]');
        alert(`Sync Queue: ${queue.length} items pending\n\n` + 
              (queue.length > 0 ? `Next item: ${JSON.stringify(queue[0], null, 2).substring(0, 500)}...` : 'Queue is empty'));
    }
    
    /**
     * Force reload pull-tab library from backend
     */
    async reloadPullTabLibrary() {
        const originalLength = this.pullTabLibrary.length;
        await this.loadPullTabLibrary(true); // Force reload
        alert(`Library reloaded. Games: ${originalLength} → ${this.pullTabLibrary.length}`);
    }
    
    /**
     * Check for application updates
     */
    checkForUpdates() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.update();
                alert('Checking for updates... If an update is available, it will be installed on next refresh.');
            });
        } else {
            alert('Service Worker not supported. Manual refresh required for updates.');
        }
    }
    
    /**
     * Check version from server
     */
    async checkVersion() {
        try {
            const response = await fetch('/version.json?t=' + Date.now());
            const data = await response.json();
            
            const currentVersion = localStorage.getItem('app_version');
            
            if (currentVersion && currentVersion !== data.version) {
                // New version available
                if (confirm('A new version is available. Refresh to update?')) {
                    localStorage.setItem('app_version', data.version);
                    window.location.reload(true);
                }
            } else {
                localStorage.setItem('app_version', data.version);
            }
        } catch (error) {
            console.log('Version check failed:', error);
        }
    }
    
    /**
     * Initialize the application
     */
    async init() {
        // Load saved draft if exists
        this.loadDraft();
        
        // Initialize UI components
        this.initializeTheme();
        this.initializeEventListeners();
        this.initializeDateField();
        this.initializePaperSalesTable();
        this.initializePOSSalesTable();
        
        // Load pull-tab library with Excel column mapping
        await this.loadPullTabLibrary();
        
        // Setup online/offline detection
        this.setupConnectionMonitoring();
        
        // Process any pending sync items
        await this.processSyncQueue();
        
        // Check for updates periodically
        this.checkForUpdates();
        setInterval(() => this.checkForUpdates(), 5 * 60 * 1000); // Every 5 minutes
    }
    
    /**
     * Initialize dark/light theme
     */
    initializeTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('theme-toggle').innerHTML = '<span class="theme-icon">☀️</span>';
        }
    }
    
    /**
     * Setup all event listeners
     */
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
    
    /**
     * Initialize date field with auto-session detection
     */
    initializeDateField() {
        const dateField = document.getElementById('session-date');
        if (dateField) {
            const today = new Date().toISOString().split('T')[0];
            dateField.value = today;
            this.determineSession(today);
        }
    }
    
    /**
     * Initialize paper sales inventory table
     */
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
    
    /**
     * Initialize POS sales table
     */
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
    
    /**
     * Determine session type based on date (Monday logic)
     */
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
    
    /**
     * Load session-specific games from backend
     */
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
    
    /**
     * Render games table with session data
     */
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
    
    /**
     * Calculate birthday BOGO promotions
     */
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
    
    /**
     * Calculate paper sales inventory
     */
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
    
    /**
     * Calculate POS sales items
     */
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
    
    /**
     * Calculate total paper sales revenue
     */
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
    
    /**
     * Calculate electronic rental sales
     */
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
    
    /**
     * Calculate progressive game prize
     */
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
    
    /**
     * Update progressive game row in table
     */
    updateProgressiveGame(prize) {
        const progRow = document.querySelector('.progressive-row');
        if (progRow) {
            progRow.querySelector('.game-prize').textContent = prize;
            progRow.querySelector('.prize-per').value = prize;
            progRow.querySelector('.game-total').textContent = `$${prize.toFixed(2)}`;
        }
    }
    
    /**
     * Calculate individual game prizes
     */
    calculateGamePrize(gameNum) {
        const row = document.querySelector(`[data-game="${gameNum}"]`).closest('tr');
        const winners = parseInt(row.querySelector('.winner-count').value) || 1;
        const prizePerWinner = parseFloat(row.querySelector('.prize-per').value) || 0;
        const total = winners * prizePerWinner;
        
        row.querySelector('.game-total').textContent = `$${total.toFixed(2)}`;
        this.calculateTotalBingoPrizes();
    }
    
    /**
     * Calculate total bingo prizes
     */
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
    
    /**
     * Calculate money drawer totals
     */
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
    
    /**
     * Load pull-tab library from backend or cache
     * Maps Excel columns to expected structure
     */
    async loadPullTabLibrary(forceReload = false) {
        try {
            if (this.isOnline && (forceReload || !localStorage.getItem(CONFIG.STORAGE_KEYS.PULL_TAB_LIBRARY))) {
                const response = await fetch(CONFIG.API_URL + '?path=pulltabs');
                const data = await response.json();
                
                if (data.success && data.games) {
                    // Map Excel column names to consistent structure
                    this.pullTabLibrary = data.games.map(game => ({
                        name: game.Game || game.name || '',
                        form: game.Form || game.form || '',
                        count: game[' Count '] || game.Count || game.count || 0,
                        price: game.Price || game.price || 1,
                        profit: game.IdealProfit || game.profit || 0,
                        url: game.URL || game.url || null
                    }));
                    
                    localStorage.setItem(CONFIG.STORAGE_KEYS.PULL_TAB_LIBRARY, JSON.stringify(this.pullTabLibrary));
                    localStorage.setItem('lastLibraryUpdate', new Date().toISOString());
                    return;
                }
            }
            
            // Load from cache
            const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.PULL_TAB_LIBRARY);
            if (cached) {
                this.pullTabLibrary = JSON.parse(cached);
            } else {
                // If no cache and offline, use minimal defaults
                this.pullTabLibrary = this.getDefaultPullTabGames();
            }
        } catch (error) {
            console.error('Error loading pull-tab library:', error);
            // Load from cache or defaults on error
            const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.PULL_TAB_LIBRARY);
            this.pullTabLibrary = cached ? JSON.parse(cached) : this.getDefaultPullTabGames();
        }
    }
    
    /**
     * Get default pull-tab games if library unavailable
     */
    getDefaultPullTabGames() {
        return [
            {name: 'Beat the Clock 599', form: '7724H', count: 960, price: 1, profit: 361},
            {name: 'Black Jack 175', form: '6916M', count: 250, price: 1, profit: 75},
            {name: 'Black Jack 200', form: '6779P', count: 300, price: 1, profit: 100}
        ];
    }
    
    /**
     * Get default games for session type
     */
    getDefaultGames(sessionType) {
        // Default games if API fails
        const defaults = {
            '5-1': [
                {num: 1, color: 'Early Bird', game: 'Hard Way Bingo', prize: 100},
                {num: 2, color: 'Blue', game: 'Regular Bingo', prize: 100},
                {num: 3, color: 'Pink', game: 'Letter X', prize: 100},
                {num: 4, color: 'Purple', game: 'Diamond', prize: 100},
                {num: 5, color: 'Yellow', game: 'Picture Frame', prize: 100}
            ],
            '6-2': [
                {num: 1, color: 'Early Bird', game: 'Four Corners', prize: 125},
                {num: 2, color: 'Blue', game: 'Regular Bingo', prize: 125},
                {num: 3, color: 'Pink', game: 'Two Lines', prize: 125},
                {num: 4, color: 'Purple', game: 'Layer Cake', prize: 125},
                {num: 5, color: 'Yellow', game: 'Picture Frame', prize: 125},
                {num: 6, color: 'Red', game: 'Coverall', prize: 125}
            ]
        };
        return defaults[sessionType] || defaults['5-1'];
    }
    
    /**
     * Toggle dark/light theme
     */
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
    
    /**
     * Open side menu
     */
    openMenu() {
        document.getElementById('side-menu')?.classList.add('active');
        document.getElementById('overlay')?.classList.add('active');
    }
    
    /**
     * Close side menu
     */
    closeMenu() {
        document.getElementById('side-menu')?.classList.remove('active');
        document.getElementById('overlay')?.classList.remove('active');
    }
    
    /**
     * Setup connection monitoring for online/offline detection
     */
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
    
    /**
     * Save draft data to local storage
     */
    saveDraft() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.DRAFT_DATA, JSON.stringify(this.data));
    }
    
    /**
     * Load draft data from local storage
     */
    loadDraft() {
        const draft = localStorage.getItem(CONFIG.STORAGE_KEYS.DRAFT_DATA);
        if (draft) {
            this.data = JSON.parse(draft);
            // Populate form fields with draft data
            this.populateFormFromData();
        }
    }
    
    /**
     * Populate form fields from saved data
     */
    populateFormFromData() {
        // Populate occasion fields
        if (this.data.occasion.date) {
            document.getElementById('session-date').value = this.data.occasion.date;
        }
        if (this.data.occasion.sessionType) {
            document.getElementById('session-type').value = this.data.occasion.sessionType;
        }
        // Add more field population logic as needed
    }
    
    /**
     * Process sync queue when online
     */
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

// Global functions for onclick handlers - Browser compatible
function closeMenu() {
    window.app?.closeMenu();
}

function showOccasions() {
    window.app?.showOccasions();
}

function showReports() {
    window.app?.showReports();
}

function showPullTabLibrary() {
    window.app?.showPullTabLibrary();
}

function showAdmin() {
    window.app?.showAdmin();
}

function showHelp() {
    window.app?.showHelp();
}

function initializeAdminNavigation() {
    const nextBtn = document.getElementById('adminNextBtn');
    const prevBtn = document.getElementById('adminPrevBtn');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const currentSection = getCurrentSection();
            const nextSection = getNextSection(currentSection);
            
            if (nextSection) {
                // Validate current section before proceeding
                if (validateSection(currentSection)) {
                    navigateToSection(nextSection);
                } else {
                    showNotification('Please complete all required fields', 'warning');
                }
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const currentSection = getCurrentSection();
            const prevSection = getPreviousSection(currentSection);
            
            if (prevSection) {
                navigateToSection(prevSection);
            }
        });
    }
}

function getCurrentSection() {
    const visibleSection = document.querySelector('.wizard-section:not(.hidden)');
    return visibleSection ? visibleSection.id : null;
}

function getNextSection(currentSectionId) {
    const sections = ['basicInfo', 'doorSales', 'sessionGames', 'pullTabs', 'specialEvents', 'moneyCount', 'summary'];
    const currentIndex = sections.indexOf(currentSectionId);
    return currentIndex >= 0 && currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;
}

function getPreviousSection(currentSectionId) {
    const sections = ['basicInfo', 'doorSales', 'sessionGames', 'pullTabs', 'specialEvents', 'moneyCount', 'summary'];
    const currentIndex = sections.indexOf(currentSectionId);
    return currentIndex > 0 ? sections[currentIndex - 1] : null;
}

function navigateToSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.wizard-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        
        // Update progress indicator
        updateProgressIndicator(sectionId);
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

function validateSection(sectionId) {
    switch(sectionId) {
        case 'basicInfo':
            return document.getElementById('mondayDate').value && 
                   document.getElementById('sessionType').value;
        case 'doorSales':
            return true; // Optional section
        case 'sessionGames':
            // Check if at least one game is added
            return document.querySelectorAll('.game-row').length > 0;
        default:
            return true;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BingoApp();
});
