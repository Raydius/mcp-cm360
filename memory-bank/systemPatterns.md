# Campaign Manager 360 MCP Server - System Patterns

This document outlines the key architectural patterns, design principles, and coding conventions used in the Campaign Manager 360 MCP Server. **All developers must strictly adhere to these patterns when modifying existing code or adding new features.**

## Architectural Patterns

### Model Context Protocol (MCP) Implementation

The core of this project is the implementation of the Model Context Protocol (MCP) server for Campaign Manager 360. The MCP pattern enables:

1. **Resource Exposure**: CM360 entities are exposed as resources with URI templates
2. **Tool Exposure**: CM360 operations are exposed as tools with defined input schemas
3. **Transport Independence**: The server can connect via stdio or HTTP/SSE transports
4. **Standardized Communication**: All communication follows the MCP protocol specification

Implementation: `src/mcp/mcpServer.ts`

### MCP Server Modular Architecture 

The flow of control **MUST** follow this path:
- MCP Request → McpServer → Resource/Tool Module → Service → External API
- External API → Service → Resource/Tool Module → McpServer → MCP Response

### REST API Layer (MANDATORY)

The project includes a REST API layer built with Express.js that:

1. **Exposes MCP Endpoints**: Provides HTTP endpoints for MCP communication
2. **Follows REST Principles**: Uses standard HTTP methods and status codes
3. **Implements Middleware Pipeline**: For authentication, validation, and error handling
4. **Separates Concerns**: Controllers, routes, and services have distinct responsibilities

Implementation: `src/api/` directory

### API Architecture Pattern (MANDATORY)

The API implementation **MUST** follow this layered architecture with clear separation of concerns:

1. **Routes Layer** (`src/api/routes/`):
   - Defines API endpoints and HTTP methods
   - Sets up request validation using express-validator
   - Manages dependency injection for controllers and services
   - Connects routes to controller methods
   - **MUST** use factory functions for dependency injection
   - **MUST** implement validation for all inputs

2. **Controller Layer** (`src/api/controllers/`):
   - Handles HTTP request/response cycle
   - Extracts and processes request data
   - Calls appropriate service methods
   - Formats API responses
   - Handles error logging and forwarding
   - **MUST** use try/catch blocks for all async operations
   - **MUST** delegate business logic to services

3. **Service Layer** (`src/api/services/`):
   - Contains business logic
   - Defines data models and interfaces
   - Communicates with external services via MCP client
   - Performs CRUD operations
   - **MUST** receive dependencies through constructor
   - **MUST** define interfaces for all data models

4. **Middleware Layer** (`src/api/middlewares/`):
   - Provides cross-cutting concerns
   - Handles request validation
   - Processes errors
   - Implements authentication (to be added)
   - **MUST** follow the Express middleware pattern

The flow of control **MUST** follow this path:
- Request → Routes → Validation Middleware → Controller → Service → MCP Client → External API
- External API → MCP Client → Service → Controller → Response Formatting → Response

**Example implementation (to be used as a template for all new API endpoints):**
- Routes: `src/api/routes/exampleRoutes.ts`
- Controller: `src/api/controllers/exampleController.ts`
- Service: `src/api/services/exampleService.ts`

### Service Layer Pattern

Business logic is encapsulated in service classes that:

1. **Abstract Implementation Details**: Hide the complexity of CM360 API interactions
2. **Provide Reusable Operations**: Can be used by both MCP and REST API layers
3. **Handle Error Cases**: Implement consistent error handling
4. **Manage Resources**: Handle resource lifecycle and cleanup

Implementation: `src/api/services/` directory

## Design Principles

### Dependency Injection (MANDATORY)

The application **MUST** use dependency injection:

1. **Service Dependencies**: Services receive their dependencies through constructors
2. **Configuration Injection**: Environment configuration is injected rather than directly accessed
3. **Testability**: Makes components easier to test in isolation
4. **Loose Coupling**: Reduces direct dependencies between components
5. **Factory Functions**: Each layer **MUST** provide factory functions (createXXX) to simplify instantiation and dependency wiring

### Error Handling Strategy (MANDATORY)

A consistent approach to error handling **MUST** be followed:

1. **Centralized Middleware**: Express middleware for handling API errors
2. **Standardized Responses**: Consistent error response format
3. **Detailed Logging**: All errors are logged with context
4. **Error Classification**: Errors are categorized (e.g., validation, authentication, server)

Implementation: `src/api/middlewares/errorHandler.ts`

### Configuration Management

Environment-based configuration:

1. **Environment Variables**: All configuration comes from environment variables
2. **Validation**: Required variables are validated at startup
3. **Type Casting**: Variables are cast to appropriate types
4. **Defaults**: Sensible defaults are provided where appropriate

Implementation: `src/config/environment.ts`

## Coding Conventions

### TypeScript Best Practices (MANDATORY)

1. **Strong Typing**: All code **MUST** use explicit TypeScript types
2. **Interface Definitions**: Interfaces **MUST** define data structures and component contracts
3. **Type Guards**: Used to validate data at runtime
4. **Generics**: Used for reusable components with type safety

### Asynchronous Patterns (MANDATORY)

1. **Promises and Async/Await**: **MUST** be used throughout for asynchronous operations
2. **Error Handling**: Try/catch blocks **MUST** be used for all async operations
3. **Promise Chaining**: Used where appropriate for complex operations
4. **Timeout Handling**: Axios requests include timeout configuration

### Testing Patterns

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test interaction between components
3. **Mocking**: External dependencies are mocked for testing
4. **Test Fixtures**: Reusable test data and setup

Implementation: `tests/` directory

## Security Patterns

### Authentication and Authorization

1. **JWT Authentication**: Google JWT for CM360 API authentication
2. **Token Management**: Automatic token refresh and caching
3. **Environment Security**: Sensitive data stored in environment variables
4. **Input Validation**: All user input is validated

### API Security

1. **CORS Configuration**: Controlled cross-origin resource sharing
2. **Helmet Integration**: HTTP security headers
3. **Rate Limiting**: Protection against abuse (to be implemented)
4. **Input Sanitization**: Prevention of injection attacks

## Adding New API Endpoints (MANDATORY)

When adding new API endpoints, you **MUST** follow these steps:

1. **Create a Service**:
   - Define interfaces for input/output data
   - Implement business logic
   - Use dependency injection for the MCP client
   - Follow the pattern in `src/api/services/exampleService.ts`

2. **Create a Controller**:
   - Implement HTTP request handling
   - Use try/catch for all async operations
   - Delegate business logic to the service
   - Follow the pattern in `src/api/controllers/exampleController.ts`

3. **Create a Router**:
   - Define routes and HTTP methods
   - Implement validation using express-validator
   - Connect routes to controller methods
   - Follow the pattern in `src/api/routes/exampleRoutes.ts`

4. **Register the Router**:
   - Add the router to `app.ts`
   - Use a consistent URL pattern: `/api/v1/[resource]`

Failure to follow this pattern will result in code that is inconsistent with the rest of the application and may be rejected during code review.

