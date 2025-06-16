// Global logger utility for conditional console logging
// Only logs in development mode (localhost) to keep production clean

const isDevelopment = () => {
  // Check if we're in development mode
  return (
    process.env.NODE_ENV === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '' ||
    window.location.port === '3000' ||
    window.location.port === '3001' ||
    window.location.href.includes('localhost')
  );
};

// Logger object with all console methods
const logger = {
  log: (...args) => {
    if (isDevelopment()) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (isDevelopment()) {
      console.error(...args);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment()) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment()) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment()) {
      console.debug(...args);
    }
  },
  
  table: (...args) => {
    if (isDevelopment()) {
      console.table(...args);
    }
  },
  
  group: (...args) => {
    if (isDevelopment()) {
      console.group(...args);
    }
  },
  
  groupCollapsed: (...args) => {
    if (isDevelopment()) {
      console.groupCollapsed(...args);
    }
  },
  
  groupEnd: () => {
    if (isDevelopment()) {
      console.groupEnd();
    }
  },
  
  time: (label) => {
    if (isDevelopment()) {
      console.time(label);
    }
  },
  
  timeEnd: (label) => {
    if (isDevelopment()) {
      console.timeEnd(label);
    }
  },
  
  // Helper method to check if we're in development
  isDev: isDevelopment,
  
  // Method to force log even in production (for critical errors)
  forceLog: (...args) => {
    console.log(...args);
  },
  
  forceError: (...args) => {
    console.error(...args);
  }
};

export default logger; 