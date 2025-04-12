import { ListAdvertisersSchema, SelectAdvertiserSchema } from '../schemas';
import { paginatedRequest, mcpReturnJSON } from './utils';
import type { McpResponse } from '../cm360';
import { baseUrl, selectedAdvertiserId } from './context';

// Handler to list all advertisers on the account
export const handleListAdvertisers = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	console.error("[MCP TOOL INVOCATION] handleListAdvertisers called with args:", args);
	const parsedArgs = ListAdvertisersSchema.parse(args || {});
	console.error("[MCP TOOL INVOCATION] handleListAdvertisers parsedArgs:", parsedArgs);
	const url = `${baseUrl}/advertisers`;
	const { items, nextPageToken } = await paginatedRequest(url, parsedArgs, "GET", "advertisers");
	console.error(`[MCP TOOL INVOCATION] handleListAdvertisers response: ${items.length} advertisers, nextPageToken: ${nextPageToken}`);
	return mcpReturnJSON({
		advertisers: items,
		nextPageToken
	});
};

// Handler to select an advertiser
export const handleSelectAdvertiser = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	console.error("[MCP TOOL INVOCATION] handleSelectAdvertiser called with args:", args);
	try {
		const parsedArgs = SelectAdvertiserSchema.parse(args || {});
		console.error("[MCP TOOL INVOCATION] handleSelectAdvertiser parsedArgs:", parsedArgs);
		// @ts-ignore
		require('./context').selectedAdvertiserId = parsedArgs.advertiserId;
		console.error("[MCP TOOL INVOCATION] handleSelectAdvertiser set selectedAdvertiserId:", parsedArgs.advertiserId);
		return {
			content: [{
				type: "text",
				text: "Advertiser selected successfully"
			}]
		};
	}
	catch (error) {
		console.error('[MCP TOOL INVOCATION] Failed to select advertiser', error);
		// @ts-ignore
		require('./context').selectedAdvertiserId = null;
		throw error;
	}
};