/**
 * RLC Bingo Frontend App - GitHub Actions Backend
 * Handles API communication with GitHub Actions workflows
 */

class RLCBingoAPI {
  constructor() {
    // GitHub repository configuration
    this.owner = 'wewg24'; // Replace with your GitHub username
    this.repo = 'rlc-bingo-manager'; // Replace with your repo name
    this.baseUrl = `https://api.github.com/repos/${this.owner}/${this.repo}`;
    this.dataUrl = `https://${this.owner}.github.io/${this.repo}/data`;

    // You'll need to set this up in GitHub secrets or use a personal access token
    this.token = null; // Will be set via frontend config
  }

  /**
   * Initialize API with GitHub token
   */
  init(token) {
    this.token = token;
  }

  /**
   * Initialize API with authentication
   */
  async initWithAuth() {
    // Try to use configured token first
    if (typeof RLC_BINGO_CONFIG !== 'undefined' && RLC_BINGO_CONFIG.github.token && RLC_BINGO_CONFIG.github.token !== 'TOKEN_HERE') {
      this.token = RLC_BINGO_CONFIG.github.token;
      console.log('Using configured token');
      return;
    }

    // Wait for auth instance to be available
    let retries = 0;
    while (typeof RLCBingoAuthInstance === 'undefined' && retries < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }

    // Fallback to auth instance if available
    if (typeof RLCBingoAuthInstance !== 'undefined') {
      this.token = await RLCBingoAuthInstance.getToken();
      if (!this.token) {
        throw new Error('GitHub token required for API access');
      }
    } else {
      throw new Error('RLCBingoAuth not loaded after waiting');
    }
  }

  /**
   * Save occasion data via Google Apps Script
   */
  async saveOccasion(occasionData) {
    try {
      console.log('Saving occasion:', occasionData);

      // Generate occasion ID if not provided
      const occasionId = occasionData.id || 'OCC_' + Date.now();
      occasionData.id = occasionId;

      // Use existing Google Apps Script endpoint
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbycm0NuPj3Y_7LZU7HaB54KB87hLHbDW8e3AQ8QwSrVXktKsiP9eusYK6z_whwuxL024A/exec';

      const response = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'saveOccasion',
          data: occasionData
        })
      });

      return {
        success: true,
        message: 'Occasion saved successfully',
        id: occasionId
      };

    } catch (error) {
      console.error('Error saving occasion:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete occasion data via Google Apps Script
   */
  async deleteOccasion(occasionId) {
    try {
      console.log('Deleting occasion:', occasionId);

      const scriptUrl = 'https://script.google.com/macros/s/AKfycbycm0NuPj3Y_7LZU7HaB54KB87hLHbDW8e3AQ8QwSrVXktKsiP9eusYK6z_whwuxL024A/exec';

      const response = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteOccasion',
          occasionId: occasionId
        })
      });

      return {
        success: true,
        message: 'Occasion deleted successfully'
      };

    } catch (error) {
      console.error('Error deleting occasion:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load all occasions from Google Apps Script
   */
  async loadOccasions() {
    try {
      console.log('Loading occasions via Google Apps Script');

      const scriptUrl = 'https://script.google.com/macros/s/AKfycbycm0NuPj3Y_7LZU7HaB54KB87hLHbDW8e3AQ8QwSrVXktKsiP9eusYK6z_whwuxL024A/exec';

      // Use JSONP to bypass CORS restrictions
      return await this.loadOccasionsJSONP(scriptUrl);

    } catch (error) {
      console.error('Error loading occasions:', error);
      return {
        success: false,
        error: error.message,
        occasions: []
      };
    }
  }

  /**
   * Load occasions using JSONP to bypass CORS
   */
  async loadOccasionsJSONP(scriptUrl) {
    return new Promise((resolve, reject) => {
      const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
      const script = document.createElement('script');

      // Set up the callback function
      window[callbackName] = function(data) {
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

      // Timeout after 10 seconds
      setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          document.body.removeChild(script);
          reject(new Error('JSONP request timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Load specific occasion data via Google Apps Script
   */
  async loadOccasion(occasionId) {
    try {
      // Load all occasions and find the specific one
      const allOccasionsResult = await this.loadOccasions();

      if (!allOccasionsResult.success) {
        throw new Error('Failed to load occasions data');
      }

      const occasion = allOccasionsResult.occasions.find(o => o.id === occasionId);

      if (!occasion) {
        throw new Error(`Occasion not found: ${occasionId}`);
      }

      return {
        success: true,
        data: occasion
      };

    } catch (error) {
      console.error('Error loading occasion:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get system status
   */
  async getStatus() {
    try {
      const response = await fetch(`${this.dataUrl}/occasions.json?t=${Date.now()}`);
      const hasData = response.ok;

      return {
        success: true,
        message: 'RLC Bingo API v12.0 - GitHub Actions Backend',
        version: '12.0.0',
        backend: 'GitHub Actions',
        storage: 'JSON files in repository',
        hasData: hasData,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: true,
        message: 'RLC Bingo API v12.0 - GitHub Actions Backend',
        version: '12.0.0',
        backend: 'GitHub Actions',
        storage: 'JSON files in repository',
        hasData: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Global API instance
const RLCBingo = new RLCBingoAPI();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RLCBingoAPI;
}
