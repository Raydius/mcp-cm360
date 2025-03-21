import { Request, Response, NextFunction } from 'express';
import { ExampleService } from '../services/exampleService';
import { logger } from '../../config/logger';

/**
 * Example resource controller
 * Handles HTTP requests related to example resources
 */
export class ExampleController {
  private service: ExampleService;

  /**
   * Initialize the controller with the example service
   * @param service - Example service instance
   */
  constructor(service: ExampleService) {
    this.service = service;
  }

  /**
   * Get a list of examples
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  getAllExamples = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse pagination parameters
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const sort = req.query.sort as string;
      const order = req.query.order as 'asc' | 'desc';

      // Get examples from service
      const examples = await this.service.getExamples({
        page: page - 1, // Convert to 0-based for the API
        limit,
        sort,
        order,
      });

      // Send success response
      res.status(200).json({
        success: true,
        data: examples,
      });
    } catch (error) {
      logger.error('Error getting examples', { error });
      next(error);
    }
  };

  /**
   * Get a single example by ID
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  getExampleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const example = await this.service.getExampleById(id);

      res.status(200).json({
        success: true,
        data: example,
      });
    } catch (error) {
      logger.error(`Error getting example: ${req.params.id}`, { error });
      next(error);
    }
  };

  /**
   * Create a new example
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  createExample = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const example = await this.service.createExample(req.body);

      res.status(201).json({
        success: true,
        data: example,
      });
    } catch (error) {
      logger.error('Error creating example', { error, body: req.body });
      next(error);
    }
  };

  /**
   * Update an existing example
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  updateExample = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const example = await this.service.updateExample(id, req.body);

      res.status(200).json({
        success: true,
        data: example,
      });
    } catch (error) {
      logger.error(`Error updating example: ${req.params.id}`, { error, body: req.body });
      next(error);
    }
  };

  /**
   * Delete an example
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  deleteExample = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.deleteExample(id);

      res.status(204).send();
    } catch (error) {
      logger.error(`Error deleting example: ${req.params.id}`, { error });
      next(error);
    }
  };

  /**
   * Perform a custom action on an example
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  performExampleAction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, action } = req.params;
      const result = await this.service.performExampleAction(id, action, req.body);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(`Error performing action ${req.params.action} on example: ${req.params.id}`, {
        error,
        body: req.body,
      });
      next(error);
    }
  };
}

/**
 * Create an example controller instance
 * @param service - Example service
 * @returns Example controller instance
 */
export function createExampleController(service: ExampleService): ExampleController {
  return new ExampleController(service);
}