class AdminPanel {
    constructor() {
        this.currentTab = localStorage.getItem('admin_current_tab') || 'games';
        this.initializeTabs();
        // Make function globally accessible
        window.saveCurrentTab = this.saveCurrentTab.bind(this);
    }

    saveCurrentTab(tabName) {
        this.currentTab = tabName;
        localStorage.setItem('admin_current_tab', tabName);
        this.updateTabVisibility();
        
        // Sync with backend
        fetch(CONFIG.BACKEND_URL, {
            method: 'POST',
            headers: {'Content-Type': 'text/plain;charset=utf-8'},
            body: JSON.stringify({
                action: 'updateAdminTab',
                tab: tabName,
                timestamp: new Date().toISOString()
            })
        }).catch(err => console.error('Tab sync failed:', err));
    }

    updateTabVisibility() {
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        const activeContent = document.getElementById(`${this.currentTab}-content`);
        if (activeContent) activeContent.style.display = 'block';
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});
