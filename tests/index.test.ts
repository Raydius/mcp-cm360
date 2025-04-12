import { testLogger } from './setup';

// Mock the MCP SDK
const mockSetRequestHandler = jest.fn();
const mockConnect = jest.fn();
const mockServer = jest.fn().mockImplementation(() => ({
	setRequestHandler: mockSetRequestHandler,
	connect: mockConnect
}));

jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
	Server: mockServer
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
	StdioServerTransport: jest.fn().mockImplementation(() => ({}))
}));

// Mock the CM360 module
const mockHandleListAdvertisers = jest.fn().mockResolvedValue({
	content: [{ type: 'text', text: JSON.stringify([{ id: 1, name: 'Test Advertiser' }], null, 2) }]
});

const mockHandleListCampaigns = jest.fn().mockResolvedValue({
	content: [{ type: 'text', text: JSON.stringify([{ id: 101, name: 'Test Campaign' }], null, 2) }]
});

const mockTools = jest.fn().mockResolvedValue({
	tools: [
		{
			name: 'list-advertisers',
			description: 'List advertisers associated with this account',
			inputSchema: {}
		},
		{
			name: 'select-advertiser',
			description: 'Select advertiser to use for subsequent interactions',
			inputSchema: {}
		},
		{
			name: 'list-campaigns',
			description: 'List campaigns associated with the selected advertiser',
			inputSchema: {}
		}
	]
});

jest.mock('../src/cm360', () => ({
	cm360: {
		tools: mockTools
	},
	handleListAdvertisers: mockHandleListAdvertisers,
	handleListCampaigns: mockHandleListCampaigns
}));

// Mock the MCP SDK types
const mockListToolsRequestSchema = { schema: 'list-tools' };
const mockCallToolRequestSchema = { schema: 'call-tool' };

jest.mock('@modelcontextprotocol/sdk/types.js', () => ({
	ListToolsRequestSchema: mockListToolsRequestSchema,
	CallToolRequestSchema: mockCallToolRequestSchema
}));

describe('MCP Server Integration', () => {
	beforeEach(() => {
		// Clear all mocks
		jest.clearAllMocks();
		
		// Import the server module (which will execute the code)
		jest.isolateModules(() => {
			require('../src/index');
		});
	});
	
	it('should initialize the server with correct configuration', () => {
		expect(mockServer).toHaveBeenCalledWith(
			{
				name: 'cm360',
				version: '1.0.0'
			},
			{ capabilities: { tools: {} } }
		);
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
	});
	
	it('should set up request handlers for ListTools and CallTool', () => {
		expect(mockSetRequestHandler).toHaveBeenCalledWith(
			mockListToolsRequestSchema,
			expect.any(Function)
		);
		
		expect(mockSetRequestHandler).toHaveBeenCalledWith(
			mockCallToolRequestSchema,
			expect.any(Function)
		);
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
	});
	
	it('should connect to the transport', () => {
		const transport = require('@modelcontextprotocol/sdk/server/stdio.js').StdioServerTransport();
		
		expect(mockConnect).toHaveBeenCalledWith(transport);
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
	});
	
	it('should handle list-advertisers tool calls', async () => {
		// Get the CallToolRequestSchema handler
		const callToolHandler = mockSetRequestHandler.mock.calls.find(
			call => call[0].schema === 'call-tool'
		)[1];
		
		// Create a mock request
		const request = {
			params: {
				name: 'list-advertisers',
				arguments: { searchString: 'Test' }
			}
		};
		
		// Call the handler
		await callToolHandler(request);
		
		// Verify the CM360 module was called correctly
		expect(mockHandleListAdvertisers).toHaveBeenCalledWith(
			{ searchString: 'Test' }
		);
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
	});
	
	it('should handle list-campaigns tool calls', async () => {
		// Get the CallToolRequestSchema handler
		const callToolHandler = mockSetRequestHandler.mock.calls.find(
			call => call[0].schema === 'call-tool'
		)[1];
		
		// Create a mock request
		const request = {
			params: {
				name: 'list-campaigns',
				arguments: { advertiserIds: [1] }
			}
		};
		
		// Call the handler
		await callToolHandler(request);
		
		// Verify the CM360 module was called correctly
		expect(mockHandleListCampaigns).toHaveBeenCalledWith(
			{ advertiserIds: [1] }
		);
		
		// Verify no errors were logged
		expect(testLogger.logs.error).toHaveLength(0);
	});
});