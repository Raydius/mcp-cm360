import { Request, Response } from 'express';
import { ExampleController } from '../../../src/api/controllers/exampleController';
import { ExampleService, Example } from '../../../src/api/services/exampleService';

// Mock the ExampleService
const mockExampleService = {
  getExamples: jest.fn(),
  getExampleById: jest.fn(),
  createExample: jest.fn(),
  updateExample: jest.fn(),
  deleteExample: jest.fn(),
  performExampleAction: jest.fn(),
} as unknown as ExampleService;

// Mock example data
const mockExamples: Example[] = [
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

describe('ExampleController', () => {
  let controller: ExampleController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Initialize controller with mock service
    controller = new ExampleController(mockExampleService);
    
    // Mock Express request, response, and next function
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('getAllExamples', () => {
    it('should return examples with pagination', async () => {
      // Setup
      const paginatedResponse = {
        items: mockExamples,
        total: 2,
        page: 0,
        limit: 10,
      };
      
      mockRequest.query = { page: '1', limit: '10' };
      mockExampleService.getExamples.mockResolvedValue(paginatedResponse);

      // Execute
      await controller.getAllExamples(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockExampleService.getExamples).toHaveBeenCalledWith({
        page: 0, // 0-based index internally
        limit: 10,
        sort: undefined,
        order: undefined,
      });
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: paginatedResponse,
      });
    });

    it('should handle service errors', async () => {
      // Setup
      const error = new Error('Service error');
      mockRequest.query = {};
      mockExampleService.getExamples.mockRejectedValue(error);

      // Execute
      await controller.getAllExamples(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getExampleById', () => {
    it('should return a single example by ID', async () => {
      // Setup
      const mockExample = mockExamples[0];
      mockRequest.params = { id: mockExample.id };
      mockExampleService.getExampleById.mockResolvedValue(mockExample);

      // Execute
      await controller.getExampleById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockExampleService.getExampleById).toHaveBeenCalledWith(mockExample.id);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockExample,
      });
    });

    it('should handle service errors when getting an example', async () => {
      // Setup
      const error = new Error('Example not found');
      mockRequest.params = { id: 'invalid-id' };
      mockExampleService.getExampleById.mockRejectedValue(error);

      // Execute
      await controller.getExampleById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createExample', () => {
    it('should create a new example', async () => {
      // Setup
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
      
      mockRequest.body = newExample;
      mockExampleService.createExample.mockResolvedValue(createdExample);

      // Execute
      await controller.createExample(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockExampleService.createExample).toHaveBeenCalledWith(newExample);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: createdExample,
      });
    });
  });

  describe('updateExample', () => {
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
      
      mockRequest.params = { id: exampleId };
      mockRequest.body = updateData;
      mockExampleService.updateExample.mockResolvedValue(updatedExample);

      // Execute
      await controller.updateExample(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockExampleService.updateExample).toHaveBeenCalledWith(exampleId, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedExample,
      });
    });
  });

  describe('deleteExample', () => {
    it('should delete an example', async () => {
      // Setup
      const exampleId = '1';
      mockRequest.params = { id: exampleId };
      mockExampleService.deleteExample.mockResolvedValue(undefined);

      // Execute
      await controller.deleteExample(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockExampleService.deleteExample).toHaveBeenCalledWith(exampleId);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe('performExampleAction', () => {
    it('should perform a custom action on an example', async () => {
      // Setup
      const exampleId = '1';
      const action = 'activate';
      const requestData = { reason: 'Testing' };
      const actionResult = { status: 'success', message: 'Example activated' };
      
      mockRequest.params = { id: exampleId, action };
      mockRequest.body = requestData;
      mockExampleService.performExampleAction.mockResolvedValue(actionResult);

      // Execute
      await controller.performExampleAction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockExampleService.performExampleAction).toHaveBeenCalledWith(
        exampleId,
        action,
        requestData
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: actionResult,
      });
    });
  });
});
