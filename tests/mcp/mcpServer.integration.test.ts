import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import config from '../../src/config/environment';

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
      name: 'cm360-mcp-test',
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

describe('CM360 MCP Server Integration Tests', () => {
  let client: Client;

  beforeAll(async () => {
    // Create a client that connects to the CM360 MCP Server via stdio
    console.log('=== CM360 MCP Server Test ===');
    console.log('Testing server at:', `http://localhost:${config.PORT}/mcp/sse`);
    console.log('Using account ID:', config.CM360_ACCOUNT_ID);
    console.log('Using profile ID:', config.CM360_PROFILE_ID);
    console.log('=================================\n');

    client = await createStdioClient();
    console.log('✅ Connected to MCP server\n');
  }, 10000); // Increase timeout for server startup

  afterAll(async () => {
    // Close the client
    if (client) {
      await client.close();
      console.log('✅ Client closed successfully');
    }
  });

  test('should list all resources', async () => {
    const resources = await client.listResources();
    console.log('Available resources:');
    console.log(JSON.stringify(resources, null, 2));
    expect(resources).toBeDefined();
    expect(Array.isArray(resources.resources)).toBe(true);
  });

  test('should list all tools', async () => {
    const tools = await client.listTools();
    console.log('Available tools:');
    console.log(JSON.stringify(tools, null, 2));
    expect(tools).toBeDefined();
    expect(Array.isArray(tools.tools)).toBe(true);
  });

  test('should read account information', async () => {
    try {
      const accountResource = await client.readResource({
        uri: `cm360://accounts/${config.CM360_ACCOUNT_ID}`
      });
      console.log('Account information:');
      console.log(JSON.stringify(accountResource, null, 2));
      expect(accountResource).toBeDefined();
      expect(accountResource.contents).toBeDefined();
      expect(accountResource.contents.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('Failed to read account information:', error);
      throw error; // Re-throw to fail the test
    }
  });

  test('should list campaigns', async () => {
    const campaignsResource = await client.readResource({
      uri: `cm360://accounts/${config.CM360_ACCOUNT_ID}/campaigns`
    });
    console.log('Campaigns:');
    console.log(JSON.stringify(campaignsResource, null, 2));
    expect(campaignsResource).toBeDefined();
    expect(campaignsResource.contents).toBeDefined();
    expect(campaignsResource.contents.length).toBeGreaterThan(0);
    
    return campaignsResource;
  });

  test('should get campaign details and perform campaign operations', async () => {
    // First get campaigns to extract a campaign ID
    const campaignsResource = await client.readResource({
      uri: `cm360://accounts/${config.CM360_ACCOUNT_ID}/campaigns`
    });
    
    // Extract first campaign ID for subsequent tests
    let campaignId = null;
    try {
      const campaignsData = JSON.parse(campaignsResource.contents[0].text as string);
      if (campaignsData.campaigns && campaignsData.campaigns.length > 0) {
        campaignId = campaignsData.campaigns[0].id;
        console.log(`Found campaign ID for testing: ${campaignId}`);
      } else {
        console.log('No campaigns found for testing subsequent operations');
        return; // Skip the rest of the test
      }
    } catch (parseError) {
      console.error('Error parsing campaigns data:', parseError);
      return; // Skip the rest of the test
    }

    // Test getting campaign details
    if (campaignId) {
      // Get campaign details
      const campaignResource = await client.readResource({
        uri: `cm360://accounts/${config.CM360_ACCOUNT_ID}/campaigns/${campaignId}`
      });
      console.log('Campaign details:');
      console.log(JSON.stringify(campaignResource, null, 2));
      expect(campaignResource).toBeDefined();
      expect(campaignResource.contents).toBeDefined();
      expect(campaignResource.contents.length).toBeGreaterThan(0);

      // Get campaign performance
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      
      const startDate = threeMonthsAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      const endDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      const campaignPerformance = await client.callTool({
        name: 'get-campaign-performance',
        arguments: {
          campaignId,
          startDate,
          endDate
        }
      });
      console.log('Campaign performance:');
      console.log(JSON.stringify(campaignPerformance, null, 2));
      expect(campaignPerformance).toBeDefined();
      expect(campaignPerformance.content).toBeDefined();

      // Update campaign
      const updateResult = await client.callTool({
        name: 'update-campaign',
        arguments: {
          campaignId,
          name: `Test Campaign (Updated ${new Date().toISOString()})`
        }
      });
      console.log('Campaign update result:');
      console.log(JSON.stringify(updateResult, null, 2));
      expect(updateResult).toBeDefined();
      expect(updateResult.content).toBeDefined();
    }
  }, 30000); // Increase timeout for API calls

  test('should list reports', async () => {
    const reportsResource = await client.readResource({
      uri: `cm360://accounts/${config.CM360_ACCOUNT_ID}/reports`
    });
    console.log('Reports:');
    console.log(JSON.stringify(reportsResource, null, 2));
    expect(reportsResource).toBeDefined();
    expect(reportsResource.contents).toBeDefined();
    expect(reportsResource.contents.length).toBeGreaterThan(0);
  });

  // Optional test for creating a new campaign - commented out by default
  /*
  test('should create a new campaign', async () => {
    const advertiserId = '12345'; // Replace with a valid advertiser ID
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    const startDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const endDate = nextMonth.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    const newCampaign = await client.callTool({
      name: 'create-campaign',
      arguments: {
        name: `Test Campaign via MCP ${new Date().toISOString()}`,
        advertiserId,
        startDate,
        endDate
      }
    });
    console.log('New campaign:');
    console.log(JSON.stringify(newCampaign, null, 2));
    expect(newCampaign).toBeDefined();
    expect(newCampaign.content).toBeDefined();
  }, 15000); // Increase timeout for API call
  */
});