# API Templates

This file contains template code for creating new API endpoints that follow the established architecture pattern. Copy and paste these templates when implementing new features, replacing placeholder names with your actual resource names.

## Route Template

```typescript
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { createResourceController } from '../controllers/resourceController';
import { createResourceService } from '../services/resourceService';
import { validate } from '../middlewares/requestValidator';
import { MCPClient } from '../../mcp/client';

/**
 * Initialize resource routes with the MCP client
 * @param mcpClient - MCP client instance
 * @returns Configured router
 */
export function createResourceRouter(mcpClient: MCPClient): Router {
  const router = Router();
  const resourceService = createResourceService(mcpClient);
  const resourceController = createResourceController(resourceService);

  // GET /api/v1/resources
  router.get(
    '/',
    validate([
      query('page').optional().isInt({ min: 1 }).toInt(),
      query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('sort').optional().isString(),
      query('order').optional().isIn(['asc', 'desc']),
    ]),
    resourceController.getAllResources
  );

  // GET /api/v1/resources/:id
  router.get(
    '/:id',
    validate([
      param('id').isString().notEmpty().withMessage('Resource ID is required'),
    ]),
    resourceController.getResourceById
  );

  // POST /api/v1/resources
  router.post(
    '/',
    validate([
      body('name').isString().trim().notEmpty().withMessage('Name is required'),
      body('description').optional().isString(),
      body('status').optional().isIn(['active', 'inactive']),
      // Add other validation rules as needed
    ]),
    resourceController.createResource
  );

  // PATCH /api/v1/resources/:id
  router.patch(
    '/:id',
    validate([
      param('id').isString().notEmpty().withMessage('Resource ID is required'),
      body('name').optional().isString().trim(),
      body('description').optional().isString(),
      body('status').optional().isIn(['active', 'inactive']),
      // Add other validation rules as needed
    ]),
    resourceController.updateResource
  );

  // DELETE /api/v1/resources/:id
  router.delete(
    '/:id',
    validate([
      param('id').isString().notEmpty().withMessage('Resource ID is required'),
    ]),
    resourceController.deleteResource
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
  const resourceRouter = createResourceRouter(mcpClient);
  
  // Forward the request to the router
  return resourceRouter(req, res, next);
});

export default router;
```

## Controller Template

```typescript
import { Request, Response, NextFunction } from 'express';
import { ResourceService } from '../services/resourceService';
import { logger } from '../../config/logger';

/**
 * Resource controller
 * Handles HTTP requests related to resources
 */
export class ResourceController {
  private service: ResourceService;

  /**
   * Initialize the controller with the resource service
   * @param service - Resource service instance
   */
  constructor(service: ResourceService) {
    this.service = service;
  }

  /**
   * Get a list of resources
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  getAllResources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse pagination parameters
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const sort = req.query.sort as string;
      const order = req.query.order as 'asc' | 'desc';

      // Get resources from service
      const resources = await this.service.getResources({
        page: page - 1, // Convert to 0-based for the API
        limit,
        sort,
        order,
      });

      // Send success response
      res.status(200).json({
        success: true,
        data: resources,
      });
    } catch (error) {
      logger.error('Error getting resources', { error });
      next(error);
    }
  };

  /**
   * Get a single resource by ID
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  getResourceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const resource = await this.service.getResourceById(id);

      res.status(200).json({
        success: true,
        data: resource,
      });
    } catch (error) {
      logger.error(`Error getting resource: ${req.params.id}`, { error });
      next(error);
    }
  };

  /**
   * Create a new resource
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  createResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resource = await this.service.createResource(req.body);

      res.status(201).json({
        success: true,
        data: resource,
      });
    } catch (error) {
      logger.error('Error creating resource', { error, body: req.body });
      next(error);
    }
  };

  /**
   * Update an existing resource
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  updateResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const resource = await this.service.updateResource(id, req.body);

      res.status(200).json({
        success: true,
        data: resource,
      });
    } catch (error) {
      logger.error(`Error updating resource: ${req.params.id}`, { error, body: req.body });
      next(error);
    }
  };

  /**
   * Delete a resource
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  deleteResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.deleteResource(id);

      res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting resource: ${req.params.id}`, { error });
      next(error);
    }
  };
}

/**
 * Create a resource controller instance
 * @param service - Resource service
 * @returns Resource controller instance
 */
export function createResourceController(service: ResourceService): ResourceController {
  return new ResourceController(service);
}
```

## Service Template

```typescript
import { MCPClient } from '../../mcp/client';
import { PaginationParams } from '../../mcp/types';
import { buildPaginationParams, formatPath } from '../../mcp/utils';

/**
 * Resource data model
 */
export interface Resource {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new resource
 */
export interface CreateResourceInput {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}

/**
 * Input for updating a resource
 */
export interface UpdateResourceInput {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

/**
 * Service for managing resources
 */
export class ResourceService {
  private client: MCPClient;
  private readonly basePath = '/resources';

  /**
   * Initialize the resource service with the MCP client
   * @param client - Initialized MCP client
   */
  constructor(client: MCPClient) {
    this.client = client;
  }

  /**
   * Get a list of resources with pagination
   * @param params - Pagination parameters
   * @returns Paginated list of resources
   */
  async getResources(params: PaginationParams = {}): Promise<{
    items: Resource[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = buildPaginationParams(params);
    return this.client.get<{
      items: Resource[];
      total: number;
      page: number;
      limit: number;
    }>(this.basePath, { params: queryParams });
  }

  /**
   * Get a single resource by ID
   * @param id - Resource ID
   * @returns Resource object
   */
  async getResourceById(id: string): Promise<Resource> {
    const path = formatPath(`${this.basePath}/:id`, { id });
    return this.client.get<Resource>(path);
  }

  /**
   * Create a new resource
   * @param data - Resource data
   * @returns Created resource
   */
  async createResource(data: CreateResourceInput): Promise<Resource> {
    return this.client.post<Resource>(this.basePath, data);
  }

  /**
   * Update an existing resource
   * @param id - Resource ID
   * @param data - Updated resource data
   * @returns Updated resource
   */
  async updateResource(id: string, data: UpdateResourceInput): Promise<Resource> {
    const path = formatPath(`${this.basePath}/:id`, { id });
    return this.client.patch<Resource>(path, data);
  }

  /**
   * Delete a resource
   * @param id - Resource ID
   * @returns Success response
   */
  async deleteResource(id: string): Promise<void> {
    const path = formatPath(`${this.basePath}/:id`, { id });
    return this.client.delete<void>(path);
  }
}

/**
 * Create a resource service instance
 * @param client - MCP client
 * @returns Resource service instance
 */
export function createResourceService(client: MCPClient): ResourceService {
  return new ResourceService(client);
}
```

## App.ts Update Template

When adding a new API endpoint, you need to update the `app.ts` file to register the new router:

```typescript
// Import API routes
import exampleRoutes from './api/routes/exampleRoutes';
import resourceRoutes from './api/routes/resourceRoutes'; // Add this line

// ...

// API routes
app.use('/api/v1/examples', exampleRoutes);
app.use('/api/v1/resources', resourceRoutes); // Add this line
```

## Usage Instructions

1. Copy the appropriate template code
2. Replace all instances of "resource" or "Resource" with your actual resource name
3. Add or modify validation rules as needed
4. Implement any additional methods required for your specific use case
5. Update the app.ts file to register your new router