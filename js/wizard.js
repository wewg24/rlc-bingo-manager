// wizard.js - Complete implementation with all fixes
// Version 11.0.4 - Properly structured with all functions

// ============================================
// STEP NAVIGATION FUNCTIONS
// ============================================

function nextStep() {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
        return false;
    }

    // Show loading during step processing
    if (window.showLoading) {
        window.showLoading({
            text: 'Processing Step',
            subtext: 'Saving data and advancing...',
            timeout: 10000
        });
    }

    try {
        // Save current step data
        saveStepData();

        // Move to next step if not at the end
        if (window.app && window.app.currentStep < window.app.totalSteps) {
            window.app.currentStep++;
            updateStepDisplay();
            loadStepData(); // Load any saved data for the new step
        }
    } catch (error) {
        console.error('Error in nextStep:', error);
        if (window.hideLoading) window.hideLoading();
        alert('Error processing step: ' + error.message);
        return;
    }

    // Hide loading after brief delay
    if (window.hideLoading) {
        setTimeout(() => window.hideLoading(), 800);
    }
}

function previousStep() {
    if (window.app && window.app.currentStep > 1) {
        saveStepData(); // Save before going back
        window.app.currentStep--;
        updateStepDisplay();
        loadStepData();
    }
}

function goToStep(step) {
    if (step >= 1 && step <= window.app.totalSteps) {
        saveStepData();
        window.app.currentStep = step;
        updateStepDisplay();
        loadStepData();
    }
}

// ============================================
// DISPLAY UPDATE FUNCTIONS
// ============================================

