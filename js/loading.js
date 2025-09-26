/**
 * Loading Overlay System
 * Provides spinner and progress feedback during data operations
 * Version 11.7.0
 */

class LoadingManager {
    constructor() {
        this.overlay = null;
        this.currentTimeout = null;
        this.isShowing = false;
        this.init();
    }

    init() {
        // Create loading overlay HTML structure
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';

        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text" id="loading-text">Loading</div>
                <div class="loading-subtext" id="loading-subtext">Please wait...</div>
            </div>
        `;

        // Add to body
        document.body.appendChild(overlay);
        this.overlay = overlay;

        // Prevent scrolling when overlay is shown
        this.overlay.addEventListener('transitionstart', () => {
            if (this.overlay.classList.contains('show')) {
                document.body.style.overflow = 'hidden';
            }
        });

        this.overlay.addEventListener('transitionend', () => {
            if (!this.overlay.classList.contains('show')) {
                document.body.style.overflow = '';
            }
        });
    }

    show(options = {}) {
        const {
            text = 'Loading',
            subtext = 'Please wait...',
            timeout = null,
            dots = true
        } = options;

        // Clear any existing timeout first
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }

        // If already showing, just update text and return
        if (this.isShowing) {
            this.updateText(text, subtext);
            return;
        }

        // Update text content
        const textEl = document.getElementById('loading-text');
        const subtextEl = document.getElementById('loading-subtext');

        if (textEl) {
            textEl.textContent = text;
            textEl.className = dots ? 'loading-text loading-dots' : 'loading-text';
        }

        if (subtextEl) {
            subtextEl.textContent = subtext;
        }

        // Show overlay
        this.overlay.classList.add('show');
        this.isShowing = true;

        // Auto-hide after timeout if specified
        if (timeout) {
            this.currentTimeout = setTimeout(() => {
                if (this.isShowing) {  // Only hide if still showing
                    this.hide();
                    console.warn('Loading timeout reached:', timeout + 'ms');
                }
            }, timeout);
        }

        // Disable form inputs to prevent interference
        this.disableInputs(true);

        console.log('Loading shown:', text);
    }

    hide() {
        // Clear timeout
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }

        // Only hide if actually showing
        if (!this.isShowing) {
            return;
        }

        // Hide overlay
        this.overlay.classList.remove('show');
        this.isShowing = false;

        // Re-enable form inputs
        this.disableInputs(false);

        console.log('Loading hidden');
    }

    updateText(text, subtext = null) {
        const textEl = document.getElementById('loading-text');
        const subtextEl = document.getElementById('loading-subtext');

        if (textEl && text) {
            textEl.textContent = text;
        }

        if (subtextEl && subtext !== null) {
            subtextEl.textContent = subtext;
        }
    }

    disableInputs(disable) {
        const inputs = document.querySelectorAll('input, button, select, textarea');
        inputs.forEach(input => {
            if (disable) {
                input.disabled = true;
                input.setAttribute('data-loading-disabled', 'true');
            } else {
                // Only re-enable if it was disabled by loading
                if (input.hasAttribute('data-loading-disabled')) {
                    input.disabled = false;
                    input.removeAttribute('data-loading-disabled');
                }
            }
        });
    }

    // Convenience methods for common loading scenarios
    showSaving() {
        this.show({
            text: 'Saving',
            subtext: 'Saving your data to Google Drive...',
            timeout: 30000 // 30 second timeout
        });
    }

    showLoading() {
        this.show({
            text: 'Loading',
            subtext: 'Fetching data from Google Drive...',
            timeout: 20000 // 20 second timeout
        });
    }

    showProcessing(operation = 'Processing') {
        this.show({
            text: operation,
            subtext: 'Please do not close this window...',
            timeout: 45000 // 45 second timeout
        });
    }

    showDeleting() {
        this.show({
            text: 'Deleting',
            subtext: 'Removing occasion data...',
            timeout: 15000 // 15 second timeout
        });
    }
}

// Global loading manager instance - initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLoadingManager);
} else {
    initializeLoadingManager();
}

function initializeLoadingManager() {
    window.LoadingManager = new LoadingManager();

    // Convenience global functions
    window.showLoading = (options) => window.LoadingManager.show(options);
    window.hideLoading = () => window.LoadingManager.hide();
}
window.updateLoading = (text, subtext) => window.LoadingManager.updateText(text, subtext);

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}