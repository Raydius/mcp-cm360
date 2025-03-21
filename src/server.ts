import app from './app';
import config, { validateEnvironment } from './config/environment';
import { logger } from './config/logger';
import { createMCPClient } from './mcp/client';

/**
 * Initialize the MCP client
 */
export function initializeMCPClient() {
  return createMCPClient({
    apiKey: config.MCP_API_KEY,
    baseUrl: config.MCP_API_BASE_URL,
    timeout: config.MCP_REQUEST_TIMEOUT,
  });
}

/**
 * Start the server
 */
async function startServer() {
  try {
    // Validate environment variables
    validateEnvironment();
    
    // Initialize MCP client
    const mcpClient = initializeMCPClient();

    // Make MCP client available to the application
    app.locals.mcpClient = mcpClient;
    
    // Start the server
    const server = app.listen(config.PORT, () => {
      logger.info(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      
      // If server doesn't close in 10 seconds, force shutdown
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.stack });
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
      gracefulShutdown('unhandledRejection');
    });
    
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start server if this file is executed directly
if (require.main === module) {
  startServer();
}

export default app;