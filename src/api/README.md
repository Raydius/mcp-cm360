# API Architecture Pattern

This directory contains the REST API implementation for the Campaign Manager 360 MCP Server. The API follows a strict layered architecture pattern that **MUST** be adhered to when modifying existing code or adding new features.

## Directory Structure

```
src/api/
├── controllers/  # Request handlers
├── middlewares/  # Express middlewares
├── routes/       # API routes
└── services/     # Business logic services
```

## Layered Architecture

The API implementation follows a layered architecture with clear separation of concerns:

### 1. Routes Layer (`routes/`)

- Defines API endpoints and HTTP methods
- Sets up request validation using express-validator
- Manages dependency injection for controllers and services
- Connects routes to controller methods

**Example:** `routes/exampleRoutes.ts`

```typescript
// Factory function pattern for dependency injection
export function createExampleRouter(mcpClient: MCPClient): Router {
  const router = Router();
  const exampleService = createExampleService(mcpClient);
  const exampleController = createExampleController(exampleService);

  // Route definition with validation
  router.get(
    '/',
    validate([
      query('page').optional().isInt({ min: 1 }).toInt(),
      // ...other validations
    ]),
    exampleController.getAllExamples
  );

  // ...other routes

  return router;
}
```

### 2. Controller Layer (`controllers/`)

- Handles HTTP request/response cycle
- Extracts and processes request data
- Calls appropriate service methods
- Formats API responses
- Handles error logging and forwarding

**Example:** `controllers/exampleController.ts`

```typescript
export class ExampleController {
  private service: ExampleService;

  constructor(service: ExampleService) {
    this.service = service;
  }

  // Async method with try/catch for error handling
  getAllExamples = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract and process request data
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      // ...other processing

      // Call service method
      const examples = await this.service.getExamples({
        page: page - 1,
        // ...other parameters
      });

      // Format response
      res.status(200).json({
        success: true,
        data: examples,
      });
    } catch (error) {
      // Log and forward error
      logger.error('Error getting examples', { error });
      next(error);
    }
  };

  // ...other controller methods
}

// Factory function for dependency injection
export function createExampleController(service: ExampleService): ExampleController {
  return new ExampleController(service);
}
```

### 3. Service Layer (`services/`)

- Contains business logic
- Defines data models and interfaces
- Communicates with external services via MCP client
- Performs CRUD operations

**Example:** `services/exampleService.ts`

```typescript
// Data model interfaces
export interface Example {
  id: string;
  name: string;
  // ...other properties
}

export class ExampleService {
  private client: MCPClient;
  private readonly basePath = '/examples';

  constructor(client: MCPClient) {
    this.client = client;
  }

  // Service methods
  async getExamples(params: PaginationParams = {}): Promise<{
    items: Example[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = buildPaginationParams(params);
    return this.client.get<{
      items: Example[];
      total: number;
      page: number;
      limit: number;
    }>(this.basePath, { params: queryParams });
  }

  // ...other service methods
}

// Factory function for dependency injection
export function createExampleService(client: MCPClient): ExampleService {
  return new ExampleService(client);
}
```

### 4. Middleware Layer (`middlewares/`)

- Provides cross-cutting concerns
- Handles request validation
- Processes errors
- Implements authentication

**Example:** `middlewares/requestValidator.ts`

```typescript
export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Format and return validation errors
    // ...
  };
}
```

## Adding New API Endpoints

When adding new API endpoints, you **MUST** follow these steps:

1. **Create a Service**:
   - Define interfaces for input/output data
   - Implement business logic
   - Use dependency injection for the MCP client
   - Follow the pattern in `services/exampleService.ts`

2. **Create a Controller**:
   - Implement HTTP request handling
   - Use try/catch for all async operations
   - Delegate business logic to the service
   - Follow the pattern in `controllers/exampleController.ts`

3. **Create a Router**:
   - Define routes and HTTP methods
   - Implement validation using express-validator
   - Connect routes to controller methods
   - Follow the pattern in `routes/exampleRoutes.ts`

4. **Register the Router**:
   - Add the router to `app.ts`
   - Use a consistent URL pattern: `/api/v1/[resource]`

## Further Documentation

For more detailed information about the API architecture pattern, refer to:

- `memory-bank/systemPatterns.md`: Comprehensive documentation of architectural patterns
- `memory-bank/decisionLog.md`: Rationale behind architectural decisions
- `memory-bank/productContext.md`: Project overview and technical details