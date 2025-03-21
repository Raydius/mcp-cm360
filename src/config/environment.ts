import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Environment configuration constants
 * All environment variables are validated and casted to appropriate types
 */
const config = {
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Server configuration
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  // MCP API configuration
  MCP_API_KEY: process.env.MCP_API_KEY || '',
  MCP_API_BASE_URL: process.env.MCP_API_BASE_URL || 'https://api.example.com/v1',
  MCP_REQUEST_TIMEOUT: parseInt(process.env.MCP_REQUEST_TIMEOUT || '10000', 10),
  
  // Google Campaign Manager 360 API configuration
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN || '',
  CM360_PROFILE_ID: process.env.CM360_PROFILE_ID || '',
  CM360_ACCOUNT_ID: process.env.CM360_ACCOUNT_ID || '',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

/**
 * Validates that all required environment variables are set
 * @throws Error if any required variable is missing
 */
export function validateEnvironment(): void {
  const requiredVariables = [
    'MCP_API_KEY',
    'MCP_API_BASE_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
    'CM360_PROFILE_ID',
    'CM360_ACCOUNT_ID'
  ];
  
  const missingVariables = requiredVariables.filter(
    (name) => !process.env[name]
  );
  
  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(', ')}`
    );
  }
}

/**
 * Determine if the application is running in production
 */
export const isProduction = config.NODE_ENV === 'production';

/**
 * Determine if the application is running in development
 */
export const isDevelopment = config.NODE_ENV === 'development';

/**
 * Determine if the application is running in test mode
 */
export const isTest = config.NODE_ENV === 'test';

export default config;