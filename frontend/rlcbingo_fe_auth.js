/**
 * RLC Bingo Authentication Handler
 * Manages GitHub token for API access
 */

class RLCBingoAuth {
  constructor() {
    this.tokenKey = 'rlc_bingo_github_token';
  }

  /**
   * Get stored token or prompt user
   */
  async getToken() {
    // Try to get from localStorage first
    let token = localStorage.getItem(this.tokenKey);

    if (!token || token === 'null' || token === '') {
      token = await this.promptForToken();
    }

    return token;
  }

  /**
   * Prompt user for GitHub token
   */
  async promptForToken() {
    const modal = this.createTokenModal();
    document.body.appendChild(modal);

    return new Promise((resolve) => {
      const tokenInput = modal.querySelector('#github-token-input');
      const saveBtn = modal.querySelector('#save-token-btn');
      const cancelBtn = modal.querySelector('#cancel-token-btn');

      saveBtn.onclick = () => {
        const token = tokenInput.value.trim();
        if (token) {
          localStorage.setItem(this.tokenKey, token);
          document.body.removeChild(modal);
          resolve(token);
        } else {
          alert('Please enter a valid GitHub token');
        }
      };

      cancelBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve(null);
      };

      tokenInput.focus();
    });
  }

  /**
   * Create token input modal
   */
  createTokenModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); display: flex; align-items: center;
      justify-content: center; z-index: 10000;
    `;

    modal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%;">
        <h2>GitHub Access Required</h2>
        <p>To save and load bingo occasions, please enter your GitHub Personal Access Token:</p>

        <div style="margin: 20px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">
            GitHub Personal Access Token:
          </label>
          <input type="password" id="github-token-input"
                 placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>

        <div style="margin: 20px 0; padding: 15px; background: #f0f8ff; border-radius: 4px; font-size: 14px;">
          <strong>How to get a token:</strong><br>
          1. Go to GitHub.com → Settings → Developer settings<br>
          2. Personal access tokens → Tokens (classic)<br>
          3. Generate new token with <strong>repo</strong> and <strong>workflow</strong> permissions<br>
          4. Copy the token (starts with ghp_)
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button id="cancel-token-btn" style="padding: 10px 20px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">
            Cancel
          </button>
          <button id="save-token-btn" style="padding: 10px 20px; border: none; background: #1976d2; color: white; border-radius: 4px; cursor: pointer;">
            Save Token
          </button>
        </div>
      </div>
    `;

    return modal;
  }

  /**
   * Clear stored token (for logout/reset)
   */
  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Test if token is valid
   */
  async testToken(token) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Global auth instance
const RLCBingoAuthInstance = new RLCBingoAuth();
