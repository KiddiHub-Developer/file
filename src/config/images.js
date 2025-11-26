const CONFIG_URL = 'https://s3.kiddihub.com/conf/img.conf.json';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Default fallback configuration
const defaultConfig = {
  thumbnails: {
    avatar: {
      mobile: { width: 90, height: 90 },
      tablet: { width: 111, height: 111 },
      desktop: { width: 160, height: 160 },
    },
    "school-thumbnail": {
      mobile: [{ width: 369, height: 230 }],
      tablet: [
        { width: 474, height: 249 },
        { width: 318, height: 165 },
        { width: 159.19, height: 82.909 },
        { width: 159.19, height: 82.909 }
      ],
      desktop: [
        { width: 768, height: 352 },
        { width: 512, height: 235 },
        { width: 256, height: 118 },
        { width: 256, height: 118 },
      ],
    },
    "school-banner": {
      mobile: { width: 181, height: 111 },
      tablet: { width: 240, height: 240 },
      desktop: { width: 240, height: 240 },
    },
    content: {
      mobile: { width: 340, height: 191 },
      tablet: { width: 638, height: 359 },
      desktop: { width: 638, height: 359 },
    },
    "edu-banner": {
      mobile: { width: 414, height: 263 },
      tablet: { width: 1920, height: 584 },
      desktop: { width: 1920, height: 584 },
    },
  },
  original: {
    "school-photos": { max_width: 966, max_height: 644 },
    content: { max_width: 966, max_height: 644 },
    "og-images": { max_width: 600, max_height: 315 }
  },
};

let cachedConfig = null;
let lastFetchTime = 0;

/**
 * Fetch image configuration from S3
 * @returns {Promise<Object>} Image configuration
 */
async function fetchImageConfig() {
  try {
    const response = await fetch(CONFIG_URL, {
      headers: {
        'Cache-Control': 'no-cache',
      },
      timeout: 5000, // 5 second timeout
    });

    if (!response.ok) {
      console.warn(`Failed to fetch image config: ${response.status} ${response.statusText}`);
      return defaultConfig;
    }

    const config = await response.json();
    cachedConfig = config;
    lastFetchTime = Date.now();

    return config;
  } catch (error) {
    return cachedConfig || defaultConfig;
  }
}

/**
 * Get image configuration with caching
 * @returns {Promise<Object>} Image configuration
 */
async function getImageConfig() {
  const now = Date.now();

  // Return cached config if still valid
  if (cachedConfig && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedConfig;
  }

  // Fetch new config
  return await fetchImageConfig();
}

// Initial fetch on module load
fetchImageConfig().catch(err => {
  console.error('[ERROR] Initial image config fetch failed:', err.message);
});

// Export a Proxy that fetches config on access
export default new Proxy({}, {
  get(target, prop) {
    // If accessing synchronously, return cached or default
    if (cachedConfig) {
      return cachedConfig[prop];
    }
    return defaultConfig[prop];
  },

  // Support async access
  async getAsync() {
    return await getImageConfig();
  }
});
