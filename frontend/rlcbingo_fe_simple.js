/**
 * RLC Bingo Manager - Simplified Single File
 * No complex authentication, direct token usage
 */

// Configuration
const GITHUB_CONFIG = {
  owner: 'wewg24',
  repo: 'rlc-bingo-manager',
  get apiUrl() { return `https://api.github.com/repos/${this.owner}/${this.repo}`; },
  get dataUrl() { return `https://${this.owner}.github.io/${this.repo}/data`; }
};

// POS Items Configuration
const POS_ITEMS = [
  { id: 'dauber', name: 'Dauber', price: 2 },
  { id: 'birthday', name: 'Birthday Pack', price: 0 },
  { id: 'coverall', name: 'Coverall Extra', price: 1 },
  { id: 'double-action', name: 'Early Bird Double', price: 5 },
  { id: 'letter-x', name: 'Letter X Extra', price: 1 },
  { id: 'number7', name: 'Number 7 Extra', price: 1 }
];

// Global variables
let currentStep = 1;
let editingOccasionId = null;
let isSubmitting = false; // Prevent multiple simultaneous submissions

// ==========================================
// API FUNCTIONS
// ==========================================

async function saveOccasion(occasionData) {
  try {
    console.log('Saving occasion:', occasionData);

    // Generate occasion ID if not provided
    const occasionId = occasionData.id || 'OCC_' + Date.now();
    occasionData.id = occasionId;

    // Use existing Google Apps Script endpoint
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbycm0NuPj3Y_7LZU7HaB54KB87hLHbDW8e3AQ8QwSrVXktKsiP9eusYK6z_whwuxL024A/exec';

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'saveOccasion',
          data: occasionData
        })
      });

      return {
        success: true,
        message: 'Occasion saved successfully',
        id: occasionId
      };

    } catch (error) {
      console.error('Error saving occasion:', error);
      return {
        success: false,
        error: 'Failed to save occasion data'
      };
    }

  } catch (error) {
    console.error('Error saving occasion:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function loadOccasions() {
  try {
    console.log('Loading occasions via Google Apps Script');

    const scriptUrl = 'https://script.google.com/macros/s/AKfycbycm0NuPj3Y_7LZU7HaB54KB87hLHbDW8e3AQ8QwSrVXktKsiP9eusYK6z_whwuxL024A/exec';

    const response = await fetch(scriptUrl + '?action=loadOccasions&t=' + Date.now(), {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to load occasions: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success || true,
      occasions: data.occasions || [],
      count: data.count || 0,
      lastUpdated: data.lastUpdated
    };

  } catch (error) {
    console.error('Error loading occasions:', error);
    return {
      success: false,
      error: error.message,
      occasions: []
    };
  }
}

async function loadOccasion(occasionId) {
  try {
    // Load all occasions and find the specific one
    const allOccasionsResult = await loadOccasions();

    if (!allOccasionsResult.success) {
      throw new Error('Failed to load occasions data');
    }

    const occasion = allOccasionsResult.occasions.find(o => o.id === occasionId);

    if (!occasion) {
      throw new Error(`Occasion not found: ${occasionId}`);
    }

    return { success: true, data: occasion };

  } catch (error) {
    console.error('Error loading occasion:', error);
    return { success: false, error: error.message };
  }
}

async function deleteOccasion(occasionId) {
  try {
    console.log('Deleting occasion:', occasionId);

    const scriptUrl = 'https://script.google.com/macros/s/AKfycbycm0NuPj3Y_7LZU7HaB54KB87hLHbDW8e3AQ8QwSrVXktKsiP9eusYK6z_whwuxL024A/exec';

    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'deleteOccasion',
        occasionId: occasionId
      })
    });

    return {
      success: true,
      message: 'Occasion deleted successfully'
    };

  } catch (error) {
    console.error('Error deleting occasion:', error);
    return { success: false, error: error.message };
  }
}