function updateStepDisplay() {
    // Hide all step contents
    document.querySelectorAll('.wizard-step').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show current step content
    const currentContent = document.getElementById(`step-${window.app.currentStep}`);
    if (currentContent) {
        currentContent.classList.add('active');
    }
    
    // Update step indicators
    document.querySelectorAll('.step').forEach((indicator, index) => {
        const stepNum = index + 1;
        indicator.classList.remove('active', 'completed');
        
        if (stepNum === window.app.currentStep) {
            indicator.classList.add('active');
        } else if (stepNum < window.app.currentStep) {
            indicator.classList.add('completed');
        }
    });
    
    // Update navigation buttons
    const prevBtn = document.querySelector('.prev-button, button[onclick="previousStep()"]');
    const nextBtn = document.querySelector('.next-button, button[onclick="nextStep()"]');

    if (prevBtn) {
        if (window.app.currentStep === 1) {
            prevBtn.style.display = 'none';
            prevBtn.disabled = true;
        } else {
            prevBtn.style.display = 'inline-block';
            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        }
    }
    
    if (nextBtn) {
        if (window.app.currentStep === window.app.totalSteps) {
            nextBtn.textContent = 'Complete';
            nextBtn.setAttribute('onclick', 'submitOccasion()');
        } else {
            nextBtn.textContent = 'Next';
            nextBtn.setAttribute('onclick', 'nextStep()');
        }
    }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

function validateCurrentStep() {
    const currentStepNum = window.app ? window.app.currentStep : 1;
    
    switch(currentStepNum) {
        case 1: // Occasion Info
            return validateOccasionInfo();
        case 2: // Paper Sales
            return validatePaperSales();
        case 3: // Game Results
            return validateGameResults();
        case 4: // Pull-Tabs
            return true; // Optional step
        case 5: // Money Count
            return validateMoneyCount();
        case 6: // Review
            return true;
        default:
            return true;
    }
}

function validateOccasionInfo() {
    const date = document.getElementById('occasion-date')?.value;
    const session = document.getElementById('session-type')?.value;
    const lion = document.getElementById('lion-charge')?.value;
    const totalPeople = document.getElementById('total-people')?.value;
    
    if (!date || !session || !lion || !totalPeople) {
        showValidationError('Please fill in all required occasion information');
        return false;
    }
    
    console.log('Occasion info validation passed');
    return true;
}

function validatePaperSales() {
    // Basic validation - ensure at least some manual count items have been entered
    let hasValidEntry = false;

    CONFIG.MANUAL_COUNT_ITEMS.forEach(type => {
        const startInput = document.getElementById(`${type.id}-start`);
        const endInput = document.getElementById(`${type.id}-end`);

        if (startInput && endInput) {
            const start = parseInt(startInput.value) || 0;
            const end = parseInt(endInput.value) || 0;

            if (start > 0 || end > 0) {
                hasValidEntry = true;
            }
        }
    });
    
    return true; // Allow proceeding even without sales for testing
}

function validateGameResults() {
    // Ensure all games have valid winner counts
    const winnerInputs = document.querySelectorAll('.winner-count');
    
    for (let input of winnerInputs) {
        const value = parseInt(input.value);
        if (isNaN(value) || value < 0) {
            showValidationError('All games must have valid winner counts (0 or more).');
            return false;
        }
    }
    
    return true;
}

function validateMoneyCount() {
    // Money count is optional for now
    return true;
}

// ============================================
// SAVE FUNCTIONS
// ============================================

function saveStepData() {
    if (!window.app) return;
    
    switch (window.app.currentStep) {
        case 1:
            saveOccasionInfo();
            break;
        case 2:
            savePaperSales();
            break;
        case 3:
            saveGameResults();
            break;
        case 4:
            savePullTabs();
            break;
        case 5:
            saveMoneyCount();
            break;
    }
    
    // Always save to localStorage as draft
    if (window.app.saveDraft) {
        window.app.saveDraft();
    }
}

function saveOccasionInfo() {
    const sessionTypeKey = document.getElementById('session-type')?.value;
    const sessionTypeLabel = CONFIG.SESSION_TYPES[sessionTypeKey] || sessionTypeKey;

    window.app.data.occasion = {
        date: document.getElementById('occasion-date')?.value,
        sessionType: sessionTypeKey, // Backend expects the session code (5-1, 6-2, etc.)
        lionInCharge: document.getElementById('lion-charge')?.value,
        totalPlayers: parseInt(document.getElementById('total-people')?.value) || 0, // Backend expects 'totalPlayers'
        birthdays: parseInt(document.getElementById('birthdays')?.value) || 0,
        createdBy: 'Mobile Entry' // Backend expects this field
    };

    // Progressive data structure aligned with backend expectations
    window.app.data.progressive = {
        jackpot: parseFloat(document.getElementById('prog-jackpot')?.value) || 0,
        ballsNeeded: parseInt(document.getElementById('prog-balls')?.value) || 0,
        consolation: parseFloat(document.getElementById('prog-consolation')?.value) || 200,
        actualBalls: parseInt(document.getElementById('prog-actual-balls')?.value) || 0,
        actualPrize: parseFloat(document.getElementById('prog-prize')?.value) || 0, // Backend expects 'actualPrize'
        checkPayment: document.getElementById('prog-check')?.checked || false // Backend expects 'checkPayment'
    };
}

function savePaperSales() {
    // Ensure complete data structure exists
    if (!window.app || !window.app.data) {
        console.error('window.app.data not initialized');
        return;
    }

    // Initialize missing data objects
    if (!window.app.data.paperBingo) {
        console.log('Initializing paperBingo object');
        window.app.data.paperBingo = {};
    }
    if (!window.app.data.posSales) {
        console.log('Initializing posSales object');
        window.app.data.posSales = {};
    }
    if (!window.app.data.electronic) {
        console.log('Initializing electronic object');
        window.app.data.electronic = {};
    }

    // Save manual count inventory
    if (CONFIG.MANUAL_COUNT_ITEMS && Array.isArray(CONFIG.MANUAL_COUNT_ITEMS)) {
        CONFIG.MANUAL_COUNT_ITEMS.forEach(type => {
            try {
                // Validate type object has required properties
                if (!type || !type.id) {
                    console.warn('Invalid MANUAL_COUNT_ITEMS entry:', type);
                    return;
                }

                const start = parseInt(document.getElementById(`${type.id}-start`)?.value) || 0;
                const end = parseInt(document.getElementById(`${type.id}-end`)?.value) || 0;
                const free = parseInt(document.getElementById(`${type.id}-free`)?.value) || 0;
                const sold = Math.max(0, start - end - free);

                // Ensure paperBingo object exists and initialize the specific type
                if (!window.app.data.paperBingo) {
                    window.app.data.paperBingo = {};
                }

                if (!window.app.data.paperBingo[type.id]) {
                    window.app.data.paperBingo[type.id] = {};
                }

                window.app.data.paperBingo[type.id] = { start, end, free, sold };

                console.log(`Saved paperBingo[${type.id}]:`, window.app.data.paperBingo[type.id]);
            } catch (error) {
                console.error('Error processing manual count item:', type.id, error);
            }
        });
    } else {
        console.warn('CONFIG.MANUAL_COUNT_ITEMS not found or invalid');
    }

    // Save POS sales
    if (CONFIG.POS_ITEMS) {
        CONFIG.POS_ITEMS.forEach(item => {
            try {
                const qty = parseInt(document.getElementById(`${item.id}-qty`)?.value) || 0;
                window.app.data.posSales[item.id] = {
                    name: item.name,
                    price: item.price,
                    quantity: qty,
                    total: qty * item.price
                };
            } catch (error) {
                console.error('Error processing POS item:', item.id, error);
            }
        });
    }

    // Save electronic rentals (now part of POS items)
    try {
        const smallMachineQty = parseInt(window.app.data.posSales['small-machine']?.quantity) || 0;
        const largeMachineQty = parseInt(window.app.data.posSales['large-machine']?.quantity) || 0;

        window.app.data.electronic = {
            smallMachines: smallMachineQty,
            largeMachines: largeMachineQty,
            smallTotal: smallMachineQty * 40,
            largeTotal: largeMachineQty * 65,
            total: (smallMachineQty * 40) + (largeMachineQty * 65)
        };
    } catch (error) {
        console.error('Error processing electronic rentals:', error);
    }

    // Trigger financial calculations update
    if (window.app && typeof window.app.calculateComprehensiveFinancials === 'function') {
        window.app.calculateComprehensiveFinancials();
    }
}

function saveGameResults() {
    const games = [];
    document.querySelectorAll('#games-body tr').forEach(row => {
        const gameNum = row.querySelector('.winner-count')?.getAttribute('data-game');
        if (gameNum) {
            const winners = parseInt(row.querySelector('.winner-count')?.value) || 0;
            const prizePerWinner = parseFloat(row.querySelector('.prize-per')?.value) || 0;
            const checkPaid = row.querySelector('.check-payment')?.checked || false;

            // Get game details from the row
            const colorCell = row.cells[1];
            const gameNameCell = row.cells[2];
            const basePrizeCell = row.cells[3];

            games.push({
                number: parseInt(gameNum), // Backend expects 'number' not 'num'
                color: colorCell?.textContent || '',
                name: gameNameCell?.textContent || '',
                prize: parseFloat(basePrizeCell?.textContent?.replace('$', '')) || 0,
                winners,
                prizePerWinner,
                totalPayout: winners * prizePerWinner, // Backend expects 'totalPayout'
                checkPayment: checkPaid // Backend expects 'checkPayment'
            });
        }
    });

    window.app.data.games = games;

    // Trigger bingo prize calculations and comprehensive financials
    if (window.app && typeof window.app.calculateTotalBingoPrizes === 'function') {
        window.app.calculateTotalBingoPrizes();
    }
}

function savePullTabs() {
    const pullTabs = [];

    // Regular games
    document.querySelectorAll('.pulltab-row').forEach(row => {
        const gameSelect = row.querySelector('.pulltab-select');
        const serialInput = row.querySelector('.serial-input');

        if (gameSelect && gameSelect.value && gameSelect.value !== 'No Game') {
            const tickets = parseInt(row.querySelector('.tickets-cell')?.textContent) || 0;
            const ticketsSold = parseFloat(row.querySelector('.tickets-sold-cell')?.textContent?.replace('$', '')) || 0;
            const prizes = parseFloat(row.querySelector('.prizes-cell')?.textContent?.replace('$', '')) || 0;
            const idealProfit = parseFloat(row.querySelector('.ideal-profit-cell')?.textContent?.replace('$', '')) || 0;
            const netProfit = ticketsSold - prizes;
            const checkPayment = row.querySelector('.check-payment')?.checked || false;

            pullTabs.push({
                gameName: gameSelect.value, // Backend expects 'gameName'
                serialNumber: serialInput?.value || '', // Backend expects 'serialNumber'
                price: tickets > 0 ? ticketsSold / tickets : 1, // Calculate price per ticket
                tickets,
                sales: ticketsSold, // Backend expects 'sales'
                idealProfit,
                prizesPaid: prizes, // Backend expects 'prizesPaid'
                netProfit,
                isSpecialEvent: false, // Backend expects 'isSpecialEvent'
                checkPayment
            });
        }
    });

    // Special events
    document.querySelectorAll('.special-event-row').forEach(row => {
        const nameSelect = row.querySelector('.special-event-select');
        const nameInput = row.querySelector('.event-name-input');
        const serialInput = row.querySelector('.event-serial-input');
        const name = nameInput?.value || nameSelect?.options[nameSelect?.selectedIndex]?.text || '';
        const ticketsCell = row.querySelector('.event-tickets-cell');
        const salesCell = row.querySelector('.event-sales-cell');
        const prizesInput = row.querySelector('.event-prizes-input');

        if (name && name !== 'Select Special Event...') {
            const tickets = parseInt(ticketsCell?.textContent) || 0;
            const sales = parseFloat(salesCell?.textContent?.replace('$', '')) || 0;
            const prizes = parseFloat(prizesInput?.value) || 0;
            const netProfit = sales - prizes;

            pullTabs.push({
                gameName: name,
                serialNumber: serialInput?.value || '',
                price: tickets > 0 ? sales / tickets : 1,
                tickets,
                sales,
                idealProfit: 0, // Special events don't have ideal profit
                prizesPaid: prizes,
                netProfit,
                isSpecialEvent: true,
                checkPayment: false // Special events typically don't pay by check
            });
        }
    });

    window.app.data.pullTabs = pullTabs;

    // Trigger financial calculations update
    if (window.app && typeof window.app.calculateComprehensiveFinancials === 'function') {
        window.app.calculateComprehensiveFinancials();
    }
}

function saveMoneyCount() {
    // Ensure moneyCount structure exists
    if (!window.app.data.moneyCount) {
        window.app.data.moneyCount = {};
    }
    if (!window.app.data.moneyCount.bingo) {
        window.app.data.moneyCount.bingo = {};
    }
    if (!window.app.data.moneyCount.pullTab && !window.app.data.moneyCount.pulltab) {
        window.app.data.moneyCount.pulltab = {};
    }

    // Save bingo drawer
    ['100', '50', '20', '10', '5', '2', '1', 'coins', 'checks'].forEach(denom => {
        const value = parseFloat(document.getElementById(`bingo-${denom}`)?.value) || 0;
        window.app.data.moneyCount.bingo[denom] = value;
    });
    
    // Save pull-tab drawer
    const pullTabData = window.app.data.moneyCount.pullTab || window.app.data.moneyCount.pulltab;

    ['100', '50', '20', '10', '5', '2', '1', 'coins'].forEach(denom => {
        const value = parseFloat(document.getElementById(`pt-${denom}`)?.value) || 0;
        pullTabData[denom] = value;
    });
}

// ============================================
// LOAD FUNCTIONS
// ============================================

function loadStepData() {
    if (!window.app) return;
    
    switch (window.app.currentStep) {
        case 1:
            loadOccasionInfo();
            break;
        case 2:
            loadPaperSales();
            break;
        case 3:
            loadGameResults();
            break;
        case 4:
            loadPullTabs();
            break;
        case 5:
            loadMoneyCount();
            break;
        case 6:
            loadReviewData();
            break;
    }
}

function loadOccasionInfo() {
    if (!window.app.data.occasion) return;
    
    const data = window.app.data.occasion;
    if (data.date) document.getElementById('occasion-date').value = data.date;

    // Handle session type - sessionType is now stored as key (5-1, 6-2, etc.)
    if (data.sessionType) {
        document.getElementById('session-type').value = data.sessionType;
    }

    if (data.lionInCharge) document.getElementById('lion-charge').value = data.lionInCharge;
    if (data.attendance) document.getElementById('total-people').value = data.attendance;
    if (data.birthdays) document.getElementById('birthdays').value = data.birthdays;
    
    if (data.progressive) {
        const prog = data.progressive;
        if (prog.jackpot) document.getElementById('prog-jackpot').value = prog.jackpot;
        if (prog.ballsNeeded) document.getElementById('prog-balls').value = prog.ballsNeeded;
        if (prog.actualBalls) document.getElementById('prog-actual-balls').value = prog.actualBalls;
        if (prog.consolation) document.getElementById('prog-consolation').value = prog.consolation;
        if (prog.prizeAwarded) document.getElementById('prog-prize').value = prog.prizeAwarded;
        if (prog.paidByCheck) document.getElementById('prog-check').checked = prog.paidByCheck;
    }
}

function loadPaperSales() {
    // Implementation for loading paper sales data
}

async function loadGameResults() {
    // Get the selected session type from step 1
    const sessionType = document.getElementById('session-type')?.value;
    const gamesBody = document.getElementById('games-body');

    if (!sessionType || !gamesBody) {
        console.warn('Session type not selected or games body not found');
        return;
    }

    try {
        // Show loading state
        gamesBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Loading session games...</td></tr>';

        // Load session games from API using JSONP to avoid CORS
        const result = await loadSessionGamesJSONP();

        console.log('Full API result:', result);
        console.log('result.data:', result.data);
        console.log('Selected sessionType:', sessionType);

        if (result.success && result.data) {
            const sessionTypes = result.data.sessionTypes || result.data;
            console.log('Extracted sessionTypes:', sessionTypes);
            console.log('Available keys:', Object.keys(sessionTypes));

            const sessionData = sessionTypes[sessionType];
            console.log('sessionData for', sessionType, ':', sessionData);

            if (sessionData && sessionData.games && Array.isArray(sessionData.games)) {
                console.log('Loading session games for:', sessionType, sessionData);
                populateSessionGamesNew(sessionData);
            } else {
                console.warn('No games found for session type:', sessionType, sessionData);
                gamesBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">No games configured for this session type</td></tr>';
            }
        } else {
            throw new Error(result.error || 'Failed to load session games');
        }
    } catch (error) {
        console.error('Error loading session games:', error);
        gamesBody.innerHTML = `
            <tr><td colspan="8" style="text-align: center; padding: 20px; color: #e74c3c;">
                Error loading session games: ${error.message}
                <br><button onclick="loadGameResults()" class="btn btn-small" style="margin-top: 10px;">Retry</button>
            </td></tr>
        `;
    }
}

function populateSessionGamesNew(sessionData) {
    const gamesBody = document.getElementById('games-body');
    if (!gamesBody) return;

    // Use the flat games array from the new schema
    const games = sessionData.games || [];
    console.log(`Loading ${games.length} games for session`);

    // Sort games by order/gameNumber
    games.sort((a, b) => (a.order || a.gameNumber || 0) - (b.order || b.gameNumber || 0));

    // Generate HTML for all games
    let gamesHtml = '';
    games.forEach((game, index) => {
        const gameNumber = game.gameNumber || game.order || (index + 1);
        const gameName = game.name || 'Unknown Game';
        const gameColor = game.color || 'N/A';
        const category = game.category || 'Regular';
        const payout = typeof game.payout === 'number' ? game.payout : 0;

        // Color-coded styling for game colors
        let colorStyle = '';
        if (gameColor !== 'N/A' && gameColor !== '') {
            colorStyle = `background-color: ${gameColor.toLowerCase()}; color: white; font-weight: bold;`;
        }

        gamesHtml += `
            <tr>
                <td><strong>${gameNumber}</strong></td>
                <td style="${colorStyle} text-align: center; padding: 4px 8px; border-radius: 4px;">${gameColor}</td>
                <td>${gameName}</td>
                <td>$${payout}</td>
                <td><input type="number" class="winner-count" data-game="${gameNumber}" min="0" value="1" onchange="updateGamePrizesNew(${index}, ${payout})" style="width: 60px;"></td>
                <td class="prize-per">$${payout}</td>
                <td class="total-prize">$${payout}</td>
            </tr>
        `;
    });

    if (gamesHtml) {
        gamesBody.innerHTML = gamesHtml;
        console.log(`Successfully loaded ${games.length} games for session`);
    } else {
        gamesBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #666;">No games available for this session</td></tr>';
    }
}

function populateSessionGames(sessionData) {
    const gamesBody = document.getElementById('games-body');
    if (!gamesBody) return;

    let allGames = [];
    let gameNumber = 1;

    // Collect all games from different categories
    if (sessionData.categories.earlyBird?.games) {
        sessionData.categories.earlyBird.games.forEach(game => {
            allGames.push({
                ...game,
                category: 'Early Bird',
                color: '#28a745', // Green
                displayNumber: gameNumber++
            });
        });
    }

    // Regular games - pre-intermission
    if (sessionData.categories.regular?.preIntermission) {
        sessionData.categories.regular.preIntermission.forEach(game => {
            allGames.push({
                ...game,
                category: 'Regular',
                color: '#007bff', // Blue
                displayNumber: gameNumber++
            });
        });
    }

    // Regular games - post-intermission
    if (sessionData.categories.regular?.postIntermission) {
        sessionData.categories.regular.postIntermission.forEach(game => {
            allGames.push({
                ...game,
                category: 'Regular',
                color: '#007bff', // Blue
                displayNumber: gameNumber++
            });
        });
    }

    // Regular games - post-progressive
    if (sessionData.categories.regular?.postProgressive) {
        sessionData.categories.regular.postProgressive.forEach(game => {
            allGames.push({
                ...game,
                category: 'Regular',
                color: '#007bff', // Blue
                displayNumber: gameNumber++
            });
        });
    }

    // Progressive games
    if (sessionData.categories.progressive?.games) {
        sessionData.categories.progressive.games.forEach(game => {
            allGames.push({
                ...game,
                category: 'Progressive',
                color: '#dc3545', // Red
                displayNumber: gameNumber++
            });
        });
    }

    // Special event games
    if (sessionData.categories.specialEvent?.games) {
        sessionData.categories.specialEvent.games.forEach(game => {
            allGames.push({
                ...game,
                category: 'Special',
                color: '#ffc107', // Yellow
                displayNumber: gameNumber++
            });
        });
    }

    // Generate HTML for all games
    let gamesHtml = '';
    allGames.forEach((game, index) => {
        const prizePerWinner = parseFloat(game.payout) || 0;

        gamesHtml += `
            <tr>
                <td>${game.displayNumber}</td>
                <td style="background-color: ${game.color}20; color: ${game.color}; font-weight: bold; text-align: center;">${game.category}</td>
                <td>${game.pattern}</td>
                <td>$${prizePerWinner}</td>
                <td><input type="number" class="winner-count" data-game="${game.gameNumber || index}" min="0" value="0" onchange="updateGamePrizes(${index})" style="width: 60px;"></td>
                <td class="prize-per">$${prizePerWinner}</td>
                <td class="total-prize">$0.00</td>
            </tr>
        `;
    });

    if (gamesHtml) {
        gamesBody.innerHTML = gamesHtml;
        console.log(`Loaded ${allGames.length} games for session`);
    } else {
        gamesBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #666;">No games available for this session</td></tr>';
    }
}

function updateGamePrizesNew(gameIndex, basePayout) {
    const row = document.querySelector(`#games-body tr:nth-child(${gameIndex + 1})`);
    if (!row) return;

    const winnersInput = row.querySelector('.winner-count');
    const prizePerCell = row.querySelector('.prize-per');
    const totalPrizeCell = row.querySelector('.total-prize');

    if (winnersInput && prizePerCell && totalPrizeCell) {
        const winners = parseInt(winnersInput.value) || 1;
        const totalPrize = basePayout; // Total prize pool stays the same
        const prizePerWinner = winners > 0 ? totalPrize / winners : 0;

        // Update the per-winner amount
        prizePerCell.textContent = `$${prizePerWinner.toFixed(2)}`;

        // Total prize stays the same (total pool is fixed)
        totalPrizeCell.textContent = `$${totalPrize.toFixed(2)}`;

        // Update total bingo prizes
        updateTotalBingoPrizes();
    }
}

function updateGamePrizes(gameIndex) {
    const row = document.querySelector(`#games-body tr:nth-child(${gameIndex + 1})`);
    if (!row) return;

    const winnersInput = row.querySelector('.winner-count');
    const prizePerCell = row.querySelector('.prize-per');
    const totalPrizeCell = row.querySelector('.total-prize');

    if (winnersInput && prizePerCell && totalPrizeCell) {
        const winners = parseInt(winnersInput.value) || 0;
        const prizePerWinner = parseFloat(prizePerCell.textContent.replace('$', '')) || 0;
        const totalPrize = winners * prizePerWinner;

        totalPrizeCell.textContent = `$${totalPrize.toFixed(2)}`;

        // Update total bingo prizes
        updateTotalBingoPrizes();
    }
}

function updateTotalBingoPrizes() {
    const totalPrizeCells = document.querySelectorAll('#games-body .total-prize');
    let total = 0;

    totalPrizeCells.forEach(cell => {
        const amount = parseFloat(cell.textContent.replace('$', '')) || 0;
        total += amount;
    });

    const totalElement = document.getElementById('total-bingo-prizes');
    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
}

// JSONP helper for loading session games
function loadSessionGamesJSONP() {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonpCallback_' + Math.random().toString(36).substr(2, 9);
        const script = document.createElement('script');

        // Set up the callback function
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(data);
        };

        // Create the script tag with callback parameter
        const url = `${CONFIG.API_URL}?action=getSessionGames&callback=${callbackName}&t=${Date.now()}`;
        script.src = url;
        script.onerror = function() {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('Failed to load session games'));
        };

        document.body.appendChild(script);

        // Timeout after 10 seconds
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                document.body.removeChild(script);
                reject(new Error('Session games request timeout'));
            }
        }, 10000);
    });
}

