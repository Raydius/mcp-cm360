import winston from 'winston';
import config, { isProduction, isTest } from './environment';

/**
 * Custom format for development logging
 */
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${
      info.splat !== undefined ? `${info.splat}` : ''
    }${
      // Add structured data if available
      info.data ? `\n${JSON.stringify(info.data, null, 2)}` : ''
    }`
  )
);

/**
 * Format for production logging (JSON)
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

/**
 * Create Winston logger with appropriate configuration
 */
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  silent: isTest, // Silent in test environment
  format: isProduction ? productionFormat : developmentFormat,
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

/**
 * Middleware to log HTTP requests
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function requestLogger(req: any, res: any, next: () => void) {
  // Skip logging for health checks or other frequent endpoints
  if (req.path === '/health' || req.path === '/status') {
    return next();
  }

  const start = Date.now();
  
  // Log the request
  logger.info(`HTTP Request: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    requestId: req.headers['x-request-id'] || null,
  });

  // Log the response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`HTTP Response: ${res.statusCode} (${duration}ms)`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      requestId: req.headers['x-request-id'] || null,
    });
  });

  next();
}