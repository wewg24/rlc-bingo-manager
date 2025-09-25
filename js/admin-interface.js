/**
 * Core Admin Interface Class
 * Handles authentication, navigation, and main app state
 */
class AdminInterface {
    constructor() {
        this.currentUser = null;
        this.occasions = [];
        this.pullTabLibrary = [];
        this.sessionGames = [];
        this.adminEventsBound = false;
        this.init();
    }

    init() {
        this.loadSavedState();
        this.setupEventListeners();
        this.checkAuthentication();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    checkAuthentication() {
        // Always require fresh authentication - no persistent login
        this.showLoginScreen();
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const alert = document.getElementById('login-alert');

        // Simple authentication - no persistent storage
        if (username.toUpperCase() === 'RLC' && password === 'lions1935') {
            this.currentUser = { username: 'RLC', loginTime: new Date() };
            this.showAdminInterface();
        } else {
            alert.textContent = 'Invalid username or password';
            alert.classList.remove('hidden');
        }
    }

    handleLogout() {
        this.currentUser = null;
        this.showLoginScreen();
    }

    showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('admin-interface').classList.add('hidden');
    }

    showAdminInterface() {
        console.log('AdminInterface: showAdminInterface called');
        const loginScreen = document.getElementById('login-screen');
        const adminInterface = document.getElementById('admin-interface');

        console.log('AdminInterface: loginScreen element:', loginScreen);
        console.log('AdminInterface: adminInterface element:', adminInterface);

        loginScreen.classList.add('hidden');
        adminInterface.classList.remove('hidden');

        console.log('AdminInterface: calling showDashboard()');
        this.showDashboard();
        this.bindAdminEventListeners();
    }

    bindAdminEventListeners() {
        // Prevent duplicate bindings
        if (this.adminEventsBound) return;
        this.adminEventsBound = true;

        // Navigation buttons
        document.getElementById('nav-dashboard').addEventListener('click', () => this.showDashboard());
        document.getElementById('nav-occasions').addEventListener('click', () => this.showOccasions());
        document.getElementById('nav-reports').addEventListener('click', () => this.showReports());
        document.getElementById('nav-library').addEventListener('click', () => this.showLibrary());
        document.getElementById('nav-session-games').addEventListener('click', () => this.showSessionGames());
        document.getElementById('nav-offline-generator').addEventListener('click', () => this.showOfflineGenerator());
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('rlc_theme', isDark ? 'dark' : 'light');
        document.getElementById('theme-toggle').textContent = isDark ? '☀️' : '🌙';
    }

    loadSavedState() {
        const theme = localStorage.getItem('rlc_theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.getElementById('theme-toggle').textContent = '☀️';
        }
    }

    // Navigation Methods
    hideAllViews() {
        const views = ['dashboard-view', 'occasions-view', 'reports-view', 'library-view', 'session-games-view', 'offline-generator-view'];
        views.forEach(viewId => {
            const view = document.getElementById(viewId);
            if (view) view.classList.add('hidden');
        });

        // Remove active class from all nav buttons
        const navButtons = document.querySelectorAll('.nav button');
        navButtons.forEach(btn => btn.classList.remove('active'));
    }

    showDashboard() {
        console.log('AdminInterface: showDashboard called');
        this.hideAllViews();
        const dashboardView = document.getElementById('dashboard-view');
        dashboardView.classList.remove('hidden');
        dashboardView.style.display = 'block';
        console.log('AdminInterface: Removed hidden class from dashboard-view');
        console.log('AdminInterface: dashboard-view classes:', dashboardView.className);
        console.log('AdminInterface: dashboard-view style display:', dashboardView.style.display);
        document.getElementById('nav-dashboard').classList.add('active');
        this.loadDashboard();
    }

    showOccasions() {
        this.hideAllViews();
        const occasionsView = document.getElementById('occasions-view');
        occasionsView.classList.remove('hidden');
        occasionsView.style.display = 'block';
        document.getElementById('nav-occasions').classList.add('active');
        if (this.apiService) {
            this.apiService.loadOccasionsTable();
        }
    }

