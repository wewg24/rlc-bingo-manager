const CONFIG = {
    // Replace with your actual deployment ID
    BACKEND_URL: 'AKfycbyYhF94GgZeBjhRgh6D-eS6DTTXXgexiR_sz1UbwpZEZ8fZX1z2bTY14X6F0hEsqN6ZZw',
    SHEET_ID: '1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc',
    PHOTO_FOLDER_ID: '1g0lfGUqI_dCeqv41ZxLaTyZqDAXt5Iyv',
    
    // API request configuration
    API_CONFIG: {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8' // Critical for GAS
        },
        mode: 'no-cors' // Required for GAS
    },
    
    // Retry configuration
    RETRY_CONFIG: {
        maxAttempts: 3,
        delay: 1000,
        backoff: 2
    }
};

// Universal API caller with retry logic
async function callBackendAPI(action, data) {
    const payload = {
        action: action,
        ...data,
        timestamp: new Date().toISOString()
    };
    
    let attempts = 0;
    while (attempts < CONFIG.RETRY_CONFIG.maxAttempts) {
        try {
            const response = await fetch(CONFIG.BACKEND_URL, {
                ...CONFIG.API_CONFIG,
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                return await response.json();
            }
            throw new Error(`HTTP ${response.status}`);
            
        } catch (error) {
            attempts++;
            if (attempts >= CONFIG.RETRY_CONFIG.maxAttempts) {
                // Queue for offline sync
                await queueOfflineRequest(payload);
                throw error;
            }
            // Exponential backoff
            await new Promise(resolve => 
                setTimeout(resolve, CONFIG.RETRY_CONFIG.delay * Math.pow(CONFIG.RETRY_CONFIG.backoff, attempts))
            );
        }
    }
}
