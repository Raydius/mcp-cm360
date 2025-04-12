# systemPatterns.md

## Architectural Patterns and Key Structures

### 1. Modular Handler Functions (src/cm360.ts)
- The codebase uses modular async handler functions for each CM360 API operation:
  - handleListAdvertisers
  - handleSelectAdvertiser
  - handleListCampaigns
  - handleListCreatives
  - handleListEventTags
- All handler functions are exported as named exports, not as properties of a single object.
- Each handler receives arguments and returns a standardized McpResponse object.
- A paginatedRequest utility function is used for handling paginated API responses.

### 2. Standardized Response Interfaces
- Interfaces such as CM360Response and McpResponse define the structure of API and internal responses, ensuring type safety and auditability.

### 3. Centralized Tool Registration
- The tools object in src/cm360.ts aggregates all available handler functions, exposing them for use by the MCP server.
- The MCP server exposes five tools: list-advertisers, select-advertiser, list-campaigns, list-creatives, and list-event-tags, each with a well-defined input schema.

### 4. Robust Error Handling (src/index.ts)
- Global process event handlers for uncaughtException and unhandledRejection ensure that unexpected errors are logged and managed gracefully.

### 5. Request Routing and Validation
- The server uses a setRequestHandler method with schema validation (CallToolRequestSchema) to route and validate incoming tool requests.

### 6. Asynchronous Server Startup
- The startServer function initializes the MCP server asynchronously, supporting scalable and non-blocking operation.

## Observations
- The codebase is organized for clarity, extensibility, and auditability, aligning with the project's stated goals.
- All core logic is encapsulated in well-defined modules and interfaces, supporting future growth and maintainability.
- The test suite is fully synchronized with the codebase and all tests are passing as of 2025-04-11.