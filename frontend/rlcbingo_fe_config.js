/**
 * RLC Bingo Configuration
 * Replace TOKEN_HERE with your actual GitHub Personal Access Token
 */

const RLC_BINGO_CONFIG = {
  // GitHub API Configuration
  github: {
    owner: 'wewg24',
    repo: 'rlc-bingo-manager',
    token: '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', // Replace with your GitHub Personal Access Token
    branch: 'main'
  },

  // API URLs (auto-generated from GitHub config)
  get apiUrl() {
    return `https://api.github.com/repos/${this.github.owner}/${this.github.repo}`;
  },

  get dataUrl() {
    return `https://${this.github.owner}.github.io/${this.github.repo}/data`;
  },

  // Application settings
  app: {
    name: 'RLC Bingo Manager',
    version: '12.0.0',
    backend: 'GitHub Actions'
  }
};

// Initialize API with token
if (typeof RLCBingo !== 'undefined') {
  RLCBingo.owner = RLC_BINGO_CONFIG.github.owner;
  RLCBingo.repo = RLC_BINGO_CONFIG.github.repo;
  RLCBingo.baseUrl = RLC_BINGO_CONFIG.apiUrl;
  RLCBingo.dataUrl = RLC_BINGO_CONFIG.dataUrl;
  RLCBingo.init(RLC_BINGO_CONFIG.github.token);
}
