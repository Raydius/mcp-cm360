import express, { Request, Response, NextFunction, Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { logger, requestLogger } from './config/logger';
import { isProduction } from './config/environment';
import { errorHandler } from './api/middlewares/errorHandler';
import { createCM360McpServer } from './mcp/mcpServer';

// Import API routes
import exampleRoutes from './api/routes/exampleRoutes';
import accountRoutes from './api/routes/accountRoutes';
import campaignRoutes from './api/routes/campaignRoutes';
import reportRoutes from './api/routes/reportRoutes';

/**
 * Creates and configures the Express application
 * @returns Configured Express application
 */
export function createApp(): Application {
  const app = express();

  // Basic security middleware
  app.use(helmet());

  // Parse JSON request bodies
  app.use(express.json());

  // Parse URL-encoded request bodies
  app.use(express.urlencoded({ extended: true }));

  // CORS configuration
  app.use(cors());

  // Request logging
  if (!isProduction) {
    // Development logging with Morgan
    app.use(morgan('dev'));
  } else {
    // Production logging with custom logger
    app.use(requestLogger);
  }

  // Initialize CM360 MCP Server and Google Auth Service
  const mcpServer = createCM360McpServer();
  app.locals.googleAuthService = mcpServer.getGoogleAuthService();
  app.locals.mcpServer = mcpServer;

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1/examples', exampleRoutes);
  app.use('/api/v1/accounts', accountRoutes);
  app.use('/api/v1/campaigns', campaignRoutes);
  app.use('/api/v1/reports', reportRoutes);

  // MCP SSE endpoint
  app.get('/mcp/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send initial connection message
    res.write('data: {"type":"connected"}\n\n');
    
    // Connect MCP server to SSE transport
    mcpServer.connectSSE(res, '/mcp/messages');
    
    // Handle client disconnect
    req.on('close', () => {
      logger.info('Client disconnected from SSE');
    });
  });
  
  // MCP message endpoint
  app.post('/mcp/messages', (req: Request, res: Response) => {
    mcpServer.handleMessage(req, res);
  });

  // We'll add the 404 handler and error handler in finalizeApp
  // to allow adding routes after app creation

  return app;
}

/**
 * Finalizes the Express application by adding the 404 handler and error handler
 * @param app - The Express application to finalize
 * @returns The finalized Express application
 */
export function finalizeApp(app: Application): Application {
  // 404 handler for undefined routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Cannot ${req.method} ${req.path}`,
      },
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}

/**
 * Create the Express application
 */
const app = finalizeApp(createApp());

export default app;