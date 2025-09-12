// src/components/admin-panel.js
class AdminPanel {
  constructor() {
    this.user = JSON.parse(localStorage.getItem('rlc_user')) || null;
    this.checkAdminAccess();
  }

  checkAdminAccess() {
    if (!this.user || this.user.role !== 'admin') {
      window.location.href = '/';
      return false;
    }
    return true;
  }

  render() {
    if (!this.checkAdminAccess()) return '';

    return `
      <div class="admin-panel">
        <div class="admin-header">
          <h2>Administrator Panel</h2>
          <span class="admin-user">Logged in as: ${this.user.name}</span>
        </div>

        <div class="admin-grid">
          <!-- User Management -->
          <div class="admin-card">
            <div class="card-header">
              <i class="material-icons">people</i>
              <h3>User Management</h3>
            </div>
            <div class="card-body">
              <button class="btn btn-primary" onclick="adminPanel.showUserList()">
                View Users
              </button>
              <button class="btn btn-success" onclick="adminPanel.addUser()">
                Add User
              </button>
              <button class="btn btn-warning" onclick="adminPanel.resetPasswords()">
                Reset Passwords
              </button>
            </div>
          </div>

          <!-- System Configuration -->
          <div class="admin-card">
            <div class="card-header">
              <i class="material-icons">settings</i>
              <h3>System Configuration</h3>
            </div>
            <div class="card-body">
              <div class="config-item">
                <label>MGC License #</label>
                <input type="text" id="mgcLicense" value="12345" class="form-control">
              </div>
              <div class="config-item">
                <label>Progressive Seed</label>
                <input type="number" id="progSeed" value="1000" class="form-control">
              </div>
              <div class="config-item">
                <label>Starting Bank</label>
                <input type="number" id="startBank" value="500" class="form-control">
              </div>
              <button class="btn btn-primary" onclick="adminPanel.saveConfig()">
                Save Configuration
              </button>
            </div>
          </div>

          <!-- Pull-Tab Library -->
          <div class="admin-card">
            <div class="card-header">
              <i class="material-icons">library_books</i>
              <h3>Pull-Tab Library</h3>
            </div>
            <div class="card-body">
              <div class="stats-row">
                <span>Total Games: <strong id="totalGames">158</strong></span>
                <span>Active: <strong id="activeGames">142</strong></span>
              </div>
              <button class="btn btn-primary" onclick="adminPanel.managePullTabs()">
                Manage Library
              </button>
              <button class="btn btn-success" onclick="adminPanel.importPullTabs()">
                Import Games
              </button>
            </div>
          </div>

          <!-- Data Management -->
          <div class="admin-card">
            <div class="card-header">
              <i class="material-icons">storage</i>
              <h3>Data Management</h3>
            </div>
            <div class="card-body">
              <button class="btn btn-primary" onclick="adminPanel.backup()">
                Create Backup
              </button>
              <button class="btn btn-warning" onclick="adminPanel.restore()">
                Restore Data
              </button>
              <button class="btn btn-danger" onclick="adminPanel.purgeOld()">
                Purge Old Data
              </button>
              <div class="data-stats">
                <small>Last Backup: <span id="lastBackup">Never</span></small>
                <small>Database Size: <span id="dbSize">0 MB</span></small>
              </div>
            </div>
          </div>

          <!-- Reports & Analytics -->
          <div class="admin-card">
            <div class="card-header">
              <i class="material-icons">analytics</i>
              <h3>Reports & Analytics</h3>
            </div>
            <div class="card-body">
              <button class="btn btn-primary" onclick="adminPanel.quarterlyReport()">
                Quarterly Report
              </button>
              <button class="btn btn-success" onclick="adminPanel.annualReport()">
                Annual Report
              </button>
              <button class="btn btn-info" onclick="adminPanel.taxReport()">
                Tax Report
              </button>
              <button class="btn btn-warning" onclick="adminPanel.auditLog()">
                View Audit Log
              </button>
            </div>
          </div>

          <!-- Session Management -->
          <div class="admin-card">
            <div class="card-header">
              <i class="material-icons">schedule</i>
              <h3>Session Management</h3>
            </div>
            <div class="card-body">
              <div class="session-config">
                <h4>Game Configurations</h4>
                <select id="sessionType" class="form-control">
                  <option value="5-1">1st/5th Monday</option>
                  <option value="6-2">2nd Monday</option>
                  <option value="7-3">3rd Monday</option>
                  <option value="8-4">4th Monday</option>
                </select>
                <button class="btn btn-primary" onclick="adminPanel.editGames()">
                  Edit Games
                </button>
              </div>
              <div class="progressive-config">
                <h4>Progressive Settings</h4>
                <div class="form-group">
                  <label>Current Jackpot</label>
                  <input type="number" id="currentJackpot" class="form-control">
                </div>
                <div class="form-group">
                  <label>Increment Amount</label>
                  <input type="number" id="increment" value="100" class="form-control">
                </div>
                <button class="btn btn-success" onclick="adminPanel.updateProgressive()">
                  Update Progressive
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- User List Modal -->
        <div id="userListModal" class="modal" style="display:none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3>User Management</h3>
              <button class="close" onclick="adminPanel.closeModal('userListModal')">×</button>
            </div>
            <div class="modal-body">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Last Login</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="userTableBody">
                  <!-- Users will be loaded here -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Pull-Tab Library Modal -->
        <div id="pullTabModal" class="modal" style="display:none;">
          <div class="modal-content large">
            <div class="modal-header">
              <h3>Pull-Tab Game Library</h3>
              <button class="close" onclick="adminPanel.closeModal('pullTabModal')">×</button>
            </div>
            <div class="modal-body">
              <div class="filter-bar">
                <input type="text" placeholder="Search games..." id="gameSearch" class="form-control">
                <select id="manufacturerFilter" class="form-control">
                  <option value="">All Manufacturers</option>
                  <option value="Arrow">Arrow</option>
                  <option value="Bingo King">Bingo King</option>
                  <option value="Diamond">Diamond</option>
                </select>
                <button class="btn btn-primary" onclick="adminPanel.filterGames()">Filter</button>
              </div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Form #</th>
                    <th>Top Prize</th>
                    <th>Tickets</th>
                    <th>Price</th>
                    <th>Profit %</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="pullTabTableBody">
                  <!-- Games will be loaded here -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // User Management Methods
  async showUserList() {
    const modal = document.getElementById('userListModal');
    modal.style.display = 'block';
    
    const response = await fetch(CONFIG.API_URL + '?path=users', {
      headers: {
        'Authorization': 'Bearer ' + this.getToken()
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      this.renderUserTable(data.users);
    }
  }

  renderUserTable(users) {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.username}</td>
        <td>${user.name}</td>
        <td>
          <select onchange="adminPanel.updateRole('${user.id}', this.value)">
            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
            <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </td>
        <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
        <td>
          <span class="status ${user.active ? 'active' : 'inactive'}">
            ${user.active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm" onclick="adminPanel.resetPassword('${user.id}')">
            Reset
          </button>
          <button class="btn btn-sm ${user.active ? 'btn-danger' : 'btn-success'}" 
                  onclick="adminPanel.toggleUserStatus('${user.id}', ${!user.active})">
            ${user.active ? 'Disable' : 'Enable'}
          </button>
        </td>
      </tr>
    `).join('');
  }

  async addUser() {
    const username = prompt('Enter username:');
    if (!username) return;
    
    const name = prompt('Enter full name:');
    if (!name) return;
    
    const password = prompt('Enter temporary password:');
    if (!password) return;
    
    const data = {
      username: username,
      name: name,
      password: password,
      role: 'user',
      active: true
    };
    
    const response = await fetch(CONFIG.API_URL + '?path=user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.getToken()
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      app.showToast('User added successfully');
      this.showUserList();
    }
  }

  async updateRole(userId, newRole) {
    const response = await fetch(CONFIG.API_URL + '?path=user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.getToken()
      },
      body: JSON.stringify({
        action: 'updateRole',
        userId: userId,
        role: newRole
      })
    });
    
    if (response.ok) {
      app.showToast('Role updated');
    }
  }

  async resetPassword(userId) {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    
    const response = await fetch(CONFIG.API_URL + '?path=user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.getToken()
      },
      body: JSON.stringify({
        action: 'resetPassword',
        userId: userId,
        password: newPassword
      })
    });
    
    if (response.ok) {
      app.showToast('Password reset successfully');
    }
  }

  async toggleUserStatus(userId, active) {
    const response = await fetch(CONFIG.API_URL + '?path=user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.getToken()
      },
      body: JSON.stringify({
        action: 'toggleStatus',
        userId: userId,
        active: active
      })
    });
    
    if (response.ok) {
      app.showToast('User status updated');
      this.showUserList();
    }
  }

  // Configuration Methods
  async saveConfig() {
    const config = {
      mgcLicense: document.getElementById('mgcLicense').value,
      progressiveSeed: document.getElementById('progSeed').value,
      startingBank: document.getElementById('startBank').value
    };
    
    const response = await fetch(CONFIG.API_URL + '?path=config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.getToken()
      },
      body: JSON.stringify(config)
    });
    
    if (response.ok) {
      app.showToast('Configuration saved');
    }
  }

  // Pull-Tab Library Methods
  async managePullTabs() {
    const modal = document.getElementById('pullTabModal');
    modal.style.display = 'block';
    
    const response = await fetch(CONFIG.API_URL + '?path=pulltab-library', {
      headers: {
        'Authorization': 'Bearer ' + this.getToken()
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      this.renderPullTabTable(data.games);
    }
  }

  renderPullTabTable(games) {
    const tbody = document.getElementById('pullTabTableBody');
    tbody.innerHTML = games.map(game => `
      <tr>
        <td>${game.Name}</td>
        <td>${game['Form']}</td>
        <td>$${game['Top Prize']}</td>
        <td>${game.Tickets}</td>
        <td>$${game.Price}</td>
        <td>${game['Profit %']}%</td>
        <td>
          <input type="checkbox" 
                 ${game.Active ? 'checked' : ''}
                 onchange="adminPanel.toggleGame('${game['Form']}', this.checked)">
        </td>
        <td>
          <button class="btn btn-sm" onclick="adminPanel.editGame('${game['Form']}')">
            Edit
          </button>
        </td>
      </tr>
    `).join('');
  }

  async toggleGame(formNumber, active) {
    const response = await fetch(CONFIG.API_URL + '?path=pulltab-library', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.getToken()
      },
      body: JSON.stringify({
        action: 'toggle',
        formNumber: formNumber,
        active: active
      })
    });
    
    if (response.ok) {
      app.showToast('Game status updated');
    }
  }

  // Data Management Methods
  async backup() {
    const response = await fetch(CONFIG.API_URL + '?path=backup', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + this.getToken()
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      app.showToast('Backup created successfully');
      document.getElementById('lastBackup').textContent = new Date().toLocaleString();
      
      // Download backup file
      const blob = new Blob([JSON.stringify(data.backup)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rlc-backup-${Date.now()}.json`;
      a.click();
    }
  }

  async restore() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const backup = JSON.parse(event.target.result);
        
        if (confirm('This will replace all current data. Continue?')) {
          const response = await fetch(CONFIG.API_URL + '?path=restore', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.getToken()
            },
            body: JSON.stringify(backup)
          });
          
          if (response.ok) {
            app.showToast('Data restored successfully');
            window.location.reload();
          }
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }

  async purgeOld() {
    const days = prompt('Delete data older than (days):', '365');
    if (!days) return;
    
    if (confirm(`This will permanently delete data older than ${days} days. Continue?`)) {
      const response = await fetch(CONFIG.API_URL + '?path=purge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.getToken()
        },
        body: JSON.stringify({ days: parseInt(days) })
      });
      
      if (response.ok) {
        const data = await response.json();
        app.showToast(`Purged ${data.deleted} records`);
      }
    }
  }

  // Report Methods
  async quarterlyReport() {
    const quarter = prompt('Enter quarter (1-4):');
    const year = prompt('Enter year:', new Date().getFullYear());
    
    const response = await fetch(CONFIG.API_URL + '?path=report&type=quarterly&quarter=' + quarter + '&year=' + year, {
      headers: {
        'Authorization': 'Bearer ' + this.getToken()
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      this.downloadReport(data.report, `quarterly-${quarter}-${year}.pdf`);
    }
  }

  async annualReport() {
    const year = prompt('Enter year:', new Date().getFullYear());
    
    const response = await fetch(CONFIG.API_URL + '?path=report&type=annual&year=' + year, {
      headers: {
        'Authorization': 'Bearer ' + this.getToken()
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      this.downloadReport(data.report, `annual-${year}.pdf`);
    }
  }

  async taxReport() {
    const year = prompt('Enter tax year:', new Date().getFullYear() - 1);
    
    const response = await fetch(CONFIG.API_URL + '?path=report&type=tax&year=' + year, {
      headers: {
        'Authorization': 'Bearer ' + this.getToken()
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      this.downloadReport(data.report, `tax-${year}.pdf`);
    }
  }

  async auditLog() {
    const response = await fetch(CONFIG.API_URL + '?path=audit', {
      headers: {
        'Authorization': 'Bearer ' + this.getToken()
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      this.showAuditLog(data.logs);
    }
  }

  showAuditLog(logs) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h3>Audit Log</h3>
          <button class="close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="modal-body">
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(log => `
                <tr>
                  <td>${new Date(log.timestamp).toLocaleString()}</td>
                  <td>${log.user}</td>
                  <td>${log.action}</td>
                  <td>${log.entity}</td>
                  <td>${log.details}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Session Management Methods
  async editGames() {
    const sessionType = document.getElementById('sessionType').value;
    window.location.href = `/admin/games-editor?session=${sessionType}`;
  }

  async updateProgressive() {
    const jackpot = document.getElementById('currentJackpot').value;
    const increment = document.getElementById('increment').value;
    
    const response = await fetch(CONFIG.API_URL + '?path=progressive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.getToken()
      },
      body: JSON.stringify({
        jackpot: jackpot,
        increment: increment
      })
    });
    
    if (response.ok) {
      app.showToast('Progressive updated');
    }
  }

  // Utility Methods
  closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }

  getToken() {
    return localStorage.getItem('rlc_token') || '';
  }

  downloadReport(data, filename) {
    const blob = new Blob([data], {type: 'application/pdf'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }
}

// Initialize admin panel
window.adminPanel = new AdminPanel();
