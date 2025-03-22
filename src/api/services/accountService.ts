import axios from 'axios';
import { logger } from '../../config/logger';
import config from '../../config/environment';
import { GoogleAuthService } from './googleAuthService';
import { PaginationParams } from '../../mcp/types';
import { buildPaginationParams, formatPath } from '../../mcp/utils';

/**
 * CM360 Account data model
 */
export interface Account {
  id: string;
  name: string;
  active: boolean;
  description?: string;
  [key: string]: any; // Allow for additional properties from the API
}

/**
 * Service for managing CM360 accounts
 */
export class AccountService {
  private googleAuthService: GoogleAuthService;
  private readonly basePath = '/accounts';
  private readonly apiBasePath = 'https://dfareporting.googleapis.com/dfareporting/v4';

  /**
   * Initialize the account service with the Google Auth service
   * @param googleAuthService - Google Auth service instance
   */
  constructor(googleAuthService: GoogleAuthService) {
    this.googleAuthService = googleAuthService;
  }

  /**
   * Get a list of accounts with pagination
   * @param params - Pagination parameters
   * @returns Paginated list of accounts
   */
  async getAccounts(params: PaginationParams = {}): Promise<{
    items: Account[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const token = await this.googleAuthService.getAccessToken();
      const queryParams = buildPaginationParams(params);
      
      const response = await axios.get(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/accounts`,
        {
          params: {
            ...queryParams,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Transform the response to match our API format
      const accounts = response.data.items || [];
      
      return {
        items: accounts,
        total: accounts.length,
        page: params.page || 0,
        limit: params.limit || accounts.length,
      };
    } catch (error) {
      logger.error('Error fetching accounts', { error });
      throw error;
    }
  }

  /**
   * Get a single account by ID
   * @param id - Account ID
   * @returns Account object
   */
  async getAccountById(id: string): Promise<Account> {
    try {
      const token = await this.googleAuthService.getAccessToken();
      
      const response = await axios.get(
        `${this.apiBasePath}/userprofiles/${config.CM360_PROFILE_ID}/accounts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error fetching account', { error, accountId: id });
      throw error;
    }
  }
}

/**
 * Create an account service instance
 * @param googleAuthService - Google Auth service
 * @returns Account service instance
 */
export function createAccountService(googleAuthService: GoogleAuthService): AccountService {
  return new AccountService(googleAuthService);
}