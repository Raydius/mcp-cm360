import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { createExampleController } from '../controllers/exampleController';
import { createExampleService } from '../services/exampleService';
import { validate } from '../middlewares/requestValidator';
import { MCPClient } from '../../mcp/client';

/**
 * Initialize example routes with the MCP client
 * @param mcpClient - MCP client instance
 * @returns Configured router
 */
export function createExampleRouter(mcpClient: MCPClient): Router {
  const router = Router();
  const exampleService = createExampleService(mcpClient);
  const exampleController = createExampleController(exampleService);

  // GET /api/v1/examples
  router.get(
    '/',
    validate([
      query('page').optional().isInt({ min: 1 }).toInt(),
      query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('sort').optional().isString(),
      query('order').optional().isIn(['asc', 'desc']),
    ]),
    exampleController.getAllExamples
  );

  // GET /api/v1/examples/:id
  router.get(
    '/:id',
    validate([
      param('id').isString().notEmpty().withMessage('Example ID is required'),
    ]),
    exampleController.getExampleById
  );

  // POST /api/v1/examples
  router.post(
    '/',
    validate([
      body('name').isString().trim().notEmpty().withMessage('Name is required'),
      body('description').optional().isString(),
      body('status').optional().isIn(['active', 'inactive']),
    ]),
    exampleController.createExample
  );

  // PATCH /api/v1/examples/:id
  router.patch(
    '/:id',
    validate([
      param('id').isString().notEmpty().withMessage('Example ID is required'),
      body('name').optional().isString().trim(),
      body('description').optional().isString(),
      body('status').optional().isIn(['active', 'inactive']),
    ]),
    exampleController.updateExample
  );

  // DELETE /api/v1/examples/:id
  router.delete(
    '/:id',
    validate([
      param('id').isString().notEmpty().withMessage('Example ID is required'),
    ]),
    exampleController.deleteExample
  );

  // POST /api/v1/examples/:id/:action
  router.post(
    '/:id/:action',
    validate([
      param('id').isString().notEmpty().withMessage('Example ID is required'),
      param('action').isString().notEmpty().withMessage('Action is required'),
    ]),
    exampleController.performExampleAction
  );

  return router;
}

// Create default router with app.locals.mcpClient (populated at runtime)
const router = Router();

// This routes file is executed before the MCP client is initialized,
// so we need to wait until the first request to create the controller
router.use((req, res, next) => {
  const mcpClient: MCPClient = req.app.locals.mcpClient;
  
  if (!mcpClient) {
    return next(new Error('MCP client not initialized'));
  }
  
  // Create router with the MCP client from app.locals
  const exampleRouter = createExampleRouter(mcpClient);
  
  // Forward the request to the router
  return exampleRouter(req, res, next);
});

export default router;