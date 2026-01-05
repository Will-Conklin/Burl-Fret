import winston, { Logger } from 'winston';
import path from 'path';

/**
 * Creates a logger instance for a bot
 * @param botName - Name of the bot (bumbles or discocowboy)
 * @returns Configured logger instance
 */
export function createLogger(botName: string = 'shared'): Logger {
  const logDir = path.join(process.cwd(), 'logs');

  // Define log format
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }: any) => {
      let log = `${timestamp} [${botName.toUpperCase()}] ${level.toUpperCase()}: ${message}`;

      // Add metadata if present
      if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
      }

      // Add stack trace if present
      if (stack) {
        log += `\n${stack}`;
      }

      return log;
    })
  );

  // Create logger
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
      // Console transport with colorization
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          logFormat
        )
      }),
      // File transport for all logs
      new winston.transports.File({
        filename: path.join(logDir, `${botName}-combined.log`),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // File transport for errors only
      new winston.transports.File({
        filename: path.join(logDir, `${botName}-error.log`),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    ],
    // Handle exceptions and rejections
    exceptionHandlers: [
      new winston.transports.File({
        filename: path.join(logDir, `${botName}-exceptions.log`)
      })
    ],
    rejectionHandlers: [
      new winston.transports.File({
        filename: path.join(logDir, `${botName}-rejections.log`)
      })
    ]
  });

  return logger;
}
