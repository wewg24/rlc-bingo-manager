// Fixed BingoApp.js - Compatible with existing v11.0.4 modules
// Version 11.0.4 - Resolves SyncManager conflict and Config detection issues

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
        
        // Session data structure
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
        // Load CONFIG using the global window object (existing implementation pattern)
        if (typeof window.CONFIG !== 'undefined') {
            this.config = window.CONFIG;
            console.log('Config module loaded successfully');
        } else {
            console.warn('CONFIG not found on window, using defaults');
            this.config = { 
                VERSION: '11.0.4',
                API_URL: 'https://script.google.com/macros/s/AKfycbzQj-363T7fBf198d6e5uooia0fTLq1dNcdaVcjABZNz9EElL4cZhLXEz2DdfH0YzAYcA/exec',
                fallback: true 
            };
        }

        // Use existing SyncManager instance (created by sync.js)
        if (typeof window.syncManager !== 'undefined') {
            this.syncManager = window.syncManager;
            console.log('Existing SyncManager instance connected');
        } else if (typeof window.SyncManager !== 'undefined') {
            // Wait for sync.js to create the instance
            let attempts = 0;
            while (!window.syncManager && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            if (window.syncManager) {
                this.syncManager = window.syncManager;
                console.log('SyncManager instance found after waiting');
            } else {
                console.warn('SyncManager class found but no instance created, using stub');
                this.syncManager = { sync: () => Promise.resolve() };
            }
        } else {
            console.warn('SyncManager not found, using stub');
            this.syncManager = { sync: () => Promise.resolve() };
        }

        // Use existing OfflineManager instance (created by offline.js)
        if (typeof window.offlineManager !== 'undefined') {
            this.offlineManager = window.offlineManager;
            console.log('Existing OfflineManager instance connected');
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
                
                // Create object stores for wizard data
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

    validateSessionInfo() {
        const date = document.getElementById('sessionDate')?.value;
        const session = document.getElementById('sessionType')?.value;
        const lion = document.getElementById('lionInCharge')?.value;
        
        if (!date || !session || !lion) {
            this.showError('Please fill in all required session information');
            return false;
        }
        return true;
    }

    validatePaperSales() {
        // Basic validation for paper sales
        return true;
    }

    validateGameResults() {
        // Basic validation for game results
        return true;
    }

    validateMoneyCount() {
        // Basic validation for money count
        return true;
    }

    saveStepData() {
        const stepData = this.getStepData();
        const storeName = this.getStoreNameForStep(this.currentStep);
        
        if (storeName && stepData) {
            this.saveToIndexedDB(storeName, stepData);
            this.updateSessionData(this.currentStep, stepData);
        }
    }

    getStepData() {
        // Collect data from current step's form fields
        const formData = {};
        const currentStepElement = document.querySelector(`.step-content:nth-child(${this.currentStep})`);
        
        if (currentStepElement) {
            const inputs = currentStepElement.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.name) {
                    formData[input.name] = input.value;
                }
            });
        }
        
        return formData;
    }

    getStoreNameForStep(step) {
        const storeNames = ['', 'sessionInfo', 'paperSales', 'gameResults', 'pullTabs', 'moneyCount', 'review'];
        return storeNames[step];
    }

    updateSessionData(step, data) {
        switch(step) {
            case 1:
                this.sessionData.sessionInfo = data;
                break;
            case 2:
                this.sessionData.paperSales = data;
                break;
            case 3:
                this.sessionData.gameResults = data;
                break;
            case 4:
                this.sessionData.pullTabs = data;
                break;
            case 5:
                this.sessionData.moneyCount = data;
                break;
        }
    }

    // Event listeners
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
            console.log('Back online - triggering sync');
            if (this.syncManager && typeof this.syncManager.syncData === 'function') {
                this.syncManager.syncData();
            }
        } else {
            console.log('Gone offline - enabling offline mode');
            if (this.offlineManager && typeof this.offlineManager.enableOfflineMode === 'function') {
                this.offlineManager.enableOfflineMode();
            }
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
        if (!this.db) return;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put({ ...data, timestamp: Date.now() });
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getFromIndexedDB(storeName, key) {
        if (!this.db) return null;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = key ? store.get(key) : store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Data submission
    async submitSession() {
        try {
            this.sessionData.timestamp = new Date().toISOString();
            
            // Show loading state
            this.showLoadingState('Submitting session data...');
            
            // Use existing sync manager to submit data
            if (this.syncManager && typeof this.syncManager.addToQueue === 'function') {
                await this.syncManager.addToQueue('submitSession', this.sessionData);
                this.showSuccessMessage('Session submitted successfully!');
            } else if (this.isOnline) {
                // Fallback to direct API call
                await this.callAPI('submitSession', this.sessionData);
                this.showSuccessMessage('Session submitted successfully!');
            } else {
                // Queue for later sync
                await this.saveToIndexedDB('syncQueue', {
                    action: 'submitSession',
                    data: this.sessionData,
                    timestamp: Date.now()
                });
                this.showSuccessMessage('Session saved offline. Will sync when online.');
            }
            
            this.clearSessionData();
            this.resetWizard();
            
        } catch (error) {
            console.error('Session submission error:', error);
            this.showErrorMessage('Submission failed. Data saved locally for retry.');
        }
    }

    async callAPI(action, data) {
        const response = await fetch(this.config.API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                data: data
            })
        });
        
        console.log(`API call ${action} completed`);
        return { success: true };
    }

    // UI helper methods
    showLoadingState(message) {
        // Implement loading UI
        console.log('Loading:', message);
    }

    showSuccessMessage(message) {
        console.log('Success:', message);
        // You can add toast notifications here
    }

    showErrorMessage(message) {
        console.error('Error:', message);
        // You can add error notifications here
    }

    showError(message) {
        alert(message); // Replace with better error display
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

    loadSavedProgress() {
        // Load any saved progress from IndexedDB
        console.log('Loading saved progress...');
    }

    clearSessionData() {
        this.sessionData = {
            sessionInfo: {},
            paperSales: [],
            gameResults: [],
            pullTabs: {},
            moneyCount: {},
            timestamp: null
        };
    }

    resetWizard() {
        this.currentStep = 1;
        this.updateWizardUI();
    }

    // Error handling
    handleInitializationError(error) {
        console.error('Critical initialization error:', error);
        
        const errorHtml = `
            <div class="init-error" style="padding: 20px; text-align: center;">
                <h2>Initialization Error</h2>
                <p>The application encountered an error during startup.</p>
                <p><strong>Error:</strong> ${error.message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin: 10px;">Retry</button>
            </div>
        `;
        
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.innerHTML = errorHtml;
        }
    }
}

// Export BingoApp globally for maximum compatibility
window.BingoApp = BingoApp;

// Also support module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BingoApp;
} else if (typeof define === 'function' && define.amd) {
    define(() => BingoApp);
}
