// Global logger configuration that overrides console methods
// This ensures NO console output in production, even if developers forget to use logger

const isDevelopment = () => {
  try {
    return (
      process.env.NODE_ENV === 'development' ||
      (typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '' ||
        window.location.port === '3000' ||
        window.location.port === '3001' ||
        window.location.href.includes('localhost')
      ))
    );
  } catch {
    // Fallback for SSR or other environments
    return process.env.NODE_ENV === 'development';
  }
};

// Store original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  table: console.table,
  group: console.group,
  groupCollapsed: console.groupCollapsed,
  groupEnd: console.groupEnd,
  time: console.time,
  timeEnd: console.timeEnd,
  trace: console.trace,
  assert: console.assert,
  clear: console.clear,
  count: console.count,
  countReset: console.countReset,
  dir: console.dir,
  dirxml: console.dirxml
};

// Override console methods globally
const initializeGlobalLogger = () => {
  if (!isDevelopment()) {
    // In production, replace all console methods with selective functions
    Object.keys(originalConsole).forEach(method => {
      if (method === 'error') {
        // Keep error logging in production for critical issues
        console[method] = (...args) => {
          // Log actual Error objects and API-related errors
          const shouldLog = args.some(arg => 
            arg instanceof Error || 
            (typeof arg === 'string' && (
              arg.includes('API') || 
              arg.includes('fetch') || 
              arg.includes('request failed') ||
              arg.includes('network') ||
              arg.includes('status') ||
              arg.includes('Error:') ||
              arg.includes('Failed to')
            ))
          );
          
          if (shouldLog) {
            originalConsole.error(...args);
          }
        };
      } else if (method === 'warn') {
        // Keep warnings for important production issues
        console[method] = (...args) => {
          const shouldLog = args.some(arg => 
            typeof arg === 'string' && (
              arg.includes('API') || 
              arg.includes('network') ||
              arg.includes('Warning:') ||
              arg.includes('Failed')
            )
          );
          
          if (shouldLog) {
            originalConsole.warn(...args);
          }
        };
      } else {
        // Disable all other console methods in production
        console[method] = () => {};
      }
    });
  }
};

// Helper function to force log in production (for critical issues)
const forceLog = {
  log: (...args) => originalConsole.log(...args),
  error: (...args) => originalConsole.error(...args),
  warn: (...args) => originalConsole.warn(...args),
  info: (...args) => originalConsole.info(...args)
};

// Development-only logger (same as original console in dev, silent in prod)
const devLogger = {
  log: (...args) => isDevelopment() && originalConsole.log(...args),
  error: (...args) => isDevelopment() && originalConsole.error(...args),
  warn: (...args) => isDevelopment() && originalConsole.warn(...args),
  info: (...args) => isDevelopment() && originalConsole.info(...args),
  debug: (...args) => isDevelopment() && originalConsole.debug(...args),
  table: (...args) => isDevelopment() && originalConsole.table(...args),
  group: (...args) => isDevelopment() && originalConsole.group(...args),
  groupCollapsed: (...args) => isDevelopment() && originalConsole.groupCollapsed(...args),
  groupEnd: () => isDevelopment() && originalConsole.groupEnd(),
  time: (label) => isDevelopment() && originalConsole.time(label),
  timeEnd: (label) => isDevelopment() && originalConsole.timeEnd(label),
  
  // Utility methods
  isDev: isDevelopment,
  force: forceLog // For critical production logging
};

// Initialize the global logger
initializeGlobalLogger();

export { devLogger as logger, forceLog, isDevelopment };
export default devLogger; 