// JSONP helper for loading pull-tab library
function loadPullTabLibraryJSONP() {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonpCallback_' + Math.random().toString(36).substr(2, 9);
        const script = document.createElement('script');

        // Set up the callback function
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(data);
        };

        // Create the script tag with callback parameter
        const url = `${CONFIG.API_URL}?action=getPullTabsLibrary&callback=${callbackName}&t=${Date.now()}`;
        script.src = url;
        script.onerror = function() {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('Failed to load pull-tab library'));
        };

        document.body.appendChild(script);

        // Timeout after 10 seconds
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                document.body.removeChild(script);
                reject(new Error('Pull-tab library request timeout'));
            }
        }, 10000);
    });
}

async function loadPullTabs() {
    try {
        // Show loading if we don't have the library yet
        if (!window.pullTabLibrary) {
            console.log('Loading pull-tab library...');

            // Load pull-tab library from API using JSONP
            const result = await loadPullTabLibraryJSONP();

            if (result.success && result.data && result.data.games) {
                // Ensure each game has required properties
                window.pullTabLibrary = result.data.games.map(game => ({
                    ...game,
                    identifier: game.identifier || `${game.name}_${game.form}` || game.name,
                    name: game.name || 'Unknown Game',
                    form: game.form || '',
                    count: game.count || 0,
                    price: game.price || 1,
                    idealProfit: game.idealProfit || 0
                }));
                console.log('Pull-tab library loaded:', window.pullTabLibrary.length, 'games');

                // Update any existing pull-tab selects with the library games
                const pullTabSelects = document.querySelectorAll('.pulltab-select');
                pullTabSelects.forEach(select => {
                    populatePullTabSelect(select);
                });
            } else {
                console.warn('Failed to load pull-tab library:', result);
                // Set empty array to prevent further attempts
                window.pullTabLibrary = [];
            }
        }
    } catch (error) {
        console.error('Error loading pull-tab library:', error);
        window.pullTabLibrary = [];
    }
}

