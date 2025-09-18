// Main Application Logic for RLC Bingo Manager
// Version 11.0.4 - Complete BingoApp class implementation

class BingoApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.data = {
            occasion: {},
            paperBingo: {},
            posSales: {},
            electronic: {},
            games: [],
            pullTabs: [],
            moneyCount: {
                bingo: {},
                pullTab: {}
            },
            financial: {}
        };
        this.pullTabLibrary = [];
        this.isDarkMode = localStorage.getItem(CONFIG?.STORAGE_KEYS?.THEME || 'rlc_bingo_theme') === 'dark';
        this.isOnline = navigator.onLine;
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing BingoApp...');
        
        try {
            // Load saved draft if exists
            await this.loadDraft();
            
            // Initialize UI
            this.initializeTheme();
            this.initializeEventListeners();
            this.initializeDateField();
            
            // Load pull-tab library
            await this.loadPullTabLibrary();
            
            // Setup online/offline detection
            this.setupConnectionMonitoring();
            
            // Update step display
            this.updateStepDisplay();
            
            console.log('BingoApp initialized successfully');
            
        } catch (error) {
            console.error('Error initializing BingoApp:', error);
        }
    }
    
    /**
     * Initialize dark/light theme
     */
    initializeTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            if (themeToggle) {
                themeToggle.innerHTML = '<span class="theme-icon">☀️</span>';
            }
        } else {
            document.body.classList.remove('dark-mode');
            if (themeToggle) {
                themeToggle.innerHTML = '<span class="theme-icon">🌙</span>';
            }
        }
    }
    
    /**
     * Toggle theme between dark and light
     */
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem(CONFIG?.STORAGE_KEYS?.THEME || 'rlc_bingo_theme', this.isDarkMode ? 'dark' : 'light');
        this.initializeTheme();
    }
    
    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.toggleMenu());
        }
        
        // Form inputs auto-save
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.autoSave();
            }
        });
        
        // Online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }
    
    /**
     * Initialize date field with default to next Monday
     */
    initializeDateField() {
        const dateField = document.getElementById('mondayDate');
        if (dateField && !dateField.value) {
            const nextMonday = this.getNextMonday();
            dateField.value = nextMonday.toISOString().split('T')[0];
        }
    }
    
    /**
     * Get next Monday's date
     */
    getNextMonday() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // If Sunday (0), add 1, otherwise add days to get to next Monday
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + daysUntilMonday);
        return nextMonday;
    }
    
    /**
     * Auto-save form data
     */
    autoSave() {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.saveDraft();
        }, 1000); // Save 1 second after last input
    }
    
    /**
     * Save current form data as draft
     */
    async saveDraft() {
        try {
            // Collect all form data
            this.collectFormData();
            
            // Save to offline manager if available
            if (window.offlineManager) {
                await window.offlineManager.saveDraft(this.data);
            } else {
                // Fallback to localStorage
                localStorage.setItem(CONFIG?.STORAGE_KEYS?.DRAFT || 'rlc_bingo_draft', JSON.stringify(this.data));
            }
            
            console.log('Draft saved successfully');
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    }
    
    /**
     * Load saved draft
     */
    async loadDraft() {
        try {
            let draftData = null;
            
            // Try to load from offline manager first
            if (window.offlineManager) {
                const draft = await window.offlineManager.getDraft();
                draftData = draft ? draft.data : null;
            } else {
                // Fallback to localStorage
                const stored = localStorage.getItem(CONFIG?.STORAGE_KEYS?.DRAFT || 'rlc_bingo_draft');
                draftData = stored ? JSON.parse(stored) : null;
            }
            
            if (draftData) {
                this.data = { ...this.data, ...draftData };
                this.populateForm();
                console.log('Draft loaded successfully');
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }
    
    /**
     * Collect all form data into this.data
     */
    collectFormData() {
        // Basic session info
        const occasion = {};
        ['mondayDate', 'sessionType', 'lionInCharge', 'totalPeople', 'birthdays',
         'progressiveJackpot', 'ballsNeeded', 'actualBalls', 'actualPrize', 'checkPayment'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                occasion[id] = element.type === 'checkbox' ? element.checked : element.value;
            }
        });
        
        this.data.occasion = occasion;
        
        // Add other data collection as needed
        // Paper sales, POS sales, games, etc.
    }
    
    /**
     * Populate form from this.data
     */
    populateForm() {
        // Basic session info
        if (this.data.occasion) {
            Object.keys(this.data.occasion).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = this.data.occasion[key];
                    } else {
                        element.value = this.data.occasion[key] || '';
                    }
                }
            });
        }
        
        // Populate other sections as needed
    }
    
    /**
     * Load pull-tab library from backend
     */
    async loadPullTabLibrary(forceReload = false) {
        try {
            console.log('Loading pull-tab library from backend...');
            
            // Try multiple API endpoints that the backend supports
            const endpoints = [
                CONFIG.API_URL + '?path=pulltab-library',
                CONFIG.API_URL + '?path=pulltabs',
                CONFIG.API_URL + '?action=get_pull_tab_library'
            ];
            
            let response = null;
            let data = null;
            
            // Try each endpoint until one works
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);
                    response = await fetch(endpoint);
                    
                    if (response.ok) {
                        data = await response.json();
                        console.log('API Response:', data);
                        
                        if (data.success && data.games && data.games.length > 0) {
                            console.log(`✅ Pull-tab library loaded successfully: ${data.games.length} games`);
                            this.pullTabLibrary = data.games;
                            
                            // Cache locally if offline manager available
                            if (window.offlineManager) {
                                await window.offlineManager.savePullTabLibrary(data.games);
                            }
                            
                            return; // Success - exit the function
                        }
                    }
                } catch (endpointError) {
                    console.warn(`Endpoint ${endpoint} failed:`, endpointError);
                    continue; // Try next endpoint
                }
            }
            
            // If we get here, all endpoints failed
            console.warn('All API endpoints failed, trying local cache...');
            
            // Try loading from local cache as fallback
            if (window.offlineManager) {
                try {
                    const cachedLibrary = await window.offlineManager.getPullTabLibrary();
                    if (cachedLibrary && cachedLibrary.length > 0) {
                        this.pullTabLibrary = cachedLibrary;
                        console.log(`📱 Loaded pull-tab library from cache: ${cachedLibrary.length} games`);
                        return;
                    }
                } catch (cacheError) {
                    console.error('Error loading from cache:', cacheError);
                }
            }
            
            // If everything fails, create a minimal fallback library
            console.warn('⚠️ Creating fallback pull-tab library');
            this.pullTabLibrary = this.createFallbackLibrary();
            
        } catch (error) {
            console.error('Critical error loading pull-tab library:', error);
            
            // Create minimal fallback
            this.pullTabLibrary = this.createFallbackLibrary();
        }
    }

    /**
 * Create a minimal fallback library when backend is unavailable
 */
