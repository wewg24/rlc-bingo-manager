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

    // Fallback to auth instance if available
    if (typeof RLCBingoAuthInstance !== 'undefined') {
      this.token = await RLCBingoAuthInstance.getToken();
      if (!this.token) {
        throw new Error('GitHub token required for API access');
      }
    } else {
      throw new Error('No authentication method available');
    }
  }

  /**
   * Save occasion data by triggering GitHub Actions workflow
   */
  async saveOccasion(occasionData) {
    try {
      console.log('Saving occasion via GitHub Actions:', occasionData);

      const response = await fetch(`${this.baseUrl}/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          event_type: 'save_occasion',
          client_payload: occasionData
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      // GitHub Actions is async, so we return success immediately
      // The actual file creation happens in the background
      return {
        success: true,
        message: 'Occasion save triggered successfully',
        id: occasionData.id || 'OCC_' + Date.now()
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
   * Delete occasion data
   */
  async deleteOccasion(occasionId) {
    try {
      const response = await fetch(`${this.baseUrl}/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          event_type: 'delete_occasion',
          client_payload: { id: occasionId }
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return {
        success: true,
        message: 'Occasion deletion triggered successfully'
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
   * Load all occasions from static JSON file
   */
  async loadOccasions() {
    try {
      const response = await fetch(`${this.dataUrl}/occasions.json?t=${Date.now()}`);

      if (!response.ok) {
        if (response.status === 404) {
          // No occasions file exists yet
          return {
            success: true,
            occasions: [],
            count: 0
          };
        }
        throw new Error(`Failed to load occasions: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        occasions: data.occasions || [],
        count: data.count || 0,
        lastUpdated: data.lastUpdated
      };

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
   * Load specific occasion data
   */
  async loadOccasion(occasionId) {
    try {
      const response = await fetch(`${this.dataUrl}/occasions/${occasionId}.json?t=${Date.now()}`);

      if (!response.ok) {
        throw new Error(`Occasion not found: ${occasionId}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data
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