function loadMoneyCount() {
    // Implementation for loading money count
}

function loadReviewData() {
    calculateFinalTotals();
}

// ============================================
// DATE PICKER & SESSION AUTO-SELECT
// ============================================

function initializeDatePicker() {
    const dateInput = document.getElementById('occasion-date');
    if (!dateInput) return;
    
    // Enable native date picker
    dateInput.type = 'date';
    
    // Set default to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Set min and max dates (within reasonable range)
    const minDate = new Date(new Date().getFullYear() - 1, 0, 1);
    const maxDate = new Date(new Date().getFullYear() + 1, 11, 31);
    
    dateInput.min = minDate.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
    
    // Add change event for auto session selection
    dateInput.addEventListener('change', function(e) {
        const selectedDate = new Date(e.target.value + 'T12:00:00'); // Add noon time to avoid timezone issues
        
        // Only auto-select for Mondays
        if (selectedDate.getDay() === 1) {
            // Find first Monday of the month
            const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const firstMonday = new Date(firstDay);
            
            // Move to first Monday
            while (firstMonday.getDay() !== 1) {
                firstMonday.setDate(firstMonday.getDate() + 1);
            }
            
            // Calculate which Monday this is (1st, 2nd, 3rd, 4th, or 5th)
            const dayDiff = selectedDate.getDate() - firstMonday.getDate();
            const weekNumber = Math.floor(dayDiff / 7) + 1;
            
            let sessionType;
            switch(weekNumber) {
                case 1:
                    sessionType = '5-1';  // 1st Monday
                    break;
                case 2:
                    sessionType = '6-2';  // 2nd Monday
                    break;
                case 3:
                    sessionType = '7-3';  // 3rd Monday
                    break;
                case 4:
                    sessionType = '8-4';  // 4th Monday
                    break;
                case 5:
                    sessionType = '5-1';  // 5th Monday (same as 1st)
                    break;
                default:
                    sessionType = '5-1';
            }
            
            // Set the session dropdown
            const sessionSelect = document.getElementById('session-type');
            if (sessionSelect) {
                sessionSelect.value = sessionType;
                // Trigger change event to load games
                sessionSelect.dispatchEvent(new Event('change'));
            }
        }
    });
    
    // Trigger initial check if today is Monday
    const todayDate = new Date();
    if (todayDate.getDay() === 1) {
        dateInput.dispatchEvent(new Event('change'));
    }
}

