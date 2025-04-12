import { ListEventTagsSchema } from '../schemas';
import { paginatedRequest, mcpReturnJSON } from './utils';
import type { McpResponse } from '../cm360';
import { baseUrl, selectedAdvertiserId } from './context';

// Handler for event tag listing
export const handleListEventTags = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	const parsedArgs = ListEventTagsSchema.parse(args || {});

	// use the selected advertiser ID (if there is one)
	if (parsedArgs.advertiserIds.length === 0 && selectedAdvertiserId) {
		parsedArgs.advertiserIds.push(selectedAdvertiserId);
	}

	const url = `${baseUrl}/eventTags`;
	const eventTags = await paginatedRequest(url, parsedArgs, "GET", "eventTags");
	console.error(`Successfully retrieved ${eventTags.length} event tags`);
	return mcpReturnJSON(eventTags);
};