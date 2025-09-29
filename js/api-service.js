/**
 * API Service Module
 * Handles all JSONP and API communication with Google Apps Script backend
 */
class ApiService {
    constructor(adminInterface) {
        this.adminInterface = adminInterface;
    }

    /**
     * Generic JSONP request function
     */
    jsonpRequest(url) {
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
            script.src = `${url}&callback=${callbackName}`;
            script.onerror = function() {
                delete window[callbackName];
                document.body.removeChild(script);
                reject(new Error('JSONP request failed'));
            };

            document.body.appendChild(script);

            // Timeout after 15 seconds
            setTimeout(() => {
                if (window[callbackName]) {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    reject(new Error('JSONP request timeout'));
                }
            }, 15000);
        });
    }

    /**
     * Load occasions with JSONP
     */
    loadOccasionsJSONP(scriptUrl) {
        return new Promise((resolve, reject) => {
            const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
            const script = document.createElement('script');

            // Set up the callback function
            window[callbackName] = function(data) {
                // Hide loading spinner
                if (window.hideLoading) {
                    window.hideLoading();
                }

                delete window[callbackName];
                document.body.removeChild(script);
                resolve({
                    success: data.success || true,
                    occasions: data.occasions || [],
                    count: data.count || 0,
                    lastUpdated: data.lastUpdated
                });
            };

            // Create the script tag
            script.src = `${scriptUrl}?action=loadOccasions&callback=${callbackName}&t=${Date.now()}`;
            script.onerror = function() {
                delete window[callbackName];
                document.body.removeChild(script);
                reject(new Error('JSONP request failed'));
            };

            document.body.appendChild(script);

            // Timeout after 30 seconds for initial load
            setTimeout(() => {
                if (window[callbackName]) {
                    delete window[callbackName];
                    if (script.parentNode) {
                        document.body.removeChild(script);
                    }
                    reject(new Error('Request timeout - server may be slow'));
                }
            }, 30000);
        });
    }

    /**
     * Load real data from API and process it
     */
    async loadRealData() {
        const result = await this.loadOccasionsJSONP(CONFIG.API_URL);

        console.log('API Response:', result); // Debug logging

        if (result.success && result.occasions && Array.isArray(result.occasions)) {
            // Convert API data to admin interface format with correct field mapping
            this.adminInterface.occasions = result.occasions.map(occasion => {
                console.log('Processing occasion:', occasion); // Debug logging

                // Clean and validate the occasion ID - handle both object formats
                const occasionId = occasion.id || occasion['Occasion ID'];
                if (!occasionId || typeof occasionId !== 'string') {
                    console.warn('Invalid occasion ID:', occasionId);
                    return null; // Skip invalid records
                }

                // Get session type with robust property access
                const sessionTypeValue = this.adminInterface.cleanString(
                    occasion.sessionType ||
                    occasion['Session Type'] ||
                    occasion['sessionType']
                ) || 'Unknown';

                // Convert session type: if it's already a key (like "5-1"), keep it
                // If it's a full name (like "1st/5th Monday"), convert to key
                let sessionTypeKey = sessionTypeValue;
                if (CONFIG.SESSION_TYPES && CONFIG.SESSION_TYPES[sessionTypeValue]) {
                    // It's already a key like "5-1"
                    sessionTypeKey = sessionTypeValue;
                } else {
                    // It's a full name like "1st/5th Monday", find the key
                    sessionTypeKey = Object.keys(CONFIG.SESSION_TYPES || {}).find(key =>
                        (CONFIG.SESSION_TYPES[key] || '') === sessionTypeValue
                    ) || sessionTypeValue;
                }

                // Get lion in charge with robust property access
                const lionInCharge = this.adminInterface.cleanString(
                    occasion.lionInCharge ||
                    occasion['Lion in Charge'] ||
                    occasion['lionInCharge']
                ) || 'N/A';

                // Get date with robust property access
                const dateValue = occasion.date || occasion['Date'] || occasion['date'];
                const validatedDate = this.adminInterface.validateDate(dateValue) || new Date().toISOString().split('T')[0];

                // Get status with robust property access
                const statusValue = this.adminInterface.cleanString(
                    occasion.status ||
                    occasion['Status'] ||
                    occasion['status']
                ) || 'Draft';

                return {
                    id: occasionId,
                    date: validatedDate,
                    sessionType: sessionTypeKey,
                    lionInCharge: lionInCharge,
                    totalPlayers: parseInt(
                        occasion.totalPlayers ||
                        occasion['Total Players'] ||
                        occasion['totalPlayers']
                    ) || 0,
                    // For now, use 0 for revenue/profit until we have those fields calculated
                    totalRevenue: 0,
                    netProfit: 0,
                    status: statusValue,
                    // Store additional fields for reference
                    progressive: {
                        jackpot: parseFloat(occasion['Progressive Jackpot']) || 0,
                        balls: parseInt(occasion['Progressive Balls']) || 0,
                        consolation: parseFloat(occasion['Progressive Consolation']) || 0,
                        actual: parseFloat(occasion['Progressive Actual']) || 0,
                        prize: parseFloat(occasion['Progressive Prize']) || 0
                    }
                };
            }).filter(occasion => occasion !== null); // Remove null records

            // Update dashboard with loaded data
            if (this.adminInterface.dashboard) {
                this.adminInterface.dashboard.updateDashboardStats();
            }
        } else {
            console.warn('Invalid API response:', result);
            throw new Error('No occasions data received from server');
        }
    }

    /**
     * Load pull-tab library
     */
    async loadPullTabLibrary() {
        // Show loading spinner
        if (window.showLoading) {
            window.showLoading({
                text: 'Loading Pull-Tab Library',
                subtext: 'Fetching games from Google Drive...',
                timeout: 15000
            });
        }

        try {
            // Use JSONP to avoid CORS issues with Google Apps Script
            const cacheBreaker = Date.now();
            let result;

            // Try multiple API endpoints for pull-tab library
            try {
                result = await this.jsonpRequest(`${CONFIG.API_URL}?action=getPullTabsLibrary&_cb=${cacheBreaker}`);
                console.log('Pull-tab library API response (getPullTabsLibrary):', result);
            } catch (error) {
                console.warn('getPullTabsLibrary failed, trying alternative path:', error);
                // Try alternative path parameter
                try {
                    result = await this.jsonpRequest(`${CONFIG.API_URL}?path=pulltabs&_cb=${cacheBreaker}`);
                    console.log('Pull-tab library API response (path=pulltabs):', result);
                } catch (error2) {
                    console.warn('path=pulltabs failed, trying loadOccasions:', error2);
                    // Final fallback - sometimes the pull-tab data comes with occasions
                    result = await this.jsonpRequest(`${CONFIG.API_URL}?action=loadOccasions&_cb=${cacheBreaker}`);
                    console.log('Pull-tab library API response (loadOccasions fallback):', result);
                }
            }

            // More flexible response validation - check multiple possible structures
            let games = null;
            if (result.success && result.data && result.data.games && Array.isArray(result.data.games)) {
                games = result.data.games;
            } else if (result.success && result.data && Array.isArray(result.data)) {
                games = result.data;
            } else if (result.success && Array.isArray(result.games)) {
                games = result.games;
            } else if (result.success && result.pullTabs && Array.isArray(result.pullTabs)) {
                games = result.pullTabs;
            } else if (result.success && result.pulltabs && Array.isArray(result.pulltabs)) {
                games = result.pulltabs;
            } else if (Array.isArray(result)) {
                games = result;
            } else if (result.success === false && result.message) {
                console.warn('API returned error:', result.message);
                // If the API explicitly says it failed, use a fallback
                games = this.getFallbackPullTabData();
            }

            if (games && games.length > 0) {
                console.log(`Pull-tab library loaded: ${games.length} games`);
                this.adminInterface.pullTabLibrary = games; // Store for access by other functions
                if (this.adminInterface.uiComponents) {
                    this.adminInterface.uiComponents.renderPullTabTable(games);
                } else {
                    console.warn('UI Components not available for pull-tab table rendering');
                }
            } else {
                console.warn('Invalid pull-tab library response structure:', {
                    hasSuccess: !!result.success,
                    hasData: !!result.data,
                    dataType: typeof result.data,
                    resultKeys: Object.keys(result || {}),
                    fullResult: result
                });

                // Use fallback data if API doesn't work
                console.log('Using fallback pull-tab data...');
                games = this.getFallbackPullTabData();

                if (games && games.length > 0) {
                    console.log(`Pull-tab library loaded from fallback: ${games.length} games`);
                    this.adminInterface.pullTabLibrary = games;
                    if (this.adminInterface.uiComponents) {
                        this.adminInterface.uiComponents.renderPullTabTable(games);
                    }
                } else {
                    this.showPullTabError('Invalid response format from server. No pull-tab data available.');
                }
            }
        } catch (error) {
            console.error('Error loading pull-tab library:', error);

            // Try fallback data on error
            console.log('Using fallback pull-tab data due to error...');
            const fallbackGames = this.getFallbackPullTabData();

            if (fallbackGames && fallbackGames.length > 0) {
                console.log(`Pull-tab library loaded from fallback after error: ${fallbackGames.length} games`);
                this.adminInterface.pullTabLibrary = fallbackGames;
                if (this.adminInterface.uiComponents) {
                    this.adminInterface.uiComponents.renderPullTabTable(fallbackGames);
                }
            } else {
                this.showPullTabError(error.message || 'Unable to load pull-tab library from Google Drive');
            }
        } finally {
            // Hide loading spinner
            if (window.hideLoading) {
                window.hideLoading();
            }
        }
    }

    /**
     * Load session games with new schema support
     */
    async loadSessionGames() {
        // Show loading spinner
        if (window.showLoading) {
            window.showLoading({
                text: 'Loading Session Games',
                subtext: 'Fetching session games from GitHub...',
                timeout: 15000
            });
        }

        try {
            // Load from the new session-games.json file with new schema
            const response = await fetch('./session-games.json?_cb=' + Date.now());
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const sessionGamesData = await response.json();

            console.log('Session games loaded:', sessionGamesData); // Debug logging

            this.adminInterface.sessionGames = sessionGamesData; // Store for access by other functions

            if (this.adminInterface.uiComponents) {
                this.adminInterface.uiComponents.renderSessionGamesView(sessionGamesData);
            }
        } catch (error) {
            console.error('Error loading session games:', error);
            this.showSessionGamesError(error.message || 'Unable to load session games data');
        } finally {
            // Hide loading spinner
            if (window.hideLoading) {
                window.hideLoading();
            }
        }
    }

    /**
     * Load occasions table
     */
    async loadOccasionsTable() {
        // Show loading spinner
        if (window.showLoading) {
            window.showLoading({
                text: 'Loading Occasions',
                subtext: 'Fetching occasions from Google Drive...',
                timeout: 15000
            });
        }

        try {
            const result = await this.loadOccasionsJSONP(CONFIG.API_URL);

            if (result.success && result.occasions && Array.isArray(result.occasions)) {
                if (this.adminInterface.uiComponents) {
                    this.adminInterface.uiComponents.renderOccasionsTable(result.occasions);
                }
            } else {
                console.warn('Invalid occasions response:', result);
                this.showOccasionsError('Invalid response from server. No occasions data available.');
            }
        } catch (error) {
            console.error('Error loading occasions table:', error);
            this.showOccasionsError(error.message || 'Unable to load occasions from Google Drive');
        } finally {
            // Hide loading spinner
            if (window.hideLoading) {
                window.hideLoading();
            }
        }
    }

    // Error display methods
    showPullTabError(message) {
        const libraryView = document.getElementById('library-view');
        if (libraryView) {
            libraryView.innerHTML = `
                <div class="card">
                    <div class="alert error">
                        <h3>⚠️ Error Loading Pull-Tab Library</h3>
                        <p>${message}</p>
                        <button class="btn" onclick="window.adminInterface.apiService.clearPullTabErrorAndRetry()">
                            🔄 Clear Error & Retry
                        </button>
                    </div>
                </div>
            `;
        }
    }

    showSessionGamesError(message) {
        const sessionGamesView = document.getElementById('session-games-view');
        if (sessionGamesView) {
            sessionGamesView.innerHTML = `
                <div class="card">
                    <div class="alert error">
                        <h3>⚠️ Error Loading Session Games</h3>
                        <p>${message}</p>
                        <button class="btn" onclick="window.adminInterface.apiService.clearSessionGamesErrorAndRetry()">
                            🔄 Clear Error & Retry
                        </button>
                    </div>
                </div>
            `;
        }
    }

    showOccasionsError(message) {
        const occasionsView = document.getElementById('occasions-view');
        if (occasionsView) {
            occasionsView.innerHTML = `
                <div class="card">
                    <div class="alert error">
                        <h3>⚠️ Error Loading Occasions</h3>
                        <p>${message}</p>
                        <button class="btn" onclick="window.adminInterface.apiService.loadOccasionsTable()">
                            🔄 Retry Loading
                        </button>
                    </div>
                </div>
            `;
        }
    }

    // Error recovery methods
    clearPullTabErrorAndRetry() {
        const libraryView = document.getElementById('library-view');
        if (libraryView) {
            libraryView.innerHTML = '<div class="card"><p>Loading...</p></div>';
        }
        setTimeout(() => this.loadPullTabLibrary(), 500);
    }

    // Fallback pull-tab data when API is not available
    getFallbackPullTabData() {
        return [
            { name: "Beat the Clock 599", price: 1.00, tickets: 960, profit: 361.00, profitPercent: 38, status: "Active" },
            { name: "Black Jack 175", price: 1.00, tickets: 250, profit: 75.00, profitPercent: 30, status: "Active" },
            { name: "Black Jack 200", price: 1.00, tickets: 300, profit: 100.00, profitPercent: 33, status: "Active" },
            { name: "Black Jack 280", price: 1.00, tickets: 400, profit: 120.00, profitPercent: 30, status: "Active" },
            { name: "Black Jack 400", price: 1.00, tickets: 600, profit: 200.00, profitPercent: 33, status: "Active" },
            { name: "Black Jack 599", price: 1.00, tickets: 840, profit: 241.00, profitPercent: 29, status: "Active" },
            { name: "Black Jack 700", price: 1.00, tickets: 1000, profit: 300.00, profitPercent: 30, status: "Active" },
            { name: "Bubble Gum 100", price: 1.00, tickets: 150, profit: 50.00, profitPercent: 33, status: "Active" },
            { name: "Bubble Gum 175", price: 1.00, tickets: 250, profit: 75.00, profitPercent: 30, status: "Active" },
            { name: "Bubble Gum 280", price: 1.00, tickets: 400, profit: 120.00, profitPercent: 30, status: "Active" },
            { name: "Bubble Gum 325", price: 1.00, tickets: 500, profit: 175.00, profitPercent: 35, status: "Active" },
            { name: "Bubble Gum 400", price: 1.00, tickets: 600, profit: 200.00, profitPercent: 33, status: "Active" },
            { name: "Bubble Gum 599", price: 1.00, tickets: 840, profit: 241.00, profitPercent: 29, status: "Active" },
            { name: "Bubble Gum 700", price: 1.00, tickets: 1000, profit: 300.00, profitPercent: 30, status: "Active" },
            { name: "Chase Your Dreams 200", price: 1.00, tickets: 300, profit: 100.00, profitPercent: 33, status: "Active" },
            { name: "Chocolate 100", price: 1.00, tickets: 150, profit: 50.00, profitPercent: 33, status: "Active" },
            { name: "Chocolate 175", price: 1.00, tickets: 250, profit: 75.00, profitPercent: 30, status: "Active" },
            { name: "Chocolate 280", price: 1.00, tickets: 400, profit: 120.00, profitPercent: 30, status: "Active" },
            { name: "Chocolate 325", price: 1.00, tickets: 500, profit: 175.00, profitPercent: 35, status: "Active" },
            { name: "Chocolate 400", price: 1.00, tickets: 600, profit: 200.00, profitPercent: 33, status: "Active" },
            { name: "Chocolate 599", price: 1.00, tickets: 840, profit: 241.00, profitPercent: 29, status: "Active" },
            { name: "Chocolate 700", price: 1.00, tickets: 1000, profit: 300.00, profitPercent: 30, status: "Active" },
            { name: "Claw Enforcement 175", price: 1.00, tickets: 280, profit: 105.00, profitPercent: 38, status: "Active" },
            { name: "Cotton Candy 100", price: 1.00, tickets: 150, profit: 50.00, profitPercent: 33, status: "Active" },
            { name: "Cotton Candy 175", price: 1.00, tickets: 250, profit: 75.00, profitPercent: 30, status: "Active" },
            { name: "Cotton Candy 280", price: 1.00, tickets: 400, profit: 120.00, profitPercent: 30, status: "Active" },
            { name: "Cotton Candy 325", price: 1.00, tickets: 500, profit: 175.00, profitPercent: 35, status: "Active" },
            { name: "Cotton Candy 400", price: 1.00, tickets: 600, profit: 200.00, profitPercent: 33, status: "Active" },
            { name: "Cotton Candy 599", price: 1.00, tickets: 840, profit: 241.00, profitPercent: 29, status: "Active" },
            { name: "Cotton Candy 700", price: 1.00, tickets: 1000, profit: 300.00, profitPercent: 30, status: "Active" },
            { name: "Crap Shoot 175", price: 1.00, tickets: 250, profit: 75.00, profitPercent: 30, status: "Active" }
        ];
    }

    clearSessionGamesErrorAndRetry() {
        const sessionGamesView = document.getElementById('session-games-view');
        if (sessionGamesView) {
            sessionGamesView.innerHTML = '<div class="card"><p>Loading...</p></div>';
        }
        setTimeout(() => this.loadSessionGames(), 500);
    }
}

// Make ApiService globally available
window.ApiService = ApiService;