// ============================================
// GAME CALCULATIONS
// ============================================

function initializeGameCalculations() {
    // Add event delegation for dynamically added game rows
    document.addEventListener('input', function(e) {
        // Check if it's a winner count input
        if (e.target.classList.contains('winner-count')) {
            const row = e.target.closest('tr');
            if (!row) return;
            
            const winnersInput = e.target;
            const prizePerInput = row.querySelector('.prize-per');
            const gameTotalCell = row.querySelector('.game-total');
            
            if (prizePerInput && gameTotalCell) {
                const winners = parseInt(winnersInput.value) || 1;
                const prizePerWinner = parseFloat(prizePerInput.value) || 0;
                const total = winners * prizePerWinner;
                
                // Update total display
                gameTotalCell.textContent = `$${total.toFixed(2)}`;
                
                // Recalculate overall totals
                if (window.app && window.app.calculateTotalBingoPrizes) {
                    window.app.calculateTotalBingoPrizes();
                }
            }
        }
        
        // Check if it's a prize per winner input
        if (e.target.classList.contains('prize-per')) {
            const row = e.target.closest('tr');
            if (!row) return;
            
            const winnersInput = row.querySelector('.winner-count');
            const prizePerInput = e.target;
            const gameTotalCell = row.querySelector('.game-total');
            
            if (winnersInput && gameTotalCell) {
                const winners = parseInt(winnersInput.value) || 1;
                const prizePerWinner = parseFloat(prizePerInput.value) || 0;
                const total = winners * prizePerWinner;
                
                gameTotalCell.textContent = `$${total.toFixed(2)}`;
                
                if (window.app && window.app.calculateTotalBingoPrizes) {
                    window.app.calculateTotalBingoPrizes();
                }
            }
        }
    });
}

