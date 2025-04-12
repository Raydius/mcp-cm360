import { ListEventTagsSchema } from '../schemas';
import { paginatedRequest, mcpReturnJSON } from './utils';
import type { McpResponse } from '../cm360';
import { baseUrl, selectedAdvertiserId } from './context';

// Handler for event tag listing
import { mcpFileLog } from './utils';

export const handleListEventTags = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	console.error("[MCP TOOL INVOCATION] handleListEventTags called with args:", args);
	mcpFileLog("[MCP TOOL INVOCATION] handleListEventTags called with args:", args);
	const parsedArgs = ListEventTagsSchema.parse(args || {});
	console.error("[MCP TOOL INVOCATION] handleListEventTags parsedArgs:", parsedArgs);
	mcpFileLog("[MCP TOOL INVOCATION] handleListEventTags parsedArgs:", parsedArgs);

	// use the selected advertiser ID (if there is one)
	if (parsedArgs.advertiserIds.length === 0 && selectedAdvertiserId) {
		console.error("[MCP TOOL INVOCATION] handleListEventTags using selectedAdvertiserId:", selectedAdvertiserId);
		mcpFileLog("[MCP TOOL INVOCATION] handleListEventTags using selectedAdvertiserId:", selectedAdvertiserId);
		parsedArgs.advertiserIds.push(selectedAdvertiserId);
	}

	const url = `${baseUrl}/eventTags`;
	const { items, nextPageToken } = await paginatedRequest(url, parsedArgs, "GET", "eventTags");
	console.error(`[MCP TOOL INVOCATION] handleListEventTags response: ${items.length} event tags, nextPageToken: ${nextPageToken}`);
	mcpFileLog(`[MCP TOOL INVOCATION] handleListEventTags response: ${items.length} event tags, nextPageToken: ${nextPageToken}`);
	return mcpReturnJSON({
		eventTags: items,
		nextPageToken
	});
};