import config, { validateEnvironment } from './config/environment';
import { logger } from './config/logger';
import { createMCPClient } from './mcp/client';
import { createCM360McpServer } from './mcp/mcpServer';
import express, { Request, Response } from 'express';
import { createApp, finalizeApp } from './app';

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

    // Create the Express application (without 404 handler yet)
    const app = createApp();
    
    // Make MCP client available to the application
    app.locals.mcpClient = mcpClient;
    
    // Initialize CM360 MCP Server
    const cm360McpServer = createCM360McpServer();

    // Set up SSE endpoint for MCP server
    app.get('/mcp/sse', async (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Connect the MCP server to the SSE transport
      await cm360McpServer.connectSSE(res, '/mcp/messages');
    });

    // Set up message endpoint for MCP server
    app.post('/mcp/messages', express.json(), async (req: Request, res: Response) => {
      await cm360McpServer.handleMessage(req, res);
    });
    
    // Finalize the app by adding the 404 handler and error handler
    finalizeApp(app);
    
    // Start the server
    const server = app.listen(config.PORT, () => {
      logger.info(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
      logger.info(`MCP Server available at http://localhost:${config.PORT}/mcp/sse`);
      
      // Start the stdio MCP server if running in development mode
      if (config.NODE_ENV === 'development') {
        cm360McpServer.connectStdio().catch(error => {
          logger.error('Failed to start stdio MCP server', { error });
        });
      }
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

// We don't export app directly anymore since it's created inside startServer
export { createApp };