createFallbackLibrary() {
    return [
        {
            name: 'Generic Pull-Tab $100',
            form: 'TEMP001',
            count: 150,
            price: 1,
            profit: 50,
            url: '',
            idealSales: 150,
            idealPrizes: 100,
            profitPercent: '33.3'
        },
        {
            name: 'Generic Pull-Tab $200',
            form: 'TEMP002', 
            count: 300,
            price: 1,
            profit: 100,
            url: '',
            idealSales: 300,
            idealPrizes: 200,
            profitPercent: '33.3'
        },
        {
            name: 'Generic Pull-Tab $400',
            form: 'TEMP003',
            count: 600,
            price: 1,
            profit: 200,
            url: '',
            idealSales: 600,
            idealPrizes: 400,
            profitPercent: '33.3'
        }
    ];
    
    /**
     * Setup connection monitoring
     */
    setupConnectionMonitoring() {
        this.updateConnectionStatus();
        
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateConnectionStatus();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateConnectionStatus();
        });
    }
    
    /**
     * Update connection status indicator
     */
    updateConnectionStatus() {
        const indicator = document.getElementById('status-indicator');
        const text = document.getElementById('status-text');
        
        if (this.isOnline) {
            if (indicator) {
                indicator.style.color = '#28a745';
                indicator.textContent = '●';
            }
            if (text) text.textContent = 'Online';
        } else {
            if (indicator) {
                indicator.style.color = '#dc3545';
                indicator.textContent = '●';
            }
            if (text) text.textContent = 'Offline';
        }
    }
    
    /**
     * Handle coming online
     */
    handleOnline() {
        console.log('App came online');
        this.isOnline = true;
        this.updateConnectionStatus();
        
        // Trigger sync if sync manager available
        if (window.syncManager) {
            setTimeout(() => {
                window.syncManager.syncData();
            }, 1000);
        }
    }
    
    /**
     * Handle going offline
     */
    handleOffline() {
        console.log('App went offline');
        this.isOnline = false;
        this.updateConnectionStatus();
    }
    
    /**
     * Toggle side menu
     */
    toggleMenu() {
        const menu = document.getElementById('side-menu');
        const overlay = document.getElementById('overlay');
        
        if (menu && overlay) {
            menu.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    }
    
    /**
     * Close side menu
     */
    closeMenu() {
        const menu = document.getElementById('side-menu');
        const overlay = document.getElementById('overlay');
        
        if (menu) menu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }
    
    /**
     * Update step display and progress
     */
    updateStepDisplay() {
        // Update progress bar
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const progress = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = progress + '%';
        }
        
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });
        
        // Show/hide wizard steps
        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
                step.style.display = 'block';
            } else {
                step.classList.remove('active');
                step.style.display = 'none';
            }
        });
        
        // Update navigation buttons
        const prevBtn = document.querySelector('.prev-button');
        const nextBtn = document.querySelector('.next-button');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        }
        
        if (nextBtn) {
            nextBtn.textContent = this.currentStep === this.totalSteps ? 'Submit' : 'Next Step';
        }
    }
    
    /**
     * Move to next step
     */
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
            this.saveDraft();
        } else {
            // Final step - submit
            this.submitOccasion();
        }
    }
    
    /**
     * Move to previous step
     */
    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.saveDraft();
        }
    }
    
    /**
     * Go to specific step
     */
    goToStep(step) {
        if (step >= 1 && step <= this.totalSteps) {
            this.currentStep = step;
            this.updateStepDisplay();
            this.saveDraft();
        }
    }
    
    /**
     * Submit occasion data
     */
    async submitOccasion() {
        try {
            this.collectFormData();
            
            if (this.isOnline) {
                // Submit directly to server
                const response = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'submit_occasion',
                        data: JSON.stringify(this.data)
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Occasion submitted successfully!');
                    this.clearDraft();
                    this.resetForm();
                } else {
                    throw new Error(result.error || 'Submission failed');
                }
            } else {
                // Add to sync queue for later
                if (window.syncManager) {
                    await window.syncManager.addToQueue('submit_occasion', this.data);
                    alert('Occasion saved offline. Will sync when connection is restored.');
                } else {
                    throw new Error('Cannot submit offline - sync manager not available');
                }
            }
        } catch (error) {
            console.error('Error submitting occasion:', error);
            alert('Error submitting occasion: ' + error.message);
        }
    }
    
    /**
     * Clear saved draft
     */
    async clearDraft() {
        try {
            if (window.offlineManager) {
                await window.offlineManager.clearDraft();
            } else {
                localStorage.removeItem(CONFIG?.STORAGE_KEYS?.DRAFT || 'rlc_bingo_draft');
            }
        } catch (error) {
            console.error('Error clearing draft:', error);
        }
    }
    
    /**
     * Reset form to initial state
     */
    resetForm() {
        this.currentStep = 1;
        this.data = {
            occasion: {},
            paperBingo: {},
            posSales: {},
            electronic: {},
            games: [],
            pullTabs: [],
            moneyCount: { bingo: {}, pullTab: {} },
            financial: {}
        };
        
        // Clear form fields
        document.querySelectorAll('input, select, textarea').forEach(element => {
            if (element.type === 'checkbox') {
                element.checked = false;
            } else {
                element.value = '';
            }
        });
        
        // Reset date field
        this.initializeDateField();
        
        // Update display
        this.updateStepDisplay();
    }
    
    /**
     * Show occasions list
     */
    showOccasions() {
        this.closeMenu();
        // Implementation for showing occasions list
        console.log('Show occasions requested');
    }
    
    /**
     * Show reports
     */
    showReports() {
        this.closeMenu();
        // Implementation for showing reports
        console.log('Show reports requested');
    }
    
    /**
     * Show pull-tab library
     */
    showPullTabLibrary() {
        this.closeMenu();
        // Implementation for showing pull-tab library
        console.log('Show pull-tab library requested');
    }
    
    /**
     * Show admin panel
     */
    showAdmin() {
        this.closeMenu();
        // Implementation for showing admin panel
        console.log('Show admin requested');
    }
    
    /**
     * Show help
     */
    showHelp() {
        this.closeMenu();
        // Implementation for showing help
        console.log('Show help requested');
    }
}

// Global functions for HTML onclick handlers
function nextStep() {
    if (window.app) {
        window.app.nextStep();
    }
}

function previousStep() {
    if (window.app) {
        window.app.previousStep();
    }
}

function goToStep(step) {
    if (window.app) {
        window.app.goToStep(step);
    }
}

function closeMenu() {
    if (window.app) {
        window.app.closeMenu();
    }
}

function showOccasions() {
    if (window.app) {
        window.app.showOccasions();
    }
}

function showReports() {
    if (window.app) {
        window.app.showReports();
    }
}

function showPullTabLibrary() {
    if (window.app) {
        window.app.showPullTabLibrary();
    }
}

function showAdmin() {
    if (window.app) {
        window.app.showAdmin();
    }
}

function showHelp() {
    if (window.app) {
        window.app.showHelp();
    }
}

// Make BingoApp available globally
window.BingoApp = BingoApp;

// Initialize when DOM is ready - but only once
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}

function initializeApp() {
    if (!window.app) {
        console.log('Initializing BingoApp...');
        window.app = new BingoApp();
    } else {
        console.log('BingoApp already initialized');
    }
}
