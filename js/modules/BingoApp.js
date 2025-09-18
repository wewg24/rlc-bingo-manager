class BingoApp {
    constructor(config = {}) {
        this.version = config.version || '11.0.4';
        this.config = null;
        this.syncManager = null;
        this.offlineManager = null;
        this.currentStep = 1;
        this.maxSteps = 6;
        this.isOnline = navigator.onLine;
        this.db = null;
        
        // Google Apps Script integration endpoints
        this.gasDeploymentUrl = 'https://script.google.com/macros/s/AKfycbzQj-363T7fBf198d6e5uooia0fTLq1dNcdaVcjABZNz9EElL4cZhLXEz2DdfH0YzAYcA/exec';
        this.gasScriptId = '1W8URFctBaFd98FQpdzi7tI8h8OnUPi1rT-Et_SJRkKiMuVKra34pN5hU';
        
        this.sessionData = {
            sessionInfo: {},
            paperSales: [],
            gameResults: [],
            pullTabs: {},
            moneyCount: {},
            timestamp: null
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing BingoApp v' + this.version);
            await this.initializeIndexedDB();
            await this.loadModules();
            this.setupEventListeners();
            this.initializeWizard();
            this.checkOnlineStatus();
            console.log('BingoApp initialized successfully');
        } catch (error) {
            console.error('BingoApp initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    async loadModules() {
        // Load existing working modules with graceful fallbacks
        if (typeof Config !== 'undefined') {
            this.config = new Config();
            console.log('Config module loaded');
        } else {
            console.warn('Config module not found, using defaults');
            this.config = { version: '11.0.4', fallback: true };
        }

        if (typeof SyncManager !== 'undefined') {
            this.syncManager = new SyncManager(this);
            console.log('SyncManager loaded');
        } else {
            console.warn('SyncManager not found, using stub');
            this.syncManager = { sync: () => Promise.resolve() };
        }

        if (typeof OfflineManager !== 'undefined') {
            this.offlineManager = new OfflineManager(this);
            console.log('OfflineManager loaded');
        } else {
            console.warn('OfflineManager not found, using stub');
            this.offlineManager = { enableOfflineMode: () => {} };
        }
    }

    async initializeIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('RLCBingoManager', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores for each wizard step
                const stores = ['sessionInfo', 'paperSales', 'gameResults', 'pullTabs', 'moneyCount', 'syncQueue'];
                stores.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                    }
                });
            };
        });
    }

    // Wizard navigation methods
    initializeWizard() {
        this.currentStep = 1;
        this.updateWizardUI();
        this.loadSavedProgress();
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveStepData();
            if (this.currentStep < this.maxSteps) {
                this.currentStep++;
                this.updateWizardUI();
            } else {
                this.submitSession();
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.saveStepData();
            this.currentStep--;
            this.updateWizardUI();
        }
    }

    updateWizardUI() {
        // Update step indicators
        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
            step.classList.toggle('completed', index + 1 < this.currentStep);
        });

        // Show/hide step content
        document.querySelectorAll('.step-content').forEach((content, index) => {
            content.style.display = index + 1 === this.currentStep ? 'block' : 'none';
        });

        // Update step title
        const stepTitles = ['Session Info', 'Paper Sales', 'Game Results', 'Pull-Tabs', 'Money Count', 'Review'];
        const titleElement = document.getElementById('stepTitle');
        if (titleElement) {
            titleElement.textContent = stepTitles[this.currentStep - 1];
        }

        // Update navigation buttons
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 1;
            prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-block';
        }
        
        if (nextBtn) {
            nextBtn.textContent = this.currentStep === this.maxSteps ? 'Submit' : 'Next';
            nextBtn.onclick = () => this.nextStep();
        }
    }

    validateCurrentStep() {
        // Step-specific validation logic
        switch(this.currentStep) {
            case 1: // Session Info
                return this.validateSessionInfo();
            case 2: // Paper Sales
                return this.validatePaperSales();
            case 3: // Game Results
                return this.validateGameResults();
            case 4: // Pull-Tabs
                return true; // Optional step
            case 5: // Money Count
                return this.validateMoneyCount();
            case 6: // Review
                return true;
            default:
                return true;
        }
    }

    saveStepData() {
        const stepData = this.getStepData();
        const storeName = this.getStoreNameForStep(this.currentStep);
        
        if (storeName && stepData) {
            this.saveToIndexedDB(storeName, stepData);
            this.updateSessionData(this.currentStep, stepData);
        }
    }

    // Google Apps Script integration
    async callGoogleScript(functionName, parameters = []) {
        try {
            if (!this.isOnline) {
                return this.queueForOfflineSync(functionName, parameters);
            }

            const response = await fetch(this.gasDeploymentUrl, {
                method: 'POST',
                mode: 'no-cors', // Required for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    function: functionName,
                    parameters: parameters
                })
            });

            // Note: no-cors mode means we can't read the response
            console.log(`Google Script function ${functionName} called`);
            return { success: true };
            
        } catch (error) {
            console.error('Google Script call failed:', error);
            return this.queueForOfflineSync(functionName, parameters);
        }
    }

    async queueForOfflineSync(functionName, parameters) {
        const queueItem = {
            function: functionName,
            parameters: parameters,
            timestamp: Date.now(),
            synced: false
        };
        
        await this.saveToIndexedDB('syncQueue', queueItem);
        console.log('Action queued for offline sync');
        return { success: true, queued: true };
    }

    // Network status handling
    setupEventListeners() {
        // Online/offline events
        window.addEventListener('online', () => this.handleOnlineStatusChange(true));
        window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
        
        // Navigation button events
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousStep());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        
        // Form input events for auto-save
        document.addEventListener('change', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.autoSave();
            }
        });
    }

    handleOnlineStatusChange(isOnline) {
        this.isOnline = isOnline;
        this.updateOnlineStatusUI();
        
        if (isOnline) {
            console.log('Back online - syncing pending actions');
            this.syncPendingActions();
        } else {
            console.log('Gone offline - enabling offline mode');
            this.offlineManager?.enableOfflineMode();
        }
    }

    updateOnlineStatusUI() {
        const statusElement = document.getElementById('onlineStatus');
        if (statusElement) {
            statusElement.textContent = this.isOnline ? '● Online' : '○ Offline';
            statusElement.className = this.isOnline ? 'status-online' : 'status-offline';
        }
    }

    // IndexedDB operations
    async saveToIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getFromIndexedDB(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = key ? store.get(key) : store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Session submission
    async submitSession() {
        try {
            this.sessionData.timestamp = new Date().toISOString();
            
            // Show loading state
            this.showLoadingState('Submitting session data...');
            
            // Submit to Google Sheets
            const result = await this.callGoogleScript('submitBingoSession', [this.sessionData]);
            
            if (result.success) {
                this.showSuccessMessage('Session submitted successfully!');
                this.clearSessionData();
                this.resetWizard();
            } else {
                throw new Error('Submission failed');
            }
            
        } catch (error) {
            console.error('Session submission error:', error);
            this.showErrorMessage('Submission failed. Data saved locally for retry.');
        }
    }

    // Error handling
    handleInitializationError(error) {
        console.error('Critical initialization error:', error);
        
        // Show user-friendly error message
        const errorHtml = `
            <div class="init-error">
                <h2>Initialization Error</h2>
                <p>The application encountered an error during startup.</p>
                <p>Error: ${error.message}</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
        
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.innerHTML = errorHtml;
        }
    }

    // Auto-save functionality
    autoSave() {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.saveStepData();
            console.log('Auto-saved current step data');
        }, 2000);
    }

    // Utility methods
    checkOnlineStatus() {
        this.isOnline = navigator.onLine;
        this.updateOnlineStatusUI();
        return this.isOnline;
    }

    resetWizard() {
        this.currentStep = 1;
        this.sessionData = {
            sessionInfo: {},
            paperSales: [],
            gameResults: [],
            pullTabs: {},
            moneyCount: {},
            timestamp: null
        };
        this.updateWizardUI();
    }
}

// Universal export for maximum compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BingoApp;
} else if (typeof define === 'function' && define.amd) {
    define(() => BingoApp);
} else {
    window.BingoApp = BingoApp;
}
