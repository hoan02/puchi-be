export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: LogContext;
  service?: string;
  traceId?: string;
}

export class Logger {
  private serviceName: string;
  private traceId?: string;

  constructor(serviceName: string, traceId?: string) {
    this.serviceName = serviceName;
    this.traceId = traceId;
  }

  private formatLog(level: LogEntry['level'], message: string, context?: LogContext): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      service: this.serviceName,
      traceId: this.traceId,
    };
  }

  private output(entry: LogEntry): void {
    const prefix = `[${entry.service}]`;
    const trace = entry.traceId ? `[${entry.traceId}]` : '';
    const level = `[${entry.level.toUpperCase()}]`;

    if (entry.context) {
      console.log(`${prefix}${trace} ${level} ${entry.message}`, entry.context);
    } else {
      console.log(`${prefix}${trace} ${level} ${entry.message}`);
    }
  }

  error(message: string, context?: LogContext): void {
    const entry = this.formatLog('error', message, context);
    this.output(entry);
  }

  warn(message: string, context?: LogContext): void {
    const entry = this.formatLog('warn', message, context);
    this.output(entry);
  }

  info(message: string, context?: LogContext): void {
    const entry = this.formatLog('info', message, context);
    this.output(entry);
  }

  debug(message: string, context?: LogContext): void {
    const entry = this.formatLog('debug', message, context);
    this.output(entry);
  }

  // Method để tạo child logger với trace ID
  withTrace(traceId: string): Logger {
    return new Logger(this.serviceName, traceId);
  }
}

// Factory function để tạo logger
export function createLogger(serviceName: string): Logger {
  return new Logger(serviceName);
}

// Legacy function để backward compatibility
export function logWithPrefix(prefix: string, message: string, ...args: any[]) {
  console.log(`[${prefix}]`, message, ...args);
}

// Utility functions cho common logging patterns
export function logApiRequest(logger: Logger, method: string, url: string, duration: number, statusCode: number, context?: LogContext): void {
  logger.info('API request completed', {
    method,
    url,
    duration: `${duration}ms`,
    statusCode,
    ...context
  });
}

export function logError(logger: Logger, error: Error, context?: LogContext): void {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    ...context
  });
}

export function logUserAction(logger: Logger, userId: string, action: string, context?: LogContext): void {
  logger.info('User action', {
    userId,
    action,
    ...context
  });
}

export function logDatabaseOperation(logger: Logger, operation: string, table: string, duration: number, context?: LogContext): void {
  logger.debug('Database operation', {
    operation,
    table,
    duration: `${duration}ms`,
    ...context
  });
}
