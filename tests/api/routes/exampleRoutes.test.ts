import request from 'supertest';
import express from 'express';
import { createExampleRouter } from '../../../src/api/routes/exampleRoutes';
import { MCPClient } from '../../../src/mcp/client';
import { errorHandler } from '../../../src/api/middlewares/errorHandler';

// Mock MCP client
const mockMCPClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
} as unknown as MCPClient;

// Sample data
const mockExamples = [
  {
    id: '1',
    name: 'Example 1',
    description: 'Test description 1',
    status: 'active',
    createdAt: '2025-03-21T12:00:00Z',
    updatedAt: '2025-03-21T12:00:00Z',
  },
  {
    id: '2',
    name: 'Example 2',
    description: 'Test description 2',
    status: 'inactive',
    createdAt: '2025-03-21T13:00:00Z',
    updatedAt: '2025-03-21T13:00:00Z',
  },
];

describe('Example Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a test Express app
    app = express();
    app.use(express.json());
    
    // Use the example router with our mock MCP client
    app.use('/api/v1/examples', createExampleRouter(mockMCPClient));
    
    // Add error handler
    app.use(errorHandler);
  });

  describe('GET /api/v1/examples', () => {
    it('should return a list of examples', async () => {
      // Mock the MCP client response
      const paginatedResponse = {
        items: mockExamples,
        total: 2,
        page: 0,
        limit: 10,
      };
      
      mockMCPClient.get.mockResolvedValue(paginatedResponse);

      // Make request
      const response = await request(app)
        .get('/api/v1/examples')
        .query({ page: 1, limit: 10 });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: paginatedResponse,
      });
      
      // Verify MCP client was called correctly
      expect(mockMCPClient.get).toHaveBeenCalledWith('/examples', {
        params: { page: 0, limit: 10 },
      });
    });

    it('should handle validation errors for invalid query parameters', async () => {
      // Make request with invalid parameters
      const response = await request(app)
        .get('/api/v1/examples')
        .query({ page: -1, limit: 'invalid' });

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle API errors', async () => {
      // Mock an error from the MCP client
      mockMCPClient.get.mockRejectedValue({
        code: 'API_ERROR',
        message: 'API error occurred',
        status: 500,
      });

      // Make request
      const response = await request(app)
        .get('/api/v1/examples');

      // Assertions
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('API_ERROR');
    });
  });

  describe('GET /api/v1/examples/:id', () => {
    it('should return a single example by ID', async () => {
      // Mock the MCP client response
      const example = mockExamples[0];
      mockMCPClient.get.mockResolvedValue(example);

      // Make request
      const response = await request(app)
        .get(`/api/v1/examples/${example.id}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: example,
      });
      
      // Verify MCP client was called correctly
      expect(mockMCPClient.get).toHaveBeenCalledWith(`/examples/${example.id}`);
    });
  });

  describe('POST /api/v1/examples', () => {
    it('should create a new example', async () => {
      // Mock input and output
      const newExample = {
        name: 'New Example',
        description: 'New description',
        status: 'active',
      };
      
      const createdExample = {
        id: '3',
        ...newExample,
        createdAt: '2025-03-21T14:00:00Z',
        updatedAt: '2025-03-21T14:00:00Z',
      };
      
      mockMCPClient.post.mockResolvedValue(createdExample);

      // Make request
      const response = await request(app)
        .post('/api/v1/examples')
        .send(newExample);

      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: createdExample,
      });
      
      // Verify MCP client was called correctly
      expect(mockMCPClient.post).toHaveBeenCalledWith('/examples', newExample);
    });

    it('should validate request body', async () => {
      // Make request with invalid data
      const response = await request(app)
        .post('/api/v1/examples')
        .send({ status: 'unknown' });

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/v1/examples/:id', () => {
    it('should update an existing example', async () => {
      // Setup
      const exampleId = '1';
      const updateData = {
        name: 'Updated Example',
        status: 'inactive',
      };
      
      const updatedExample = {
        ...mockExamples[0],
        ...updateData,
        updatedAt: '2025-03-21T15:00:00Z',
      };
      
      mockMCPClient.patch.mockResolvedValue(updatedExample);

      // Make request
      const response = await request(app)
        .patch(`/api/v1/examples/${exampleId}`)
        .send(updateData);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: updatedExample,
      });
      
      // Verify MCP client was called correctly
      expect(mockMCPClient.patch).toHaveBeenCalledWith(`/examples/${exampleId}`, updateData);
    });
  });

  describe('DELETE /api/v1/examples/:id', () => {
    it('should delete an example', async () => {
      // Setup
      const exampleId = '1';
      mockMCPClient.delete.mockResolvedValue(undefined);

      // Make request
      const response = await request(app)
        .delete(`/api/v1/examples/${exampleId}`);

      // Assertions
      expect(response.status).toBe(204);
      
      // Verify MCP client was called correctly
      expect(mockMCPClient.delete).toHaveBeenCalledWith(`/examples/${exampleId}`);
    });
  });

  describe('POST /api/v1/examples/:id/:action', () => {
    it('should perform a custom action on an example', async () => {
      // Setup
      const exampleId = '1';
      const action = 'activate';
      const requestData = { reason: 'Testing' };
      const actionResult = { status: 'success', message: 'Example activated' };
      
      mockMCPClient.post.mockResolvedValue(actionResult);

      // Make request
      const response = await request(app)
        .post(`/api/v1/examples/${exampleId}/${action}`)
        .send(requestData);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: actionResult,
      });
      
      // Verify MCP client was called correctly
      expect(mockMCPClient.post).toHaveBeenCalledWith(
        `/examples/${exampleId}/${action}`,
        requestData
      );
    });
  });
});
