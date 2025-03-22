# Testing the Campaign Manager 360 MCP Server

This document provides comprehensive guidance on testing the CM360 MCP Server to ensure it's working correctly.

## Testing Options

There are several ways to test the CM360 MCP Server:

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test the interaction between components
3. **MCP Server Tests**: Test the MCP server's resources and tools
4. **End-to-End Tests**: Test the complete flow from client to server to CM360 API

## 1. Running Unit Tests

Unit tests are located in the `tests` directory and can be run with Jest:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 2. Testing the MCP Server

### 2.1 Simple MCP Server Test

The `tests/mcp/mcpServer.simple.test.ts` file contains tests that verify the MCP server correctly registers all resources and tools. This test uses mocks and doesn't make actual API calls, so it's fast and doesn't require valid credentials.

```bash
# Run just the simple MCP server test
npx jest tests/mcp/mcpServer.simple.test.ts
```

### 2.2 Comprehensive MCP Server Tests

For more comprehensive tests that actually connect to the MCP server and test all resources and tools, use the Jest tests in `tests/mcp/mcpServer.integration.test.ts`:

```bash
# Run the comprehensive MCP server tests
npm run test:mcp
```

These tests:
- Connect to the MCP server
- List all available resources and tools
- Test each resource by reading it
- Test each tool by calling it with appropriate parameters
- Include proper Jest assertions to verify correct behavior

See `tests/mcp/README.md` for more details on these tests.

## 3. Manual Testing with the Example Client

The `examples/cm360-client-example.ts` file provides an example of how to use the MCP client to connect to the server and use its resources and tools. You can run this example to manually test the server:

```bash
# Build the project first
npm run build

# Run the example
npx ts-node examples/cm360-client-example.ts
```

Make sure to update the example with your actual account ID, campaign ID, and advertiser ID before running it.

## 4. Testing with curl

You can also test the MCP server's HTTP endpoints directly using curl:

```bash
# Test the SSE endpoint
curl -v http://localhost:3000/mcp/sse

# Test the health endpoint
curl http://localhost:3000/health
```

## 5. Testing in Production

Before deploying to production, it's recommended to run all tests:

```bash
# Run all tests
npm test

# Run the MCP server test
npm run test:mcp
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Check that your Google API credentials are valid
   - Verify that the service account has the necessary permissions
   - Make sure the CM360 API is enabled in your Google Cloud project

2. **Connection Issues**:
   - Ensure the server is running
   - Check that the port is not blocked by a firewall
   - Verify that the server is listening on the expected port

3. **Resource/Tool Not Found**:
   - Check that the resource or tool is registered in `src/mcp/mcpServer.ts`
   - Verify that the URI or tool name is correct

### Debugging

For more detailed logging, set the `LOG_LEVEL` environment variable to `debug`:

```bash
LOG_LEVEL=debug npm start
```

## Adding New Tests

When adding new resources or tools to the MCP server, make sure to:

1. Add unit tests for the new functionality
2. Update the `tests/mcp/mcpServer.simple.test.ts` file to test the registration of the new resource or tool
3. Update the `tests/mcp-test.ts` file to test the new resource or tool
4. Update the example client to demonstrate the use of the new resource or tool