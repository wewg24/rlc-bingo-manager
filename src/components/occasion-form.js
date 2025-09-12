// src/components/occasion-form.js
class OccasionForm {
  constructor(container) {
    this.container = container;
    this.data = {
      id: null,
      date: new Date().toISOString().split('T')[0],
      sessionType: '',
      lionInCharge: '',
      totalPlayers: 0,
      workersCount: 0,
      startTime: '',
      endTime: '',
      progressive: {
        jackpot: 0,
        ballsToWin: 48,
        consolation: 200,
        actualBalls: 0,
        winner: false,
        amountPaid: 0
      },
      notes: ''
    };
  }

  render() {
    return `
      <form id="occasionDetailForm" class="occasion-form">
        <div class="form-section">
          <h3>Basic Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label required">Date</label>
              <input type="date" 
                     class="form-control" 
                     name="date" 
                     value="${this.data.date}" 
                     required>
              <span class="field-help">Date of the bingo occasion</span>
            </div>
            
            <div class="form-group">
              <label class="form-label required">Session Type</label>
              <select class="form-control" name="sessionType" required>
                <option value="">Select Session...</option>
                <option value="5-1">1st/5th Monday (5-1)</option>
                <option value="6-2">2nd Monday (6-2)</option>
                <option value="7-3">3rd Monday (7-3)</option>
                <option value="8-4">4th Monday (8-4)</option>
              </select>
              <span class="field-help">Determines game configuration</span>
            </div>
            
            <div class="form-group">
              <label class="form-label required">Lion in Charge</label>
              <input type="text" 
                     class="form-control" 
                     name="lionInCharge" 
                     placeholder="Enter name"
                     required>
              <span class="field-help">Primary responsible member</span>
            </div>
            
            <div class="form-group">
              <label class="form-label required">Total Players</label>
              <input type="number" 
                     class="form-control" 
                     name="totalPlayers" 
                     min="0" 
                     value="0"
                     required>
              <span class="field-help">Total attendance count</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">Workers Count</label>
              <input type="number" 
                     class="form-control" 
                     name="workersCount" 
                     min="0" 
                     value="0">
              <span class="field-help">Number of volunteers working</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">Start Time</label>
              <input type="time" 
                     class="form-control" 
                     name="startTime">
              <span class="field-help">Session start time</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">End Time</label>
              <input type="time" 
                     class="form-control" 
                     name="endTime">
              <span class="field-help">Session end time</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Progressive Game Details</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Starting Jackpot</label>
              <input type="number" 
                     class="form-control" 
                     name="progJackpot" 
                     step="1" 
                     min="0"
                     value="${this.data.progressive.jackpot}">
              <span class="field-help">Progressive jackpot amount</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">Balls to Win</label>
              <input type="number" 
                     class="form-control" 
                     name="progBalls" 
                     min="1" 
                     max="75"
                     value="${this.data.progressive.ballsToWin}">
              <span class="field-help">Required balls for jackpot</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">Consolation Prize</label>
              <input type="number" 
                     class="form-control" 
                     name="progConsolation" 
                     step="1"
                     value="${this.data.progressive.consolation}">
              <span class="field-help">Amount if not won in required balls</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">Actual Balls Called</label>
              <input type="number" 
                     class="form-control" 
                     name="progActualBalls" 
                     min="0" 
                     max="75"
                     value="${this.data.progressive.actualBalls}">
              <span class="field-help">Actual balls when won</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">
                <input type="checkbox" 
                       name="progWinner" 
                       onchange="this.toggleWinnerAmount()">
                Progressive Won
              </label>
            </div>
            
            <div class="form-group" id="winnerAmountGroup" style="display:none;">
              <label class="form-label">Amount Paid</label>
              <input type="number" 
                     class="form-control" 
                     name="progAmountPaid" 
                     step="1"
                     min="0">
              <span class="field-help">Total paid to winner(s)</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Additional Notes</h3>
          <div class="form-group">
            <textarea class="form-control" 
                      name="notes" 
                      rows="4" 
                      placeholder="Enter any additional notes or special circumstances..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            <i class="material-icons">save</i>
            Save Occasion
          </button>
          <button type="button" class="btn btn-secondary" onclick="app.printBlankForm('occasion')">
            <i class="material-icons">print</i>
            Print Blank Form
          </button>
          <button type="button" class="btn btn-warning" onclick="app.resetForm()">
            <i class="material-icons">refresh</i>
            Reset Form
          </button>
        </div>
      </form>
    `;
  }

  toggleWinnerAmount() {
    const group = document.getElementById('winnerAmountGroup');
    const checkbox = document.querySelector('[name="progWinner"]');
    group.style.display = checkbox.checked ? 'block' : 'none';
  }

  validate() {
    const errors = [];
    
    if (!this.data.date) errors.push('Date is required');
    if (!this.data.sessionType) errors.push('Session type is required');
    if (!this.data.lionInCharge) errors.push('Lion in charge is required');
    if (this.data.totalPlayers < 0) errors.push('Total players cannot be negative');
    
    if (this.data.progressive.actualBalls > 75) {
      errors.push('Actual balls cannot exceed 75');
    }
    
    if (this.data.progressive.actualBalls > 0 && 
        this.data.progressive.actualBalls < this.data.progressive.ballsToWin) {
      this.data.progressive.winner = true;
    }
    
    return errors;
  }

  getData() {
    const form = document.getElementById('occasionDetailForm');
    const formData = new FormData(form);
    
    return {
      ...this.data,
      ...Object.fromEntries(formData),
      timestamp: new Date().toISOString(),
      id: this.data.id || 'OCC_' + Date.now()
    };
  }
}