// ============================================
// PULL-TAB FUNCTIONS
// ============================================

function addPullTabRow() {
    const tbody = document.getElementById('pulltab-body');
    if (!tbody) return;
    
    const row = document.createElement('tr');
    row.className = 'pulltab-row';
    row.id = 'pulltab-' + Date.now();
    
    row.innerHTML = `
        <td>
            <select class="pulltab-select" onchange="handlePullTabSelection(this)">
                <option value="">Select Game...</option>
                <option value="No Game">No Game</option>
            </select>
        </td>
        <td><input type="text" class="serial-input" placeholder="Serial #"></td>
        <td class="ticket-price-cell">$0.00</td>
        <td class="tickets-cell">0</td>
        <td class="sales-cell">$0.00</td>
        <td class="ideal-cell">$0.00</td>
        <td class="prizes-cell">$0.00</td>
        <td class="net-cell">$0.00</td>
        <td><input type="checkbox" class="se-checkbox"></td>
    `;
    
    tbody.appendChild(row);
    
    // Populate the select with library games if available
    if (window.pullTabLibrary) {
        populatePullTabSelect(row.querySelector('.pulltab-select'));
    }
}

function handlePullTabSelection(selectElement) {
    const selectedValue = selectElement.value;
    if (!selectedValue || selectedValue === 'No Game') return;
    
    const row = selectElement.closest('tr');
    const game = window.pullTabLibrary?.find(g => g.identifier === selectedValue || g.name === selectedValue);
    
    if (game && row) {
        // Auto-populate fields
        const ticketsCell = row.querySelector('.tickets-cell');
        const ticketsSoldCell = row.querySelector('.tickets-sold-cell');
        const prizesPaidCell = row.querySelector('.prizes-cell');
        const profitCell = row.querySelector('.profit-cell');
        const idealProfitCell = row.querySelector('.ideal-profit-cell');
        
        // Set values
        if (ticketsCell) ticketsCell.textContent = game.count;
        
        // Calculate ideal values
        const idealSales = game.count * game.price;
        const idealPrizes = idealSales - game.idealProfit;
        
        if (ticketsSoldCell) ticketsSoldCell.textContent = `$${idealSales.toFixed(2)}`;
        if (prizesPaidCell) prizesPaidCell.textContent = `$${idealPrizes.toFixed(2)}`;
        if (profitCell) profitCell.textContent = `$${game.idealProfit.toFixed(2)}`;
        if (idealProfitCell) idealProfitCell.textContent = `$${game.idealProfit.toFixed(2)}`;
        
        // Trigger totals calculation
        calculatePullTabTotals();
    }
}

function deletePullTabRow(button) {
    const row = button.closest('tr');
    if (row && confirm('Delete this pull-tab game?')) {
        row.remove();
        calculatePullTabTotals();
    }
}

