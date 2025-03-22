# API Architecture Code Review Checklist

This checklist should be used when reviewing code changes to ensure compliance with the established API architecture pattern. All items should be checked before approving any pull request that modifies or adds to the API layer.

## General

- [ ] Code follows TypeScript best practices
- [ ] All public methods and functions have JSDoc comments
- [ ] Error handling is consistent with the established pattern
- [ ] Logging is implemented appropriately
- [ ] No direct access to environment variables (use config module)
- [ ] No hardcoded values (use constants or configuration)
- [ ] Tests are included for all new functionality

## Routes Layer

- [ ] Routes are defined in a dedicated file in `src/api/routes/`
- [ ] Factory function pattern is used for dependency injection
- [ ] Express-validator is used for input validation
- [ ] All route parameters, query parameters, and request bodies are validated
- [ ] Routes are organized by resource and follow RESTful principles
- [ ] Router is exported using both named export (factory function) and default export (middleware)
- [ ] Route paths follow the established pattern (`/api/v1/[resource]`)
- [ ] HTTP methods are appropriate for the operations (GET, POST, PATCH, DELETE)
- [ ] Controller methods are properly connected to routes

## Controller Layer

- [ ] Controller is defined in a dedicated file in `src/api/controllers/`
- [ ] Controller is implemented as a class with instance methods
- [ ] Factory function pattern is used for dependency injection
- [ ] Service is injected through the constructor
- [ ] All methods use async/await with try/catch blocks
- [ ] Error handling includes appropriate logging
- [ ] Errors are forwarded to the Express error handler
- [ ] Response formatting follows the established pattern
- [ ] HTTP status codes are appropriate for the operations
- [ ] No business logic in controllers (delegate to services)

## Service Layer

- [ ] Service is defined in a dedicated file in `src/api/services/`
- [ ] Service is implemented as a class with instance methods
- [ ] Factory function pattern is used for dependency injection
- [ ] MCP client is injected through the constructor
- [ ] Data models are defined using TypeScript interfaces
- [ ] Input/output types are clearly defined
- [ ] Methods are focused on business logic
- [ ] No direct handling of HTTP requests/responses
- [ ] Path formatting uses the utility functions

## Integration

- [ ] New routes are registered in `app.ts`
- [ ] Dependencies are properly wired up
- [ ] No circular dependencies
- [ ] Consistent naming conventions across all layers

## Security

- [ ] Input validation is thorough and appropriate
- [ ] No sensitive data is logged
- [ ] Authentication/authorization is implemented where required
- [ ] No security vulnerabilities (injection, XSS, etc.)

## Performance

- [ ] No unnecessary database queries or API calls
- [ ] Pagination is implemented for list endpoints
- [ ] Appropriate error handling for timeouts and failures
- [ ] No memory leaks or excessive resource usage

## Documentation

- [ ] API endpoints are documented
- [ ] Data models are documented
- [ ] Usage examples are provided where appropriate
- [ ] Changes are reflected in relevant documentation

## Testing

- [ ] Unit tests for each layer (routes, controllers, services)
- [ ] Integration tests for API endpoints
- [ ] Edge cases and error conditions are tested
- [ ] Mocks are used appropriately for external dependencies