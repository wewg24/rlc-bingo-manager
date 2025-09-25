/**
 * Admin Interface Initialization
 * Initializes all modules and sets up the admin interface
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing RLC Bingo Admin Interface...');

    // Initialize all modules
    const adminInterface = new AdminInterface();
    const apiService = new ApiService(adminInterface);
    const uiComponents = new UIComponents(adminInterface);
    const dashboard = new Dashboard(adminInterface);
    const utilities = new Utilities(adminInterface);
    const crudOperations = new CrudOperations(adminInterface);

    // Set up module references
    adminInterface.setApiService(apiService);
    adminInterface.setUIComponents(uiComponents);
    adminInterface.setDashboard(dashboard);
    adminInterface.setUtilities(utilities);
    adminInterface.setCrudOperations(crudOperations);

    // Initialize dashboard
    dashboard.init();

    // Make admin interface globally available
    window.adminInterface = adminInterface;

    // Set up global utility functions for backward compatibility
    window.showLoading = function(options) {
        if (typeof options === 'string') {
            utilities.showLoading(options);
        } else if (options && options.text) {
            utilities.showLoading(options.text);
        } else {
            utilities.showLoading();
        }
    };

    window.hideLoading = function() {
        utilities.hideLoading();
    };

    console.log('✅ RLC Bingo Admin Interface initialized successfully');
});

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    if (window.adminInterface && window.adminInterface.utilities) {
        window.adminInterface.utilities.showAlert('An unexpected error occurred. Please refresh the page.', 'error');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    if (window.adminInterface && window.adminInterface.utilities) {
        window.adminInterface.utilities.showAlert('A network or processing error occurred.', 'error');
    }
});