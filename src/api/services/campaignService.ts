import axios from 'axios';
import { logger } from '../../config/logger';
import config from '../../config/environment';
import { GoogleAuthService } from './googleAuthService';
import { PaginationParams } from '../../mcp/types';
import { buildPaginationParams, formatPath } from '../../mcp/utils';

/**
 * CM360 Campaign data model
 */
export interface Campaign {
  id: string;
  name: string;
  advertiserId: string;
  startDate: string;
  endDate: string;
  status?: string;
  [key: string]: any; // Allow for additional properties from the API
}

/**
 * Input for creating a new campaign
 */
export interface CreateCampaignInput {
  name: string;
  advertiserId: string | number;
  startDate: string;
  endDate: string;
}

/**
 * Input for updating a campaign
 */
export interface UpdateCampaignInput {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'PAUSED';
}

/**
 * Campaign performance report parameters
 */
export interface CampaignPerformanceParams {
  campaignId: string | number;
  startDate: string;
  endDate: string;
}

/**
 * Service for managing CM360 campaigns
 */
export class CampaignService {
  private googleAuthService: GoogleAuthService;
  private readonly basePath = '/campaigns';
  private readonly apiBasePath = 'https://dfareporting.googleapis.com/dfareporting/v4';

  /**
   * Initialize the campaign service with the Google Auth service
   * @param googleAuthService - Google Auth service instance
   */
  constructor(googleAuthService: GoogleAuthService) {
    this.googleAuthService = googleAuthService;
  }

  /**
   * Get a list of campaigns with pagination
   * @param accountId - Account ID to filter campaigns
   * @param params - Pagination parameters
   * @returns Paginated list of campaigns
   */
  async getCampaigns(accountId: string, params: PaginationParams = {}): Promise<{
    items: Campaign[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const token = await this.googleAuthService.getAccessToken();
      const queryParams = buildPaginationParams(params);
      
      const response = await axios.get(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/campaigns`,
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
      const campaigns = response.data.items || [];
      
      return {
        items: campaigns,
        total: campaigns.length,
        page: params.page || 0,
        limit: params.limit || campaigns.length,
      };
    } catch (error) {
      logger.error('Error fetching campaigns', { error, accountId });
      throw error;
    }
  }

  /**
   * Get a single campaign by ID
   * @param campaignId - Campaign ID
   * @returns Campaign object
   */
  async getCampaignById(campaignId: string): Promise<Campaign> {
    try {
      const token = await this.googleAuthService.getAccessToken();
      
      const response = await axios.get(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/campaigns/${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error fetching campaign', { error, campaignId });
      throw error;
    }
  }

  /**
   * Create a new campaign
   * @param data - Campaign data
   * @returns Created campaign
   */
  async createCampaign(data: CreateCampaignInput): Promise<Campaign> {
    try {
      const token = await this.googleAuthService.getAccessToken();
      
      const response = await axios.post(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/campaigns`,
        {
          name: data.name,
          advertiserId: data.advertiserId,
          startDate: data.startDate,
          endDate: data.endDate
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error creating campaign', { error, data });
      throw error;
    }
  }

  /**
   * Update an existing campaign
   * @param campaignId - Campaign ID
   * @param data - Updated campaign data
   * @returns Updated campaign
   */
  async updateCampaign(campaignId: string, data: UpdateCampaignInput): Promise<Campaign> {
    try {
      const token = await this.googleAuthService.getAccessToken();
      
      // First get the current campaign
      const getCampaignResponse = await axios.get(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/campaigns/${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const campaign = getCampaignResponse.data;
      
      // Update the fields
      if (data.name) campaign.name = data.name;
      if (data.startDate) campaign.startDate = data.startDate;
      if (data.endDate) campaign.endDate = data.endDate;
      if (data.status) campaign.status = data.status;

      // Send the update
      const updateResponse = await axios.put(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/campaigns`,
        campaign,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return updateResponse.data;
    } catch (error) {
      logger.error('Error updating campaign', { error, campaignId, data });
      throw error;
    }
  }

  /**
   * Get campaign performance data
   * @param params - Campaign performance parameters
   * @returns Campaign performance data
   */
  async getCampaignPerformance(params: CampaignPerformanceParams): Promise<any> {
    try {
      const token = await this.googleAuthService.getAccessToken();
      
      // Create a report
      const reportResponse = await axios.post(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/reports`,
        {
          type: 'STANDARD',
          name: `Campaign Performance ${params.campaignId} ${new Date().toISOString()}`,
          format: 'CSV',
          criteria: {
            dateRange: {
              startDate: params.startDate,
              endDate: params.endDate,
            },
            dimensions: [
              { name: 'date' },
              { name: 'campaign' },
            ],
            metricNames: [
              'impressions',
              'clicks',
              'totalConversions',
              'clickRate',
            ],
          },
          delivery: {
            emailOwner: false,
          },
          schedule: {
            active: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const reportId = reportResponse.data.id;

      // Run the report
      await axios.post(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/reports/${reportId}/run`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Wait for the report to complete (simplified for example)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Get the report file
      const fileResponse = await axios.get(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/reports/${reportId}/files`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!fileResponse.data.items || fileResponse.data.items.length === 0) {
        return {
          status: 'processing',
          message: 'Report is still processing. Please try again later.',
        };
      }

      const fileId = fileResponse.data.items[0].id;

      // Get the report data
      const reportDataResponse = await axios.get(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/reports/${reportId}/files/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return reportDataResponse.data;
    } catch (error) {
      logger.error('Error getting campaign performance', { error, params });
      throw error;
    }
  }
}

/**
 * Create a campaign service instance
 * @param googleAuthService - Google Auth service
 * @returns Campaign service instance
 */
export function createCampaignService(googleAuthService: GoogleAuthService): CampaignService {
  return new CampaignService(googleAuthService);
}