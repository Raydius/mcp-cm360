import { ListPlacementsSchema } from '../schemas';
import { paginatedRequest, mcpReturnJSON } from './utils';
import type { McpResponse } from '../cm360';
import { baseUrl, selectedAdvertiserId } from './context';

// Handler for placements listing
import { mcpFileLog } from './utils';

export const handleListPlacements = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	console.error("[MCP TOOL INVOCATION] handleListPlacements called with args:", args);
	mcpFileLog("[MCP TOOL INVOCATION] handleListPlacements called with args:", args);
	const parsedArgs = ListPlacementsSchema.parse(args || {});
	console.error("[MCP TOOL INVOCATION] handleListPlacements parsedArgs:", parsedArgs);
	mcpFileLog("[MCP TOOL INVOCATION] handleListPlacements parsedArgs:", parsedArgs);

	// use the selected advertiser ID (if there is one)
	if (parsedArgs.advertiserIds.length === 0 && selectedAdvertiserId) {
		console.error("[MCP TOOL INVOCATION] handleListPlacements using selectedAdvertiserId:", selectedAdvertiserId);
		mcpFileLog("[MCP TOOL INVOCATION] handleListPlacements using selectedAdvertiserId:", selectedAdvertiserId);
		parsedArgs.advertiserIds.push(selectedAdvertiserId);
	}

	const url = `${baseUrl}/placements`;
	const { items, nextPageToken } = await paginatedRequest(url, parsedArgs, "GET", "placements");
	console.error(`[MCP TOOL INVOCATION] handleListPlacements response: ${items.length} placements, nextPageToken: ${nextPageToken}`);
	mcpFileLog(`[MCP TOOL INVOCATION] handleListPlacements response: ${items.length} placements, nextPageToken: ${nextPageToken}`);
	return mcpReturnJSON({
		placements: items,
		nextPageToken
	});
};