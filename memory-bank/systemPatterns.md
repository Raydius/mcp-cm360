# systemPatterns.md

## Architectural Patterns and Key Structures

### 1. Modular Handler Functions (src/cm360.ts)
- The codebase uses modular async handler functions for each CM360 API operation:
  - handleListAdvertisers
  - handleSelectAdvertiser
  - handleListCampaigns
  - handleListCreatives
  - handleListCreativeGroups
  - handleListEventTags
- All handler functions are exported as named exports, not as properties of a single object.
- Each handler receives arguments and returns a standardized McpResponse object.
- A paginatedRequest utility function is used for handling paginated API responses.

### 2. Standardized Response Interfaces
- Interfaces such as CM360Response and McpResponse define the structure of API and internal responses, ensuring type safety and auditability.

### 3. Centralized Tool Registration
- The tools object in src/cm360.ts aggregates all available handler functions, exposing them for use by the MCP server.
- The MCP server exposes tools such as: list-advertisers, select-advertiser, list-campaigns, list-creatives, list-creative-groups, and list-event-tags, each with a well-defined input schema.

### 4. Robust Error Handling (src/index.ts)
- Global process event handlers for uncaughtException and unhandledRejection ensure that unexpected errors are logged and managed gracefully.

### 5. Request Routing and Validation
- The server uses a setRequestHandler method with schema validation (CallToolRequestSchema) to route and validate incoming tool requests.

### 6. Asynchronous Server Startup
- The startServer function initializes the MCP server asynchronously, supporting scalable and non-blocking operation.

---

## Pattern: Adding a New API Method and Test Integration

This pattern was established during the addition of support for the creativeGroups.list method. Follow these steps to add support for a new CM360 API method and ensure it is fully integrated and tested:

### Step-by-Step Process

1. **Schema Definition**
   - In `src/schemas.ts`, define a new Zod schema for the method's input parameters (e.g., `ListCreativeGroupsSchema`).

2. **Handler Implementation**
   - In `src/cm360.ts`, implement a new handler function (e.g., `handleListCreativeGroups`) following the async pattern:
     - Parse arguments using the schema.
     - Add any defaulting logic (e.g., use selectedAdvertiserId if none provided).
     - Construct the API endpoint URL.
     - Call `paginatedRequest` with the correct endpoint and key.
     - Return the result via `mcpReturnJSON`.

3. **Tool Registration**
   - In the tools array/object in `src/cm360.ts`, add a new entry for the method:
     - Set the `name`, `description`, and `inputSchema` (matching the new schema).

4. **Handler Export and Routing**
   - Ensure the new handler is exported from `src/cm360.ts`.
   - In `src/index.ts`, import the handler and add a new case in the request router (switch/case) to invoke it.

5. **Test Suite Integration**
   - In `tests/cm360.test.ts`, update the "tools" test to include the new method, verifying its registration and schema.
   - If direct handler tests exist, add/duplicate a test for the new handler, mocking API responses as needed.

6. **Verification**
   - Run the test suite to ensure all tests pass and the new method is covered.

### Notes
- This process ensures all new API methods are consistently implemented, discoverable, and tested.
- Use the creativeGroups.list implementation as a reference for future additions.

## Observations
- The codebase is organized for clarity, extensibility, and auditability, aligning with the project's stated goals.
- All core logic is encapsulated in well-defined modules and interfaces, supporting future growth and maintainability.
- The test suite is fully synchronized with the codebase and all tests are passing as of 2025-04-12.