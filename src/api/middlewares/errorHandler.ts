import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger';
import { MCPError } from '../../mcp/types';
import { isProduction } from '../../config/environment';

/**
 * Standard API error response structure
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
}

/**
 * Global error handler middleware
 * Processes all errors and returns a standardized response
 * 
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function errorHandler(
  err: Error | MCPError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Default error values
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let errorMessage = 'An unexpected error occurred';
  let errorDetails: unknown = undefined;

  // Process MCPError
  if (err instanceof MCPError) {
    statusCode = err.status || 500;
    errorCode = err.code;
    errorMessage = err.message;
    errorDetails = err.details;
    
    logger.error(`MCP Error: ${err.message}`, {
      code: err.code,
      status: err.status,
      details: err.details,
      path: req.path,
      method: req.method,
    });
  } 
  // Process validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = err.message;
    
    logger.warn(`Validation Error: ${err.message}`, {
      path: req.path,
      method: req.method,
    });
  }
  // Process other known errors
  else if (err.name === 'SyntaxError') {
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    errorMessage = 'Invalid JSON payload';
    
    logger.warn(`Syntax Error: ${err.message}`, {
      path: req.path,
      method: req.method,
    });
  }
  // Process generic errors
  else {
    logger.error(`Unhandled Error: ${err.message}`, {
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
    },
  };

  // Include error details if available
  if (errorDetails !== undefined) {
    errorResponse.error.details = errorDetails;
  }

  // Include stack trace in development mode
  if (!isProduction && err.stack) {
    errorResponse.error.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}