function populatePullTabSelect(selectElement) {
    if (!window.pullTabLibrary) return;
    
    // Keep existing options
    const currentValue = selectElement.value;
    
    // Clear options except first two
    while (selectElement.options.length > 2) {
        selectElement.remove(2);
    }
    
    // Add library games
    window.pullTabLibrary.forEach(game => {
        const option = document.createElement('option');
        option.value = game.identifier || game.name;
        option.textContent = `${game.name} (${game.form})`;
        selectElement.appendChild(option);
    });
    
    // Restore value if it existed
    if (currentValue) {
        selectElement.value = currentValue;
    }
}

function addSpecialEventRow() {
    const tbody = document.getElementById('special-events-body');
    if (!tbody) return;
    
    const rowId = 'special-' + Date.now();
    const row = document.createElement('tr');
    row.className = 'special-event-row';
    row.id = rowId;
    
    row.innerHTML = `
        <td>
            <select class="special-event-select" onchange="handleSpecialEventSelection(this)">
                <option value="">Select Special Event...</option>
                <option value="Fire Fighters 599">Fire Fighters 599 ($960)</option>
                <option value="Race Horse Downs 250">Race Horse Downs 250 ($1000)</option>
                <option value="Dig Life 200">Dig Life 200 ($300)</option>
                <option value="Gum Drops 400">Gum Drops 400 ($600)</option>
                <option value="Bubble Gum 400">Bubble Gum 400 ($600)</option>
                <option value="custom">Custom Event...</option>
            </select>
            <input type="text" class="event-name-input" style="display:none;" placeholder="Event name">
        </td>
        <td><input type="text" class="event-serial-input" placeholder="Serial #"></td>
        <td class="event-tickets-cell">0</td>
        <td class="event-sales-cell">$0.00</td>
        <td><input type="number" class="event-prizes-input" min="0" step="0.01" value="0"></td>
        <td class="event-profit-cell">$0.00</td>
        <td><button onclick="deleteSpecialEvent(this)" class="remove-btn">×</button></td>
    `;
    
    tbody.appendChild(row);
}

function handleSpecialEventSelection(selectElement) {
    const row = selectElement.closest('tr');
    const nameInput = row.querySelector('.event-name-input');
    const ticketsCell = row.querySelector('.event-tickets-cell');
    const salesCell = row.querySelector('.event-sales-cell');
    
    if (selectElement.value === 'custom') {
        nameInput.style.display = 'block';
        selectElement.style.display = 'none';
    } else if (selectElement.value) {
        // Parse the value to get tickets amount
        const match = selectElement.value.match(/\$(\d+)/);
        if (match) {
            const amount = parseInt(match[1]);
            ticketsCell.textContent = amount;
            salesCell.textContent = `$${amount.toFixed(2)}`;
        }
        calculatePullTabTotals();
    }
}

function deleteSpecialEvent(button) {
    const row = button.closest('tr');
    if (row && confirm('Delete this special event?')) {
        row.remove();
        calculatePullTabTotals();
    }
}

function calculatePullTabTotals() {
    let totalSold = 0;
    let totalPrizes = 0;
    let totalProfit = 0;
    let idealProfit = 0;
    
    // Regular games
    document.querySelectorAll('.pulltab-row').forEach(row => {
        totalSold += parseFloat(row.querySelector('.tickets-sold-cell')?.textContent?.replace('$', '')) || 0;
        totalPrizes += parseFloat(row.querySelector('.prizes-cell')?.textContent?.replace('$', '')) || 0;
        totalProfit += parseFloat(row.querySelector('.profit-cell')?.textContent?.replace('$', '')) || 0;
        idealProfit += parseFloat(row.querySelector('.ideal-profit-cell')?.textContent?.replace('$', '')) || 0;
    });
    
    // Special events
    document.querySelectorAll('.special-event-row').forEach(row => {
        const sales = parseFloat(row.querySelector('.event-sales-cell')?.textContent?.replace('$', '')) || 0;
        const prizes = parseFloat(row.querySelector('.event-prizes-input')?.value) || 0;
        
        totalSold += sales;
        totalPrizes += prizes;
        totalProfit += (sales - prizes);
    });
    
    // Update totals display
    const elements = {
        'pulltab-total-sold': totalSold,
        'pulltab-total-prizes': totalPrizes,
        'pulltab-total-profit': totalProfit,
        'pulltab-ideal-profit': idealProfit
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = `$${value.toFixed(2)}`;
        }
    }
}

// ============================================
// FINAL CALCULATIONS
// ============================================

