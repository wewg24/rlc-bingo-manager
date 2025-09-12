// src/js/auth.js
class AuthManager {
  constructor() {
    this.user = null;
    this.token = null;
    this.refreshTimer = null;
    this.init();
  }

  init() {
    // Check for existing session
    this.token = localStorage.getItem('rlc_token');
    const userStr = localStorage.getItem('rlc_user');
    
    if (this.token && userStr) {
      this.user = JSON.parse(userStr);
      this.startRefreshTimer();
      this.validateSession();
    }
  }

  async login(username, password) {
    try {
      const response = await fetch(CONFIG.API_URL + '?path=auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          this.user = data.user;
          this.token = data.token;
          
          // Store in localStorage
          localStorage.setItem('rlc_token', this.token);
          localStorage.setItem('rlc_user', JSON.stringify(this.user));
          
          // Start refresh timer
          this.startRefreshTimer();
          
          // Log successful login
          this.logActivity('LOGIN', 'User logged in');
          
          return {
            success: true,
            user: this.user
          };
        }
      }
      
      return {
        success: false,
        error: 'Invalid credentials'
      };
      
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Connection failed'
      };
    }
  }

  async logout() {
    // Log logout
    this.logActivity('LOGOUT', 'User logged out');
    
    // Clear session
    this.user = null;
    this.token = null;
    
    // Clear storage
    localStorage.removeItem('rlc_token');
    localStorage.removeItem('rlc_user');
    localStorage.removeItem('rlc_current_session');
    
    // Stop refresh timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    // Clear offline data if requested
    if (confirm('Clear offline data?')) {
      await this.clearOfflineData();
    }
    
    // Redirect to login
    window.location.href = '/';
  }

  async validateSession() {
    try {
      const response = await fetch(CONFIG.API_URL + '?path=validate', {
        headers: {
          'Authorization': 'Bearer ' + this.token
        }
      });
      
      if (!response.ok) {
        // Session invalid
        this.logout();
        return false;
      }
      
      return true;
      
    } catch (error) {
      // Offline - allow continued use
      return true;
    }
  }

  async refreshToken() {
    if (!this.token) return;
    
    try {
      const response = await fetch(CONFIG.API_URL + '?path=refresh', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + this.token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.token = data.token;
        localStorage.setItem('rlc_token', this.token);
      }
    } catch (error) {
      // Offline - continue with existing token
    }
  }

  startRefreshTimer() {
    // Refresh token every 20 minutes
    this.refreshTimer = setInterval(() => {
      this.refreshToken();
    }, 20 * 60 * 1000);
  }

  async changePassword(oldPassword, newPassword) {
    const response = await fetch(CONFIG.API_URL + '?path=change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      },
      body: JSON.stringify({
        oldPassword: oldPassword,
        newPassword: newPassword
      })
    });
    
    if (response.ok) {
      this.logActivity('PASSWORD_CHANGE', 'Password changed');
      return { success: true };
    }
    
    return { success: false, error: 'Failed to change password' };
  }

  hasPermission(permission) {
    if (!this.user) return false;
    
    // Admin has all permissions
    if (this.user.role === 'admin') return true;
    
    // Check specific permissions
    const permissions = {
      user: ['view', 'create'],
      manager: ['view', 'create', 'edit', 'delete'],
      admin: ['view', 'create', 'edit', 'delete', 'admin']
    };
    
    const userPermissions = permissions[this.user.role] || [];
    return userPermissions.includes(permission);
  }

  isAuthenticated() {
    return this.token !== null && this.user !== null;
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  async logActivity(action, details) {
    try {
      await fetch(CONFIG.API_URL + '?path=log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.token
        },
        body: JSON.stringify({
          action: action,
          details: details,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      // Log failed - continue
    }
  }

  async clearOfflineData() {
    // Clear IndexedDB
    if (window.localforage) {
      await localforage.clear();
    }
    
    // Clear cache
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
    }
  }
}

// Export for use
window.AuthManager = AuthManager;
