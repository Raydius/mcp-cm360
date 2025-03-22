import { GoogleAuth, JWT } from 'google-auth-library';
import { logger } from '../../config/logger';
import config from '../../config/environment';

/**
 * Service for handling Google API authentication
 */
export class GoogleAuthService {
  private googleAuth: GoogleAuth;
  private jwtClient: JWT | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Initialize the Google Auth service
   */
  constructor() {
    // Initialize Google Auth client
    this.googleAuth = new GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/dfareporting',
        'https://www.googleapis.com/auth/dfatrafficking'
      ]
    });
  }

  /**
   * Get a valid access token
   * @returns Promise with the access token
   */
  public async getAccessToken(): Promise<string> {
    const now = Date.now();
    
    // If token is still valid, return it
    if (this.accessToken && this.tokenExpiry > now + 60000) {
      return this.accessToken;
    }
    
    try {
      // Initialize JWT client if not already done
      if (!this.jwtClient) {
        this.jwtClient = await this.googleAuth.getClient() as JWT;
      }
      
      // Get a new token
      const token = await this.jwtClient.getAccessToken();
      
      if (!token || !token.token) {
        throw new Error('Failed to get access token');
      }
      
      this.accessToken = token.token;
      
      // Set expiry (default to 1 hour if not provided)
      if (token.res && token.res.data && token.res.data.expires_in) {
        this.tokenExpiry = now + (token.res.data.expires_in * 1000);
      } else {
        this.tokenExpiry = now + 3600000; // 1 hour
      }
      
      return this.accessToken;
    } catch (error) {
      logger.error('Error getting access token', { error });
      throw error;
    }
  }
}

/**
 * Create a Google Auth service instance
 * @returns Google Auth service instance
 */
export function createGoogleAuthService(): GoogleAuthService {
  return new GoogleAuthService();
}