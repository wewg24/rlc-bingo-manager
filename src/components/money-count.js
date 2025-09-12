// src/components/money-count.js
class MoneyCount {
  constructor() {
    this.denominations = [
      { value: 100, label: '$100 Bills', count: 0 },
      { value: 50, label: '$50 Bills', count: 0 },
      { value: 20, label: '$20 Bills', count: 0 },
      { value: 10, label: '$10 Bills', count: 0 },
      { value: 5, label: '$5 Bills', count: 0 },
      { value: 1, label: '$1 Bills', count: 0 },
      { value: 0.25, label: 'Quarters', count: 0 },
      { value: 0.10, label: 'Dimes', count: 0 },
      { value: 0.05, label: 'Nickels', count: 0 },
      { value: 0.01, label: 'Pennies', count: 0 }
    ];
    this.checks = [];
    this.startingBank = 500.00;
  }

  render() {
    return `
      <div class="money-count">
        <div class="count-header">
          <h3>Money Count Sheet</h3>
          <p class="count-date">Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="starting-bank">
          <label class="form-label">Starting Bank</label>
          <input type="number" 
                 class="form-control" 
                 id="startingBank"
                 value="${this.startingBank}"
                 step="0.01"
                 onchange="moneyCount.calculate()">
        </div>
        
        <div class="denominations-grid">
          <h4>Cash Count</h4>
          <div class="form-grid">
            ${this.denominations.map(denom => this.renderDenomination(denom)).join('')}
          </div>
        </div>
        
        <div class="checks-section">
          <h4>Checks</h4>
          <button class="btn btn-primary btn-sm" onclick="moneyCount.addCheck()">
            <i class="material-icons">add</i>
            Add Check
          </button>
          <div id="checksList" class="checks-list">
            ${this.checks.length === 0 ? 
              '<p class="no-checks">No checks recorded</p>' :
              this.checks.map(check => this.renderCheck(check)).join('')
            }
          </div>
          <div class="check-total">
            <label>Total Checks:</label>
            <span id="checksTotal">$0.00</span>
          </div>
        </div>
        
        <div class="totals-section">
          <h4>Summary</h4>
          <table class="summary-table">
            <tr>
              <td>Starting Bank:</td>
              <td id="summaryStarting">$${this.startingBank.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Total Cash:</td>
              <td id="totalCash">$0.00</td>
            </tr>
            <tr>
              <td>Total Checks:</td>
              <td id="totalChecks">$0.00</td>
            </tr>
            <tr class="total-row">
              <td><strong>Grand Total:</strong></td>
              <td><strong id="grandTotal">$0.00</strong></td>
            </tr>
            <tr>
              <td>Less Starting Bank:</td>
              <td id="lessBank">-$${this.startingBank.toFixed(2)}</td>
            </tr>
            <tr class="deposit-row">
              <td><strong>Deposit Amount:</strong></td>
              <td><strong id="depositAmount">$0.00</strong></td>
            </tr>
          </table>
        </div>
        
        <div class="verification-section">
          <h4>Verification</h4>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Expected Revenue</label>
              <input type="number" 
                     class="form-control" 
                     id="expectedRevenue"
                     step="0.01"
                     placeholder="Enter expected amount">
            </div>
            <div class="form-group">
              <label class="form-label">Variance</label>
              <input type="text" 
                     class="form-control" 
                     id="variance"
                     readonly
                     value="$0.00">
            </div>
          </div>
        </div>
        
        <div class="counter-info">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Counted By</label>
              <input type="text" 
                     class="form-control" 
                     id="countedBy"
                     placeholder="Name">
            </div>
            <div class="form-group">
              <label class="form-label">Verified By</label>
              <input type="text" 
                     class="form-control" 
                     id="verifiedBy"
                     placeholder="Name">
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-primary" onclick="moneyCount.save()">
            <i class="material-icons">save</i>
            Save Count
          </button>
          <button type="button" class="btn btn-secondary" onclick="moneyCount.print()">
            <i class="material-icons">print</i>
            Print Count Sheet
          </button>
          <button type="button" class="btn btn-warning" onclick="moneyCount.reset()">
            <i class="material-icons">refresh</i>
            Reset
          </button>
        </div>
      </div>
    `;
  }

  renderDenomination(denom) {
    const id = `denom_${denom.value}`;
    return `
      <div class="form-group denomination-group">
        <label class="form-label">${denom.label}</label>
        <div class="denomination-input">
          <input type="number" 
                 class="form-control count-input" 
                 id="${id}"
                 data-value="${denom.value}"
                 value="${denom.count}"
                 min="0"
                 onchange="moneyCount.calculate()">
          <span class="subtotal" id="${id}_total">$0.00</span>
        </div>
      </div>
    `;
  }

  renderCheck(check) {
    return `
      <div class="check-entry" id="check_${check.id}">
        <input type="text" 
               placeholder="Check #" 
               value="${check.number}"
               class="form-control"
               style="width: 100px;">
        <input type="text" 
               placeholder="From" 
               value="${check.from}"
               class="form-control"
               style="width: 200px;">
        <input type="number" 
               placeholder="Amount" 
               value="${check.amount}"
               step="0.01"
               class="form-control"
               style="width: 100px;"
               onchange="moneyCount.calculateChecks()">
        <button class="btn btn-danger btn-sm" onclick="moneyCount.removeCheck(${check.id})">
          <i class="material-icons">delete</i>
        </button>
      </div>
    `;
  }

