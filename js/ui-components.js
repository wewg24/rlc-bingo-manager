/**
 * UI Components Module
 * Handles table rendering, forms, modals, and UI interactions
 */
class UIComponents {
    constructor(adminInterface) {
        this.adminInterface = adminInterface;
    }

    /**
     * Render Pull-Tab Library Table with New Schema Support
     */
    renderPullTabTable(games) {
        const libraryView = document.getElementById('library-view');
        if (!libraryView || !games || !Array.isArray(games)) return;

        const tableHtml = `
            <div class="card">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3>Pull-Tab Library (${games.length} Games)</h3>
                    <div class="d-flex gap-2">
                        <input type="text" id="pull-tab-search" placeholder="Search games..." class="form-control" style="width: 200px;">
                        <button class="btn success" onclick="window.adminInterface.uiComponents.showAddPullTabModal()">Add New Game</button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="table" id="pull-tab-library-table">
                        <thead>
                            <tr>
                                <th>Game Name</th>
                                <th>Price</th>
                                <th>Count</th>
                                <th>Ideal Profit</th>
                                <th>Profit %</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${games.map(game => this.renderPullTabRow(game)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        libraryView.innerHTML = tableHtml;

        // Initialize search functionality
        this.initializePullTabSearch();
    }

    renderPullTabRow(game) {
        const price = parseFloat(game.price) || 0;
        const count = parseInt(game.count) || 0;
        const idealProfit = parseFloat(game.idealProfit) || 0;
        const totalSales = price * count;
        const profitPercentage = totalSales > 0 ? Math.round((idealProfit / totalSales) * 100) : 0;

        return `
            <tr data-game-name="${game.name || ''}">
                <td>
                    <strong>${game.name || 'Unknown'}</strong>
                    ${game.url ? `<br><a href="${game.url}" target="_blank" class="text-small">📄 View Details</a>` : ''}
                </td>
                <td>$${price.toFixed(2)}</td>
                <td>${count.toLocaleString()}</td>
                <td>$${idealProfit.toFixed(2)}</td>
                <td>${profitPercentage}%</td>
                <td>
                    <select class="form-control status-select" data-game-name="${game.name}" onchange="window.adminInterface.uiComponents.updatePullTabStatus(this)">
                        <option value="active" ${game.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="discontinued" ${game.status === 'discontinued' ? 'selected' : ''}>Discontinued</option>
                        <option value="seasonal" ${game.status === 'seasonal' ? 'selected' : ''}>Seasonal</option>
                    </select>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm" onclick="window.adminInterface.uiComponents.viewPullTabDetails('${game.name}')">View</button>
                        <button class="btn btn-sm warning" onclick="window.adminInterface.uiComponents.editPullTab('${game.name}')">Edit</button>
                        <button class="btn btn-sm danger" onclick="window.adminInterface.uiComponents.deletePullTab('${game.name}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Render Session Games View with New Schema
     */
    renderSessionGamesView(sessionData) {
        const sessionGamesView = document.getElementById('session-games-view');
        if (!sessionGamesView || !sessionData) return;

        const metadata = sessionData.metadata || {};
        const sessionTypes = sessionData.sessionTypes || {};

        let contentHtml = `
            <div class="card">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3>Session Games Management</h3>
                    <div class="d-flex gap-2">
                        <span class="badge badge-info">${metadata.organization || 'Rolla Lions Club'}</span>
                        <span class="badge badge-secondary">Last Updated: ${metadata.lastUpdated || 'Unknown'}</span>
                    </div>
                </div>

                <div class="session-metadata mb-4">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Venue:</strong> ${metadata.venue || 'N/A'}</p>
                            <p><strong>Schedule:</strong> ${metadata.schedule || 'N/A'}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Minimum Age:</strong> ${metadata.minimumAge || 'N/A'}</p>
                            <p><strong>Event Games Start:</strong> ${metadata.eventGamesStart || 'N/A'}</p>
                        </div>
                    </div>
                    ${metadata.prizePayoutDisclaimer ? `<div class="alert alert-info"><small>${metadata.prizePayoutDisclaimer}</small></div>` : ''}
                </div>
        `;

        // Render each session type
        for (const [sessionId, sessionInfo] of Object.entries(sessionTypes)) {
            contentHtml += this.renderSessionTypeView(sessionId, sessionInfo);
        }

        contentHtml += `</div>`;

        sessionGamesView.innerHTML = contentHtml;
    }

    renderSessionTypeView(sessionId, sessionInfo) {
        // Use the flat games array from the new schema
        const games = sessionInfo.games || [];

        // Sort games by order/gameNumber
        games.sort((a, b) => (a.order || a.gameNumber || 0) - (b.order || b.gameNumber || 0));

        const totalPrizeValue = games.reduce((sum, game) => {
            const payout = typeof game.payout === 'number' ? game.payout : 0;
            return sum + payout;
        }, 0);

        return `
            <div class="session-card card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h4>${sessionInfo.sessionName || sessionId} (${sessionId})</h4>
                    <div class="session-stats">
                        <span class="badge badge-primary">${games.length} Games</span>
                        <span class="badge badge-success">$${totalPrizeValue.toLocaleString()} Total Prizes</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Game Name</th>
                                    <th>Color</th>
                                    <th>Category</th>
                                    <th>Timing</th>
                                    <th>Payout</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${games.map(game => this.renderSessionGameRow(sessionId, game)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    renderSessionGameRow(sessionId, game) {
        const gameNumber = game.gameNumber || game.order || '?';
        const gameName = game.name || 'Unknown Game';
        const gameColor = game.color || 'N/A';
        const category = game.category || 'Regular';
        const timing = game.timing || 'Unknown';
        const payout = typeof game.payout === 'number' ? `$${game.payout}` : (game.payout || 'Variable');

        // Color-coded background for game colors
        const colorStyle = gameColor !== 'N/A' ? `background-color: ${gameColor.toLowerCase()}; color: ${this.getContrastColor(gameColor)};` : '';

        return `
            <tr data-session="${sessionId}" data-game="${gameNumber}">
                <td><strong>${gameNumber}</strong></td>
                <td>${gameName}</td>
                <td><span class="color-badge" style="${colorStyle} padding: 2px 8px; border-radius: 4px; font-size: 12px;">${gameColor}</span></td>
                <td><span class="badge badge-outline-secondary">${category}</span></td>
                <td><small>${timing}</small></td>
                <td><strong>${payout}</strong></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm" onclick="window.adminInterface.uiComponents.viewSessionGameDetails('${sessionId}', ${gameNumber})">View</button>
                        <button class="btn btn-sm warning" onclick="window.adminInterface.uiComponents.editSessionGame('${sessionId}', ${gameNumber})">Edit</button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Render Occasions Table
     */
    renderOccasionsTable(occasions) {
        const occasionsView = document.getElementById('occasions-view');
        if (!occasionsView || !occasions || !Array.isArray(occasions)) return;

        const tableHtml = `
            <div class="card">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3>Occasions (${occasions.length} total)</h3>
                    <div class="d-flex gap-2">
                        <a href="./occasion.html" class="btn success" target="_blank">Create New Occasion</a>
                    </div>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Session Type</th>
                                <th>Lion in Charge</th>
                                <th>Players</th>
                                <th>Revenue</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${occasions.map(occasion => this.renderOccasionRow(occasion)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        occasionsView.innerHTML = tableHtml;
    }

    renderOccasionRow(occasion) {
        const formattedDate = new Date(occasion.date).toLocaleDateString();
        const sessionTypeName = CONFIG.SESSION_TYPES ? (CONFIG.SESSION_TYPES[occasion.sessionType] || occasion.sessionType) : occasion.sessionType;

        return `
            <tr>
                <td><strong>${formattedDate}</strong></td>
                <td>${sessionTypeName}</td>
                <td>${occasion.lionInCharge}</td>
                <td>${occasion.totalPlayers || 0}</td>
                <td>$${(occasion.totalRevenue || 0).toLocaleString()}</td>
                <td><span class="status ${occasion.status.toLowerCase()}">${occasion.status}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm" onclick="window.adminInterface.uiComponents.viewOccasion('${occasion.id}')">View</button>
                        <button class="btn btn-sm warning" onclick="window.adminInterface.uiComponents.editOccasion('${occasion.id}')">Edit</button>
                        <button class="btn btn-sm danger" onclick="window.adminInterface.uiComponents.deleteOccasion('${occasion.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Utility Methods
    initializePullTabSearch() {
        const searchInput = document.getElementById('pull-tab-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterPullTabTable(e.target.value);
            });
        }
    }

    filterPullTabTable(searchTerm) {
        const table = document.getElementById('pull-tab-library-table');
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        const lowerSearchTerm = searchTerm.toLowerCase();

        rows.forEach(row => {
            const gameName = row.querySelector('td strong')?.textContent.toLowerCase() || '';
            if (gameName.includes(lowerSearchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    getContrastColor(colorName) {
        // Simple contrast calculator for readability
        const darkColors = ['black', 'navy', 'brown', 'purple', 'olive'];
        return darkColors.includes(colorName.toLowerCase()) ? 'white' : 'black';
    }

    updatePullTabStatus(selectElement) {
        const gameName = selectElement.dataset.gameName;
        const newStatus = selectElement.value;
        console.log(`Updating ${gameName} status to ${newStatus}`);
        // This would trigger a save operation through the CRUD module
        if (this.adminInterface.crudOperations) {
            this.adminInterface.crudOperations.updatePullTabStatus(gameName, newStatus);
        }
    }

    // Modal and Detail View Methods (placeholders for now)
    showAddPullTabModal() {
        console.log('Show add pull-tab modal');
        // Implementation will be in CRUD operations module
    }

    viewPullTabDetails(gameName) {
        console.log('View pull-tab details:', gameName);
        // Implementation will be in CRUD operations module
    }

    editPullTab(gameName) {
        console.log('Edit pull-tab:', gameName);
        // Implementation will be in CRUD operations module
    }

    deletePullTab(gameName) {
        console.log('Delete pull-tab:', gameName);
        // Implementation will be in CRUD operations module
    }

    viewSessionGameDetails(sessionId, gameNumber) {
        console.log('View session game details:', sessionId, gameNumber);

        // Find the session game data
        const sessionGames = this.adminInterface.sessionGames || [];
        const game = sessionGames.find(g => g.sessionId === sessionId && g.gameNumber === gameNumber);

        if (game) {
            this.showSessionGameModal(game, 'view');
        } else {
            this.adminInterface.utilities.showAlert('Session game not found', 'error');
        }
    }

    editSessionGame(sessionId, gameNumber) {
        console.log('Edit session game:', sessionId, gameNumber);

        // Find the session game data
        const sessionGames = this.adminInterface.sessionGames || [];
        const game = sessionGames.find(g => g.sessionId === sessionId && g.gameNumber === gameNumber);

        if (game) {
            this.showSessionGameModal(game, 'edit');
        } else {
            this.adminInterface.utilities.showAlert('Session game not found', 'error');
        }
    }

    showSessionGameModal(game, mode = 'view') {
        const modalHTML = `
            <div class="modal fade" id="sessionGameModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${mode === 'edit' ? 'Edit' : 'View'} Session Game</h5>
                            <button type="button" class="btn-close" onclick="this.closeModal('sessionGameModal')"></button>
                        </div>
                        <div class="modal-body">
                            <form id="sessionGameForm">
                                <div class="form-group">
                                    <label>Session ID:</label>
                                    <input type="text" class="form-control" value="${game.sessionId}" ${mode === 'view' ? 'readonly' : ''}>
                                </div>
                                <div class="form-group">
                                    <label>Game Number:</label>
                                    <input type="number" class="form-control" value="${game.gameNumber}" ${mode === 'view' ? 'readonly' : ''}>
                                </div>
                                <div class="form-group">
                                    <label>Game Type:</label>
                                    <input type="text" class="form-control" value="${game.gameType || 'Not specified'}" ${mode === 'view' ? 'readonly' : ''}>
                                </div>
                                <div class="form-group">
                                    <label>Players:</label>
                                    <input type="number" class="form-control" value="${game.players || 0}" ${mode === 'view' ? 'readonly' : ''}>
                                </div>
                                <div class="form-group">
                                    <label>Prize Amount:</label>
                                    <input type="text" class="form-control" value="${game.prizeAmount || '$0.00'}" ${mode === 'view' ? 'readonly' : ''}>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            ${mode === 'edit' ?
                                '<button type="button" class="btn btn-primary" onclick="window.adminInterface.uiComponents.saveSessionGame()">Save Changes</button>' :
                                ''}
                            <button type="button" class="btn btn-secondary" onclick="window.adminInterface.uiComponents.closeModal('sessionGameModal')">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page and show it
        const existingModal = document.getElementById('sessionGameModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal using Bootstrap or custom modal system
        const modal = document.getElementById('sessionGameModal');
        modal.style.display = 'block';
        modal.classList.add('show');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    saveSessionGame() {
        this.adminInterface.utilities.showAlert('Session game save functionality not yet implemented', 'info');
        this.closeModal('sessionGameModal');
    }

    viewOccasion(occasionId) {
        console.log('View occasion:', occasionId);
        // Implementation will be in CRUD operations module
    }

    editOccasion(occasionId) {
        console.log('Edit occasion:', occasionId);
        // Implementation will be in CRUD operations module
    }

    deleteOccasion(occasionId) {
        console.log('Delete occasion:', occasionId);
        // Implementation will be in CRUD operations module
    }
}

// Make UIComponents globally available
window.UIComponents = UIComponents;