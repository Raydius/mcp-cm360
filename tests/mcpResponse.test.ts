import { cm360, handleListAdvertisers } from '../src/cm360';
import { mockJwtRequest, testLogger } from './setup';

describe('MCP Response Formatting', () => {
	beforeEach(() => {
		// Clear all mocks
		jest.clearAllMocks();
	});
	
	it('should format simple data correctly', async () => {
		// Mock the JWT request method
		mockJwtRequest.mockResolvedValueOnce({
			data: {
				advertisers: [
					{ id: 1, name: 'Test Advertiser' }
				]
			}
		});
		
		// Call the method that uses mcpReturnJSON
		const result = await handleListAdvertisers();
		
		// Check the structure of the response
		expect(result).toEqual({
			content: [
				{
					type: 'text',
					text: JSON.stringify([{ id: 1, name: 'Test Advertiser' }], null, 2)
				}
			]
		});
		
		// Verify the text is properly formatted JSON
		const parsedText = JSON.parse(result.content[0].text);
		expect(parsedText).toEqual([{ id: 1, name: 'Test Advertiser' }]);
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
	});
	
	it('should format complex data correctly', async () => {
		// Create a complex data structure
		const complexData = {
			advertisers: [
				{
					id: 1,
					name: 'Test Advertiser',
					status: 'ACTIVE',
					defaultCreativeGroupId: 12345,
					advertiserGroupId: 67890,
					clickThroughUrlSuffix: 'suffix',
					defaultClickThroughEventTagId: 54321,
					suspended: false,
					floodlightConfigurationId: 98765,
					originalFloodlightConfigurationId: 43210,
					subaccounts: [
						{ id: 111, name: 'Subaccount 1' },
						{ id: 222, name: 'Subaccount 2' }
					]
				}
			]
		};
		
		// Mock the JWT request method
		mockJwtRequest.mockResolvedValueOnce({
			data: complexData
		});
		
		// Call the method that uses mcpReturnJSON
		const result = await handleListAdvertisers();
		
		// Check the structure of the response
		expect(result).toEqual({
			content: [
				{
					type: 'text',
					text: JSON.stringify(complexData.advertisers, null, 2)
				}
			]
		});
		
		// Verify the text is properly formatted JSON
		const parsedText = JSON.parse(result.content[0].text);
		expect(parsedText).toEqual(complexData.advertisers);
		
		// Check that the JSON is properly indented
		expect(result.content[0].text).toContain('\n');
		expect(result.content[0].text).toContain('  ');
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
	});
	
	it('should handle empty data correctly', async () => {
		// Mock the JWT request method
		mockJwtRequest.mockResolvedValueOnce({
			data: {
				advertisers: []
			}
		});
		
		// Call the method that uses mcpReturnJSON
		const result = await handleListAdvertisers();
		
		// Check the structure of the response
		expect(result).toEqual({
			content: [
				{
					type: 'text',
					text: '[]'
				}
			]
		});
		
		// Verify the text is properly formatted JSON
		const parsedText = JSON.parse(result.content[0].text);
		expect(parsedText).toEqual([]);
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
	});
});