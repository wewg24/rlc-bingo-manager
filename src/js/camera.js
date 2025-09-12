
// Photo capture and compression
async function capturePhoto() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { 
      facingMode: 'environment',
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    }
  });
  
  // Compress before storage
  const compressed = await compressImage(blob, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8
  });
  
  // Store locally first
  await storePhotoLocally(compressed);
  
  // Queue for upload
  await queueForUpload(compressed);
}
