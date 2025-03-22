import { CM360McpServer } from '../../src/mcp/mcpServer';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Mock the dependencies
jest.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  return {
    McpServer: jest.fn().mockImplementation(() => ({
      resource: jest.fn(),
      tool: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

jest.mock('google-auth-library', () => {
  return {
    GoogleAuth: jest.fn().mockImplementation(() => ({
      getClient: jest.fn().mockResolvedValue({
        getAccessToken: jest.fn().mockResolvedValue({ token: 'mock-token' }),
      }),
    })),
    JWT: jest.fn(),
  };
});

jest.mock('axios');

describe('CM360McpServer', () => {
  let cm360McpServer: CM360McpServer;
  let mockServer: any;

  beforeEach(() => {
    jest.clearAllMocks();
    cm360McpServer = new CM360McpServer();
    mockServer = (McpServer as jest.Mock).mock.results[0].value;
  });

  describe('Resource Registration', () => {
    it('should register all required resources', () => {
      // Verify that the resource method was called for each resource
      expect(mockServer.resource).toHaveBeenCalledTimes(4);
      
      // Check for account resource
      expect(mockServer.resource).toHaveBeenCalledWith(
        'account',
        expect.anything(),
        expect.any(Function)
      );
      
      // Check for campaigns resource
      expect(mockServer.resource).toHaveBeenCalledWith(
        'campaigns',
        expect.anything(),
        expect.any(Function)
      );
      
      // Check for campaign resource
      expect(mockServer.resource).toHaveBeenCalledWith(
        'campaign',
        expect.anything(),
        expect.any(Function)
      );
      
      // Check for reports resource
      expect(mockServer.resource).toHaveBeenCalledWith(
        'reports',
        expect.anything(),
        expect.any(Function)
      );
    });
  });

  describe('Tool Registration', () => {
    it('should register all required tools', () => {
      // Verify that the tool method was called for each tool
      expect(mockServer.tool).toHaveBeenCalledTimes(3);
      
      // Check for get-campaign-performance tool
      expect(mockServer.tool).toHaveBeenCalledWith(
        'get-campaign-performance',
        expect.anything(),
        expect.any(Function)
      );
      
      // Check for create-campaign tool
      expect(mockServer.tool).toHaveBeenCalledWith(
        'create-campaign',
        expect.anything(),
        expect.any(Function)
      );
      
      // Check for update-campaign tool
      expect(mockServer.tool).toHaveBeenCalledWith(
        'update-campaign',
        expect.anything(),
        expect.any(Function)
      );
    });
  });

  describe('Connection Methods', () => {
    it('should connect to stdio transport', async () => {
      await cm360McpServer.connectStdio();
      expect(mockServer.connect).toHaveBeenCalledTimes(1);
    });

    it('should connect to SSE transport', async () => {
      const mockRes = {};
      const mockMessagesEndpoint = '/mcp/messages';
      
      await cm360McpServer.connectSSE(mockRes, mockMessagesEndpoint);
      expect(mockServer.connect).toHaveBeenCalledTimes(1);
    });
  });
});