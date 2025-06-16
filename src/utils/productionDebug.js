// Production Debugging Utilities for API Issues
import { logger } from './globalLogger.js';
import { checkEnvironment } from './envCheck.js';

export const debugApiIssues = () => {
  logger.log('=== Production API Debug Report ===');
  
  // Environment Check
  const env = checkEnvironment();
  logger.log('Environment Status:', env);
  
  // Network Check
  if (typeof navigator !== 'undefined') {
    logger.log('Network Status:', navigator.onLine ? 'Online' : 'Offline');
    logger.log('User Agent:', navigator.userAgent.substring(0, 100));
  }
  
  // Domain Check
  if (typeof window !== 'undefined') {
    logger.log('Current Domain:', window.location.hostname);
    logger.log('Protocol:', window.location.protocol);
    logger.log('Origin:', window.location.origin);
  }
  
  // Common Issues Checklist
  logger.log('=== Common Production Issues Checklist ===');
  logger.log('1. API Key Present:', env.hasApiKey ? '✅' : '❌');
  logger.log('2. HTTPS Protocol:', window?.location?.protocol === 'https:' ? '✅' : '⚠️');
  logger.log('3. CORS Configured:', 'Check network tab for CORS errors');
  logger.log('4. Environment Variables:', 'Check Vercel/deployment env vars');
  
  return env;
};

export const testApiEndpoint = async () => {
  try {
    logger.log('Testing API endpoint connectivity...');
    
    const testUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      logger.error('Cannot test API: No API key found');
      return { success: false, error: 'No API key' };
    }
    
    const response = await fetch(`${testUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello, this is a test message.'
          }]
        }]
      })
    });
    
    logger.log('API Response Status:', response.status);
    logger.log('API Response OK:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      logger.error('API Error Response:', errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }
    
    const data = await response.json();
    logger.log('API Test Successful');
    return { success: true, data };
    
  } catch (error) {
    logger.error('API Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}; 