async function getSystemStatus() {
  try {
    const response = await fetch(`${GITHUB_CONFIG.dataUrl}/occasions.json?t=${Date.now()}`);
    const hasData = response.ok;

    return {
      success: true,
      message: 'RLC Bingo API v12.0 - GitHub Actions Backend',
      version: '12.0.0',
      backend: 'GitHub Actions',
      storage: 'JSON files in repository',
      hasData: hasData,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: true,
      message: 'RLC Bingo API v12.0 - GitHub Actions Backend',
      version: '12.0.0',
      backend: 'GitHub Actions',
      storage: 'JSON files in repository',
      hasData: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// ==========================================
// WIZARD FUNCTIONS
// ==========================================

async function initializeWizard() {
  try {
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

    console.log('Wizard initialized successfully');

  } catch (error) {
    console.error('Wizard initialization error:', error);
    throw error;
  }
}

async function loadOccasionForEdit(occasionId) {
  try {
    const result = await loadOccasion(occasionId);

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

function initializePOSTable() {
  const tbody = document.getElementById('pos-table-body');
  if (!tbody) return;

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

function loadPOSSalesData(posSales) {
  POS_ITEMS.forEach(item => {
    const qtyInput = document.getElementById(`${item.id}-qty`);
    if (qtyInput && posSales[item.id]) {
      qtyInput.value = posSales[item.id].quantity || 0;
    }
  });
  updatePOSTotal();
}

function updatePOSTotal() {
  let grandTotal = 0;

  POS_ITEMS.forEach(item => {
    const qtyInput = document.getElementById(`${item.id}-qty`);
    const totalCell = document.getElementById(`${item.id}-total`);

    if (qtyInput && totalCell) {
      const quantity = parseInt(qtyInput.value) || 0;
      const total = quantity * item.price;

      totalCell.textContent = `$${total.toFixed(2)}`;
      grandTotal += total;
    }
  });

  const posTotal = document.getElementById('pos-total');
  if (posTotal) {
    posTotal.textContent = `$${grandTotal.toFixed(2)}`;
  }
}

function nextStep() {
  if (currentStep === 1) {
    const date = document.getElementById('occasion-date').value;
    const sessionType = document.getElementById('session-type').value;
    const lionCharge = document.getElementById('lion-charge').value;

    if (!date || !sessionType || !lionCharge) {
      alert('Please fill in all required fields');
      return;
    }

    document.getElementById('step-1').classList.remove('active');
    document.getElementById('step-2').classList.add('active');
    currentStep = 2;
  }
}

function prevStep() {
  if (currentStep === 2) {
    document.getElementById('step-2').classList.remove('active');
    document.getElementById('step-1').classList.add('active');
    currentStep = 1;
  }
}

function collectPOSSales() {
  const posSales = {};
  POS_ITEMS.forEach(item => {
    const qtyInput = document.getElementById(`${item.id}-qty`);
    if (qtyInput) {
      const qty = parseInt(qtyInput.value) || 0;
      if (qty > 0) {
        posSales[item.id] = {
          name: item.name,
          price: item.price,
          quantity: qty,
          total: qty * item.price
        };
      }
    }
  });
  return posSales;
}

async function submitOccasion() {
  // Prevent multiple simultaneous submissions
  if (isSubmitting) {
    console.log('Already submitting, ignoring duplicate call');
    return;
  }

  isSubmitting = true;
  console.log('Starting submission process...');

  try {
    // Show loading
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) loadingDiv.style.display = 'block';

    const saveBtn = document.querySelector('button[onclick="submitOccasion()"]') ||
                   document.querySelector('button[onclick="saveOccasion()"]');
    if (saveBtn) saveBtn.disabled = true;

    // Collect form data
    const formData = {
      id: editingOccasionId,
      date: document.getElementById('occasion-date').value,
      sessionType: document.getElementById('session-type').value,
      lionInCharge: document.getElementById('lion-charge').value,
      totalPlayers: parseInt(document.getElementById('total-players').value) || 0,
      posSales: collectPOSSales(),
      status: 'Active'
    };

    console.log('Submitting occasion data:', formData);

    const result = await saveOccasion(formData);

    if (result.success) {
      alert(`✅ Occasion ${editingOccasionId ? 'updated' : 'saved'} successfully!`);
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
    // Reset submission flag
    isSubmitting = false;

    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) loadingDiv.style.display = 'none';

    const saveBtn = document.querySelector('button[onclick="submitOccasion()"]') ||
                   document.querySelector('button[onclick="saveOccasion()"]');
    if (saveBtn) saveBtn.disabled = false;
  }
}

// Button click handler with extra protection
function handleSubmit(button) {
  if (isSubmitting) {
    console.log('Button clicked but already submitting');
    return false;
  }

  // Immediately disable the button
  button.disabled = true;
  button.textContent = 'Saving...';

  // Call the actual submit function
  submitOccasion().finally(() => {
    // Re-enable button when done (if still exists)
    if (button) {
      button.disabled = false;
      button.textContent = 'Save Occasion';
    }
  });

  return false; // Prevent any default behavior
}

// Make functions globally accessible
window.handleSubmit = handleSubmit;
window.submitOccasion = submitOccasion;

// ==========================================
// ADMIN FUNCTIONS
// ==========================================

async function loadOccasionsList() {
  try {
    const result = await loadOccasions();
    return result;
  } catch (error) {
    console.error('Error loading occasions list:', error);
    return { success: false, error: error.message, occasions: [] };
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

// ==========================================
// SYSTEM STATUS
// ==========================================

async function checkSystemStatus() {
  try {
    const status = await getSystemStatus();
    return status;
  } catch (error) {
    console.error('Status check error:', error);
    return { success: false, error: error.message };
  }
}

console.log('RLC Bingo Simple API loaded successfully');