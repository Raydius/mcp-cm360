import { Request, Response, NextFunction } from 'express';
import { AccountService } from '../services/accountService';
import { logger } from '../../config/logger';

/**
 * Account controller
 * Handles HTTP requests related to CM360 accounts
 */
export class AccountController {
  private service: AccountService;

  /**
   * Initialize the controller with the account service
   * @param service - Account service instance
   */
  constructor(service: AccountService) {
    this.service = service;
  }

  /**
   * Get a list of accounts
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  getAllAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse pagination parameters
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const sort = req.query.sort as string;
      const order = req.query.order as 'asc' | 'desc';

      // Get accounts from service
      const accounts = await this.service.getAccounts({
        page: page - 1, // Convert to 0-based for the API
        limit,
        sort,
        order,
      });

      // Send success response
      res.status(200).json({
        success: true,
        data: accounts,
      });
    } catch (error) {
      logger.error('Error getting accounts', { error });
      next(error);
    }
  };

  /**
   * Get a single account by ID
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  getAccountById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const account = await this.service.getAccountById(id);

      res.status(200).json({
        success: true,
        data: account,
      });
    } catch (error) {
      logger.error(`Error getting account: ${req.params.id}`, { error });
      next(error);
    }
  };
}

/**
 * Create an account controller instance
 * @param service - Account service
 * @returns Account controller instance
 */
export function createAccountController(service: AccountService): AccountController {
  return new AccountController(service);
}