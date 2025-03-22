import axios from 'axios';
import { logger } from '../../config/logger';
import config from '../../config/environment';
import { GoogleAuthService } from './googleAuthService';
import { PaginationParams } from '../../mcp/types';
import { buildPaginationParams, formatPath } from '../../mcp/utils';

/**
 * CM360 Report data model
 */
export interface Report {
  id: string;
  name: string;
  type: string;
  format: string;
  lastModifiedTime: string;
  [key: string]: any; // Allow for additional properties from the API
}

/**
 * Service for managing CM360 reports
 */
export class ReportService {
  private googleAuthService: GoogleAuthService;
  private readonly basePath = '/reports';
  private readonly apiBasePath = 'https://dfareporting.googleapis.com/dfareporting/v4';

  /**
   * Initialize the report service with the Google Auth service
   * @param googleAuthService - Google Auth service instance
   */
  constructor(googleAuthService: GoogleAuthService) {
    this.googleAuthService = googleAuthService;
  }

  /**
   * Get a list of reports with pagination
   * @param accountId - Account ID to filter reports
   * @param params - Pagination parameters
   * @returns Paginated list of reports
   */
  async getReports(accountId: string, params: PaginationParams = {}): Promise<{
    items: Report[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const token = await this.googleAuthService.getAccessToken();
      const queryParams = buildPaginationParams(params);
      
      const response = await axios.get(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/reports`,
        {
          params: {
            ...queryParams,
            accountId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Transform the response to match our API format
      const reports = response.data.items || [];
      
      return {
        items: reports,
        total: reports.length,
        page: params.page || 0,
        limit: params.limit || reports.length,
      };
    } catch (error) {
      logger.error('Error fetching reports', { error, accountId });
      throw error;
    }
  }

  /**
   * Get a single report by ID
   * @param reportId - Report ID
   * @returns Report object
   */
  async getReportById(reportId: string): Promise<Report> {
    try {
      const token = await this.googleAuthService.getAccessToken();
      
      const response = await axios.get(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/reports/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error fetching report', { error, reportId });
      throw error;
    }
  }

  /**
   * Get report files for a specific report
   * @param reportId - Report ID
   * @returns Report files
   */
  async getReportFiles(reportId: string): Promise<any> {
    try {
      const token = await this.googleAuthService.getAccessToken();
      
      const response = await axios.get(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/reports/${reportId}/files`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error fetching report files', { error, reportId });
      throw error;
    }
  }

  /**
   * Get report file data
   * @param reportId - Report ID
   * @param fileId - File ID
   * @returns Report file data
   */
  async getReportFileData(reportId: string, fileId: string): Promise<any> {
    try {
      const token = await this.googleAuthService.getAccessToken();
      
      const response = await axios.get(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/reports/${reportId}/files/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error fetching report file data', { error, reportId, fileId });
      throw error;
    }
  }

  /**
   * Run a report
   * @param reportId - Report ID
   * @returns Run response
   */
  async runReport(reportId: string): Promise<any> {
    try {
      const token = await this.googleAuthService.getAccessToken();
      
      const response = await axios.post(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/reports/${reportId}/run`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error running report', { error, reportId });
      throw error;
    }
  }
}

/**
 * Create a report service instance
 * @param googleAuthService - Google Auth service
 * @returns Report service instance
 */
export function createReportService(googleAuthService: GoogleAuthService): ReportService {
  return new ReportService(googleAuthService);
}