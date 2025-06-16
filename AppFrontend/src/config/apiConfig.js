// API Configuration
// For development: Add your API key here temporarily
// For production: Use proper environment variables

export const getGeminiApiKey = () => {
  // Check for environment variables first (using Vite format)
  const viteApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (viteApiKey && viteApiKey !== 'your_gemini_api_key_here') {
    return viteApiKey;
  }
  
  // Legacy support for React App format
  if (typeof window !== 'undefined' && window.REACT_APP_GEMINI_API_KEY) {
    return window.REACT_APP_GEMINI_API_KEY;
  }
  
  // For development only - replace with your actual key
  // Make sure to remove this before committing to version control
  const DEVELOPMENT_API_KEY = 'your_api_key_here';
  
  if (DEVELOPMENT_API_KEY !== 'your_api_key_here') {
    return DEVELOPMENT_API_KEY;
  }
  
  console.error('❌ API key not configured. Please either:');
  console.error('1. Set VITE_GEMINI_API_KEY in your .env file, or');
  console.error('2. Temporarily add your key to src/config/apiConfig.js');
  
  return null;
};

export const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'; 