// Environment variable checker for debugging production issues
import { logger } from './globalLogger.js';

export const checkEnvironment = () => {
  logger.log('Environment Check:');
  logger.log('NODE_ENV:', import.meta.env.MODE);
  logger.log('VITE_GEMINI_API_KEY exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
  logger.log('VITE_SITE_ENABLED:', import.meta.env.VITE_SITE_ENABLED);
  
  // Don't log the actual API key for security
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    const keyLength = import.meta.env.VITE_GEMINI_API_KEY.length;
    const keyPrefix = import.meta.env.VITE_GEMINI_API_KEY.substring(0, 6);
    logger.log(`API Key format: ${keyPrefix}... (${keyLength} chars)`);
  }
  
  return {
    hasApiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
    environment: import.meta.env.MODE,
    siteEnabled: import.meta.env.VITE_SITE_ENABLED
  };
};

export const logProductionError = (context, error, additionalInfo = {}) => {
  logger.error(`Production Error in ${context}:`, error.message);
  logger.error('Error details:', {
    name: error.name,
    stack: error.stack?.substring(0, 500),
    ...additionalInfo
  });
}; 