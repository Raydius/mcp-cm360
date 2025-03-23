import { cm360 } from '../src/cm360';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * These tests make REAL API calls to the CM360 API.
 * They will only run if valid credentials are provided.
 * 
 * To run these tests:
 * 1. Create a .env file with the following variables:
 *    - GOOGLE_APPLICATION_CREDENTIALS: Path to your service account key file
 *    - CM360_PROFILE_ID: Your CM360 profile ID
 * 2. Run the tests with: npm run test:real
 */

// Load environment variables from .env file
dotenv.config();

// Import the original console methods for direct logging
import { originalConsole } from './setup';

// Check if credentials are available and return reason if not
const checkCredentials = () => {
  try {
    // Check if .env file exists
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      return { valid: false, reason: `Missing .env file at ${envPath}` };
    }
    
    // Check if GOOGLE_APPLICATION_CREDENTIALS is set
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!credentialsPath) {
      return { valid: false, reason: 'GOOGLE_APPLICATION_CREDENTIALS not set in .env file' };
    }
    
    // Resolve relative paths if needed
    const resolvedCredentialsPath = credentialsPath.startsWith('/') 
      ? credentialsPath 
      : path.resolve(process.cwd(), credentialsPath);
    
    // Check if credentials file exists
    if (!fs.existsSync(resolvedCredentialsPath)) {
      return { valid: false, reason: `Credentials file not found at path: ${resolvedCredentialsPath}` };
    }
    
    // Check if CM360_PROFILE_ID is set
    if (!process.env.CM360_PROFILE_ID) {
      return { valid: false, reason: 'CM360_PROFILE_ID not set in .env file' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, reason: `Error checking credentials: ${error}` };
  }
};

// Get credential status
const credentialStatus = checkCredentials();

// Log the reason for skipping tests
if (!credentialStatus.valid) {
  originalConsole.log(`\n\x1b[33mSkipping CM360 Real API Tests: ${credentialStatus.reason}\x1b[0m\n`);
}

// Only run these tests if credentials are available
(credentialStatus.valid ? describe : describe.skip)('CM360 Real API Tests', () => {
  // Set longer timeout for API calls
  jest.setTimeout(30000);
  
  // Disable mocks for these tests
  beforeAll(() => {
    // We need to reset the modules to get the real JWT client
    jest.resetModules();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Unmock the google-auth-library module
    jest.unmock('google-auth-library');
    
    // Log that we're using real API calls
    originalConsole.log('\n===== USING REAL API CALLS =====\n');
    originalConsole.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    originalConsole.log('CM360_PROFILE_ID:', process.env.CM360_PROFILE_ID);
    originalConsole.log('\n================================\n');
  });
  
  it('should fetch advertisers from the CM360 API', async () => {
    // Log that we're making a real API call
    originalConsole.log('\n===== REAL API CALL: Fetching advertisers =====\n');
    
    // Act
    const result = await cm360.handleListAdvertisers({
      maxResults: 5
    });
    
    // Log the result
    originalConsole.log('\n===== RESULT =====');
    originalConsole.log(result.content[0].text);
    originalConsole.log('=================\n');
    
    // Assert
    expect(result).toHaveProperty('content');
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const advertisers = JSON.parse(result.content[0].text);
    expect(Array.isArray(advertisers)).toBe(true);
    
    // If advertisers were returned, check their structure
    if (advertisers.length > 0) {
      const advertiser = advertisers[0];
      expect(advertiser).toHaveProperty('id');
      expect(advertiser).toHaveProperty('name');
    }
  });
  
  it('should fetch campaigns from the CM360 API', async () => {
    // Log that we're making a real API call
    originalConsole.log('\n===== REAL API CALL: Fetching campaigns =====\n');
    
    // Act
    const result = await cm360.handleListCampaigns({
      maxResults: 5
    });
    
    // Log the result
    originalConsole.log('\n===== RESULT =====');
    originalConsole.log(result.content[0].text);
    originalConsole.log('=================\n');
    
    // Assert
    expect(result).toHaveProperty('content');
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const campaigns = JSON.parse(result.content[0].text);
    expect(Array.isArray(campaigns)).toBe(true);
    
    // If campaigns were returned, check their structure
    if (campaigns.length > 0) {
      const campaign = campaigns[0];
      expect(campaign).toHaveProperty('id');
      expect(campaign).toHaveProperty('name');
      expect(campaign).toHaveProperty('advertiserId');
    }
  });
  
  it('should filter campaigns by advertiser ID if provided', async () => {
    // First get advertisers
    const advertisersResult = await cm360.handleListAdvertisers({
      maxResults: 1
    });
    
    const advertisers = JSON.parse(advertisersResult.content[0].text);
    
    // Skip test if no advertisers are available
    if (advertisers.length === 0) {
      originalConsole.log('Skipping test: No advertisers available');
      return;
    }
    
    // Get the first advertiser ID
    const advertiserId = advertisers[0].id;
    
    // Log that we're making a real API call
    originalConsole.log(`\n===== REAL API CALL: Fetching campaigns for advertiser ${advertiserId} =====\n`);
    
    // Act - get campaigns for this advertiser
    const result = await cm360.handleListCampaigns({
      advertiserIds: [advertiserId],
      maxResults: 5
    });
    
    // Log the result
    originalConsole.log('\n===== RESULT =====');
    originalConsole.log(result.content[0].text);
    originalConsole.log('=================\n');
    
    // Assert
    expect(result).toHaveProperty('content');
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const campaigns = JSON.parse(result.content[0].text);
    expect(Array.isArray(campaigns)).toBe(true);
    
    // If campaigns were returned, check they belong to the advertiser
    if (campaigns.length > 0) {
      campaigns.forEach(campaign => {
        expect(campaign.advertiserId).toBe(advertiserId);
      });
    }
  });
});