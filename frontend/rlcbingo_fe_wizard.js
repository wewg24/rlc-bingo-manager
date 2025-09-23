/**
 * RLC Bingo Wizard JavaScript
 * Handles the multi-step occasion creation/editing process
 */

const POS_ITEMS = [
    { id: 'dauber', name: 'Dauber', price: 2 },
    { id: 'birthday', name: 'Birthday Pack', price: 0 },
    { id: 'coverall', name: 'Coverall Extra', price: 1 },
    { id: 'double-action', name: 'Early Bird Double', price: 5 },
    { id: 'letter-x', name: 'Letter X Extra', price: 1 },
    { id: 'number7', name: 'Number 7 Extra', price: 1 }
];

let currentStep = 1;
let editingOccasionId = null;

/**
 * Initialize the wizard
 */
async function initializeWizard() {
    try {
        // Initialize API with authentication
        await RLCBingo.initWithAuth();

        // Check for edit parameter
        const urlParams = new URLSearchParams(window.location.search);
        editingOccasionId = urlParams.get('edit');

        if (editingOccasionId) {
            await loadOccasionForEdit(editingOccasionId);
        }

        // Initialize POS table
        initializePOSTable();

        // Set default date to today
        if (!editingOccasionId) {
            document.getElementById('occasion-date').value = new Date().toISOString().split('T')[0];
        }

    } catch (error) {
        console.error('Wizard initialization error:', error);
        alert('Error initializing wizard: ' + error.message);
    }
}

/**
 * Load occasion data for editing
 */
async function loadOccasionForEdit(occasionId) {
    try {
        const result = await RLCBingo.loadOccasion(occasionId);

        if (result.success) {
            const occasion = result.data;

            // Populate form fields
            document.getElementById('occasion-date').value = occasion.date || '';
            document.getElementById('session-type').value = occasion.sessionType || '';
            document.getElementById('lion-charge').value = occasion.lionInCharge || '';
            document.getElementById('total-players').value = occasion.totalPlayers || 0;

            // Load POS sales data
            loadPOSSalesData(occasion.posSales || {});

            // Update page title
            document.querySelector('.wizard-header h1').textContent = 'Edit RLC Bingo Occasion';
            document.querySelector('.wizard-header p').textContent = `Editing ${occasion.id}`;

        } else {
            alert('Error loading occasion for edit: ' + result.error);
            window.location.href = 'rlcbingo_fe_admin.html';
        }
    } catch (error) {
        console.error('Error loading occasion for edit:', error);
        alert('Error loading occasion: ' + error.message);
        window.location.href = 'rlcbingo_fe_admin.html';
    }
}

/**
 * Initialize POS sales table
 */
function initializePOSTable() {
    const tbody = document.getElementById('pos-table-body');
    tbody.innerHTML = '';

    POS_ITEMS.forEach(item => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td><input type="number" id="${item.id}-qty" min="0" value="0" onchange="updatePOSTotal()"></td>
            <td id="${item.id}-total">$0.00</td>
        `;
    });
}

/**
 * Load POS sales data into form
 */
function loadPOSSalesData(posSales) {
    POS_ITEMS.forEach(item => {
        const qtyInput = document.getElementById(`${item.id}-qty`);
        if (posSales[item.id]) {
            qtyInput.value = posSales[item.id].quantity || 0;
        }
    });
    updatePOSTotal();
}

/**
 * Update POS total calculations
 */
function updatePOSTotal() {
    let grandTotal = 0;

    POS_ITEMS.forEach(item => {
        const qtyInput = document.getElementById(`${item.id}-qty`);
        const totalCell = document.getElementById(`${item.id}-total`);

        const quantity = parseInt(qtyInput.value) || 0;
        const total = quantity * item.price;

        totalCell.textContent = `$${total.toFixed(2)}`;
        grandTotal += total;
    });

    document.getElementById('pos-total').textContent = `$${grandTotal.toFixed(2)}`;
}

/**
 * Move to next step
 */
function nextStep() {
    if (currentStep === 1) {
        // Validate step 1 fields
        const date = document.getElementById('occasion-date').value;
        const sessionType = document.getElementById('session-type').value;
        const lionCharge = document.getElementById('lion-charge').value;

        if (!date || !sessionType || !lionCharge) {
            alert('Please fill in all required fields');
            return;
        }

        // Move to step 2
        document.getElementById('step-1').classList.remove('active');
        document.getElementById('step-2').classList.add('active');
        currentStep = 2;
    }
}

/**
 * Move to previous step
 */
function prevStep() {
    if (currentStep === 2) {
        document.getElementById('step-2').classList.remove('active');
        document.getElementById('step-1').classList.add('active');
        currentStep = 1;
    }
}

/**
 * Collect POS sales data
 */
function collectPOSSales() {
    const posSales = {};
    POS_ITEMS.forEach(item => {
        const qty = parseInt(document.getElementById(`${item.id}-qty`).value) || 0;
        if (qty > 0) {
            posSales[item.id] = {
                name: item.name,
                price: item.price,
                quantity: qty,
                total: qty * item.price
            };
        }
    });
    return posSales;
}

/**
 * Save occasion data
 */
async function saveOccasion() {
    try {
        // Show loading
        document.getElementById('loading').style.display = 'block';
        document.querySelector('button[onclick="saveOccasion()"]').disabled = true;

        // Collect form data
        const formData = {
            id: editingOccasionId, // Will be null for new occasions
            date: document.getElementById('occasion-date').value,
            sessionType: document.getElementById('session-type').value,
            lionInCharge: document.getElementById('lion-charge').value,
            totalPlayers: parseInt(document.getElementById('total-players').value) || 0,
            posSales: collectPOSSales(),
            status: 'Active'
        };

        console.log('Submitting occasion data:', formData);

        // Save via API
        const result = await RLCBingo.saveOccasion(formData);

        if (result.success) {
            alert(`✅ Occasion ${editingOccasionId ? 'updated' : 'saved'} successfully!`);

            // Redirect to admin after a short delay to allow GitHub Actions to process
            setTimeout(() => {
                window.location.href = 'rlcbingo_fe_admin.html';
            }, 2000);
        } else {
            alert('❌ Save failed: ' + result.error);
        }

    } catch (error) {
        console.error('Error saving occasion:', error);
        alert('❌ Error saving occasion: ' + error.message);
    } finally {
        // Hide loading
        document.getElementById('loading').style.display = 'none';
        document.querySelector('button[onclick="saveOccasion()"]').disabled = false;
    }
}