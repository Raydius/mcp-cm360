import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import { logger } from '../config/logger';
import config from '../config/environment';
import axios from 'axios';
import { GoogleAuth, JWT } from 'google-auth-library';

/**
 * CM360 MCP Server
 * Implements the Model Context Protocol server for Google Campaign Manager 360
 */
export class CM360McpServer {
  private server: McpServer;
  private googleAuth: GoogleAuth;
  private jwtClient: JWT | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Initialize the CM360 MCP Server
   */
  constructor() {
    // Create the MCP server
    this.server = new McpServer({
      name: 'CM360 MCP Server',
      version: '1.0.0',
    });

    // Initialize Google Auth client
    this.googleAuth = new GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/dfareporting',
        'https://www.googleapis.com/auth/dfatrafficking'
      ]
    });

    // Register resources and tools
    this.registerResources();
    this.registerTools();
  }

  /**
   * Register CM360 resources
   */
  private registerResources(): void {
    // Account resource
    this.server.resource(
      'account',
      new ResourceTemplate('cm360://accounts/{accountId}', { list: undefined }),
      async (uri, { accountId }) => {
        try {
          const token = await this.getAccessToken();
          const response = await axios.get(
            `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${config.CM360_PROFILE_ID}/accounts/${accountId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return {
            contents: [{
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify(response.data, null, 2),
            }],
          };
        } catch (error) {
          logger.error('Error fetching account', { error, accountId });
          throw error;
        }
      }
    );

    // Campaigns resource
    this.server.resource(
      'campaigns',
      new ResourceTemplate('cm360://accounts/{accountId}/campaigns', { list: undefined }),
      async (uri, { accountId }) => {
        try {
          const token = await this.getAccessToken();
          const response = await axios.get(
            `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${config.CM360_PROFILE_ID}/campaigns`,
            {
              params: {
                accountId,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return {
            contents: [{
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify(response.data, null, 2),
            }],
          };
        } catch (error) {
          logger.error('Error fetching campaigns', { error, accountId });
          throw error;
        }
      }
    );

    // Campaign resource
    this.server.resource(
      'campaign',
      new ResourceTemplate('cm360://accounts/{accountId}/campaigns/{campaignId}', { list: undefined }),
      async (uri, { accountId, campaignId }) => {
        try {
          const token = await this.getAccessToken();
          const response = await axios.get(
            `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${config.CM360_PROFILE_ID}/campaigns/${campaignId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return {
            contents: [{
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify(response.data, null, 2),
            }],
          };
        } catch (error) {
          logger.error('Error fetching campaign', { error, accountId, campaignId });
          throw error;
        }
      }
    );

    // Reports resource
    this.server.resource(
      'reports',
      new ResourceTemplate('cm360://accounts/{accountId}/reports', { list: undefined }),
      async (uri, { accountId }) => {
        try {
          const token = await this.getAccessToken();
          const response = await axios.get(
            `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${config.CM360_PROFILE_ID}/reports`,
            {
              params: {
                accountId,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return {
            contents: [{
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify(response.data, null, 2),
            }],
          };
        } catch (error) {
          logger.error('Error fetching reports', { error, accountId });
          throw error;
        }
      }
    );
  }

  /**
   * Register CM360 tools
   */
  private registerTools(): void {
    // Get campaign performance tool
    this.server.tool(
      'get-campaign-performance',
      {
        campaignId: z.string().or(z.number()),
        startDate: z.string(),
        endDate: z.string(),
      },
      async ({ campaignId, startDate, endDate }) => {
        try {
          const token = await this.getAccessToken();
          
          // Create a report
          const reportResponse = await axios.post(
            `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${config.CM360_PROFILE_ID}/reports`,
            {
              type: 'STANDARD',
              name: `Campaign Performance ${campaignId} ${new Date().toISOString()}`,
              format: 'CSV',
              criteria: {
                dateRange: {
                  startDate,
                  endDate,
                },
                dimensions: [
                  { name: 'date' },
                  { name: 'campaign' },
                ],
                metricNames: [
                  'impressions',
                  'clicks',
                  'totalConversions',
                  'clickRate',
                ],
              },
              delivery: {
                emailOwner: false,
              },
              schedule: {
                active: false,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          const reportId = reportResponse.data.id;

          // Run the report
          await axios.post(
            `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${config.CM360_PROFILE_ID}/reports/${reportId}/run`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Wait for the report to complete (simplified for example)
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Get the report file
          const fileResponse = await axios.get(
            `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${config.CM360_PROFILE_ID}/reports/${reportId}/files`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!fileResponse.data.items || fileResponse.data.items.length === 0) {
            return {
              content: [{
                type: 'text',
                text: 'Report is still processing. Please try again later.',
              }],
            };
          }

          const fileId = fileResponse.data.items[0].id;

          // Get the report data
          const reportDataResponse = await axios.get(
            `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${config.CM360_PROFILE_ID}/reports/${reportId}/files/${fileId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return {
            content: [{
              type: 'text',
              text: JSON.stringify(reportDataResponse.data, null, 2),
            }],
          };
        } catch (error) {
          logger.error('Error getting campaign performance', { error, campaignId });
          return {
            content: [{
              type: 'text',
              text: `Error getting campaign performance: ${error instanceof Error ? error.message : String(error)}`,
            }],
            isError: true,
          };
        }
      }
    );

    // Create campaign tool
    this.server.tool(
      'create-campaign',
      {
        name: z.string(),
        advertiserId: z.string().or(z.number()),
        startDate: z.string(),
        endDate: z.string(),
      },
      async ({ name, advertiserId, startDate, endDate }) => {
        try {
          const token = await this.getAccessToken();
          
          const response = await axios.post(
            `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${config.CM360_PROFILE_ID}/campaigns`,
            {
              name,
              advertiserId,
              startDate,
              endDate,
              accountId: config.CM360_ACCOUNT_ID,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          return {
            content: [{
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            }],
          };
        } catch (error) {
          logger.error('Error creating campaign', { error, name, advertiserId });
          return {
            content: [{
              type: 'text',
              text: `Error creating campaign: ${error instanceof Error ? error.message : String(error)}`,
            }],
            isError: true,
          };
        }
      }
    );

    // Update campaign tool
    this.server.tool(
      'update-campaign',
      {
        campaignId: z.string().or(z.number()),
        name: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.enum(['ACTIVE', 'ARCHIVED', 'PAUSED']).optional(),
      },
      async ({ campaignId, name, startDate, endDate, status }) => {
        try {
          const token = await this.getAccessToken();
          
          // First get the current campaign
          const getCampaignResponse = await axios.get(
            `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${config.CM360_PROFILE_ID}/campaigns/${campaignId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const campaign = getCampaignResponse.data;
          
          // Update the fields
          if (name) campaign.name = name;
          if (startDate) campaign.startDate = startDate;
          if (endDate) campaign.endDate = endDate;
          if (status) campaign.status = status;

          // Send the update
          const updateResponse = await axios.put(
            `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${config.CM360_PROFILE_ID}/campaigns`,
            campaign,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          return {
            content: [{
              type: 'text',
              text: JSON.stringify(updateResponse.data, null, 2),
            }],
          };
        } catch (error) {
          logger.error('Error updating campaign', { error, campaignId });
          return {
            content: [{
              type: 'text',
              text: `Error updating campaign: ${error instanceof Error ? error.message : String(error)}`,
            }],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Get a valid access token
   * @returns Promise with the access token
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    
    // If token is still valid, return it
    if (this.accessToken && this.tokenExpiry > now + 60000) {
      return this.accessToken;
    }
    
    try {
      // Initialize JWT client if not already done
      if (!this.jwtClient) {
        this.jwtClient = await this.googleAuth.getClient() as JWT;
      }
      
      // Get a new token
      const token = await this.jwtClient.getAccessToken();
      
      if (!token || !token.token) {
        throw new Error('Failed to get access token');
      }
      
      this.accessToken = token.token;
      
      // Set expiry (default to 1 hour if not provided)
      if (token.res && token.res.data && token.res.data.expires_in) {
        this.tokenExpiry = now + (token.res.data.expires_in * 1000);
      } else {
        this.tokenExpiry = now + 3600000; // 1 hour
      }
      
      return this.accessToken;
    } catch (error) {
      logger.error('Error getting access token', { error });
      throw error;
    }
  }

  /**
   * Connect the server to a stdio transport
   * @returns Promise that resolves when connected
   */
  public async connectStdio(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      logger.info('CM360 MCP Server connected to stdio transport');
    } catch (error) {
      logger.error('Error connecting CM360 MCP Server to stdio transport', { error });
      throw error;
    }
  }

  /**
   * Connect the server to an SSE transport
   * @param res - Express response object for SSE
   * @param messagesEndpoint - Endpoint for receiving messages
   * @returns Promise that resolves when connected
   */
  public async connectSSE(res: any, messagesEndpoint: string): Promise<void> {
    try {
      const transport = new SSEServerTransport(messagesEndpoint, res);
      await this.server.connect(transport);
      logger.info('CM360 MCP Server connected to SSE transport');
    } catch (error) {
      logger.error('Error connecting CM360 MCP Server to SSE transport', { error });
      throw error;
    }
  }

  /**
   * Handle a message from the client
   * @param req - Express request object
   * @param res - Express response object
   * @returns Promise that resolves when the message is handled
   */
  public async handleMessage(req: any, res: any): Promise<void> {
    try {
      // This assumes you're using the SSE transport
      // You'll need to implement this based on your transport
      // For example, with SSEServerTransport:
      // await transport.handlePostMessage(req, res);
      res.status(200).send('OK');
    } catch (error) {
      logger.error('Error handling message', { error });
      res.status(500).send('Error handling message');
    }
  }
}

/**
 * Create a CM360 MCP Server instance
 * @returns An initialized CM360 MCP Server
 */
export function createCM360McpServer(): CM360McpServer {
  return new CM360McpServer();
}