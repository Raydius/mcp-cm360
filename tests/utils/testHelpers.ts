import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { createMCPClient, MCPClient } from '../../src/mcp/client';
import { MCPConfig } from '../../src/mcp/types';

/**
 * Creates a mock MCP client that returns predefined responses
 * @param mockResponses - Object mapping request patterns to mock responses
 * @returns A mock MCP client
 */
export function createMockMCPClient(
  mockResponses: Record<string, any> = {}
): MCPClient {
  // Create a basic mock client with default implementations
  const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as MCPClient;

  // Override with mock implementations
  for (const [path, response] of Object.entries(mockResponses)) {
    // Extract method and path pattern from the key
    const [method, pathPattern] = path.split(' ');
    
    // Map to corresponding client method
    const clientMethod = method.toLowerCase() as keyof typeof mockClient;
    
    if (typeof mockClient[clientMethod] === 'function') {
      // Override the method to return the mock response when path matches
      (mockClient[clientMethod] as jest.Mock).mockImplementation(
        (requestPath: string, ...args: any[]) => {
          // Check if the request path matches the pattern
          if (new RegExp(`^${pathPattern.replace(/:\w+/g, '[^/]+')}$`).test(requestPath)) {
            // Return mock response or a function that returns the response
            return typeof response === 'function' 
              ? Promise.resolve(response(...args))
              : Promise.resolve(response);
          }
          
          // If no matching pattern, return a generic error
          return Promise.reject(new Error(`No mock found for ${method} ${requestPath}`));
        }
      );
    }
  }

  return mockClient;
}

/**
 * Creates a real HTTP client for testing against a real API server
 * @param baseURL - Base URL for the API server
 * @param options - Additional options for the client
 * @returns Configured Axios instance
 */
export function createTestClient(
  baseURL: string,
  options: {
    apiKey?: string;
    timeout?: number;
    headers?: Record<string, string>;
  } = {}
): AxiosInstance {
  // Create Axios instance with base configuration
  const client = axios.create({
    baseURL,
    timeout: options.timeout || 5000,
    headers: {
      'Content-Type': 'application/json',
      ...(options.apiKey ? { 'Authorization': `Bearer ${options.apiKey}` } : {}),
      ...options.headers,
    },
  });

  // Add response transformation
  client.interceptors.response.use(
    (response) => {
      // Return just the data for successful responses
      return response.data;
    },
    (error) => {
      // Format error response
      if (error.response) {
        const formattedError = {
          code: error.response.data?.error?.code || 'API_ERROR',
          message: error.response.data?.error?.message || error.message,
          status: error.response.status,
          details: error.response.data?.error?.details,
        };
        
        return Promise.reject(formattedError);
      }
      
      // Handle network errors
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: error.message,
      });
    }
  );

  return client;
}

/**
 * Creates a real MCP client for testing against a running MCP API
 * @param config - MCP configuration
 * @returns Configured MCP client
 */
export function createRealMCPClient(config: MCPConfig): MCPClient {
  return createMCPClient(config);
}

/**
 * Test helper for running API tests against a real or mock server
 */
export class APITestHelper {
  private mockResponses: Record<string, any> = {};
  private _client?: MCPClient;

  /**
   * Add a mock response for a specific API call
   * @param method - HTTP method
   * @param path - API path (can include patterns like :id)
   * @param response - Mock response or function returning a response
   */
  mockResponse(method: string, path: string, response: any): APITestHelper {
    this.mockResponses[`${method.toUpperCase()} ${path}`] = response;
    return this;
  }

  /**
   * Get a real or mock MCP client based on configuration
   * @param useMock - Whether to use mock client or real client
   * @param config - MCP configuration (required for real client)
   */
  getClient(useMock: boolean = true, config?: MCPConfig): MCPClient {
    if (this._client) {
      return this._client;
    }

    if (useMock) {
      this._client = createMockMCPClient(this.mockResponses);
    } else if (config) {
      this._client = createRealMCPClient(config);
    } else {
      throw new Error('MCP configuration required for real client');
    }

    return this._client;
  }
}