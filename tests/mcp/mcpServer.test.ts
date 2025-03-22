import { CM360McpServer } from '../../src/mcp/mcpServer';
import axios from 'axios';
import { GoogleAuth, JWT } from 'google-auth-library';

// Mock dependencies
jest.mock('axios');
jest.mock('google-auth-library');
jest.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  return {
    McpServer: jest.fn().mockImplementation(() => {
      return {
        resource: jest.fn(),
        tool: jest.fn(),
        connect: jest.fn().mockResolvedValue(undefined),
      };
    }),
    ResourceTemplate: jest.fn().mockImplementation((template) => template),
  };
});
jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => {
  return {
    StdioServerTransport: jest.fn().mockImplementation(() => ({})),
  };
});
jest.mock('@modelcontextprotocol/sdk/server/sse.js', () => {
  return {
    SSEServerTransport: jest.fn().mockImplementation(() => ({})),
  };
});
jest.mock('../../src/config/logger', () => {
  return {
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    },
  };
});

describe('CM360McpServer', () => {
  let server: CM360McpServer;
  
  beforeEach(() => {
    // Mock GoogleAuth implementation
    (GoogleAuth as unknown as jest.Mock).mockImplementation(() => {
      return {
        getClient: jest.fn().mockResolvedValue({
          getAccessToken: jest.fn().mockResolvedValue({
            token: 'mock-access-token',
            res: {
              data: {
                expires_in: 3600,
              },
            },
          }),
        }),
      };
    });
    
    // Mock axios implementation
    (axios.get as jest.Mock).mockResolvedValue({
      data: { mockData: true },
    });
    (axios.post as jest.Mock).mockResolvedValue({
      data: { id: 'mock-id', mockData: true },
    });
    
    // Create server instance
    server = new CM360McpServer();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('connectStdio', () => {
    it('should connect to stdio transport', async () => {
      await server.connectStdio();
      
      // Verify that the server was connected
      expect(server['server'].connect).toHaveBeenCalled();
    });
    
    it('should handle connection errors', async () => {
      // Mock connection error
      server['server'].connect = jest.fn().mockRejectedValue(new Error('Connection error'));
      
      await expect(server.connectStdio()).rejects.toThrow('Connection error');
    });
  });
  
  describe('connectSSE', () => {
    it('should connect to SSE transport', async () => {
      const mockRes = {};
      const mockEndpoint = '/messages';
      
      await server.connectSSE(mockRes, mockEndpoint);
      
      // Verify that the server was connected
      expect(server['server'].connect).toHaveBeenCalled();
    });
  });
  
  describe('getAccessToken', () => {
    it('should return cached token if valid', async () => {
      // Set up a valid token
      server['accessToken'] = 'cached-token';
      server['tokenExpiry'] = Date.now() + 3600000; // Valid for 1 hour
      
      const token = await server['getAccessToken']();
      
      expect(token).toBe('cached-token');
      expect(server['googleAuth'].getClient).not.toHaveBeenCalled();
    });
    
    it('should get a new token if expired', async () => {
      // Set up an expired token
      server['accessToken'] = 'expired-token';
      server['tokenExpiry'] = Date.now() - 1000; // Expired
      
      const token = await server['getAccessToken']();
      
      expect(token).toBe('mock-access-token');
      expect(server['googleAuth'].getClient).toHaveBeenCalled();
    });
    
    it('should handle token retrieval errors', async () => {
      // Mock token retrieval error
      server['googleAuth'].getClient = jest.fn().mockRejectedValue(new Error('Token error'));
      
      await expect(server['getAccessToken']()).rejects.toThrow('Token error');
    });
  });
});