/**
 * MCP SDK Configuration options
 */
export interface MCPConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for the MCP API */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Optional headers to include with every request */
  headers?: Record<string, string>;
}

/**
 * Generic API response structure
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Error thrown by the MCP client
 */
export class MCPError extends Error {
  code: string;
  status?: number;
  details?: unknown;

  constructor(message: string, code: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Request options for MCP client methods
 */
export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}