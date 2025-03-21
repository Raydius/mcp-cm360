import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { MCPConfig, APIResponse, MCPError, RequestOptions } from './types';
import { logger } from '../config/logger';

/**
 * MCP Server SDK Client
 * Handles communication with the MCP API service
 */
export class MCPClient {
  private client: AxiosInstance;
  private config: MCPConfig;

  /**
   * Initialize the MCP client with configuration
   * @param config - The configuration for connecting to the MCP API
   */
  constructor(config: MCPConfig) {
    this.config = {
      ...config,
      timeout: config.timeout || 10000,
    };

    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...this.config.headers,
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use((config) => {
      logger.debug('Outgoing request', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        headers: this.sanitizeHeaders(config.headers || {}),
      });
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Response received', {
          status: response.status,
          url: response.config.url,
          data: this.truncateResponseData(response.data),
        });
        return response;
      },
      (error: AxiosError) => {
        this.handleAxiosError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request to the MCP API
   * @param path - API endpoint path
   * @param options - Request options including query parameters
   * @returns Promise with the response data
   */
  public async get<T>(path: string, options?: RequestOptions): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        params: options?.params,
        headers: options?.headers,
        timeout: options?.timeout,
      };

      const response = await this.client.get<APIResponse<T>>(path, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a POST request to the MCP API
   * @param path - API endpoint path
   * @param data - The data to send in the request body
   * @param options - Request options
   * @returns Promise with the response data
   */
  public async post<T>(path: string, data: unknown, options?: RequestOptions): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: options?.headers,
        params: options?.params,
        timeout: options?.timeout,
      };

      const response = await this.client.post<APIResponse<T>>(path, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a PUT request to the MCP API
   * @param path - API endpoint path
   * @param data - The data to send in the request body
   * @param options - Request options
   * @returns Promise with the response data
   */
  public async put<T>(path: string, data: unknown, options?: RequestOptions): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: options?.headers,
        params: options?.params,
        timeout: options?.timeout,
      };

      const response = await this.client.put<APIResponse<T>>(path, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a PATCH request to the MCP API
   * @param path - API endpoint path
   * @param data - The data to send in the request body
   * @param options - Request options
   * @returns Promise with the response data
   */
  public async patch<T>(path: string, data: unknown, options?: RequestOptions): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: options?.headers,
        params: options?.params,
        timeout: options?.timeout,
      };

      const response = await this.client.patch<APIResponse<T>>(path, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a DELETE request to the MCP API
   * @param path - API endpoint path
   * @param options - Request options
   * @returns Promise with the response data
   */
  public async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        headers: options?.headers,
        params: options?.params,
        timeout: options?.timeout,
      };

      const response = await this.client.delete<APIResponse<T>>(path, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process successful API responses
   * @param response - The axios response object
   * @returns The data from the response
   * @private
   */
  private handleResponse<T>(response: AxiosResponse<APIResponse<T>>): T {
    const { data } = response;

    // Check if response indicates an error
    if (!data.success) {
      throw new MCPError(
        data.error?.message || 'Unknown API error',
        data.error?.code || 'UNKNOWN_ERROR',
        response.status,
        data.error?.details
      );
    }

    // Return data or an empty object if no data was provided
    return data.data as T;
  }

  /**
   * Process and transform API errors
   * @param error - The caught error
   * @returns A standardized MCPError
   * @private
   */
  private handleError(error: unknown): MCPError {
    if (error instanceof MCPError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;

      // API returned an error response
      if (response) {
        const status = response.status;
        const errorData = response.data as APIResponse<unknown>;
        
        return new MCPError(
          errorData.error?.message || `API Error: ${status}`,
          errorData.error?.code || 'API_ERROR',
          status,
          errorData.error?.details
        );
      }

      // Request was made but no response received
      if (request) {
        return new MCPError(
          'No response received from API',
          'CONNECTION_ERROR',
          undefined
        );
      }

      // Error setting up the request
      return new MCPError(
        `Request setup failed: ${message}`,
        'REQUEST_SETUP_ERROR',
        undefined
      );
    }

    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new MCPError(
      `Unexpected error: ${errorMessage}`,
      'UNEXPECTED_ERROR',
      undefined,
      error
    );
  }

  /**
   * Log Axios errors in a standardized format
   * @param error - The axios error to handle
   * @private
   */
  private handleAxiosError(error: AxiosError): void {
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      logger.error('API Error Response', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      logger.error('API No Response', {
        request: error.request,
        url: error.config?.url,
      });
    } else {
      // Something happened in setting up the request
      logger.error('API Request Setup Error', {
        message: error.message,
        url: error.config?.url,
      });
    }
  }

  /**
   * Remove sensitive information from headers for logging
   * @param headers - Headers to sanitize
   * @returns Sanitized headers
   * @private
   */
  private sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...headers };
    
    // Remove or mask sensitive headers
    if (sanitized.Authorization) {
      sanitized.Authorization = 'Bearer [REDACTED]';
    }
    
    if (sanitized['X-API-Key']) {
      sanitized['X-API-Key'] = '[REDACTED]';
    }
    
    return sanitized;
  }

  /**
   * Truncate response data for logging to prevent large logs
   * @param data - Response data to truncate
   * @returns Truncated data for logging
   * @private
   */
  private truncateResponseData(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    // For arrays, show length and first few items
    if (Array.isArray(data)) {
      const length = data.length;
      if (length <= 3) {
        return data;
      }
      return {
        _type: 'Array',
        length,
        preview: data.slice(0, 3),
        _truncated: true,
      };
    }

    // For objects, keep a limited set of keys
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj);
    
    if (keys.length <= 10) {
      return obj;
    }

    const truncated: Record<string, unknown> = {};
    keys.slice(0, 10).forEach(key => {
      truncated[key] = obj[key];
    });

    return {
      ...truncated,
      _truncated: true,
      _totalKeys: keys.length,
    };
  }
}

/**
 * Create an MCP client instance with the provided configuration
 * @param config - The configuration for connecting to the MCP API
 * @returns An initialized MCP client
 */
export function createMCPClient(config: MCPConfig): MCPClient {
  return new MCPClient(config);
}