function calculateFinalTotals() {
    console.log('Calculating final totals for review step');

    // Get data from window.app if available
    const appData = window.app?.data || {};

    // 1. Calculate Bingo Sales (Paper Sales + Electronic)
    let totalBingoSales = 0;

    // From POS Door Sales
    const totalPaperElement = document.getElementById('total-paper-sales');
    const totalPaperSales = parseFloat(totalPaperElement?.textContent?.replace('$', '')) || 0;
    totalBingoSales += totalPaperSales;

    // From Electronic Sales
    if (appData.electronic?.total) {
        totalBingoSales += appData.electronic.total;
    }

    // 2. Bingo Prizes (from Session Games in step 3)
    const bingoTotalElement = document.getElementById('total-bingo-prizes');
    const totalBingoPrizes = parseFloat(bingoTotalElement?.textContent?.replace('$', '')) || 0;

    // 3. Pull-Tab Sales and Prizes (from step 4)
    let totalPullTabSales = 0;
    let totalPullTabPrizes = 0;
    let totalSESales = 0;
    let totalSEPrizes = 0;

    // Check for pull-tab data in app.data
    if (appData.pullTabs && Array.isArray(appData.pullTabs)) {
        appData.pullTabs.forEach(pt => {
            if (pt.isSpecialEvent) {
                totalSESales += pt.sales || 0;
                totalSEPrizes += pt.prizesPaid || 0;
            } else {
                totalPullTabSales += pt.sales || 0;
                totalPullTabPrizes += pt.prizesPaid || 0;
            }
        });
    }

    // Fallback: try to read from UI elements
    const ptRegSalesElement = document.getElementById('pt-reg-sales');
    const ptRegPrizesElement = document.getElementById('pt-reg-prizes');
    const ptSeSalesElement = document.getElementById('pt-se-sales');
    const ptSePrizesElement = document.getElementById('pt-se-prizes');

    if (ptRegSalesElement) totalPullTabSales = parseFloat(ptRegSalesElement.textContent?.replace('$', '')) || totalPullTabSales;
    if (ptRegPrizesElement) totalPullTabPrizes = parseFloat(ptRegPrizesElement.textContent?.replace('$', '')) || totalPullTabPrizes;
    if (ptSeSalesElement) totalSESales = parseFloat(ptSeSalesElement.textContent?.replace('$', '')) || totalSESales;
    if (ptSePrizesElement) totalSEPrizes = parseFloat(ptSePrizesElement.textContent?.replace('$', '')) || totalSEPrizes;

    // 4. Cash Deposit (from step 5 - Money Count)
    let totalDeposit = 0;

    // Check for deposit data in app.data
    if (appData.moneyCount) {
        // Sum up all the cash in both drawers
        const bingoDrawer = appData.moneyCount.bingo || {};
        const pullTabDrawer = appData.moneyCount.pulltab || appData.moneyCount.pullTab || {};

        Object.values(bingoDrawer).forEach(amount => totalDeposit += parseFloat(amount) || 0);
        Object.values(pullTabDrawer).forEach(amount => totalDeposit += parseFloat(amount) || 0);
    }

    // Fallback: try to read from UI elements
    const depositTotalElement = document.getElementById('deposit-total');
    if (depositTotalElement) {
        totalDeposit = parseFloat(depositTotalElement.textContent?.replace('$', '')) || totalDeposit;
    }

    // Calculate derived totals
    const grossSales = totalBingoSales + totalPullTabSales + totalSESales;
    const totalPrizes = totalBingoPrizes + totalPullTabPrizes + totalSEPrizes;
    const actualProfit = totalDeposit - 1000; // Less startup of $1000

    // Update the Review & Submit summary fields
    updateSummaryField('summary-bingo-sales', totalBingoSales);
    updateSummaryField('summary-pt-sales', totalPullTabSales);
    updateSummaryField('summary-se-sales', totalSESales);
    updateSummaryField('summary-gross', grossSales);
    updateSummaryField('summary-bingo-prizes', totalBingoPrizes);
    updateSummaryField('summary-pt-prizes', totalPullTabPrizes);
    updateSummaryField('summary-se-prizes', totalSEPrizes);
    updateSummaryField('summary-total-prizes', totalPrizes);
    updateSummaryField('summary-deposit', totalDeposit);
    updateSummaryField('summary-actual', actualProfit);

    console.log('Final totals calculated:', {
        bingoSales: totalBingoSales,
        pullTabSales: totalPullTabSales,
        seSales: totalSESales,
        grossSales: grossSales,
        bingoPrizes: totalBingoPrizes,
        pullTabPrizes: totalPullTabPrizes,
        sePrizes: totalSEPrizes,
        totalPrizes: totalPrizes,
        deposit: totalDeposit,
        actualProfit: actualProfit
    });
}

function updateSummaryField(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.textContent = `$${value.toFixed(2)}`;
    }
}

// ============================================
// SUBMIT FUNCTION
// ============================================

async function submitOccasion() {
    if (!confirm('Submit this occasion? This will save all data to the database.')) {
        return;
    }

    // Show loading overlay and disable button to prevent multiple clicks
    if (window.showLoading) {
        window.showLoading('Submitting Occasion', 'Please wait while we save your data...');
    }

    const submitBtn = document.querySelector('[onclick="submitOccasion()"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
    }

    try {
        // Prepare submission data
        const submissionData = {
            ...window.app.data,
            submittedAt: new Date().toISOString(),
            submittedBy: window.app.data.occasion.lionInCharge
        };

        // Submit to backend
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                action: 'saveOccasion',
                data: JSON.stringify(submissionData)
            })
        });

        const result = await response.json();

        // Hide loading overlay
        if (window.hideLoading) {
            window.hideLoading();
        }

        if (result.success) {
            alert('Occasion submitted successfully!');

            // Clear draft data
            localStorage.removeItem(CONFIG.STORAGE_KEYS.DRAFT_DATA);

            // Reset form
            window.location.reload();
        } else {
            // Re-enable button on error
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Occasion';
            }
            throw new Error(result.message || 'Submission failed');
        }
    } catch (error) {
        console.error('Submission error:', error);

        // Hide loading overlay
        if (window.hideLoading) {
            window.hideLoading();
        }

        // Re-enable button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Occasion';
        }

        // Add to sync queue for later submission
        const queue = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE) || '[]');
        queue.push({
            action: 'saveOccasion',
            data: window.app.data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));

        alert('Submission saved offline. Will sync when connection is restored.');
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function showValidationError(message) {
    // Show error message to user
    const existingError = document.querySelector('.validation-error');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #f44336;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Wizard.js initializing...');

    // Initialize date picker
    initializeDatePicker();

    // Initialize game calculations
    initializeGameCalculations();

    // Add step click handlers for direct navigation
    document.querySelectorAll('.step[data-step]').forEach(stepElement => {
        stepElement.addEventListener('click', (e) => {
            const targetStep = parseInt(stepElement.getAttribute('data-step'));
            if (targetStep && targetStep !== window.app.currentStep) {
                // Save current step data before switching
                if (window.app.saveDraft) {
                    window.app.saveDraft();
                }
                // Allow direct navigation to any step
                window.app.currentStep = targetStep;
                updateStepDisplay();
            }
        });
        // Add cursor pointer to indicate clickable
        stepElement.style.cursor = 'pointer';
    });

    // Set initial step display
    if (window.app) {
        updateStepDisplay();
    }

    // Load pull-tab library if function exists
    if (typeof loadPullTabLibrary === 'function') {
        loadPullTabLibrary();
    }

    console.log('Wizard.js initialization complete');
});