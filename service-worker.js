
// Caching strategy
const CACHE_STRATEGY = {
  static: 'cache-first',      // CSS, JS, images
  api: 'network-first',        // API calls
  photos: 'cache-then-network', // User photos
  reports: 'cache-first'        // Generated PDFs
};
