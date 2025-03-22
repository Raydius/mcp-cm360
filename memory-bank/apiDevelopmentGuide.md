# API Development Guide

This guide outlines the process for adding new API endpoints to the Campaign Manager 360 MCP Server. Following these steps will ensure that your implementation adheres to the established architecture pattern.

## Overview of the API Architecture

The API follows a layered architecture with clear separation of concerns:

1. **Routes Layer**: Defines API endpoints and validation rules
2. **Controller Layer**: Handles HTTP requests/responses
3. **Service Layer**: Contains business logic
4. **MCP Client**: Communicates with external APIs

Each layer is implemented with dependency injection using factory functions, making it highly testable and maintainable.

## Step-by-Step Process for Adding a New API Endpoint

### 1. Plan Your API Endpoint

Before writing any code, define:

- The resource you're exposing (e.g., campaigns, reports, accounts)
- The operations you need to support (GET, POST, PATCH, DELETE)
- The data model for the resource
- The validation rules for inputs
- The expected responses for each operation

### 2. Create the Service Layer

Start with the service layer, which contains the business logic for your resource.

1. Create a new file in `src/api/services/` named after your resource (e.g., `campaignService.ts`)
2. Define interfaces for your resource and input/output data
3. Implement the service class with methods for each operation
4. Create a factory function for dependency injection

Use the template from `src/api/TEMPLATES.md` as a starting point.

### 3. Create the Controller Layer

Next, create the controller layer, which handles HTTP requests and responses.

1. Create a new file in `src/api/controllers/` named after your resource (e.g., `campaignController.ts`)
2. Implement the controller class with methods for each operation
3. Use try/catch blocks for error handling
4. Delegate business logic to the service
5. Format responses according to the established pattern
6. Create a factory function for dependency injection

Use the template from `src/api/TEMPLATES.md` as a starting point.

### 4. Create the Routes Layer

Finally, create the routes layer, which defines the API endpoints and validation rules.

1. Create a new file in `src/api/routes/` named after your resource (e.g., `campaignRoutes.ts`)
2. Define routes for each operation
3. Implement validation using express-validator
4. Connect routes to controller methods
5. Create a factory function for dependency injection
6. Implement the middleware for lazy initialization

Use the template from `src/api/TEMPLATES.md` as a starting point.

### 5. Register the Router

Register your new router in `app.ts`:

```typescript
// Import API routes
import exampleRoutes from './api/routes/exampleRoutes';
import campaignRoutes from './api/routes/campaignRoutes'; // Add this line

// ...

// API routes
app.use('/api/v1/examples', exampleRoutes);
app.use('/api/v1/campaigns', campaignRoutes); // Add this line
```

### 6. Write Tests

Write tests for each layer of your implementation:

1. **Service Tests**: Test the business logic in isolation
2. **Controller Tests**: Test the HTTP request/response handling
3. **Route Tests**: Test the API endpoints with integration tests

### 7. Document Your API

Update the API documentation to include your new endpoints:

1. Add JSDoc comments to all public methods and functions
2. Update any API documentation files
3. Add usage examples for common scenarios

### 8. Review Your Implementation

Before submitting your code for review, check it against the code review checklist in `memory-bank/codeReviewChecklist.md`.

## Best Practices

### Dependency Injection

- Always use factory functions for dependency injection
- Inject dependencies through constructors
- Don't create dependencies inside classes

```typescript
// Good
export function createCampaignService(client: MCPClient): CampaignService {
  return new CampaignService(client);
}

// Bad
export class CampaignService {
  private client: MCPClient;

  constructor() {
    this.client = new MCPClient(config); // Don't do this
  }
}
```

### Error Handling

- Use try/catch blocks for all async operations
- Log errors with context
- Forward errors to the Express error handler
- Don't swallow errors

```typescript
// Good
async getResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resource = await this.service.getResource(req.params.id);
    res.status(200).json({ success: true, data: resource });
  } catch (error) {
    logger.error(`Error getting resource: ${req.params.id}`, { error });
    next(error);
  }
};

// Bad
async getResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const resource = await this.service.getResource(req.params.id);
    res.status(200).json({ success: true, data: resource });
  } catch (error) {
    // Swallowing the error
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
```

### Validation

- Validate all inputs using express-validator
- Define validation rules in the routes layer
- Provide meaningful error messages

```typescript
// Good
router.post(
  '/',
  validate([
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  ]),
  controller.createResource
);

// Bad
router.post('/', controller.createResource); // No validation
```

### Separation of Concerns

- Routes should only define endpoints and validation
- Controllers should only handle HTTP requests/responses
- Services should contain all business logic
- Don't mix responsibilities between layers

```typescript
// Good - Controller
createResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resource = await this.service.createResource(req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    logger.error('Error creating resource', { error, body: req.body });
    next(error);
  }
};

// Bad - Controller doing business logic
createResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Business logic should be in the service
    const now = new Date().toISOString();
    const resource = {
      ...req.body,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await this.client.post('/resources', resource);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error('Error creating resource', { error, body: req.body });
    next(error);
  }
};
```

## Common Pitfalls to Avoid

1. **Circular Dependencies**: Be careful not to create circular dependencies between modules
2. **Inconsistent Error Handling**: Always use the established error handling pattern
3. **Missing Validation**: Always validate all inputs
4. **Business Logic in Controllers**: Keep business logic in the service layer
5. **Direct Access to Environment Variables**: Use the config module instead
6. **Hardcoded Values**: Use constants or configuration
7. **Inconsistent Response Formatting**: Follow the established response format

## Resources

- API Templates: `src/api/TEMPLATES.md`
- API Architecture Documentation: `src/api/README.md`
- System Patterns: `memory-bank/systemPatterns.md`
- Code Review Checklist: `memory-bank/codeReviewChecklist.md`