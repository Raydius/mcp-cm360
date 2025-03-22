import express, { Request, Response, NextFunction, Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { logger, requestLogger } from './config/logger';
import { isProduction } from './config/environment';
import { errorHandler } from './api/middlewares/errorHandler';

// Import API routes
import exampleRoutes from './api/routes/exampleRoutes';

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

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1/examples', exampleRoutes);

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