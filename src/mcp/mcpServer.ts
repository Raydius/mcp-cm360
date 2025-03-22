import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { logger } from '../config/logger';
import { createGoogleAuthService } from '../api/services/googleAuthService';
import { createCM360ResourceService } from '../api/services/cm360ResourceService';
import { createCM360ToolService } from '../api/services/cm360ToolService';

/**
 * CM360 MCP Server
 * Implements the Model Context Protocol server for Google Campaign Manager 360
 */
export class CM360McpServer {
  private server: McpServer;
  private googleAuthService: ReturnType<typeof createGoogleAuthService>;
  private resourceService: ReturnType<typeof createCM360ResourceService>;
  private toolService: ReturnType<typeof createCM360ToolService>;

  /**
   * Initialize the CM360 MCP Server
   */
  constructor() {
    // Create the MCP server
    this.server = new McpServer({
      name: 'CM360 MCP Server',
      version: '1.0.0',
    });

    // Initialize services
    this.googleAuthService = createGoogleAuthService();
    this.resourceService = createCM360ResourceService(this.googleAuthService);
    this.toolService = createCM360ToolService(this.googleAuthService);

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
      this.resourceService.getAccountResourceTemplate(),
      (uri, params) => this.resourceService.handleAccountResource(uri, { accountId: params.accountId as string })
    );

    // Campaigns resource
    this.server.resource(
      'campaigns',
      this.resourceService.getCampaignsResourceTemplate(),
      (uri, params) => this.resourceService.handleCampaignsResource(uri, { accountId: params.accountId as string })
    );

    // Campaign resource
    this.server.resource(
      'campaign',
      this.resourceService.getCampaignResourceTemplate(),
      (uri, params) => this.resourceService.handleCampaignResource(uri, {
        accountId: params.accountId as string,
        campaignId: params.campaignId as string
      })
    );

    // Reports resource
    this.server.resource(
      'reports',
      this.resourceService.getReportsResourceTemplate(),
      (uri, params) => this.resourceService.handleReportsResource(uri, { accountId: params.accountId as string })
    );
  }

  /**
   * Register CM360 tools
   */
  private registerTools(): void {
    // Get campaign performance tool
    this.server.tool(
      'get-campaign-performance',
      this.toolService.getCampaignPerformanceSchema(),
      (params) => this.toolService.handleCampaignPerformanceTool(params)
    );

    // Create campaign tool
    this.server.tool(
      'create-campaign',
      this.toolService.getCreateCampaignSchema(),
      (params) => this.toolService.handleCreateCampaignTool(params)
    );

    // Update campaign tool
    this.server.tool(
      'update-campaign',
      this.toolService.getUpdateCampaignSchema(),
      (params) => this.toolService.handleUpdateCampaignTool(params)
    );
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

  /**
   * Get the Google Auth service
   * @returns Google Auth service instance
   */
  public getGoogleAuthService(): ReturnType<typeof createGoogleAuthService> {
    return this.googleAuthService;
  }
}

/**
 * Create a CM360 MCP Server instance
 * @returns An initialized CM360 MCP Server
 */
export function createCM360McpServer(): CM360McpServer {
  return new CM360McpServer();
}