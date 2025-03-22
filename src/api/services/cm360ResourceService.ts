import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GoogleAuthService } from './googleAuthService';
import { AccountService } from './accountService';
import { CampaignService } from './campaignService';
import { ReportService } from './reportService';
import { logger } from '../../config/logger';

/**
 * Service for handling CM360 MCP resources
 */
export class CM360ResourceService {
  private googleAuthService: GoogleAuthService;
  private accountService: AccountService;
  private campaignService: CampaignService;
  private reportService: ReportService;

  /**
   * Initialize the CM360 resource service
   * @param googleAuthService - Google Auth service instance
   */
  constructor(googleAuthService: GoogleAuthService) {
    this.googleAuthService = googleAuthService;
    this.accountService = new AccountService(googleAuthService);
    this.campaignService = new CampaignService(googleAuthService);
    this.reportService = new ReportService(googleAuthService);
  }

  /**
   * Get account resource template
   * @returns Account resource template
   */
  getAccountResourceTemplate(): ResourceTemplate {
    return new ResourceTemplate('cm360://accounts/{accountId}', { list: undefined });
  }

  /**
   * Handle account resource request
   * @param uri - Resource URI
   * @param params - URI parameters
   * @returns Resource response
   */
  async handleAccountResource(uri: URL, params: { accountId: string }): Promise<any> {
    try {
      const account = await this.accountService.getAccountById(params.accountId);
      
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(account, null, 2),
        }],
      };
    } catch (error) {
      logger.error('Error fetching account resource', { error, accountId: params.accountId });
      throw error;
    }
  }

  /**
   * Get campaigns resource template
   * @returns Campaigns resource template
   */
  getCampaignsResourceTemplate(): ResourceTemplate {
    return new ResourceTemplate('cm360://accounts/{accountId}/campaigns', { list: undefined });
  }

  /**
   * Handle campaigns resource request
   * @param uri - Resource URI
   * @param params - URI parameters
   * @returns Resource response
   */
  async handleCampaignsResource(uri: URL, params: { accountId: string }): Promise<any> {
    try {
      const campaigns = await this.campaignService.getCampaigns(params.accountId);
      
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(campaigns, null, 2),
        }],
      };
    } catch (error) {
      logger.error('Error fetching campaigns resource', { error, accountId: params.accountId });
      throw error;
    }
  }

  /**
   * Get campaign resource template
   * @returns Campaign resource template
   */
  getCampaignResourceTemplate(): ResourceTemplate {
    return new ResourceTemplate('cm360://accounts/{accountId}/campaigns/{campaignId}', { list: undefined });
  }

  /**
   * Handle campaign resource request
   * @param uri - Resource URI
   * @param params - URI parameters
   * @returns Resource response
   */
  async handleCampaignResource(uri: URL, params: { accountId: string, campaignId: string }): Promise<any> {
    try {
      const campaign = await this.campaignService.getCampaignById(params.campaignId);
      
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(campaign, null, 2),
        }],
      };
    } catch (error) {
      logger.error('Error fetching campaign resource', { 
        error, 
        accountId: params.accountId, 
        campaignId: params.campaignId 
      });
      throw error;
    }
  }

  /**
   * Get reports resource template
   * @returns Reports resource template
   */
  getReportsResourceTemplate(): ResourceTemplate {
    return new ResourceTemplate('cm360://accounts/{accountId}/reports', { list: undefined });
  }

  /**
   * Handle reports resource request
   * @param uri - Resource URI
   * @param params - URI parameters
   * @returns Resource response
   */
  async handleReportsResource(uri: URL, params: { accountId: string }): Promise<any> {
    try {
      const reports = await this.reportService.getReports(params.accountId);
      
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(reports, null, 2),
        }],
      };
    } catch (error) {
      logger.error('Error fetching reports resource', { error, accountId: params.accountId });
      throw error;
    }
  }
}

/**
 * Create a CM360 resource service instance
 * @param googleAuthService - Google Auth service
 * @returns CM360 resource service instance
 */
export function createCM360ResourceService(googleAuthService: GoogleAuthService): CM360ResourceService {
  return new CM360ResourceService(googleAuthService);
}