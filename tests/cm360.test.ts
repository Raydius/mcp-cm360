import { cm360, handleListAdvertisers, handleListCampaigns } from '../src/cm360';
import { mockJwtRequest, testLogger } from './setup';

describe('CM360 API Module', () => {
	beforeEach(() => {
		// Clear all mocks
		jest.clearAllMocks();
	});

	describe('handleListAdvertisers', () => {
		it('should fetch advertisers with default parameters', async () => {
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
			const result = await handleListAdvertisers();
			
			// Assert
			expect(mockJwtRequest).toHaveBeenCalledWith(expect.objectContaining({
				url: expect.stringContaining('/advertisers'),
				method: 'GET',
				params: expect.objectContaining({
					searchString: '',
				})
			}));
			
			expect(result).toEqual({
				content: [{
					type: 'text',
					text: JSON.stringify([
						{ id: 1, name: 'Advertiser 1' },
						{ id: 2, name: 'Advertiser 2' }
					], null, 2)
				}]
			});
			
			// Verify no errors were logged
			expect(testLogger.logs.error).toHaveLength(0);
		});

		it('should fetch advertisers with custom parameters', async () => {
			// Arrange
			const mockResponse = {
				data: {
					advertisers: [
						{ id: 3, name: 'Test Advertiser' }
					]
				}
			};
			
			// Mock the JWT request method
			mockJwtRequest.mockResolvedValueOnce(mockResponse);
			
			// Act
			const result = await handleListAdvertisers({
				searchString: 'Test',
			});
			
			// Assert
			expect(mockJwtRequest).toHaveBeenCalledWith(expect.objectContaining({
				url: expect.stringContaining('/advertisers'),
				method: 'GET',
				params: expect.objectContaining({
					searchString: 'Test',
				})
			}));
			
			expect(result).toEqual({
				content: [{
					type: 'text',
					text: JSON.stringify([
						{ id: 3, name: 'Test Advertiser' }
					], null, 2)
				}]
			});
			
			// Verify no errors were logged
			expect(testLogger.logs.error).toHaveLength(0);
		});

		it('should handle pagination correctly', async () => {
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
			const result = await handleListAdvertisers();
			
			// Assert
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
			
			// Result should contain all advertisers from both pages
			expect(result).toEqual({
				content: [{
					type: 'text',
					text: JSON.stringify([
						{ id: 1, name: 'Advertiser 1' },
						{ id: 2, name: 'Advertiser 2' },
						{ id: 3, name: 'Advertiser 3' },
						{ id: 4, name: 'Advertiser 4' }
					], null, 2)
				}]
			});
			
			// Verify no errors were logged
			expect(testLogger.logs.error).toHaveLength(0);
		});

		it('should handle API errors gracefully', async () => {
			// Arrange
			const errorMessage = 'API request failed';
			
			// Mock the JWT request method to throw an error
			mockJwtRequest.mockRejectedValueOnce(new Error(errorMessage));
			
			// Act & Assert
			await expect(handleListAdvertisers()).rejects.toThrow(errorMessage);
			
			// Verify error was logged
			expect(testLogger.hasErrorLogged('API request failed')).toBe(true);
		});
	});

	describe('handleListCampaigns', () => {
		it('should fetch campaigns with default parameters', async () => {
			// Arrange
			const mockResponse = {
				data: {
					campaigns: [
						{ id: 101, name: 'Campaign 1', advertiserId: 1 },
						{ id: 102, name: 'Campaign 2', advertiserId: 2 }
					]
				}
			};
			
			// Mock the JWT request method
			mockJwtRequest.mockResolvedValueOnce(mockResponse);
			
			// Act
			const result = await handleListCampaigns();
			
			// Assert
			expect(mockJwtRequest).toHaveBeenCalledWith(expect.objectContaining({
				url: expect.stringContaining('/campaigns'),
				method: 'GET',
				params: expect.objectContaining({
					searchString: '',
				})
			}));
			
			expect(result).toEqual({
				content: [{
					type: 'text',
					text: JSON.stringify([
						{ id: 101, name: 'Campaign 1', advertiserId: 1 },
						{ id: 102, name: 'Campaign 2', advertiserId: 2 }
					], null, 2)
				}]
			});
			
			// Verify no errors were logged
			expect(testLogger.logs.error).toHaveLength(0);
		});

		it('should fetch campaigns filtered by advertiser IDs', async () => {
			// Arrange
			const mockResponse = {
				data: {
					campaigns: [
						{ id: 101, name: 'Campaign 1', advertiserId: 1 }
					]
				}
			};
			
			// Mock the JWT request method
			mockJwtRequest.mockResolvedValueOnce(mockResponse);
			
			// Act
			const result = await handleListCampaigns({
				advertiserIds: [1],
				searchString: 'Campaign',
			});
			
			// Assert
			expect(mockJwtRequest).toHaveBeenCalledWith(expect.objectContaining({
				url: expect.stringContaining('/campaigns'),
				method: 'GET',
				params: expect.objectContaining({
					advertiserIds: [1],
					searchString: 'Campaign',
				})
			}));
			
			expect(result).toEqual({
				content: [{
					type: 'text',
					text: JSON.stringify([
						{ id: 101, name: 'Campaign 1', advertiserId: 1 }
					], null, 2)
				}]
			});
			
			// Verify no errors were logged
			expect(testLogger.logs.error).toHaveLength(0);
		});
	});

	describe('handleListPlacements', () => {
		const { handleListPlacements } = require('../src/cm360');

		it('should fetch placements with default parameters', async () => {
			const mockResponse = {
				data: {
					placements: [
						{ id: 201, name: 'Placement 1' },
						{ id: 202, name: 'Placement 2' }
					]
				}
			};
			mockJwtRequest.mockResolvedValueOnce(mockResponse);

			const result = await handleListPlacements();
			expect(mockJwtRequest).toHaveBeenCalledWith(expect.objectContaining({
				url: expect.stringContaining('/placements'),
				method: 'GET',
				params: expect.objectContaining({
					searchString: '',
				})
			}));
			expect(result).toEqual({
				content: [{
					type: 'text',
					text: JSON.stringify([
						{ id: 201, name: 'Placement 1' },
						{ id: 202, name: 'Placement 2' }
					], null, 2)
				}]
			});
			expect(testLogger.logs.error).toHaveLength(0);
		});

		it('should fetch placements with custom parameters', async () => {
			const mockResponse = {
				data: {
					placements: [
						{ id: 203, name: 'Test Placement' }
					]
				}
			};
			mockJwtRequest.mockResolvedValueOnce(mockResponse);

			const result = await handleListPlacements({
				advertiserIds: [1],
				campaignIds: [10],
				searchString: 'Test'
			});
			expect(mockJwtRequest).toHaveBeenCalledWith(expect.objectContaining({
				url: expect.stringContaining('/placements'),
				method: 'GET',
				params: expect.objectContaining({
					advertiserIds: [1],
					campaignIds: [10],
					searchString: 'Test'
				})
			}));
			expect(result).toEqual({
				content: [{
					type: 'text',
					text: JSON.stringify([
						{ id: 203, name: 'Test Placement' }
					], null, 2)
				}]
			});
			expect(testLogger.logs.error).toHaveLength(0);
		});

		it('should handle pagination correctly', async () => {
			const firstPageResponse = {
				data: {
					placements: [
						{ id: 201, name: 'Placement 1' },
						{ id: 202, name: 'Placement 2' }
					],
					nextPageToken: 'next-page-token'
				}
			};
			const secondPageResponse = {
				data: {
					placements: [
						{ id: 203, name: 'Placement 3' }
					]
				}
			};
			mockJwtRequest.mockResolvedValueOnce(firstPageResponse);
			mockJwtRequest.mockResolvedValueOnce(secondPageResponse);

			const result = await handleListPlacements();
			expect(mockJwtRequest).toHaveBeenNthCalledWith(1, expect.objectContaining({
				url: expect.stringContaining('/placements'),
				method: 'GET',
				params: expect.objectContaining({
					searchString: '',
				})
			}));
			expect(mockJwtRequest).toHaveBeenNthCalledWith(2, expect.objectContaining({
				url: expect.stringContaining('/placements'),
				method: 'GET',
				params: expect.objectContaining({
					searchString: '',
					pageToken: 'next-page-token'
				})
			}));
			expect(result).toEqual({
				content: [{
					type: 'text',
					text: JSON.stringify([
						{ id: 201, name: 'Placement 1' },
						{ id: 202, name: 'Placement 2' },
						{ id: 203, name: 'Placement 3' }
					], null, 2)
				}]
			});
			expect(testLogger.logs.error).toHaveLength(0);
		});

		it('should handle API errors gracefully', async () => {
			const errorMessage = 'API request failed';
			mockJwtRequest.mockRejectedValueOnce(new Error(errorMessage));
			await expect(handleListPlacements()).rejects.toThrow(errorMessage);
			expect(testLogger.hasErrorLogged('API request failed')).toBe(true);
		});
	});

	describe('tools', () => {
		it('should return the list of available tools', async () => {
			// Act
			const result = await cm360.tools();
			
			// Assert
			expect(result).toEqual({
				tools: [
					{
						name: "list-advertisers",
						description: "List advertisers associated with this account",
						inputSchema: {
							type: "object",
							properties: {
								searchString: {
									type: "string",
									description: "Search query for advertiser name",
									default: ""
								}
							},
							required: []
						}
					},
					{
						name: "select-advertiser",
						description: "Select advertiser to use for subsequent interactions",
						inputSchema: {
							type: "object",
							properties: {
								advertiserId: {
									type: "number",
									description: "ID of Advertiser to select"
								}
							},
							required: []
						}
					},
					{
						name: "list-campaigns",
						description: "List campaigns associated with the selected advertiser (or account if no advertiser selected)",
						inputSchema: {
							type: "object",
							properties: {
								advertiserIds: {
									type: "array",
									items: {
										type: "number"
									},
									description: "ID of Advertiser you want to filter campaigns by"
								},
								searchString: {
									type: "string",
									description: "Search query for campaign name"
								}
							},
							required: []
						}
					},
					{
						name: "list-creatives",
						description: "List creatives associated with the selected advertiser and/or campaign",
						inputSchema: {
							type: "object",
							properties: {
								advertiserIds: {
									type: "array",
									items: {
										type: "number"
									},
									description: "IDs of Advertisers to filter creatives by"
								},
								campaignIds: {
									type: "array",
									items: {
										type: "number"
									},
									description: "IDs of Campaigns to filter creatives by"
								},
								searchString: {
									type: "string",
									description: "Search query for creative name"
								}
							},
							required: []
						}
					},
					{
						name: "list-creative-groups",
						description: "List creative groups associated with the selected advertiser and/or campaign",
						inputSchema: {
							type: "object",
							properties: {
								advertiserIds: {
									type: "array",
									items: {
										type: "number"
									},
									description: "IDs of Advertisers to filter creative groups by"
								},
								campaignIds: {
									type: "array",
									items: {
										type: "number"
									},
									description: "IDs of Campaigns to filter creative groups by"
								},
								searchString: {
									type: "string",
									description: "Search query for creative group name"
								}
							},
							required: []
						}
					},
					{
						name: "list-event-tags",
						description: "List event tags associated with the selected advertiser and/or campaign",
						inputSchema: {
							type: "object",
							properties: {
								advertiserIds: {
									type: "array",
									items: {
										type: "number"
									},
									description: "IDs of Advertisers to filter event tags by"
								},
								campaignIds: {
									type: "array",
									items: {
										type: "number"
									},
									description: "IDs of Campaigns to filter event tags by"
								},
								searchString: {
									type: "string",
									description: "Search query for event tag name"
								}
							},
							required: []
						}
					}
				,
					{
						name: "list-placements",
						description: "List placements associated with the selected advertiser and/or campaign",
						inputSchema: {
							type: "object",
							properties: {
								advertiserIds: {
									type: "array",
									items: {
										type: "number"
									},
									description: "IDs of Advertisers to filter placements by"
								},
								campaignIds: {
									type: "array",
									items: {
										type: "number"
									},
									description: "IDs of Campaigns to filter placements by"
								},
								searchString: {
									type: "string",
									description: "Search query for placement name"
								}
							},
							required: []
						}
					}
				]
			});
		});
	});
});