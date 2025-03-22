# Campaign Manager 360 MCP Server - Decision Log

This document tracks key architectural and technical decisions made during the development of the Campaign Manager 360 MCP Server.

## 2025-03-21 - Initial Project Structure

**Context:** Need to establish a clear and maintainable project structure for the CM360 MCP Server.

**Decision:** Adopted a modular structure with clear separation of concerns:
- `src/api`: REST API components (controllers, middlewares, routes, services)
- `src/config`: Configuration files
- `src/mcp`: MCP SDK implementation
- `src/server.ts`: Server entry point
- `src/app.ts`: Express application setup

**Rationale:** This structure:
1. Separates the MCP implementation from the REST API
2. Makes it easy to locate specific components
3. Follows standard Node.js/Express.js project conventions
4. Facilitates testing of individual components

**Implementation:** The structure is reflected in the project directory organization and import paths.

## 2025-03-21 - MCP Resource and Tool Design

**Context:** Need to design MCP resources and tools that provide access to CM360 functionality.

**Decision:** Implemented the following resources and tools:
- Resources:
  - Account: `cm360://accounts/{accountId}`
  - Campaigns: `cm360://accounts/{accountId}/campaigns`
  - Campaign: `cm360://accounts/{accountId}/campaigns/{campaignId}`
  - Reports: `cm360://accounts/{accountId}/reports`
- Tools:
  - get-campaign-performance: Get performance metrics for a campaign
  - create-campaign: Create a new campaign
  - update-campaign: Update an existing campaign

**Rationale:**
1. Resources provide read-only access to CM360 data
2. Tools provide actions that can modify data or perform complex operations
3. The design follows REST principles with clear resource paths
4. The implementation covers the most common CM360 operations

**Implementation:** Resources and tools are registered in the `registerResources` and `registerTools` methods in `src/mcp/mcpServer.ts`.

## 2025-03-21 - Authentication Strategy

**Context:** Need a secure way to authenticate with the Google Campaign Manager 360 API.

**Decision:** Use Google JWT authentication with service account credentials.

**Rationale:**
1. JWT authentication is the recommended approach for server-to-server authentication with Google APIs
2. Service accounts provide a secure way to authenticate without user interaction
3. The approach supports token caching and automatic token refresh
4. It's compatible with the CM360 API requirements

**Implementation:** Authentication is handled in the `getAccessToken` method in `src/mcp/mcpServer.ts`, using the Google Auth Library.

## 2025-03-21 - Error Handling Strategy

**Context:** Need a consistent approach to error handling throughout the application.

**Decision:** Implement a centralized error handling middleware for the REST API and standardized error responses for MCP tools.

**Rationale:**
1. Centralized error handling ensures consistent error responses
2. Standardized error formats make it easier for clients to handle errors
3. Detailed error logging helps with debugging
4. The approach separates error handling from business logic

**Implementation:** Error handling middleware in `src/api/middlewares/errorHandler.ts` and error responses in MCP tool implementations.

## 2025-03-21 - API Architecture Pattern

**Context:** Need a scalable and maintainable architecture for the REST API layer that integrates with the MCP client.

**Decision:** Implemented a layered architecture with clear separation of concerns:
1. Routes Layer: Defines endpoints and validation rules
2. Controller Layer: Handles HTTP requests/responses
3. Service Layer: Contains business logic
4. MCP Client: Communicates with external APIs

Each layer is implemented with dependency injection using factory functions.

**Rationale:**
1. Separation of concerns makes the code more maintainable
2. Dependency injection improves testability
3. Factory functions simplify component creation and wiring
4. The pattern is scalable for adding new endpoints
5. Clear boundaries between layers make it easier to understand the codebase
6. Consistent error handling across all layers

**Implementation:**
- Example route implementation: `src/api/routes/exampleRoutes.ts`
- Example controller: `src/api/controllers/exampleController.ts`
- Example service: `src/api/services/exampleService.ts`
- MCP client: `src/mcp/client.ts`

## 2025-03-21 - Strict Enforcement of API Architecture Pattern

**Context:** After analyzing the existing codebase, we identified a clear and effective API architecture pattern. To ensure consistency and maintainability as the project grows, we need to enforce strict adherence to this pattern.

**Decision:**
1. Mandate strict adherence to the established API architecture pattern for all existing and future code
2. Update documentation to clearly mark mandatory patterns and practices
3. Use the example implementation as a template for all new API endpoints
4. Require code reviews to verify compliance with the pattern

**Rationale:**
1. Consistency across the codebase improves maintainability
2. Standardized patterns reduce onboarding time for new developers
3. Clear separation of concerns improves testability
4. Dependency injection pattern facilitates unit testing
5. Consistent error handling improves reliability
6. Standardized validation improves security

**Implementation:**
1. Updated `systemPatterns.md` to clearly mark mandatory patterns
2. Added detailed guidelines for implementing new API endpoints
3. Emphasized the importance of following the established pattern
4. Provided clear examples and templates for each layer

