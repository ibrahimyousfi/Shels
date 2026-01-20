/**
 * Logger utility for tracking errors and debugging
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  error?: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory
  private logToConsole = true;
  private logToFile = true;

  /**
   * Clean context to avoid circular references and large objects
   */
  private cleanContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;
    
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(context)) {
      try {
        // Skip functions and complex objects
        if (typeof value === 'function') {
          cleaned[key] = '[Function]';
        } else if (value && typeof value === 'object') {
          // Only keep simple properties
          if (Array.isArray(value)) {
            cleaned[key] = `[Array(${value.length})]`;
          } else if (value.constructor && value.constructor.name !== 'Object') {
            cleaned[key] = `[${value.constructor.name}]`;
          } else {
            // Try to stringify, but limit depth
            try {
              const str = JSON.stringify(value);
              if (str.length > 500) {
                cleaned[key] = str.substring(0, 500) + '...';
              } else {
                cleaned[key] = value;
              }
            } catch {
              cleaned[key] = '[Complex Object]';
            }
          }
        } else {
          cleaned[key] = value;
        }
      } catch {
        cleaned[key] = '[Unable to serialize]';
      }
    }
    return cleaned;
  }

  /**
   * Log an error
   */
  error(message: string, error?: Error | any, context?: Record<string, any>) {
    const cleanedContext = this.cleanContext(context);
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      error: error?.message || String(error),
      stack: error?.stack,
      context: cleanedContext
    };
    
    this.addLog(entry);
    
    // Send to API in client-side
    if (typeof window !== 'undefined') {
      this.sendToAPI(entry).catch(() => {
        // Silently fail if API is not available
      });
    }
    
    if (this.logToConsole) {
      console.error(`[ERROR] ${message}`, error, context);
    }
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: Record<string, any>) {
    const cleanedContext = this.cleanContext(context);
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context: cleanedContext
    };
    
    this.addLog(entry);
    
    // Send to API in client-side
    if (typeof window !== 'undefined') {
      this.sendToAPI(entry).catch(() => {
        // Silently fail if API is not available
      });
    }
    
    if (this.logToConsole) {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  /**
   * Log info
   */
  info(message: string, context?: Record<string, any>) {
    const cleanedContext = this.cleanContext(context);
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context: cleanedContext
    };
    
    this.addLog(entry);
    
    if (this.logToConsole) {
      console.log(`[INFO] ${message}`, context);
    }
  }

  /**
   * Log debug info
   */
  debug(message: string, context?: Record<string, any>) {
    const cleanedContext = this.cleanContext(context);
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context: cleanedContext
    };
    
    this.addLog(entry);
    
    if (this.logToConsole && process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  /**
   * Add log entry
   */
  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Save to file in development
    if (this.logToFile && typeof window === 'undefined') {
      this.saveToFile(entry);
    }
  }

  /**
   * Send log to API (client-side only)
   */
  private async sendToAPI(entry: LogEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Silently fail if API is not available
    }
  }

  /**
   * Save log to file (server-side only)
   */
  private async saveToFile(entry: LogEntry) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`);
      
      // Create logs directory if it doesn't exist
      await fs.mkdir(logDir, { recursive: true });
      
      // Append log entry with safe stringify
      const logLine = JSON.stringify(entry, null, 2) + '\n';
      await fs.appendFile(logFile, logLine);
    } catch (error) {
      // Silently fail if file system operations fail
      console.error('Failed to save log to file:', error);
    }
  }

  /**
   * Get all logs
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): LogEntry[] {
    return this.logs
      .filter(log => log.level === LogLevel.ERROR)
      .slice(-count)
      .reverse();
  }

  /**
   * Clear logs
   */
  clear() {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const logger = new Logger();

// Export convenience functions
export const logError = (message: string, error?: Error | any, context?: Record<string, any>) => {
  logger.error(message, error, context);
};

export const logWarn = (message: string, context?: Record<string, any>) => {
  logger.warn(message, context);
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(message, context);
};

export const logDebug = (message: string, context?: Record<string, any>) => {
  logger.debug(message, context);
};