    showReports() {
        this.hideAllViews();
        const reportsView = document.getElementById('reports-view');
        reportsView.classList.remove('hidden');
        reportsView.style.display = 'block';
        document.getElementById('nav-reports').classList.add('active');
        // Reports functionality will be handled by reports module
    }

    showLibrary() {
        this.hideAllViews();
        const libraryView = document.getElementById('library-view');
        libraryView.classList.remove('hidden');
        libraryView.style.display = 'block';
        document.getElementById('nav-library').classList.add('active');
        if (this.apiService) {
            this.apiService.loadPullTabLibrary();
        }
    }

    showSessionGames() {
        this.hideAllViews();
        const sessionGamesView = document.getElementById('session-games-view');
        sessionGamesView.classList.remove('hidden');
        sessionGamesView.style.display = 'block';
        document.getElementById('nav-session-games').classList.add('active');
        if (this.apiService) {
            this.apiService.loadSessionGames();
        }
    }

    showOfflineGenerator() {
        this.hideAllViews();
        const offlineGeneratorView = document.getElementById('offline-generator-view');
        offlineGeneratorView.classList.remove('hidden');
        offlineGeneratorView.style.display = 'block';
        document.getElementById('nav-offline-generator').classList.add('active');
        // Offline generator will be handled by offline-generator module
    }

    // Dashboard Loading
    async loadDashboard() {
        console.log('AdminInterface: loadDashboard called');
        console.log('AdminInterface: window.showLoading available:', !!window.showLoading);

        if (window.showLoading) {
            console.log('AdminInterface: calling showLoading');
            window.showLoading({
                text: 'Loading Dashboard',
                subtext: 'Fetching occasions and data from Google Drive...',
                timeout: 20000
            });
        } else {
            console.warn('AdminInterface: window.showLoading not available');
        }

        try {
            if (this.apiService) {
                await this.apiService.loadRealData();
                this.generateQRCode();
            } else {
                throw new Error('API Service not initialized');
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showErrorState(error.message || 'Unable to load data from Google Drive');
        } finally {
            console.log('AdminInterface: calling hideLoading in finally block');
            if (window.hideLoading) {
                window.hideLoading();
                console.log('AdminInterface: hideLoading called successfully');
            } else {
                console.warn('AdminInterface: window.hideLoading not available in finally block');
            }

            // Force remove any loading text that might be stuck
            setTimeout(() => {
                const loadingOverlay = document.getElementById('loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                    console.log('AdminInterface: Force-hidden loading overlay');
                }
            }, 100);
        }
    }

    showErrorState(message) {
        const dashboardView = document.getElementById('dashboard-view');
        if (dashboardView) {
            dashboardView.innerHTML = `
                <div class="card">
                    <div class="alert error">
                        <h3>⚠️ Error Loading Dashboard</h3>
                        <p>${message}</p>
                        <button class="btn" onclick="window.adminInterface.loadDashboard()">
                            🔄 Retry Loading
                        </button>
                    </div>
                </div>
            `;
        }
    }

    generateQRCode() {
        if (this.utilities) {
            this.utilities.generateQRCode();
        }
    }

    // Utility methods for data processing
    cleanString(value) {
        if (typeof value !== 'string') return '';
        return value.trim();
    }

    validateDate(dateValue) {
        if (!dateValue) return null;
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split('T')[0];
    }

    // Set module references (will be set during initialization)
    setApiService(apiService) {
        this.apiService = apiService;
    }

    setCrudOperations(crudOperations) {
        this.crudOperations = crudOperations;
    }

    setUtilities(utilities) {
        this.utilities = utilities;
    }

    setDashboard(dashboard) {
        this.dashboard = dashboard;
    }

    setUIComponents(uiComponents) {
        this.uiComponents = uiComponents;
    }
}

// Make AdminInterface globally available
window.AdminInterface = AdminInterface;