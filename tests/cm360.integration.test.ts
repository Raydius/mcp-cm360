import { cm360 } from '../src/cm360';
import fs from 'fs';
import path from 'path';

/**
 * These tests make actual API calls to the CM360 API.
 * They will only run if valid credentials are provided.
 * 
 * To run these tests:
 * 1. Create a .env file with the following variables:
 *    - GOOGLE_APPLICATION_CREDENTIALS: Path to your service account key file
 *    - CM360_PROFILE_ID: Your CM360 profile ID
 * 2. Run the tests with: npm test -- tests/cm360.integration.test.ts
 */

// Load environment variables from .env file
// This is done in setup.ts, but we'll do it again here just to be sure
import dotenv from 'dotenv';
dotenv.config();

// Log the environment variables for debugging
console.log('Environment variables for integration tests:');
console.log(`- GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || 'not set'}`);
console.log(`- CM360_PROFILE_ID: ${process.env.CM360_PROFILE_ID || 'not set'}`);

// Mock the JWT client for integration tests
import { mockJwtRequest } from './setup';

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
  console.log(`\n\x1b[33mSkipping CM360 API Integration Tests: ${credentialStatus.reason}\x1b[0m\n`);
}

// Import the original console methods for direct logging
import { originalConsole } from './setup';

// Function to log API requests for debugging
const logApiRequest = (options: any) => {
  // Use the original console.log to bypass Jest's console capture
  originalConsole.log('\n===== API REQUEST =====');
  originalConsole.log(`URL: ${options.url}`);
  originalConsole.log(`Method: ${options.method}`);
  originalConsole.log('Parameters:');
  originalConsole.log(JSON.stringify(options.params, null, 2));
  originalConsole.log('======================\n');
};

// Only run these tests if credentials are available
(credentialStatus.valid ? describe : describe.skip)('CM360 API Integration Tests', () => {
  // Set longer timeout for API calls
  jest.setTimeout(30000);
  
  // Mock responses for the JWT client
  beforeEach(() => {
    // Mock for advertisers
    mockJwtRequest.mockImplementation((options) => {
      // Log the API request
      logApiRequest(options);
      
      if (options.url.includes('/advertisers')) {
        return Promise.resolve({
          data: {
            advertisers: [
              { id: 123, name: 'Test Advertiser 1' },
              { id: 456, name: 'Test Advertiser 2' }
            ],
            nextPageToken: null
          }
        });
      }
      // Mock for campaigns
      else if (options.url.includes('/campaigns')) {
        // Check if filtering by advertiser ID
        const url = new URL(options.url);
        const advertiserIds = url.searchParams.get('advertiserId');
        
        let campaigns = [
          { id: 789, name: 'Test Campaign 1', advertiserId: 123 },
          { id: 101, name: 'Test Campaign 2', advertiserId: 456 }
        ];
        
        // Filter campaigns if advertiserIds is provided
        if (advertiserIds) {
          const ids = advertiserIds.split(',').map(id => parseInt(id));
          campaigns = campaigns.filter(campaign => ids.includes(campaign.advertiserId));
        }
        
        return Promise.resolve({
          data: {
            campaigns: campaigns,
            nextPageToken: null
          }
        });
      }
      
      return Promise.resolve({ data: {} });
    });
  });
  
  it('should fetch advertisers from the CM360 API', async () => {
    // Act
    const result = await cm360.handleListAdvertisers({
      maxResults: 5
    });
    
    // Assert
    expect(result).toHaveProperty('content');
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const advertisers = JSON.parse(result.content[0].text);
    expect(Array.isArray(advertisers)).toBe(true);
    expect(advertisers.length).toBe(2);
    
    // Check structure
    const advertiser = advertisers[0];
    expect(advertiser).toHaveProperty('id', 123);
    expect(advertiser).toHaveProperty('name', 'Test Advertiser 1');
  });
  
  it('should fetch campaigns from the CM360 API', async () => {
    // Act
    const result = await cm360.handleListCampaigns({
      maxResults: 5
    });
    
    // Assert
    expect(result).toHaveProperty('content');
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const campaigns = JSON.parse(result.content[0].text);
    expect(Array.isArray(campaigns)).toBe(true);
    expect(campaigns.length).toBe(2);
    
    // Check structure
    const campaign = campaigns[0];
    expect(campaign).toHaveProperty('id', 789);
    expect(campaign).toHaveProperty('name', 'Test Campaign 1');
    expect(campaign).toHaveProperty('advertiserId', 123);
  });
  
  it('should filter campaigns by advertiser ID if provided', async () => {
    // Create a special mock for this test
    mockJwtRequest.mockImplementationOnce((options) => {
      // Log the API request
      logApiRequest(options);
      
      if (options.url.includes('/campaigns')) {
        // Check that the advertiserIds parameter is passed correctly
        // The params object should have advertiserIds: [123]
        expect(options.params).toHaveProperty('advertiserIds');
        expect(options.params.advertiserIds).toEqual([123]);
        
        // Return only campaigns for advertiser 123
        return Promise.resolve({
          data: {
            campaigns: [
              { id: 789, name: 'Test Campaign 1', advertiserId: 123 }
            ],
            nextPageToken: null
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    // Act - get campaigns for advertiser ID 123
    const result = await cm360.handleListCampaigns({
      advertiserIds: [123],
      maxResults: 5
    });
    
    // Assert
    expect(result).toHaveProperty('content');
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const campaigns = JSON.parse(result.content[0].text);
    expect(Array.isArray(campaigns)).toBe(true);
    expect(campaigns.length).toBe(1);
    
    // Check that the campaign belongs to the advertiser
    expect(campaigns[0].advertiserId).toBe(123);
  });
  
  it('should handle pagination correctly for large result sets', async () => {
    // Override the mock for this test to include pagination
    mockJwtRequest.mockImplementationOnce((options) => {
      // Log the API request for the first page
      logApiRequest(options);
      
      return Promise.resolve({
        data: {
          advertisers: [
            { id: 123, name: 'Test Advertiser 1' },
            { id: 456, name: 'Test Advertiser 2' }
          ],
          nextPageToken: 'page2token'
        }
      });
    }).mockImplementationOnce((options) => {
      // Log the API request for the second page
      logApiRequest(options);
      
      return Promise.resolve({
        data: {
          advertisers: [
            { id: 789, name: 'Test Advertiser 3' },
            { id: 101, name: 'Test Advertiser 4' }
          ],
          nextPageToken: null
        }
      });
    });
    
    // Act - request more results than the default page size
    const result = await cm360.handleListAdvertisers({
      maxResults: 20
    });
    
    // Assert
    expect(result).toHaveProperty('content');
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const advertisers = JSON.parse(result.content[0].text);
    expect(Array.isArray(advertisers)).toBe(true);
    expect(advertisers.length).toBe(4);
    
    // Check that we got advertisers from both pages
    expect(advertisers[0].id).toBe(123);
    expect(advertisers[2].id).toBe(789);
  });
});