/**
 * Logger - Configurable logging utility
 */

import { redactSensitiveText } from "../errors/MoviError";

export enum LogLevel {
  SILENT = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5,
}

let currentLevel: LogLevel = LogLevel.SILENT;

export interface LogEntry {
  level: LogLevel;
  tag: string;
  message: string;
  details: readonly unknown[];
}

export interface LoggerConfig {
  level?: LogLevel;
  sink?: (entry: LogEntry) => void;
}

export interface MoviLogger {
  error(tag: string, message: string, ...args: unknown[]): void;
  warn(tag: string, message: string, ...args: unknown[]): void;
  info(tag: string, message: string, ...args: unknown[]): void;
  debug(tag: string, message: string, ...args: unknown[]): void;
  trace(tag: string, message: string, ...args: unknown[]): void;
}

function sanitizeDetail(value: unknown): unknown {
  if (typeof value === "string") return redactSensitiveText(value);
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactSensitiveText(value.message),
    };
  }
  if (value && typeof value === "object") return "[redacted-object]";
  return value;
}

function safeMessage(message: string): string {
  return redactSensitiveText(message);
}

export function createLogger(config: LoggerConfig = {}): MoviLogger {
  const level = config.level ?? LogLevel.SILENT;
  const write = (
    entryLevel: LogLevel,
    tag: string,
    message: string,
    args: unknown[],
  ): void => {
    if (level < entryLevel) return;
    const entry: LogEntry = {
      level: entryLevel,
      tag,
      message: safeMessage(message),
      details: args.map(sanitizeDetail),
    };
    if (config.sink) {
      config.sink(entry);
      return;
    }
    const prefix = `[movi:${tag}]`;
    if (entryLevel === LogLevel.ERROR) {
      console.error(prefix, entry.message, ...entry.details);
    } else if (entryLevel === LogLevel.WARN) {
      console.warn(prefix, entry.message, ...entry.details);
    } else if (entryLevel === LogLevel.INFO) {
      console.info(prefix, entry.message, ...entry.details);
    } else if (entryLevel === LogLevel.DEBUG) {
      console.debug(prefix, entry.message, ...entry.details);
    } else {
      console.trace(prefix, entry.message, ...entry.details);
    }
  };

  return {
    error: (tag, message, ...args) =>
      write(LogLevel.ERROR, tag, message, args),
    warn: (tag, message, ...args) =>
      write(LogLevel.WARN, tag, message, args),
    info: (tag, message, ...args) =>
      write(LogLevel.INFO, tag, message, args),
    debug: (tag, message, ...args) =>
      write(LogLevel.DEBUG, tag, message, args),
    trace: (tag, message, ...args) =>
      write(LogLevel.TRACE, tag, message, args),
  };
}

export const Logger = {
  setLevel(level: LogLevel): void {
    currentLevel = level;
  },

  getLevel(): LogLevel {
    return currentLevel;
  },

  error(tag: string, message: string, ...args: unknown[]): void {
    if (currentLevel >= LogLevel.ERROR) {
      console.error(
        `[movi:${tag}]`,
        safeMessage(message),
        ...args.map(sanitizeDetail),
      );
    }
  },

  warn(tag: string, message: string, ...args: unknown[]): void {
    if (currentLevel >= LogLevel.WARN) {
      console.warn(
        `[movi:${tag}]`,
        safeMessage(message),
        ...args.map(sanitizeDetail),
      );
    }
  },

  info(tag: string, message: string, ...args: unknown[]): void {
    if (currentLevel >= LogLevel.INFO) {
      console.info(
        `[movi:${tag}]`,
        safeMessage(message),
        ...args.map(sanitizeDetail),
      );
    }
  },

  debug(tag: string, message: string, ...args: unknown[]): void {
    if (currentLevel >= LogLevel.DEBUG) {
      console.debug(
        `[movi:${tag}]`,
        safeMessage(message),
        ...args.map(sanitizeDetail),
      );
    }
  },

  trace(tag: string, message: string, ...args: unknown[]): void {
    if (currentLevel >= LogLevel.TRACE) {
      console.trace(
        `[movi:${tag}]`,
        safeMessage(message),
        ...args.map(sanitizeDetail),
      );
    }
  },
};
