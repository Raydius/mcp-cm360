import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/reportService';
import { logger } from '../../config/logger';

/**
 * Report controller
 * Handles HTTP requests related to CM360 reports
 */
export class ReportController {
  private service: ReportService;

  /**
   * Initialize the controller with the report service
   * @param service - Report service instance
   */
  constructor(service: ReportService) {
    this.service = service;
  }

  /**
   * Get a list of reports
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  getAllReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      // Get reports from service
      const reports = await this.service.getReports(accountId, {
        page: page - 1, // Convert to 0-based for the API
        limit,
        sort,
        order,
      });

      // Send success response
      res.status(200).json({
        success: true,
        data: reports,
      });
    } catch (error) {
      logger.error('Error getting reports', { error });
      next(error);
    }
  };

  /**
   * Get a single report by ID
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  getReportById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const report = await this.service.getReportById(id);

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error(`Error getting report: ${req.params.id}`, { error });
      next(error);
    }
  };

  /**
   * Get report files
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  getReportFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const files = await this.service.getReportFiles(id);

      res.status(200).json({
        success: true,
        data: files,
      });
    } catch (error) {
      logger.error(`Error getting report files: ${req.params.id}`, { error });
      next(error);
    }
  };

  /**
   * Get report file data
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  getReportFileData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, fileId } = req.params;
      
      if (!fileId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETER',
            message: 'File ID is required',
          },
        });
        return;
      }

      const fileData = await this.service.getReportFileData(id, fileId);

      res.status(200).json({
        success: true,
        data: fileData,
      });
    } catch (error) {
      logger.error(`Error getting report file data: ${req.params.id}/${req.params.fileId}`, { error });
      next(error);
    }
  };

  /**
   * Run a report
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  runReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.runReport(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(`Error running report: ${req.params.id}`, { error });
      next(error);
    }
  };
}

/**
 * Create a report controller instance
 * @param service - Report service
 * @returns Report controller instance
 */
export function createReportController(service: ReportService): ReportController {
  return new ReportController(service);
}