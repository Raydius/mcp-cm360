/**
 * This script makes real API calls to the CM360 API.
 * It doesn't use any mocks and directly uses the CM360 module.
 * 
 * To run this script:
 * 1. Create a .env file with the following variables:
 *    - GOOGLE_APPLICATION_CREDENTIALS: Path to your service account key file
 *    - CM360_PROFILE_ID: Your CM360 profile ID
 * 2. Run the script with: node real-api-test.js
 */

// Load environment variables from .env file
require('dotenv').config();

// Import the CM360 module
const { cm360 } = require('./build/cm360');

// Function to log the result
function logResult(title, result) {
  console.log(`\n===== ${title} =====`);
  console.log(JSON.stringify(JSON.parse(result.content[0].text), null, 2));
  console.log('======================\n');
}

// Main function to run the tests
async function runTests() {
  try {
    console.log('\n===== CM360 REAL API TEST =====');
    console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('CM360_PROFILE_ID:', process.env.CM360_PROFILE_ID);
    console.log('===============================\n');

    // Test 1: Fetch advertisers
    console.log('Fetching advertisers...');
    const advertisersResult = await cm360.handleListAdvertisers({
      maxResults: 5
    });
    logResult('ADVERTISERS', advertisersResult);

    // Test 2: Fetch campaigns
    console.log('Fetching campaigns...');
    const campaignsResult = await cm360.handleListCampaigns({
      maxResults: 5
    });
    logResult('CAMPAIGNS', campaignsResult);

    // Test 3: Fetch campaigns for a specific advertiser
    const advertisers = JSON.parse(advertisersResult.content[0].text);
    if (advertisers.length > 0) {
      // Convert the advertiser ID to a number
      const advertiserId = parseInt(advertisers[0].id, 10);
      console.log(`Fetching campaigns for advertiser ${advertiserId}...`);
      const filteredCampaignsResult = await cm360.handleListCampaigns({
        advertiserIds: [advertiserId],
        maxResults: 5
      });
      logResult(`CAMPAIGNS FOR ADVERTISER ${advertiserId}`, filteredCampaignsResult);
    } else {
      console.log('No advertisers found to test filtering campaigns.');
    }

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();