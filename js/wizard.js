// Wizard Navigation Logic
let currentStep = 1;
const totalSteps = 6;

function nextStep() {
    if (currentStep < totalSteps) {
        if (validateCurrentStep()) {
            currentStep++;
            updateWizard();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateWizard();
    }
}

function goToStep(step) {
    if (step >= 1 && step <= totalSteps) {
        currentStep = step;
        updateWizard();
    }
}

function updateWizard() {
    // Update step visibility
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step-${currentStep}`)?.classList.add('active');
    
    // Update progress bar
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else if (index + 1 < currentStep) {
            step.classList.add('completed');
        }
    });
    
    // Update navigation buttons
    document.getElementById('prev-btn').disabled = currentStep === 1;
    document.getElementById('next-btn').textContent = currentStep === totalSteps ? 'Complete' : 'Next';
    
    // Calculate totals when reaching review step
    if (currentStep === 6) {
        calculateFinalSummary();
    }
}

function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            return validateSessionInfo();
        case 2:
            return validatePaperSales();
        case 3:
            return true; // Games are pre-populated
        case 4:
            return validatePullTabs();
        case 5:
            return validateMoneyCount();
        default:
            return true;
    }
}

function validateSessionInfo() {
    const date = document.getElementById('session-date').value;
    const session = document.getElementById('session-type').value;
    const lion = document.getElementById('lion-charge').value;
    const people = document.getElementById('total-people').value;
    
    if (!date || !session || !lion || !people) {
        alert('Please complete all required fields');
        return false;
    }
    
    // Store session data
    if (window.app) {
        window.app.data.occasion = {
            date,
            sessionType: session,
            lionInCharge: lion,
            totalPeople: parseInt(people),
            birthdays: parseInt(document.getElementById('birthdays').value) || 0
        };
        
        // Store progressive data
        window.app.data.progressive = {
            jackpot: parseFloat(document.getElementById('prog-jackpot').value) || 0,
            ballsNeeded: parseInt(document.getElementById('prog-balls').value) || 0,
            consolation: parseFloat(document.getElementById('prog-consolation').value) || 200,
            actualBalls: parseInt(document.getElementById('prog-actual-balls').value) || 0,
            actualPrize: parseFloat(document.getElementById('prog-prize').value) || 0,
            checkPayment: document.getElementById('prog-check').checked
        };
    }
    
    return true;
}

function validatePaperSales() {
    // Paper sales are optional but should be logical
    let hasData = false;
    
    CONFIG.PAPER_TYPES.forEach(type => {
        const start = document.getElementById(`${type.id}-start`)?.value;
        const end = document.getElementById(`${type.id}-end`)?.value;
        
        if (start || end) {
            hasData = true;
            if (parseInt(end) > parseInt(start)) {
                alert(`Ending count cannot exceed starting count for ${type.name}`);
                return false;
            }
        }
    });
    
    return true;
}

function validatePullTabs() {
    // Pull-tabs are optional
    return true;
}

function validateMoneyCount() {
    // Money count should have at least some values
    const bingoTotal = parseFloat(document.getElementById('bingo-total')?.textContent.replace('$', '')) || 0;
    const ptTotal = parseFloat(document.getElementById('pt-total')?.textContent.replace('$', '')) || 0;
    
    if (bingoTotal === 0 && ptTotal === 0) {
        return confirm('No money count entered. Continue anyway?');
    }
    
    return true;
}

function calculateFinalSummary() {
    if (!window.app) return;
    
    const data = window.app.data;
    
    // Calculate total bingo sales
    let bingoSales = 0;
    Object.values(data.posSales || {}).forEach(item => {
        bingoSales += item.total || 0;
    });
    bingoSales += data.electronic?.total || 0;
    
    // Get pull-tab totals
    let ptSales = 0;
    let ptPrizes = 0;
    let seSales = 0;
    let sePrizes = 0;
    
    document.querySelectorAll('#pulltab-body tr').forEach(row => {
        const isSpecial = row.querySelector('[type="checkbox"]:nth-of-type(1)')?.checked;
        const sales = parseFloat(row.cells[4]?.textContent.replace('$', '')) || 0;
        const prizes = parseFloat(row.cells[6]?.textContent.replace('$', '')) || 0;
        
        if (isSpecial) {
            seSales += sales;
            sePrizes += prizes;
        } else {
            ptSales += sales;
            ptPrizes += prizes;
        }
    });
    
    // Update summary display
    document.getElementById('summary-bingo-sales').textContent = `$${bingoSales.toFixed(2)}`;
    document.getElementById('summary-pt-sales').textContent = `$${ptSales.toFixed(2)}`;
    document.getElementById('summary-se-sales').textContent = `$${seSales.toFixed(2)}`;
    
    const grossSales = bingoSales + ptSales + seSales;
    document.getElementById('summary-gross').textContent = `$${grossSales.toFixed(2)}`;
    
    const bingoPrizes = data.financial?.bingoPrizesPaid || 0;
    document.getElementById('summary-bingo-prizes').textContent = `$${bingoPrizes.toFixed(2)}`;
    document.getElementById('summary-pt-prizes').textContent = `$${ptPrizes.toFixed(2)}`;
    document.getElementById('summary-se-prizes').textContent = `$${sePrizes.toFixed(2)}`;
    
    const totalPrizes = bingoPrizes + ptPrizes + sePrizes;
    document.getElementById('summary-total-prizes').textContent = `$${totalPrizes.toFixed(2)}`;
    
    const deposit = data.financial?.totalCashDeposit || 0;
    document.getElementById('summary-deposit').textContent = `$${deposit.toFixed(2)}`;
    
    const actualProfit = deposit - 1000; // Less startup
    document.getElementById('summary-actual').textContent = `$${actualProfit.toFixed(2)}`;
    
    const idealProfit = grossSales - totalPrizes;
    document.getElementById('summary-ideal').textContent = `$${idealProfit.toFixed(2)}`;
    
    const overShort = actualProfit - idealProfit;
    const overShortElement = document.getElementById('summary-overshort');
    overShortElement.textContent = overShort < 0 ? 
        `($${Math.abs(overShort).toFixed(2)})` : 
        `$${overShort.toFixed(2)}`;
    overShortElement.parentElement.className = overShort >= 0 ? 'summary-item' : 'summary-item danger';
    
    // Update metrics
    const players = data.occasion?.totalPeople || 0;
    document.getElementById('metric-players').textContent = players;
    document.getElementById('metric-gross').textContent = `$${grossSales.toFixed(2)}`;
    document.getElementById('metric-profit').textContent = `$${idealProfit.toFixed(2)}`;
    document.getElementById('metric-per-player').textContent = players > 0 ? 
        `$${(idealProfit / players).toFixed(2)}` : '$0.00';
}

// Initialize step click handlers
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.step').forEach((step, index) => {
        step.addEventListener('click', () => {
            if (index + 1 <= currentStep) {
                goToStep(index + 1);
            }
        });
    });
});
