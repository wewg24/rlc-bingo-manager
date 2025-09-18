// wizard.js - Complete implementation with all fixes
// Version 11.0.4 - Addresses all identified issues

// Step navigation functions
function nextStep() {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
        return false;
    }
    
    // Save current step data
    saveStepData();
    
    // Move to next step if not at the end
    if (window.app && window.app.currentStep < window.app.totalSteps) {
        window.app.currentStep++;
        updateStepDisplay();
        loadStepData(); // Load any saved data for the new step
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

// Update the visual display of steps
function updateStepDisplay() {
    // Hide all step contents
    document.querySelectorAll('.step-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show current step content
    const currentContent = document.getElementById(`step-${window.app.currentStep}`);
    if (currentContent) {
        currentContent.style.display = 'block';
    }
    
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        const stepNum = index + 1;
        indicator.classList.remove('active', 'completed');
        
        if (stepNum === window.app.currentStep) {
            indicator.classList.add('active');
        } else if (stepNum < window.app.currentStep) {
            indicator.classList.add('completed');
        }
    });
    
    // Update navigation buttons
    const prevBtn = document.querySelector('.prev-button');
    const nextBtn = document.querySelector('.next-button');
    
    if (prevBtn) {
        prevBtn.style.display = window.app.currentStep === 1 ? 'none' : 'block';
    }
    
    if (nextBtn) {
        if (window.app.currentStep === window.app.totalSteps) {
            nextBtn.textContent = 'Complete';
            nextBtn.onclick = submitOccasion;
        } else {
            nextBtn.textContent = 'Next';
            nextBtn.onclick = nextStep;
        }
    }
}

// Validation functions for each step
function validateSessionInfo() {
    // Use the correct IDs that actually exist in your HTML
    const date = document.getElementById('session-date')?.value;
    const session = document.getElementById('session-type')?.value;
    const lion = document.getElementById('lion-charge')?.value;
    
    if (!date || !session || !lion) {
        console.log('Validation failed - missing:', {
            date: !!date,
            session: !!session, 
            lion: !!lion
        });
        alert('Please fill in all required session information');
        return false;
    }
    
    console.log('Session info validation passed');
    return true;
}

