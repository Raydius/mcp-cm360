import { Request, Response, NextFunction } from 'express';
import { CampaignService } from '../services/campaignService';
import { logger } from '../../config/logger';

/**
 * Campaign controller
 * Handles HTTP requests related to CM360 campaigns
 */
export class CampaignController {
  private service: CampaignService;

  /**
   * Initialize the controller with the campaign service
   * @param service - Campaign service instance
   */
  constructor(service: CampaignService) {
    this.service = service;
  }

  /**
   * Get a list of campaigns
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  getAllCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get account ID from request
      const accountId = req.query.accountId as string;
      
      if (!accountId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETER',
            message: 'Account ID is required',
          },
        });
        return;
      }

      // Parse pagination parameters
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const sort = req.query.sort as string;
      const order = req.query.order as 'asc' | 'desc';

      // Get campaigns from service
      const campaigns = await this.service.getCampaigns(accountId, {
        page: page - 1, // Convert to 0-based for the API
        limit,
        sort,
        order,
      });

      // Send success response
      res.status(200).json({
        success: true,
        data: campaigns,
      });
    } catch (error) {
      logger.error('Error getting campaigns', { error });
      next(error);
    }
  };

  /**
   * Get a single campaign by ID
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  getCampaignById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const campaign = await this.service.getCampaignById(id);

      res.status(200).json({
        success: true,
        data: campaign,
      });
    } catch (error) {
      logger.error(`Error getting campaign: ${req.params.id}`, { error });
      next(error);
    }
  };

  /**
   * Create a new campaign
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  createCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const campaign = await this.service.createCampaign(req.body);

      res.status(201).json({
        success: true,
        data: campaign,
      });
    } catch (error) {
      logger.error('Error creating campaign', { error, body: req.body });
      next(error);
    }
  };

  /**
   * Update an existing campaign
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  updateCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const campaign = await this.service.updateCampaign(id, req.body);

      res.status(200).json({
        success: true,
        data: campaign,
      });
    } catch (error) {
      logger.error(`Error updating campaign: ${req.params.id}`, { error, body: req.body });
      next(error);
    }
  };

  /**
   * Get campaign performance data
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  getCampaignPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETER',
            message: 'Start date and end date are required',
          },
        });
        return;
      }

      const performance = await this.service.getCampaignPerformance({
        campaignId: id,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.status(200).json({
        success: true,
        data: performance,
      });
    } catch (error) {
      logger.error(`Error getting campaign performance: ${req.params.id}`, { error });
      next(error);
    }
  };
}

/**
 * Create a campaign controller instance
 * @param service - Campaign service
 * @returns Campaign controller instance
 */
export function createCampaignController(service: CampaignService): CampaignController {
  return new CampaignController(service);
}