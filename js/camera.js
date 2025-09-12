// Camera and photo management
class CameraManager {
  constructor() {
    this.stream = null;
  }
  
  async capturePhoto() {
    // Use file input for simplicity (works on all devices)
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use rear camera on mobile
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const compressed = await this.compressImage(file);
          resolve(compressed);
        }
      };
      
      input.click();
    });
  }
  
  async compressImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions
          const maxWidth = 1200;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.8);
        };
        
        img.src = e.target.result;
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  async uploadPhoto(blob, metadata) {
    const formData = new FormData();
    formData.append('photo', blob);
    formData.append('metadata', JSON.stringify(metadata));
    
    try {
      const response = await fetch(CONFIG.API_URL + '?path=photo', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + this.getAuthToken()
        },
        body: formData
      });
      
      return response.ok;
    } catch (error) {
      // Queue for later upload
      return false;
    }
  }
  
  getAuthToken() {
    return localStorage.getItem('rlc_token') || '';
  }
}

// Export
window.CameraManager = CameraManager;

// Utility function for drag-drop
function setupPhotoDragDrop(element) {
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    element.classList.add('dragover');
  });
  
  element.addEventListener('dragleave', () => {
    element.classList.remove('dragover');
  });
  
  element.addEventListener('drop', async (e) => {
    e.preventDefault();
    element.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    const camera = new CameraManager();
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const compressed = await camera.compressImage(file);
        // Handle compressed image
        handleCompressedPhoto(compressed);
      }
    }
  });
}

function handleCompressedPhoto(blob) {
  // Display preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.createElement('img');
    img.src = e.target.result;
    img.className = 'photo-thumb';
    document.getElementById('photoPreview').appendChild(img);
  };
  reader.readAsDataURL(blob);
  
  // Queue for upload
  if (window.app) {
    window.app.queuePhotoUpload(blob);
  }
}
