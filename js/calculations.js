// All calculation functions
function addPullTabRow() {
    const tbody = document.getElementById('pulltab-body');
    if (!tbody) return;
    
    const row = tbody.insertRow();
    row.innerHTML = `
        <td>
            <select class="pt-game-select">
                <option value="">Select Game...</option>
                ${window.app?.pullTabLibrary.map(game => 
                    `<option value="${game.name}">${game.name}</option>`
                ).join('')}
            </select>
        </td>
        <td><input type="text" placeholder="Serial #"></td>
        <td><input type="number" value="1.00" step="0.01" class="pt-price"></td>
        <td><input type="number" class="pt-tickets" min="0"></td>
        <td class="pt-sales">$0.00</td>
        <td><input type="number" class="pt-ideal" step="0.01"></td>
        <td><input type="number" class="pt-prizes" step="0.01"></td>
        <td class="pt-net">$0.00</td>
        <td><input type="checkbox" class="pt-special"></td>
        <td><input type="checkbox" class="pt-check"></td>
    `;
    
    // Add event listeners
    const gameSelect = row.querySelector('.pt-game-select');
    gameSelect.addEventListener('change', (e) => {
        const game = window.app?.pullTabLibrary.find(g => g.name === e.target.value);
        if (game) {
            row.querySelector('.pt-price').value = game.price || 1;
            row.querySelector('.pt-ideal').value = game.profit || 0;
        }
    });
    
    row.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', () => calculatePullTabRow(row));
    });
}

function addSpecialEventRow() {
    const tbody = document.getElementById('pulltab-body');
    if (!tbody) return;
    
    const row = tbody.insertRow();
    row.className = 'special-event';
    row.innerHTML = `
        <td><input type="text" value="Special Event" style="font-weight: bold;"></td>
        <td><input type="text" placeholder="Serial #"></td>
        <td><input type="number" value="1.00" step="0.01" class="pt-price"></td>
        <td><input type="number" class="pt-tickets" min="0"></td>
        <td class="pt-sales">$0.00</td>
        <td><input type="number" class="pt-ideal" step="0.01"></td>
        <td><input type="number" class="pt-prizes" step="0.01"></td>
        <td class="pt-net">$0.00</td>
        <td><input type="checkbox" class="pt-special" checked disabled></td>
        <td><input type="checkbox" class="pt-check"></td>
    `;
    
    row.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', () => calculatePullTabRow(row));
    });
}

function calculatePullTabRow(row) {
    const price = parseFloat(row.querySelector('.pt-price')?.value) || 0;
    const tickets = parseInt(row.querySelector('.pt-tickets')?.value) || 0;
    const prizes = parseFloat(row.querySelector('.pt-prizes')?.value) || 0;
    
    const sales = price * tickets;
    const net = sales - prizes;
    
    row.querySelector('.pt-sales').textContent = `$${sales.toFixed(2)}`;
    row.querySelector('.pt-net').textContent = `$${net.toFixed(2)}`;
    
    calculatePullTabTotals();
}

function calculatePullTabTotals() {
    let regSales = 0, regIdeal = 0, regPrizes = 0, regNet = 0;
    let seSales = 0, seIdeal = 0, sePrizes = 0, seNet = 0;
    
    document.querySelectorAll('#pulltab-body tr').forEach(row => {
        const isSpecial = row.querySelector('.pt-special')?.checked;
        const sales = parseFloat(row.querySelector('.pt-sales')?.textContent.replace('$', '')) || 0;
        const ideal = parseFloat(row.querySelector('.pt-ideal')?.value) || 0;
        const prizes = parseFloat(row.querySelector('.pt-prizes')?.value) || 0;
        const net = parseFloat(row.querySelector('.pt-net')?.textContent.replace('$', '')) || 0;
        
        if (isSpecial) {
            seSales += sales;
            seIdeal += ideal;
            sePrizes += prizes;
            seNet += net;
        } else {
            regSales += sales;
            regIdeal += ideal;
            regPrizes += prizes;
            regNet += net;
        }
    });
    
    // Update totals
    document.getElementById('pt-reg-sales').textContent = `$${regSales.toFixed(2)}`;
    document.getElementById('pt-reg-ideal').textContent = `$${regIdeal.toFixed(2)}`;
    document.getElementById('pt-reg-prizes').textContent = `$${regPrizes.toFixed(2)}`;
    document.getElementById('pt-reg-net').textContent = `$${regNet.toFixed(2)}`;
    
    document.getElementById('pt-se-sales').textContent = `$${seSales.toFixed(2)}`;
    document.getElementById('pt-se-ideal').textContent = `$${seIdeal.toFixed(2)}`;
    document.getElementById('pt-se-prizes').textContent = `$${sePrizes.toFixed(2)}`;
    document.getElementById('pt-se-net').textContent = `$${seNet.toFixed(2)}`;
    
    // Store in app data
    if (window.app) {
        window.app.data.pullTabTotals = {
            regularSales: regSales,
            regularPrizes: regPrizes,
            specialSales: seSales,
            specialPrizes: sePrizes
        };
    }
}

function submitOccasion() {
    if (!validateCurrentStep()) return;
    
    if (!window.app) return;
    
    const data = window.app.data;
    
    if (window.app.isOnline) {
        // Submit directly
        fetch(CONFIG.API_URL, {
            method: 'POST',
            body: new URLSearchParams({
                action: 'save-occasion',
                data: JSON.stringify(data)
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Occasion saved successfully!');
                localStorage.removeItem(CONFIG.STORAGE_KEYS.DRAFT_DATA);
                window.location.reload();
            } else {
                alert('Error saving occasion: ' + result.error);
            }
        })
        .catch(error => {
            console.error('Submit error:', error);
            addToSyncQueue(data);
        });
    } else {
        addToSyncQueue(data);
        alert('Saved offline. Will sync when connection is restored.');
    }
}

function addToSyncQueue(data) {
    const queue = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE) || '[]');
    queue.push({
        action: 'save-occasion',
        data: data,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(CONFIG.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
}

function saveDraft() {
    if (window.app) {
        window.app.saveDraft();
        alert('Draft saved!');
    }
}

function printReport() {
    window.print();
}

function exportData() {
    if (!window.app) return;
    
    const data = window.app.data;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bingo-occasion-${data.occasion?.date || 'draft'}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
