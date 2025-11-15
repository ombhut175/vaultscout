/**
 * Custom Logger for Hackathon Development
 * Simple, effective logging compatible with Next.js
 * Replaces nexlog with a custom implementation
 */

// Logger configuration based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Log levels
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// Base logger function
const log = (level: LogLevel, message: string, data?: any) => {
  if (LOG_LEVELS[level] < LOG_LEVELS[logLevel as LogLevel]) {
    return; // Skip if log level is too low
  }

  const timestamp = new Date().toISOString();

  if (isDevelopment) {
    // Development: Use console with colors and formatting
    const levelEmoji = {
      debug: '🛠️',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };
    
    // Pass objects directly to console for better inspection
    if (data !== undefined) {
      console.log(`${levelEmoji[level]} [${level.toUpperCase()}] ${message}`, data);
    } else {
      console.log(`${levelEmoji[level]} [${level.toUpperCase()}] ${message}`);
    }
  } else {
    // Production: Structured JSON logging
    const logData = {
      timestamp,
      level,
      message,
      ...(data && { data }),
    };
    console.log(JSON.stringify(logData));
  }
};

/**
 * Hackathon-specific logger methods
 * Use these for consistent logging across the project
 */
export const hackLog = {
  // API Request logging
  apiRequest: (method: string, url: string, data?: any) => {
    log('info', `🚀 [API] ${method.toUpperCase()} ${url}`, { method, url, data });
  },
  
  apiSuccess: (method: string, url: string, response?: any) => {
    log('info', `✅ [API] ${method.toUpperCase()} ${url} - Success`, { method, url, response });
  },
  
  apiError: (method: string, url: string, error: any) => {
    log('error', `❌ [API] ${method.toUpperCase()} ${url} - Failed`, { method, url, error });
  },

  // Component lifecycle
  componentMount: (componentName: string, props?: any) => {
    log('debug', `🎯 [Component] ${componentName} mounted`, { componentName, props });
  },
  
  componentUpdate: (componentName: string, changes?: any) => {
    log('debug', `🔄 [Component] ${componentName} updated`, { componentName, changes });
  },

  // Store/State management
  storeAction: (action: string, payload?: any) => {
    log('debug', `📊 [Store] ${action}`, { action, payload });
  },
  
  storeUpdate: (storeName: string, newState?: any) => {
    log('debug', `🔄 [Store] ${storeName} state updated`, { storeName, newState });
  },

  // Form handling
  formSubmit: (formName: string, data?: any) => {
    log('info', `📝 [Form] ${formName} submitted`, { formName, data });
  },
  
  formValidation: (formName: string, errors?: any) => {
    log('warn', `⚠️ [Form] ${formName} validation failed`, { formName, errors });
  },

  // Authentication
  authLogin: (userId?: string) => {
    log('info', `🔐 [Auth] User login`, { userId });
  },
  
  authLogout: (userId?: string) => {
    log('info', `🔐 [Auth] User logout`, { userId });
  },

  // Navigation/Routing
  routeChange: (from: string, to: string) => {
    log('debug', `🧭 [Route] Navigation: ${from} → ${to}`, { from, to });
  },

  // General development logs
  dev: (message: string, data?: any) => {
    log('debug', `🛠️ [Dev] ${message}`, data);
  },
  
  info: (message: string, data?: any) => {
    log('info', `ℹ️ [Info] ${message}`, data);
  },
  
  warn: (message: string, data?: any) => {
    log('warn', `⚠️ [Warn] ${message}`, data);
  },
  
  error: (message: string, error?: any) => {
    log('error', `❌ [Error] ${message}`, { error });
  },

  // Performance tracking
  performanceStart: (label: string) => {
    log('debug', `⏱️ [Perf] ${label} - Started`, { label });
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${label}-start`);
    } else if (typeof console !== 'undefined' && console.time) {
      console.time(label);
    }
  },
  
  performanceEnd: (label: string, duration?: number) => {
    let actualDuration = duration;
    
    if (typeof window !== 'undefined' && window.performance) {
      try {
        window.performance.mark(`${label}-end`);
        window.performance.measure(label, `${label}-start`, `${label}-end`);
        const measure = window.performance.getEntriesByName(label)[0];
        actualDuration = measure ? measure.duration : duration;
      } catch (e) {
        // Ignore performance measurement errors
      }
    } else if (typeof console !== 'undefined' && console.timeEnd) {
      console.timeEnd(label);
      // Note: console.timeEnd already logs the duration, so we don't need to log it again
      return;
    }
    
    log('debug', `⏱️ [Perf] ${label} - Completed`, { 
      label, 
      duration: actualDuration ? `${actualDuration.toFixed(2)}ms` : 'unknown' 
    });
  },

  // Feature flags or experiments
  feature: (featureName: string, enabled: boolean, data?: any) => {
    log('info', `🎯 [Feature] ${featureName} ${enabled ? 'enabled' : 'disabled'}`, { featureName, enabled, data });
  },

  // Data processing
  dataProcess: (operation: string, inputCount?: number, outputCount?: number) => {
    log('debug', `📊 [Data] ${operation}`, { operation, input: inputCount, output: outputCount });
  },

  // Cache operations
  cacheHit: (key: string) => {
    log('debug', `💾 [Cache] Hit - ${key}`, { key, type: 'hit' });
  },
  
  cacheMiss: (key: string) => {
    log('debug', `💾 [Cache] Miss - ${key}`, { key, type: 'miss' });
  },

  // WebSocket/Real-time events
  websocketConnect: (url?: string) => {
    log('info', `🔌 [WebSocket] Connected`, { url });
  },
  
  websocketMessage: (type: string, data?: any) => {
    log('debug', `🔌 [WebSocket] Message: ${type}`, { type, data });
  },

  // Advanced console methods for better debugging
  group: (label: string, data?: any) => {
    if (isDevelopment && typeof console !== 'undefined' && console.group) {
      console.group(`📁 [Group] ${label}`, data);
    } else {
      log('debug', `📁 [Group] ${label}`, data);
    }
  },

  groupEnd: () => {
    if (isDevelopment && typeof console !== 'undefined' && console.groupEnd) {
      console.groupEnd();
    }
  },

  table: (data: any, label?: string) => {
    if (isDevelopment && typeof console !== 'undefined' && console.table) {
      if (label) {
        console.log(`📊 [Table] ${label}`);
      }
      console.table(data);
    } else {
      log('debug', `📊 [Table] ${label || 'Data'}`, data);
    }
  },

  dir: (object: any, label?: string) => {
    if (isDevelopment && typeof console !== 'undefined' && console.dir) {
      if (label) {
        console.log(`🔍 [Dir] ${label}`);
      }
      console.dir(object);
    } else {
      log('debug', `🔍 [Dir] ${label || 'Object'}`, object);
    }
  },

  trace: (message: string, data?: any) => {
    if (isDevelopment && typeof console !== 'undefined' && console.trace) {
      console.trace(`🔍 [Trace] ${message}`, data);
    } else {
      log('debug', `🔍 [Trace] ${message}`, data);
    }
  },
};

// Export the base logger for advanced usage
export const logger = { log };

// Export default hackLog for easy imports
export default hackLog;
