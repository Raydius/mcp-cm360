import { z } from 'zod';
import { GoogleAuthService } from './googleAuthService';
import { CampaignService } from './campaignService';
import { logger } from '../../config/logger';

/**
 * Service for handling CM360 MCP tools
 */
export class CM360ToolService {
  private googleAuthService: GoogleAuthService;
  private campaignService: CampaignService;

  /**
   * Initialize the CM360 tool service
   * @param googleAuthService - Google Auth service instance
   */
  constructor(googleAuthService: GoogleAuthService) {
    this.googleAuthService = googleAuthService;
    this.campaignService = new CampaignService(googleAuthService);
  }

  /**
   * Get campaign performance tool schema
   * @returns Zod schema for campaign performance tool
   */
  getCampaignPerformanceSchema() {
    return {
      campaignId: z.string().or(z.number()),
      startDate: z.string(),
      endDate: z.string(),
    };
  }

  /**
   * Handle campaign performance tool request
   * @param params - Tool parameters
   * @returns Tool response
   */
  async handleCampaignPerformanceTool(params: { 
    campaignId: string | number, 
    startDate: string, 
    endDate: string 
  }): Promise<any> {
    try {
      const performance = await this.campaignService.getCampaignPerformance({
        campaignId: params.campaignId,
        startDate: params.startDate,
        endDate: params.endDate,
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(performance, null, 2),
        }],
      };
    } catch (error) {
      logger.error('Error getting campaign performance', { error, params });
      return {
        content: [{
          type: 'text',
          text: `Error getting campaign performance: ${error instanceof Error ? error.message : String(error)}`,
        }],
        isError: true,
      };
    }
  }

  /**
   * Get create campaign tool schema
   * @returns Zod schema for create campaign tool
   */
  getCreateCampaignSchema() {
    return {
      name: z.string(),
      advertiserId: z.string().or(z.number()),
      startDate: z.string(),
      endDate: z.string(),
    };
  }

  /**
   * Handle create campaign tool request
   * @param params - Tool parameters
   * @returns Tool response
   */
  async handleCreateCampaignTool(params: { 
    name: string, 
    advertiserId: string | number, 
    startDate: string, 
    endDate: string 
  }): Promise<any> {
    try {
      const campaign = await this.campaignService.createCampaign({
        name: params.name,
        advertiserId: params.advertiserId,
        startDate: params.startDate,
        endDate: params.endDate,
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(campaign, null, 2),
        }],
      };
    } catch (error) {
      logger.error('Error creating campaign', { error, params });
      return {
        content: [{
          type: 'text',
          text: `Error creating campaign: ${error instanceof Error ? error.message : String(error)}`,
        }],
        isError: true,
      };
    }
  }

  /**
   * Get update campaign tool schema
   * @returns Zod schema for update campaign tool
   */
  getUpdateCampaignSchema() {
    return {
      campaignId: z.string().or(z.number()),
      name: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      status: z.enum(['ACTIVE', 'ARCHIVED', 'PAUSED']).optional(),
    };
  }

  /**
   * Handle update campaign tool request
   * @param params - Tool parameters
   * @returns Tool response
   */
  async handleUpdateCampaignTool(params: { 
    campaignId: string | number, 
    name?: string, 
    startDate?: string, 
    endDate?: string, 
    status?: 'ACTIVE' | 'ARCHIVED' | 'PAUSED' 
  }): Promise<any> {
    try {
      const { campaignId, ...updateData } = params;
      const campaign = await this.campaignService.updateCampaign(
        String(campaignId), 
        updateData
      );
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(campaign, null, 2),
        }],
      };
    } catch (error) {
      logger.error('Error updating campaign', { error, params });
      return {
        content: [{
          type: 'text',
          text: `Error updating campaign: ${error instanceof Error ? error.message : String(error)}`,
        }],
        isError: true,
      };
    }
  }
}

/**
 * Create a CM360 tool service instance
 * @param googleAuthService - Google Auth service
 * @returns CM360 tool service instance
 */
export function createCM360ToolService(googleAuthService: GoogleAuthService): CM360ToolService {
  return new CM360ToolService(googleAuthService);
}