class OccasionForm {
    constructor() {
        this.formData = {};
        this.photos = [];
        this.initializeForm();
    }
    
    initializeForm() {
        document.getElementById('occasion-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
        
        // Initialize photo capture
        document.getElementById('photo-button').addEventListener('click', () => {
            this.capturePhoto();
        });
    }
    
    async submitForm() {
        // Collect form data
        const formElement = document.getElementById('occasion-form');
        const formData = new FormData(formElement);
        
        const data = {
            action: 'saveOccasion',
            occasion: formData.get('occasion'),
            date: formData.get('date'),
            session: formData.get('session'),
            games: this.collectGamesData(),
            pullTabs: this.collectPullTabsData(),
            moneyCount: this.collectMoneyCountData(),
            photos: this.photos,
            timestamp: new Date().toISOString()
        };
        
        try {
            // Show loading indicator
            this.showLoading(true);
            
            // Submit to backend
            const response = await fetch(CONFIG.BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess('Occasion saved successfully!');
                this.resetForm();
            } else {
                throw new Error(result.error || 'Save failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            
            // Queue for offline sync
            await this.queueOfflineSubmission(data);
            this.showError('Saved offline. Will sync when connection restored.');
            
        } finally {
            this.showLoading(false);
        }
    }
    
    collectGamesData() {
        const games = [];
        document.querySelectorAll('.game-entry').forEach(entry => {
            games.push({
                name: entry.querySelector('.game-name').value,
                revenue: parseFloat(entry.querySelector('.game-revenue').value) || 0,
                prizes: parseFloat(entry.querySelector('.game-prizes').value) || 0
            });
        });
        return games;
    }
    
    collectPullTabsData() {
        const pullTabs = [];
        document.querySelectorAll('.pulltab-entry').forEach(entry => {
            const gameSelect = entry.querySelector('.pulltab-game');
            const selectedOption = gameSelect.options[gameSelect.selectedIndex];
            
            pullTabs.push({
                gameId: gameSelect.value,
                gameName: selectedOption.text,
                quantity: parseInt(entry.querySelector('.pulltab-quantity').value) || 0,
                revenue: parseFloat(entry.querySelector('.pulltab-revenue').value) || 0
            });
        });
        return pullTabs;
    }
    
    collectMoneyCountData() {
        return {
            bills: {
                ones: parseInt(document.getElementById('bills-1').value) || 0,
                fives: parseInt(document.getElementById('bills-5').value) || 0,
                tens: parseInt(document.getElementById('bills-10').value) || 0,
                twenties: parseInt(document.getElementById('bills-20').value) || 0,
                fifties: parseInt(document.getElementById('bills-50').value) || 0,
                hundreds: parseInt(document.getElementById('bills-100').value) || 0
            },
            coins: parseFloat(document.getElementById('coins-total').value) || 0,
            checks: parseFloat(document.getElementById('checks-total').value) || 0
        };
    }
    
    async queueOfflineSubmission(data) {
        const db = await openDatabase();
        const tx = db.transaction(['offline_queue'], 'readwrite');
        const store = tx.objectStore('offline_queue');
        
        await store.add({
            type: 'occasion_form',
            data: data,
            timestamp: new Date().toISOString(),
            synced: false
        });
    }
    
    async capturePhoto() {
        const camera = new CameraManager();
        const photoBlob = await camera.captureImage();
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            this.photos.push({
                data: reader.result,
                timestamp: new Date().toISOString(),
                type: 'occasion_photo'
            });
            this.updatePhotoCount();
        };
        reader.readAsDataURL(photoBlob);
    }
    
    updatePhotoCount() {
        document.getElementById('photo-count').textContent = `${this.photos.length} photo(s) captured`;
    }
    
    showLoading(show) {
        document.getElementById('loading-indicator').style.display = show ? 'block' : 'none';
    }
    
    showSuccess(message) {
        const alert = document.getElementById('success-alert');
        alert.textContent = message;
        alert.style.display = 'block';
        setTimeout(() => alert.style.display = 'none', 3000);
    }
    
    showError(message) {
        const alert = document.getElementById('error-alert');
        alert.textContent = message;
        alert.style.display = 'block';
        setTimeout(() => alert.style.display = 'none', 5000);
    }
    
    resetForm() {
        document.getElementById('occasion-form').reset();
        this.photos = [];
        this.updatePhotoCount();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.occasionForm = new OccasionForm();
});
