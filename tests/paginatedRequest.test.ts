import { cm360 } from '../src/cm360';
import { mockJwtRequest, testLogger } from './setup';

describe('paginatedRequest', () => {
	beforeEach(() => {
		// Clear all mocks
		jest.clearAllMocks();
	});
	
	it('should handle single page responses', async () => {
		// Arrange
		const mockResponse = {
			data: {
				advertisers: [
					{ id: 1, name: 'Advertiser 1' },
					{ id: 2, name: 'Advertiser 2' }
				]
			}
		};
		
		// Mock the JWT request method
		mockJwtRequest.mockResolvedValueOnce(mockResponse);
		
		// Act
		const result = await cm360.handleListAdvertisers();
		
		// Assert
		expect(mockJwtRequest).toHaveBeenCalledTimes(1);
		expect(mockJwtRequest).toHaveBeenCalledWith(expect.objectContaining({
			url: expect.stringContaining('/advertisers'),
			method: 'GET',
			params: expect.objectContaining({
				searchString: '',
			})
		}));
		
		// Check the result
		expect(result).toHaveProperty('content');
		expect(result.content[0]).toHaveProperty('type', 'text');
		expect(JSON.parse(result.content[0].text)).toEqual([
			{ id: 1, name: 'Advertiser 1' },
			{ id: 2, name: 'Advertiser 2' }
		]);
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
	});
	
	it('should handle paginated responses', async () => {
		// Arrange
		const firstPageResponse = {
			data: {
				advertisers: [
					{ id: 1, name: 'Advertiser 1' },
					{ id: 2, name: 'Advertiser 2' }
				],
				nextPageToken: 'next-page-token'
			}
		};
		
		const secondPageResponse = {
			data: {
				advertisers: [
					{ id: 3, name: 'Advertiser 3' },
					{ id: 4, name: 'Advertiser 4' }
				]
			}
		};
		
		// Mock the JWT request method
		mockJwtRequest.mockResolvedValueOnce(firstPageResponse);
		mockJwtRequest.mockResolvedValueOnce(secondPageResponse);
		
		// Act
		const result = await cm360.handleListAdvertisers();
		
		// Assert
		expect(mockJwtRequest).toHaveBeenCalledTimes(2);
		
		// First call should not have pageToken
		expect(mockJwtRequest).toHaveBeenNthCalledWith(1, expect.objectContaining({
			url: expect.stringContaining('/advertisers'),
			method: 'GET',
			params: expect.objectContaining({
				searchString: '',
			})
		}));
		
		// Second call should include the pageToken
		expect(mockJwtRequest).toHaveBeenNthCalledWith(2, expect.objectContaining({
			url: expect.stringContaining('/advertisers'),
			method: 'GET',
			params: expect.objectContaining({
				searchString: '',
				pageToken: 'next-page-token'
			})
		}));
		
		// Check the result
		expect(result).toHaveProperty('content');
		expect(result.content[0]).toHaveProperty('type', 'text');
		expect(JSON.parse(result.content[0].text)).toEqual([
			{ id: 1, name: 'Advertiser 1' },
			{ id: 2, name: 'Advertiser 2' },
			{ id: 3, name: 'Advertiser 3' },
			{ id: 4, name: 'Advertiser 4' }
		]);
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
	});
	
	it('should handle empty responses', async () => {
		// Arrange
		const mockResponse = {
			data: {
				advertisers: []
			}
		};
		
		// Mock the JWT request method
		mockJwtRequest.mockResolvedValueOnce(mockResponse);
		
		// Act
		const result = await cm360.handleListAdvertisers();
		
		// Assert
		expect(mockJwtRequest).toHaveBeenCalledTimes(1);
		
		// Check the result
		expect(result).toHaveProperty('content');
		expect(result.content[0]).toHaveProperty('type', 'text');
		expect(JSON.parse(result.content[0].text)).toEqual([]);
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
	});
	
	it('should handle API errors', async () => {
		// Arrange
		const errorMessage = 'API request failed';
		
		// Mock the JWT request method to throw an error
		mockJwtRequest.mockRejectedValueOnce(new Error(errorMessage));
		
		// Act & Assert
		await expect(cm360.handleListAdvertisers()).rejects.toThrow(errorMessage);
		
		// Verify error was logged
		expect(testLogger.hasErrorLogged('API request failed')).toBe(true);
	});
});