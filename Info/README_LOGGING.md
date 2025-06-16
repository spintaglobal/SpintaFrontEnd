# Global Logging System

This project implements a global logging system that automatically suppresses console output in production while allowing full logging in development.

## How It Works

The global logger automatically detects the environment and:
- **Development (localhost)**: Shows all console logs normally
- **Production**: Suppresses all console output except critical errors

## Environment Detection

The system considers you're in development if:
- `process.env.NODE_ENV === 'development'`
- Running on `localhost`, `127.0.0.1`, or ports `3000`/`3001`
- URL contains `localhost`

## Usage

### Option 1: Import Logger (Recommended)
```javascript
import { logger } from '../../../utils/globalLogger.js';

// Use instead of console.log
logger.log('Debug info');
logger.error('Error occurred');
logger.warn('Warning message');
logger.info('Info message');
```

### Option 2: Use Console Directly (Auto-suppressed)
```javascript
// These work normally in dev, but are automatically suppressed in production
console.log('This works in dev only');
console.error('This works in dev only');
```

### Force Logging (Production Critical Issues)
```javascript
import { logger } from '../../../utils/globalLogger.js';

// These will show even in production (use sparingly)
logger.force.log('Critical production info');
logger.force.error('Critical production error');
```

## Available Methods

```javascript
// Standard logging (dev only)
logger.log(...args)
logger.error(...args)
logger.warn(...args)
logger.info(...args)
logger.debug(...args)
logger.table(...args)
logger.group(...args)
logger.groupCollapsed(...args)
logger.groupEnd()
logger.time(label)
logger.timeEnd(label)

// Utility methods
logger.isDev()           // Returns true if in development
logger.force.log()       // Force log in production
logger.force.error()     // Force error in production
```

## Benefits

1. **Clean Production**: No console clutter in production builds
2. **Automatic**: Works without changing existing console.log statements
3. **Flexible**: Can still force critical logs when needed
4. **Development Friendly**: Full logging in development environment

## Implementation

The system is automatically initialized when `App.jsx` loads by importing `globalLogger.js` first. This ensures all console methods are overridden before any other code runs.

## Best Practices

1. Use `logger.log()` instead of `console.log()` for new code
2. Only use `logger.force.*()` for critical production issues
3. Keep debug logs for development troubleshooting
4. Use appropriate log levels (log, warn, error, info)

## Testing

To test the production behavior locally:
1. Build the project: `npm run build`
2. Serve the built files: `npm run preview`
3. Console logs should be suppressed on the preview URL 