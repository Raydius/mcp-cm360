import { ListPlacementsSchema } from '../schemas';
import { paginatedRequest, mcpReturnJSON } from './utils';
import type { McpResponse } from '../cm360';
import { baseUrl, selectedAdvertiserId } from './context';

// Handler for placements listing
export const handleListPlacements = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	const parsedArgs = ListPlacementsSchema.parse(args || {});

	// use the selected advertiser ID (if there is one)
	if (parsedArgs.advertiserIds.length === 0 && selectedAdvertiserId) {
		parsedArgs.advertiserIds.push(selectedAdvertiserId);
	}

	const url = `${baseUrl}/placements`;
	const { items, nextPageToken } = await paginatedRequest(url, parsedArgs, "GET", "placements");
	console.error(`Successfully retrieved ${items.length} placements`);
	return mcpReturnJSON({
		placements: items,
		nextPageToken
	});
};