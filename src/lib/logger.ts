/**
 * Logging utility for API routes and server-side operations
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: string;
  stack?: string;
}

const isDevelopment = process.env.NODE_ENV === 'development';

function formatLog(entry: LogEntry): string {
  const { timestamp, level, message, data, error, stack } = entry;
  const levelUpper = level.toUpperCase().padEnd(5);
  const logParts = [`[${timestamp}] [${levelUpper}]`, message];

  if (data) {
    logParts.push(JSON.stringify(data, null, 2));
  }

  if (error) {
    logParts.push(`Error: ${error}`);
  }

  if (stack && isDevelopment) {
    logParts.push(stack);
  }

  return logParts.join(' ');
}

export const logger = {
  debug: (message: string, data?: any) => {
    if (!isDevelopment) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      data,
    };
    console.log(formatLog(entry));
  },

  info: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      data,
    };
    console.log(formatLog(entry));
  },

  warn: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      data,
    };
    console.warn(formatLog(entry));
  },

  error: (message: string, error?: Error | string, data?: any) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: errorMessage,
      stack,
      data,
    };
    console.error(formatLog(entry));
  },

  request: (method: string, path: string, status: number, duration: number) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `${method} ${path}`,
      data: { status, durationMs: duration },
    };
    console.log(formatLog(entry));
  },
};
