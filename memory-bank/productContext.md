# Campaign Manager 360 MCP Server - Product Context

## Project Overview

The Campaign Manager 360 MCP Server is a TypeScript and Node.js implementation of the Model Context Protocol (MCP) server for Google Campaign Manager 360 (CM360). This server provides programmatic access to CM360 data and functionality through the MCP protocol, allowing Large Language Models (LLMs) to interact with Campaign Manager 360.

## Project Goals

1. Provide a robust MCP server implementation for CM360
2. Enable LLMs to access and manipulate CM360 data
3. Implement a complete REST API framework for CM360 operations
4. Ensure proper authentication and security for Google API access
5. Maintain comprehensive testing and documentation
6. **Enforce consistent architectural patterns across the codebase**

## Technical Stack

- **Language**: TypeScript
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **MCP Implementation**: Model Context Protocol SDK
- **Authentication**: Google JWT Authentication
- **API Integration**: Campaign Manager 360 API
- **Testing**: Jest
- **Logging**: Winston

## Key Features

- **TypeScript Support**: Fully typed codebase for improved developer experience
- **MCP Server SDK Integration**: Implementation of the MCP Server using the TypeScript SDK
- **Campaign Manager 360 API**: Integration with Google Campaign Manager 360 API
- **REST API Framework**: Complete Express.js REST API setup
- **Error Handling**: Robust error handling with standardized responses
- **Request Validation**: Input validation using express-validator
- **Logging**: Configured Winston logger for different environments
- **Testing**: Jest test setup for independent API testing
- **Environment Management**: Proper environment variable configuration
- **JWT Authentication**: Google JWT authentication for CM360 API

## API Architecture Pattern (MANDATORY)

The project implements a layered architecture with clear separation of concerns that **MUST** be followed for all API implementations:

1. **Routes Layer**: Defines API endpoints, HTTP methods, and request validation
   - Uses express-validator for input validation
   - Manages dependency injection for controllers and services
   - Example: `src/api/routes/exampleRoutes.ts`

2. **Controller Layer**: Handles HTTP request/response cycle
   - Extracts and processes request data
   - Calls appropriate service methods
   - Formats API responses
   - Example: `src/api/controllers/exampleController.ts`

3. **Service Layer**: Contains business logic
   - Defines data models and interfaces
   - Communicates with external services via MCP client
   - Performs CRUD operations
   - Example: `src/api/services/exampleService.ts`

4. **MCP Client**: Handles communication with external APIs
   - Manages authentication
   - Formats requests and responses
   - Handles errors
   - Example: `src/mcp/client.ts`

This architecture is implemented using dependency injection with factory functions, making it highly testable and maintainable. **All developers MUST strictly adhere to this pattern when modifying existing code or adding new features.**

For detailed guidelines on implementing this pattern, see `memory-bank/systemPatterns.md`.

## MCP Server Architecture (MANDATORY)

The MCP server implementation follows a modular architecture with clear separation of concerns that **MUST** be followed for all MCP components:

For detailed guidelines on implementing this pattern, see `memory-bank/systemPatterns.md`.

## Project Structure

```
mcp-cm360/
├── src/
│   ├── api/             # REST API components
│   │   ├── controllers/ # Request handlers
│   │   ├── middlewares/ # Express middlewares
│   │   ├── routes/      # API routes
│   │   └── services/    # Business logic services
│   ├── config/          # Configuration files
│   ├── mcp/             # MCP SDK implementation
│   │   ├── client.ts    # MCP client
│   │   ├── mcpServer.ts # MCP server
│   │   ├── types.ts     # Type definitions
│   │   └── utils.ts     # Utility functions
│   ├── server.ts        # Server entry point
│   └── app.ts           # Express application setup
├── tests/               # Test files
├── examples/            # Example usage
├── memory-bank/         # Project memory and documentation
├── .env.example         # Environment variables example
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── jest.config.js       # Jest configuration
```

## MCP Resources and Tools

### Resources
- **Account**: `cm360://accounts/{accountId}` - Get information about a CM360 account
- **Campaigns**: `cm360://accounts/{accountId}/campaigns` - List campaigns in an account
- **Campaign**: `cm360://accounts/{accountId}/campaigns/{campaignId}` - Get information about a specific campaign
- **Reports**: `cm360://accounts/{accountId}/reports` - List reports in an account

### Tools
- **get-campaign-performance**: Get performance metrics for a campaign
- **create-campaign**: Create a new campaign
- **update-campaign**: Update an existing campaign

## Environment Requirements

The following environment variables are required:
- `MCP_API_KEY`: API key for MCP authentication
- `MCP_API_BASE_URL`: Base URL for MCP API
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to Google service account key file
- `CM360_PROFILE_ID`: Campaign Manager 360 profile ID

## Memory Bank Files

The Memory Bank contains the following core files:

1. **productContext.md**: This file (current) - Project overview, goals, and technical details
2. **activeContext.md**: Current session context, recent changes, and active goals
3. **progress.md**: Work completed and next steps
4. **decisionLog.md**: Key decisions and their rationale
5. **systemPatterns.md**: Architectural patterns, design principles, and coding conventions
6. **apiDevelopmentGuide.md**: Step-by-step guide for adding new API endpoints
7. **codeReviewChecklist.md**: Checklist for verifying compliance with architecture patterns

Additional files may be created as needed to document specific aspects of the project.

## Development Guidelines

1. **Follow the API Architecture Pattern**: All API implementations MUST follow the layered architecture pattern described in `systemPatterns.md`.
2. **Follow the MCP Server Architecture Pattern**: All MCP components MUST follow the modular architecture pattern described in `systemPatterns.md`.
3. **Use Dependency Injection**: All components MUST use dependency injection to improve testability and maintainability.
4. **Implement Proper Validation**: All API endpoints MUST validate input data using express-validator.
5. **Handle Errors Consistently**: All components MUST follow the error handling strategy described in `systemPatterns.md`.
6. **Write Tests**: All components MUST have corresponding unit tests.
7. **Document Your Code**: All public APIs MUST be documented with JSDoc comments.
8. **Follow the Code Review Checklist**: All code changes MUST be reviewed against the checklist in `codeReviewChecklist.md`.