// Also fix the validateCurrentStep function to use correct step IDs:
function validateCurrentStep() {
    const currentStepNum = window.app ? window.app.currentStep : 1;
    
    switch(currentStepNum) {
        case 1: // Session Info
            return validateSessionInfo();
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

function validatePaperSales() {
    // Basic validation - ensure at least some paper types have been entered
    let hasValidEntry = false;
    
    CONFIG.PAPER_TYPES.forEach(type => {
        const startInput = document.getElementById(`${type.id}-start`);
        const endInput = document.getElementById(`${type.id}-end`);
        
        if (startInput && endInput) {
            const start = parseInt(startInput.value) || 0;
            const end = parseInt(endInput.value) || 0;
            
            if (start > 0 || end > 0) {
                hasValidEntry = true;
            }
            
            // Validate that end count doesn't exceed start count (without free)
            if (end > start) {
                showValidationError(`${type.name}: Ending count cannot exceed starting count.`);
                return false;
            }
        }
    });
    
    if (!hasValidEntry) {
        showValidationError('Please enter paper sales inventory counts.');
        return false;
    }
    
    return true;
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

function validatePullTabs() {
    // Pull-tabs are optional, so minimal validation
    return true;
}

function validateMoneyCount() {
    // Ensure both drawers have been counted
    const bingoTotal = parseFloat(document.getElementById('bingo-total')?.textContent?.replace('$', '')) || 0;
    const ptTotal = parseFloat(document.getElementById('pt-total')?.textContent?.replace('$', '')) || 0;
    
    if (bingoTotal === 0 && ptTotal === 0) {
        showValidationError('Please count both cash drawers.');
        return false;
    }
    
    return true;
}

// Save and load step data
function saveStepData() {
    if (!window.app) return;
    
    switch (window.app.currentStep) {
        case 1:
            saveSessionInfo();
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
    window.app.saveDraft();
}

function loadStepData() {
    if (!window.app) return;
    
    switch (window.app.currentStep) {
        case 1:
            loadSessionInfo();
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

// Individual step save functions
function saveSessionInfo() {
    window.app.data.occasion = {
        date: document.getElementById('session-date')?.value,
        sessionType: document.getElementById('session-type')?.value,
        lionInCharge: document.getElementById('lion-in-charge')?.value,
        attendance: parseInt(document.getElementById('attendance')?.value) || 0,
        birthdays: parseInt(document.getElementById('birthdays')?.value) || 0,
        progressive: {
            jackpot: parseFloat(document.getElementById('prog-jackpot')?.value) || 0,
            ballsNeeded: parseInt(document.getElementById('prog-balls')?.value) || 0,
            actualBalls: parseInt(document.getElementById('prog-actual-balls')?.value) || 0,
            consolation: parseFloat(document.getElementById('prog-consolation')?.value) || 200,
            prizeAwarded: parseFloat(document.getElementById('prog-prize')?.value) || 0,
            paidByCheck: document.getElementById('prog-check')?.checked || false
        }
    };
}

function savePaperSales() {
    // Save paper inventory
    CONFIG.PAPER_TYPES.forEach(type => {
        const start = parseInt(document.getElementById(`${type.id}-start`)?.value) || 0;
        const end = parseInt(document.getElementById(`${type.id}-end`)?.value) || 0;
        const free = parseInt(document.getElementById(`${type.id}-free`)?.value) || 0;
        const sold = Math.max(0, start - end - free);
        
        window.app.data.paperBingo[type.id] = { start, end, free, sold };
    });
    
    // Save POS sales
    const posItems = getPOSItemsOrdered(); // Get items in correct order
    posItems.forEach(item => {
        const qty = parseInt(document.getElementById(`${item.id}-qty`)?.value) || 0;
        window.app.data.posSales[item.id] = {
            name: item.name,
            price: item.price,
            quantity: qty,
            total: qty * item.price
        };
    });
    
    // Save electronic rentals
    const smallMachines = parseInt(document.getElementById('small-machines')?.value) || 0;
    const largeMachines = parseInt(document.getElementById('large-machines')?.value) || 0;
    
    window.app.data.electronic = {
        smallMachines,
        largeMachines,
        smallTotal: smallMachines * 40,
        largeTotal: largeMachines * 65,
        total: (smallMachines * 40) + (largeMachines * 65)
    };
}

function saveGameResults() {
    const games = [];
    document.querySelectorAll('#games-body tr').forEach(row => {
        const gameNum = row.querySelector('.winner-count')?.getAttribute('data-game');
        if (gameNum) {
            const winners = parseInt(row.querySelector('.winner-count')?.value) || 0;
            const prizePerWinner = parseFloat(row.querySelector('.prize-per')?.value) || 0;
            const checkPaid = row.querySelector('.check-payment')?.checked || false;
            
            games.push({
                num: gameNum,
                winners,
                prizePerWinner,
                totalPrize: winners * prizePerWinner,
                paidByCheck: checkPaid
            });
        }
    });
    
    window.app.data.games = games;
}

function savePullTabs() {
    const pullTabs = [];
    
    // Regular games
    document.querySelectorAll('.pulltab-row').forEach(row => {
        const gameSelect = row.querySelector('.game-select');
        const serialInput = row.querySelector('.serial-input');
        const openedInput = row.querySelector('.opened-input');
        
        if (gameSelect && gameSelect.value && gameSelect.value !== 'No Game') {
            pullTabs.push({
                game: gameSelect.value,
                serial: serialInput?.value || '',
                opened: parseInt(openedInput?.value) || 0,
                tickets: parseInt(row.querySelector('.tickets-cell')?.textContent) || 0,
                prizes: parseFloat(row.querySelector('.prizes-cell')?.textContent?.replace('$', '')) || 0,
                profit: parseFloat(row.querySelector('.profit-cell')?.textContent?.replace('$', '')) || 0,
                isSpecial: false
            });
        }
    });
    
    // Special events
    document.querySelectorAll('.special-event-row').forEach(row => {
        const nameInput = row.querySelector('.event-name-input');
        const ticketsInput = row.querySelector('.event-tickets-input');
        const prizesInput = row.querySelector('.event-prizes-input');
        
        if (nameInput && nameInput.value) {
            pullTabs.push({
                game: nameInput.value,
                serial: '',
                opened: 1,
                tickets: parseInt(ticketsInput?.value) || 0,
                prizes: parseFloat(prizesInput?.value) || 0,
                profit: (parseInt(ticketsInput?.value) || 0) - (parseFloat(prizesInput?.value) || 0),
                isSpecial: true
            });
        }
    });
    
    window.app.data.pullTabs = pullTabs;
}

function saveMoneyCount() {
    // Save bingo drawer
    ['100', '50', '20', '10', '5', '2', '1', 'coins', 'checks'].forEach(denom => {
        const value = parseFloat(document.getElementById(`bingo-${denom}`)?.value) || 0;
        window.app.data.moneyCount.bingo[denom] = value;
    });
    
    // Save pull-tab drawer
    ['100', '50', '20', '10', '5', '2', '1', 'coins'].forEach(denom => {
        const value = parseFloat(document.getElementById(`pt-${denom}`)?.value) || 0;
        window.app.data.moneyCount.pullTab[denom] = value;
    });
}

// Load functions for each step
function loadSessionInfo() {
    if (!window.app.data.occasion) return;
    
    const data = window.app.data.occasion;
    if (data.date) document.getElementById('session-date').value = data.date;
    if (data.sessionType) document.getElementById('session-type').value = data.sessionType;
    if (data.lionInCharge) document.getElementById('lion-in-charge').value = data.lionInCharge;
    if (data.attendance) document.getElementById('attendance').value = data.attendance;
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
    // Load paper inventory
    if (window.app.data.paperBingo) {
        Object.keys(window.app.data.paperBingo).forEach(typeId => {
            const data = window.app.data.paperBingo[typeId];
            if (data.start) document.getElementById(`${typeId}-start`).value = data.start;
            if (data.end) document.getElementById(`${typeId}-end`).value = data.end;
            if (data.free) document.getElementById(`${typeId}-free`).value = data.free;
        });
    }
    
    // Load POS sales
    if (window.app.data.posSales) {
        Object.keys(window.app.data.posSales).forEach(itemId => {
            const data = window.app.data.posSales[itemId];
            if (data.quantity) document.getElementById(`${itemId}-qty`).value = data.quantity;
        });
    }
    
    // Load electronic rentals
    if (window.app.data.electronic) {
        const elec = window.app.data.electronic;
        if (elec.smallMachines) document.getElementById('small-machines').value = elec.smallMachines;
        if (elec.largeMachines) document.getElementById('large-machines').value = elec.largeMachines;
    }
}

function loadGameResults() {
    // Game results would be loaded when games are rendered
    // This happens in the main app's loadSessionGames function
}

function loadPullTabs() {
    // Pull-tabs would be restored if there were saved rows
    // This is handled when adding rows
}

function loadMoneyCount() {
    // Load bingo drawer
    if (window.app.data.moneyCount.bingo) {
        Object.keys(window.app.data.moneyCount.bingo).forEach(denom => {
            const value = window.app.data.moneyCount.bingo[denom];
            const input = document.getElementById(`bingo-${denom}`);
            if (input) input.value = value;
        });
    }
    
    // Load pull-tab drawer
    if (window.app.data.moneyCount.pullTab) {
        Object.keys(window.app.data.moneyCount.pullTab).forEach(denom => {
            const value = window.app.data.moneyCount.pullTab[denom];
            const input = document.getElementById(`pt-${denom}`);
            if (input) input.value = value;
        });
    }
}

function loadReviewData() {
    // Calculate all totals for review
    calculateFinalTotals();
}

// POS Items ordering function
function getPOSItemsOrdered() {
    // Define the correct order as shown in the POS report
    return [
        // Electronic Bingo (sorted by reg number)
        { id: '27reg18pro', name: '27reg18pro', price: 0, category: 'electronic' },
        { id: '27reg18pro-rental', name: '27reg18pro Rental', price: 49, category: 'electronic' },
        { id: '45reg36pro', name: '45reg36pro', price: 0, category: 'electronic' },
        { id: '45reg36pro-rental', name: '45reg36pro Rental', price: 65, category: 'electronic' },
        { id: 'b-lc-lions', name: 'B LC Lions', price: 0, category: 'electronic' },
        { id: 'lc-progressive-brown', name: 'LC Progressive Brown', price: 0, category: 'electronic' },
        
        // Miscellaneous
        { id: 'dauber', name: 'Dauber', price: 2, category: 'miscellaneous' },
        
        // Paper (alphabetical)
        { id: 'birthday-pack', name: 'Birthday Pack', price: 0, category: 'paper' },
        { id: 'coverall-extra', name: 'Coverall Extra', price: 1, category: 'paper' },
        { id: 'early-bird-double', name: 'Early Bird Double', price: 5, category: 'paper' },
        { id: 'letter-x-extra', name: 'Letter X Extra', price: 1, category: 'paper' },
        { id: 'number-7-extra', name: 'Number 7 Extra', price: 1, category: 'paper' },
        { id: 'progressive-18-face', name: 'Progressive 18 Face', price: 5, category: 'paper' },
        { id: 'progressive-3-face', name: 'Progressive 3 Face', price: 1, category: 'paper' }
    ];
}

// Helper functions
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

// Pull-tab specific functions
function addPullTabRow() {
    const tbody = document.getElementById('pulltab-body');
    if (!tbody) return;
    
    const row = document.createElement('tr');
    row.className = 'pulltab-row';
    
    // Create game select with options from library
    const gameOptions = window.app.pullTabLibrary.map(game => 
        `<option value="${game.name}" data-form="${game.form}" data-count="${game.count}" 
                data-price="${game.price}" data-profit="${game.profit}">
            ${game.name} - ${game.form}
        </option>`
    ).join('');
    
    row.innerHTML = `
        <td>
            <select class="game-select" onchange="updatePullTabRow(this)">
                <option value="">Select Game...</option>
                ${gameOptions}
            </select>
        </td>
        <td><input type="text" class="serial-input" placeholder="Serial #"></td>
        <td><input type="number" class="opened-input" value="1" min="0" max="1"></td>
        <td class="tickets-cell">0</td>
        <td class="tickets-sold-cell">$0.00</td>
        <td class="prizes-cell">$0.00</td>
        <td class="profit-cell">$0.00</td>
        <td class="ideal-profit-cell">$0.00</td>
        <td><input type="checkbox" class="check-payment"></td>
        <td><button onclick="removePullTabRow(this)" class="remove-btn">×</button></td>
    `;
    
    tbody.appendChild(row);
}

function updatePullTabRow(selectElement) {
    const row = selectElement.closest('tr');
    const selectedOption = selectElement.selectedOptions[0];
    
    if (selectedOption && selectedOption.value) {
        const count = parseInt(selectedOption.dataset.count) || 0;
        const price = parseFloat(selectedOption.dataset.price) || 1;
        const profit = parseFloat(selectedOption.dataset.profit) || 0;
        const opened = parseInt(row.querySelector('.opened-input').value) || 0;
        
        // Update cells
        row.querySelector('.tickets-cell').textContent = count * opened;
        row.querySelector('.tickets-sold-cell').textContent = `$${(count * price * opened).toFixed(2)}`;
        row.querySelector('.ideal-profit-cell').textContent = `$${(profit * opened).toFixed(2)}`;
        
        // Prizes would be entered manually
        calculatePullTabTotals();
    }
}

function removePullTabRow(button) {
    const row = button.closest('tr');
    row.remove();
    calculatePullTabTotals();
}

function addSpecialEvent() {
    const tbody = document.getElementById('special-events-body');
    if (!tbody) return;
    
    const row = document.createElement('tr');
    row.className = 'special-event-row';
    
    row.innerHTML = `
        <td><input type="text" class="event-name-input" placeholder="Event Name"></td>
        <td>-</td>
        <td>1</td>
        <td><input type="number" class="event-tickets-input" placeholder="0" min="0"></td>
        <td class="event-sold-cell">$0.00</td>
        <td><input type="number" class="event-prizes-input" placeholder="0" min="0" step="0.01"></td>
        <td class="event-profit-cell">$0.00</td>
        <td>-</td>
        <td><input type="checkbox" class="check-payment"></td>
        <td><button onclick="removeSpecialEvent(this)" class="remove-btn">×</button></td>
    `;
    
    // Add event listeners for calculations
    row.querySelector('.event-tickets-input').addEventListener('input', () => calculateSpecialEventRow(row));
    row.querySelector('.event-prizes-input').addEventListener('input', () => calculateSpecialEventRow(row));
    
    tbody.appendChild(row);
}

function calculateSpecialEventRow(row) {
    const tickets = parseInt(row.querySelector('.event-tickets-input').value) || 0;
    const prizes = parseFloat(row.querySelector('.event-prizes-input').value) || 0;
    
    row.querySelector('.event-sold-cell').textContent = `$${tickets.toFixed(2)}`;
    row.querySelector('.event-profit-cell').textContent = `$${(tickets - prizes).toFixed(2)}`;
    
    calculatePullTabTotals();
}

function removeSpecialEvent(button) {
    const row = button.closest('tr');
    row.remove();
    calculatePullTabTotals();
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
        const tickets = parseInt(row.querySelector('.event-tickets-input')?.value) || 0;
        const prizes = parseFloat(row.querySelector('.event-prizes-input')?.value) || 0;
        
        totalSold += tickets;
        totalPrizes += prizes;
        totalProfit += (tickets - prizes);
    });
    
    // Update totals display
    document.getElementById('pulltab-total-sold').textContent = `$${totalSold.toFixed(2)}`;
    document.getElementById('pulltab-total-prizes').textContent = `$${totalPrizes.toFixed(2)}`;
    document.getElementById('pulltab-total-profit').textContent = `$${totalProfit.toFixed(2)}`;
    document.getElementById('pulltab-ideal-profit').textContent = `$${idealProfit.toFixed(2)}`;
}

// Final calculations for review
function calculateFinalTotals() {
    // Calculate bingo sales
    let bingoSales = 0;
    Object.values(window.app.data.paperBingo || {}).forEach(item => {
        const paperType = CONFIG.PAPER_TYPES.find(t => t.id === item.id);
        if (paperType) {
            bingoSales += item.sold * paperType.price;
        }
    });
    
    // Calculate POS sales
    let posSales = 0;
    Object.values(window.app.data.posSales || {}).forEach(item => {
        posSales += item.total || 0;
    });
    
    // Calculate electronic sales
    const electronicSales = window.app.data.electronic?.total || 0;
    
    // Total bingo sales
    const totalBingoSales = bingoSales + posSales + electronicSales;
    
    // Calculate pull-tab sales and prizes
    let pullTabSales = 0;
    let pullTabPrizes = 0;
    
    window.app.data.pullTabs?.forEach(pt => {
        pullTabSales += pt.tickets * (pt.price || 1);
        pullTabPrizes += pt.prizes || 0;
    });
    
    // Calculate game prizes
    let bingoPrizes = 0;
    window.app.data.games?.forEach(game => {
        bingoPrizes += game.totalPrize || 0;
    });
    
    // Add progressive prize if any
    bingoPrizes += window.app.data.occasion?.progressive?.prizeAwarded || 0;
    
    // Calculate totals
    const grossSales = totalBingoSales + pullTabSales;
    const totalPrizes = bingoPrizes + pullTabPrizes;
    const netProfit = grossSales - totalPrizes;
    
    // Update display
    document.getElementById('review-bingo-sales').textContent = `$${totalBingoSales.toFixed(2)}`;
    document.getElementById('review-pulltab-sales').textContent = `$${pullTabSales.toFixed(2)}`;
    document.getElementById('review-gross-sales').textContent = `$${grossSales.toFixed(2)}`;
    document.getElementById('review-bingo-prizes').textContent = `$${bingoPrizes.toFixed(2)}`;
    document.getElementById('review-pulltab-prizes').textContent = `$${pullTabPrizes.toFixed(2)}`;
    document.getElementById('review-total-prizes').textContent = `$${totalPrizes.toFixed(2)}`;
    document.getElementById('review-net-profit').textContent = `$${netProfit.toFixed(2)}`;
    
    // Calculate deposit
    const bingoDrawer = Object.values(window.app.data.moneyCount?.bingo || {}).reduce((a, b) => a + b, 0);
    const ptDrawer = Object.values(window.app.data.moneyCount?.pullTab || {}).reduce((a, b) => a + b, 0);
    const totalDeposit = bingoDrawer + ptDrawer;
    
    document.getElementById('review-deposit').textContent = `$${totalDeposit.toFixed(2)}`;
    
    // Calculate over/short
    const overShort = totalDeposit - 1000 - netProfit; // Minus startup cash
    document.getElementById('review-over-short').textContent = `$${overShort.toFixed(2)}`;
}

// Submit occasion
async function submitOccasion() {
    if (!confirm('Submit this occasion? This will save all data to the database.')) {
        return;
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
                action: 'submitOccasion',
                data: JSON.stringify(submissionData)
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Occasion submitted successfully!');
            
            // Clear draft data
            localStorage.removeItem(CONFIG.STORAGE_KEYS.DRAFT_DATA);
            
            // Reset form
            window.app.data = {
                occasion: {},
                paperBingo: {},
                posSales: {},
                electronic: {},
                games: [],
                pullTabs: [],
                moneyCount: { bingo: {}, pullTab: {} },
                financial: {}
            };
            
            // Go back to step 1
            window.app.currentStep = 1;
            updateStepDisplay();
        } else {
            throw new Error(result.message || 'Submission failed');
        }
    } catch (error) {
        console.error('Submission error:', error);
        
        // Add to sync queue for later submission
        const queue = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE) || '[]');
        queue.push({
            action: 'submitOccasion',
            data: window.app.data,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
        
        alert('Submission saved offline. Will sync when connection is restored.');
    }
}

// Initialize wizard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Set initial step display
    if (window.app) {
        updateStepDisplay();
    }
    
    // Add date picker functionality
    const dateInput = document.getElementById('session-date');
    if (dateInput) {
        // Set min and max dates (within reasonable range)
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 1, 0, 1);
        const maxDate = new Date(today.getFullYear() + 1, 11, 31);
        
        dateInput.min = minDate.toISOString().split('T')[0];
        dateInput.max = maxDate.toISOString().split('T')[0];
        
        // Add change listener for auto-session selection
        dateInput.addEventListener('change', (e) => {
            const selectedDate = new Date(e.target.value);
            
            // Check if it's a Monday
            if (selectedDate.getDay() === 1) {
                // Determine which Monday of the month
                const firstMonday = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                while (firstMonday.getDay() !== 1) {
                    firstMonday.setDate(firstMonday.getDate() + 1);
                }
                
                const weekNumber = Math.ceil((selectedDate.getDate() - firstMonday.getDate() + 1) / 7) + 1;
                
                let sessionType;
                switch(weekNumber) {
                    case 1:
                    case 5:
                        sessionType = '5-1';
                        break;
                    case 2:
                        sessionType = '6-2';
                        break;
                    case 3:
                        sessionType = '7-3';
                        break;
                    case 4:
                        sessionType = '8-4';
                        break;
                    default:
                        sessionType = '5-1';
                }
                
                const sessionSelect = document.getElementById('session-type');
                if (sessionSelect) {
                    sessionSelect.value = sessionType;
                    // Trigger change event to load games
                    sessionSelect.dispatchEvent(new Event('change'));
                }
            }
        });
    }
    
    // Add auto-calculation for games
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('winner-count')) {
            const row = e.target.closest('tr');
            const winners = parseInt(e.target.value) || 1;
            const prizeInput = row.querySelector('.prize-per');
            
            // For non-progressive games, update total automatically
            if (!prizeInput.hasAttribute('readonly')) {
                const prizePerWinner = parseFloat(prizeInput.value) || 0;
                const total = winners * prizePerWinner;
                row.querySelector('.game-total').textContent = `$${total.toFixed(2)}`;
                
                // Recalculate totals
                window.app.calculateTotalBingoPrizes();
            }
        }
    });
});
