import { MCPClient } from '../../mcp/client';
import { PaginationParams } from '../../mcp/types';
import { buildPaginationParams, formatPath } from '../../mcp/utils';

/**
 * Example data model
 */
export interface Example {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new example
 */
export interface CreateExampleInput {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}

/**
 * Input for updating an example
 */
export interface UpdateExampleInput {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

/**
 * Service for managing example resources
 */
export class ExampleService {
  private client: MCPClient;
  private readonly basePath = '/examples';

  /**
   * Initialize the example service with the MCP client
   * @param client - Initialized MCP client
   */
  constructor(client: MCPClient) {
    this.client = client;
  }

  /**
   * Get a list of examples with pagination
   * @param params - Pagination parameters
   * @returns Paginated list of examples
   */
  async getExamples(params: PaginationParams = {}): Promise<{
    items: Example[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryParams = buildPaginationParams(params);
    return this.client.get<{
      items: Example[];
      total: number;
      page: number;
      limit: number;
    }>(this.basePath, { params: queryParams });
  }

  /**
   * Get a single example by ID
   * @param id - Example ID
   * @returns Example object
   */
  async getExampleById(id: string): Promise<Example> {
    const path = formatPath(`${this.basePath}/:id`, { id });
    return this.client.get<Example>(path);
  }

  /**
   * Create a new example
   * @param data - Example data
   * @returns Created example
   */
  async createExample(data: CreateExampleInput): Promise<Example> {
    return this.client.post<Example>(this.basePath, data);
  }

  /**
   * Update an existing example
   * @param id - Example ID
   * @param data - Updated example data
   * @returns Updated example
   */
  async updateExample(id: string, data: UpdateExampleInput): Promise<Example> {
    const path = formatPath(`${this.basePath}/:id`, { id });
    return this.client.patch<Example>(path, data);
  }

  /**
   * Delete an example
   * @param id - Example ID
   * @returns Success response
   */
  async deleteExample(id: string): Promise<void> {
    const path = formatPath(`${this.basePath}/:id`, { id });
    return this.client.delete<void>(path);
  }

  /**
   * Perform a custom action on an example
   * @param id - Example ID
   * @param action - Action name
   * @param data - Action data
   * @returns Action result
   */
  async performExampleAction(id: string, action: string, data?: any): Promise<any> {
    const path = formatPath(`${this.basePath}/:id/:action`, { id, action });
    return this.client.post(path, data || {});
  }
}

/**
 * Create an example service instance
 * @param client - MCP client
 * @returns Example service instance
 */
export function createExampleService(client: MCPClient): ExampleService {
  return new ExampleService(client);
}