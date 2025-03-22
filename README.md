# Campaign Manager 360 MCP Server

A TypeScript and Node.js implementation of the Model Context Protocol (MCP) server for Google Campaign Manager 360 (CM360). This server provides programmatic access to CM360 data and functionality through the MCP protocol, allowing LLMs to interact with Campaign Manager 360.

## Features

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

4. Update the `.env` file with your MCP API key, Google API credentials, and other configuration.

### Setting Up Google API Credentials

To use the Campaign Manager 360 MCP Server, you need to set up Google API credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Campaign Manager 360 API (also known as DCM/DFA Reporting and Trafficking API)
4. Create a Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the service account details and click "Create"
   - Grant the service account the necessary roles (e.g., "Campaign Manager 360 API User")
   - Click "Done"

5. Create a Service Account Key:
   - Find your service account in the list and click on it
   - Go to the "Keys" tab
   - Click "Add Key" > "Create new key"
   - Select "JSON" as the key type and click "Create"
   - The key file will be downloaded to your computer
   - Store this file securely and set the path to this file in your `.env` file as GOOGLE_APPLICATION_CREDENTIALS

6. Get your CM360 Profile ID and Account ID:
   - You can find these in the Campaign Manager 360 UI
   - Or use the API to list available user profiles and accounts
   - Add these to your `.env` file

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

## Campaign Manager 360 MCP Server

The CM360 MCP Server implements the Model Context Protocol to provide access to Google Campaign Manager 360 data and functionality. It exposes resources and tools that can be used by LLMs to interact with CM360.

### Resources

The server exposes the following resources:

- **Account**: `cm360://accounts/{accountId}` - Get information about a CM360 account
- **Campaigns**: `cm360://accounts/{accountId}/campaigns` - List campaigns in an account
- **Campaign**: `cm360://accounts/{accountId}/campaigns/{campaignId}` - Get information about a specific campaign
- **Reports**: `cm360://accounts/{accountId}/reports` - List reports in an account

### Tools

The server provides the following tools:

- **get-campaign-performance**: Get performance metrics for a campaign
  - Parameters:
    - `campaignId`: ID of the campaign
    - `startDate`: Start date in YYYY-MM-DD format
    - `endDate`: End date in YYYY-MM-DD format
  
- **create-campaign**: Create a new campaign
  - Parameters:
    - `name`: Name of the campaign
    - `advertiserId`: ID of the advertiser
    - `startDate`: Start date in YYYY-MM-DD format
    - `endDate`: End date in YYYY-MM-DD format

- **update-campaign**: Update an existing campaign
  - Parameters:
    - `campaignId`: ID of the campaign
    - `name`: (Optional) New name for the campaign
    - `startDate`: (Optional) New start date in YYYY-MM-DD format
    - `endDate`: (Optional) New end date in YYYY-MM-DD format
    - `status`: (Optional) New status ('ACTIVE', 'ARCHIVED', or 'PAUSED')

### Using the MCP Server

The MCP server can be accessed through two transports:

1. **HTTP with SSE**: Access the server through HTTP endpoints
   - SSE Endpoint: `http://localhost:3000/mcp/sse`
   - Messages Endpoint: `http://localhost:3000/mcp/messages`

2. **stdio**: In development mode, the server also connects to stdio for command-line tools

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

## Examples

The `examples/` directory contains sample code demonstrating how to use the CM360 MCP Server:

- `cm360-client-example.ts`: Shows how to create an MCP client that connects to the CM360 MCP Server and uses its resources and tools

To run the example:

```bash
# Build the project first
npm run build

# Run the example
npx ts-node examples/cm360-client-example.ts
```

## Customizing the Server

### Adding New API Endpoints

1. Create a new service in `src/api/services/`
2. Create a new controller in `src/api/controllers/`
3. Create new routes in `src/api/routes/`
4. Register the routes in `src/app.ts`

### Adding New MCP Resources or Tools

To add new CM360 resources or tools:

1. Modify the `registerResources` or `registerTools` methods in `src/mcp/mcpServer.ts`
2. Follow the existing patterns for implementing resources and tools
3. Update the README.md documentation to reflect the new capabilities

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