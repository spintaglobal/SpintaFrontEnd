// API Configuration
const config = {
  // API Endpoints
  apiBaseUrl: 'https://80yhq8e9rl.execute-api.us-east-1.amazonaws.com',
  
  // Feature flags
  features: {
    // Whether to use mock data as fallback if the API fails
    useMockFallback: true,

    // Logging level for API interactions ('none', 'errors', 'all')
    loggingLevel: 'all'
  }
};

// Log configuration on startup
if (import.meta.env.DEV) {
  console.log('API Configuration loaded in development mode:', {
    apiBaseUrl: config.apiBaseUrl,
    fallbackEnabled: config.features.useMockFallback
  });
}

export default config; 