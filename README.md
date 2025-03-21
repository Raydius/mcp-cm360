# MCP Server SDK Boilerplate

A comprehensive TypeScript and Node.js boilerplate for implementing the MCP Server SDK with REST API functionality. This boilerplate provides a solid foundation for building tools that access REST APIs and enables independent testing of the REST API.

## Features

- **TypeScript Support**: Fully typed codebase for improved developer experience
- **MCP Server SDK Integration**: Ready-to-use implementation of the MCP Server SDK
- **REST API Framework**: Complete Express.js REST API setup
- **Error Handling**: Robust error handling with standardized responses
- **Request Validation**: Input validation using express-validator
- **Logging**: Configured Winston logger for different environments
- **Testing**: Jest test setup for independent API testing
- **Environment Management**: Proper environment variable configuration

## Project Structure

```
mcp-server-sdk/
├── src/
│   ├── api/             # REST API components
│   │   ├── controllers/ # Request handlers
│   │   ├── middlewares/ # Express middlewares
│   │   ├── routes/      # API routes
│   │   └── services/    # Business logic services
│   ├── config/          # Configuration files
│   ├── mcp/             # MCP SDK implementation
│   ├── server.ts        # Server entry point
│   └── app.ts           # Express application setup
├── tests/               # Test files
├── .env.example         # Environment variables example
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── jest.config.js       # Jest configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository or use it as a template
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update the `.env` file with your MCP API key and other configuration.

### Development

Start the development server with hot reloading:

```bash
npm run dev
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Start Production Server

Run the compiled code:

```bash
npm start
```

### Testing

Run the tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Using the MCP Client

The MCP client provides a simple interface for making requests to the MCP API:

```typescript
import { createMCPClient } from './mcp/client';

// Create client with configuration
const mcpClient = createMCPClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.example.com/v1',
  timeout: 10000,
});

// Make API requests
async function getExamples() {
  try {
    const examples = await mcpClient.get('/examples', {
      params: { page: 0, limit: 10 }
    });
    return examples;
  } catch (error) {
    console.error('Failed to get examples:', error);
    throw error;
  }
}
```

## Testing the REST API Independently

You can test the REST API independently of the MCP Server using the provided test utilities:

```typescript
import { APITestHelper } from './tests/utils/testHelpers';
import request from 'supertest';
import express from 'express';
import { createExampleRouter } from './src/api/routes/exampleRoutes';

describe('Example API', () => {
  let app;
  let apiHelper;

  beforeEach(() => {
    // Create API test helper
    apiHelper = new APITestHelper();
    
    // Mock responses
    apiHelper.mockResponse('GET', '/examples', {
      items: [{ id: '1', name: 'Example 1' }],
      total: 1,
      page: 0,
      limit: 10,
    });
    
    // Setup Express app with mock client
    app = express();
    app.use(express.json());
    app.use('/api/v1/examples', createExampleRouter(apiHelper.getClient()));
  });

  it('should return examples', async () => {
    const response = await request(app).get('/api/v1/examples');
    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
  });
});
```

## Using a Real MCP API for Testing

You can also test against a real MCP API:

```typescript
import { createRealMCPClient } from './tests/utils/testHelpers';
import config from './src/config/environment';

describe('Real API Integration Tests', () => {
  let mcpClient;

  beforeAll(() => {
    // Create a real client using application config
    mcpClient = createRealMCPClient({
      apiKey: config.MCP_API_KEY,
      baseUrl: config.MCP_API_BASE_URL,
    });
  });

  it('should get examples from real API', async () => {
    const result = await mcpClient.get('/examples');
    expect(result).toBeDefined();
  });
});
```

## Customizing the Boilerplate

### Adding New API Endpoints

1. Create a new service in `src/api/services/`
2. Create a new controller in `src/api/controllers/`
3. Create new routes in `src/api/routes/`
4. Register the routes in `src/app.ts`

### Extending the MCP Client

To add custom functionality to the MCP client, modify or extend the `MCPClient` class in `src/mcp/client.ts`.

## Best Practices

- Keep environment variables in `.env` and reference them through the `config` object
- Use the logger instead of `console.log`
- Write tests for all new functionality
- Validate all user input using express-validator
- Handle errors properly and return standardized error responses

## License

ISC