  addCheck() {
    const check = {
      id: Date.now(),
      number: '',
      from: '',
      amount: 0
    };
    
    this.checks.push(check);
    
    const container = document.getElementById('checksList');
    if (this.checks.length === 1) {
      container.innerHTML = '';
    }
    
    container.insertAdjacentHTML('beforeend', this.renderCheck(check));
    this.calculateChecks();
  }

  removeCheck(checkId) {
    this.checks = this.checks.filter(c => c.id !== checkId);
    document.getElementById(`check_${checkId}`).remove();
    
    if (this.checks.length === 0) {
      document.getElementById('checksList').innerHTML = '<p class="no-checks">No checks recorded</p>';
    }
    
    this.calculateChecks();
  }

  calculate() {
    let totalCash = 0;
    
    // Calculate cash totals
    this.denominations.forEach(denom => {
      const input = document.getElementById(`denom_${denom.value}`);
      const count = parseInt(input.value) || 0;
      const subtotal = count * denom.value;
      
      document.getElementById(`denom_${denom.value}_total`).textContent = `$${subtotal.toFixed(2)}`;
      totalCash += subtotal;
    });
    
    document.getElementById('totalCash').textContent = `$${totalCash.toFixed(2)}`;
    
    this.calculateTotals();
  }

  calculateChecks() {
    let totalChecks = 0;
    
    document.querySelectorAll('.check-entry').forEach(entry => {
      const amountInput = entry.querySelector('input[type="number"]');
      const amount = parseFloat(amountInput.value) || 0;
      totalChecks += amount;
    });
    
    document.getElementById('checksTotal').textContent = `$${totalChecks.toFixed(2)}`;
    document.getElementById('totalChecks').textContent = `$${totalChecks.toFixed(2)}`;
    
    this.calculateTotals();
  }

  calculateTotals() {
    const startingBank = parseFloat(document.getElementById('startingBank').value) || 0;
    const totalCash = parseFloat(document.getElementById('totalCash').textContent.replace('$', '')) || 0;
    const totalChecks = parseFloat(document.getElementById('totalChecks').textContent.replace('$', '')) || 0;
    
    const grandTotal = totalCash + totalChecks;
    const depositAmount = grandTotal - startingBank;
    
    document.getElementById('summaryStarting').textContent = `$${startingBank.toFixed(2)}`;
    document.getElementById('grandTotal').textContent = `$${grandTotal.toFixed(2)}`;
    document.getElementById('lessBank').textContent = `-$${startingBank.toFixed(2)}`;
    document.getElementById('depositAmount').textContent = `$${depositAmount.toFixed(2)}`;
    
    // Calculate variance if expected revenue is entered
    const expectedRevenue = parseFloat(document.getElementById('expectedRevenue').value) || 0;
    if (expectedRevenue > 0) {
      const variance = depositAmount - expectedRevenue;
      document.getElementById('variance').value = `$${variance.toFixed(2)}`;
      
      // Color code variance
      const varianceInput = document.getElementById('variance');
      if (Math.abs(variance) < 1) {
        varianceInput.style.color = 'green';
      } else if (Math.abs(variance) < 10) {
        varianceInput.style.color = 'orange';
      } else {
        varianceInput.style.color = 'red';
      }
    }
  }

  reset() {
    if (confirm('Are you sure you want to reset all counts?')) {
      document.querySelectorAll('.count-input').forEach(input => {
        input.value = 0;
      });
      
      this.checks = [];
      document.getElementById('checksList').innerHTML = '<p class="no-checks">No checks recorded</p>';
      
      document.getElementById('expectedRevenue').value = '';
      document.getElementById('countedBy').value = '';
      document.getElementById('verifiedBy').value = '';
      
      this.calculate();
    }
  }

  save() {
    const data = {
      startingBank: parseFloat(document.getElementById('startingBank').value),
      denominations: [],
      checks: [],
      totals: {},
      verification: {}
    };
    
    // Collect denomination data
    this.denominations.forEach(denom => {
      const count = parseInt(document.getElementById(`denom_${denom.value}`).value) || 0;
      if (count > 0) {
        data.denominations.push({
          value: denom.value,
          label: denom.label,
          count: count,
          subtotal: count * denom.value
        });
      }
    });
    
    // Collect check data
    document.querySelectorAll('.check-entry').forEach(entry => {
      const number = entry.querySelector('input[placeholder="Check #"]').value;
      const from = entry.querySelector('input[placeholder="From"]').value;
      const amount = parseFloat(entry.querySelector('input[type="number"]').value) || 0;
      
      if (amount > 0) {
        data.checks.push({ number, from, amount });
      }
    });
    
    // Collect totals
    data.totals = {
      totalCash: parseFloat(document.getElementById('totalCash').textContent.replace('$', '')),
      totalChecks: parseFloat(document.getElementById('totalChecks').textContent.replace('$', '')),
      grandTotal: parseFloat(document.getElementById('grandTotal').textContent.replace('$', '')),
      depositAmount: parseFloat(document.getElementById('depositAmount').textContent.replace('$', ''))
    };
    
    // Collect verification data
    data.verification = {
      expectedRevenue: parseFloat(document.getElementById('expectedRevenue').value) || 0,
      variance: parseFloat(document.getElementById('variance').value.replace('$', '')) || 0,
      countedBy: document.getElementById('countedBy').value,
      verifiedBy: document.getElementById('verifiedBy').value,
      timestamp: new Date().toISOString()
    };
    
    const occasionId = app.currentOccasion?.id;
    if (occasionId) {
      data.occasionId = occasionId;
      app.queueForSync('moneycount', data);
      app.showToast('Money count saved successfully!');
    } else {
      app.showToast('Please save occasion first', 'error');
    }
    
    return data;
  }

  print() {
    window.print();
  }

  getData() {
    return this.save();
  }
}
