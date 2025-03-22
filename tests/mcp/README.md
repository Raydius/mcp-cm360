# Testing the CM360 MCP Server

This directory contains tests for the Campaign Manager 360 MCP Server.

## MCP Server Tests

The `mcpServer.integration.test.ts` file contains Jest tests for all resources and tools provided by the CM360 MCP Server to verify they're working correctly.

### Prerequisites

Before running the tests, make sure:

1. You have set up your `.env` file with the correct Google API credentials
2. The CM360 API is enabled in your Google Cloud project
3. You have the necessary permissions to access CM360 data

### Running the Tests

Run the MCP tests using Jest:

```bash
npm run test:mcp
```

The tests use the stdio transport, which will automatically spawn a server process, so you don't need to have the server running separately.

### What the Tests Do

The test suite:

1. Connects to the MCP server
2. Lists all available resources and tools
3. Tests each resource by reading it:
   - Account information
   - Campaigns list
   - Campaign details
   - Reports list
4. Tests each tool by calling it with appropriate parameters:
   - Get campaign performance
   - Update campaign
   - (Optionally) Create a new campaign

### Troubleshooting

If you encounter errors:

1. Check your `.env` file to ensure all required variables are set correctly
2. Verify that your Google API credentials are valid and have the necessary permissions
3. Check that the CM360 API is enabled in your Google Cloud project
4. Look for error messages in the test output for specific issues

### Customizing the Tests

You can modify the `mcpServer.integration.test.ts` file to:

- Add or remove specific test cases
- Use different parameters for tool calls
- Add additional assertions for more thorough testing