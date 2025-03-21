import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

/**
 * Example of using the CM360 MCP Server with the MCP TypeScript SDK client
 */
async function main() {
  try {
    // Create a client that connects to the CM360 MCP Server via stdio
    // This is useful for command-line tools
    const stdioClient = await createStdioClient();
    
    // Example: List resources
    console.log('Available resources:');
    const resources = await stdioClient.listResources();
    console.log(resources);
    
    // Example: Read account information
    console.log('\nAccount information:');
    const accountId = '12345'; // Replace with your actual account ID
    const accountResource = await stdioClient.readResource({
      uri: `cm360://accounts/${accountId}`
    });
    console.log(accountResource);
    
    // Example: List campaigns
    console.log('\nCampaigns:');
    const campaignsResource = await stdioClient.readResource({
      uri: `cm360://accounts/${accountId}/campaigns`
    });
    console.log(campaignsResource);
    
    // Example: Get campaign performance
    console.log('\nCampaign performance:');
    const campaignId = '67890'; // Replace with your actual campaign ID
    const campaignPerformance = await stdioClient.callTool({
      name: 'get-campaign-performance',
      arguments: {
        campaignId,
        startDate: '2025-01-01',
        endDate: '2025-03-21'
      }
    });
    console.log(campaignPerformance);
    
    // Close the stdio client
    await stdioClient.close();
    
    // Create a client that connects to the CM360 MCP Server via HTTP/SSE
    // This is useful for web applications
    const sseClient = await createSSEClient();
    
    // Example: Create a new campaign
    console.log('\nCreating a new campaign:');
    const advertiserId = '54321'; // Replace with your actual advertiser ID
    const newCampaign = await sseClient.callTool({
      name: 'create-campaign',
      arguments: {
        name: 'Test Campaign via MCP',
        advertiserId,
        startDate: '2025-04-01',
        endDate: '2025-04-30'
      }
    });
    console.log(newCampaign);
    
    // Close the SSE client
    await sseClient.close();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Create an MCP client that connects to the CM360 MCP Server via stdio
 */
async function createStdioClient() {
  // Create a transport that spawns the server process
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/server.js'],
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });
  
  // Create the client
  const client = new Client(
    {
      name: 'cm360-client-example',
      version: '1.0.0'
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      }
    }
  );
  
  // Connect to the transport
  await client.connect(transport);
  
  return client;
}

/**
 * Create an MCP client that connects to the CM360 MCP Server via HTTP/SSE
 *
 * Note: The actual implementation may vary depending on the specific version
 * of the MCP SDK you're using. Consult the SDK documentation for details.
 */
async function createSSEClient() {
  // This is a simplified example - in a real application, you would
  // use the appropriate SSEClientTransport constructor based on the SDK version
  
  // For demonstration purposes only - replace with actual implementation
  console.log('Creating SSE client (implementation details may vary)');
  
  // Create the client
  const client = new Client(
    {
      name: 'cm360-client-example',
      version: '1.0.0'
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      }
    }
  );
  
  // In a real implementation, you would connect to the transport
  // await client.connect(transport);
  
  // For this example, we'll just return the client without connecting
  // In a real application, you would need to implement this properly
  return client;
}

// Run the example
main().catch(console.error);