import { ListCreativesSchema, ListCreativeGroupsSchema } from '../schemas';
import { paginatedRequest, mcpReturnJSON } from './utils';
import type { McpResponse } from '../cm360';
import { baseUrl, selectedAdvertiserId } from './context';

// Handler for creative listing
export const handleListCreatives = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	const parsedArgs = ListCreativesSchema.parse(args || {});

	// use the selected advertiser ID (if there is one)
	if (parsedArgs.advertiserIds.length === 0 && selectedAdvertiserId) {
		parsedArgs.advertiserIds.push(selectedAdvertiserId);
	}

	const url = `${baseUrl}/creatives`;
	const { items, nextPageToken } = await paginatedRequest(url, parsedArgs, "GET", "creatives");
	console.error(`Successfully retrieved ${items.length} creatives`);
	return mcpReturnJSON({
		creatives: items,
		nextPageToken
	});
};

// Handler for creative groups listing
export const handleListCreativeGroups = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	const parsedArgs = ListCreativeGroupsSchema.parse(args || {});

	if (parsedArgs.advertiserIds.length === 0 && selectedAdvertiserId) {
		parsedArgs.advertiserIds.push(selectedAdvertiserId);
	}

	const url = `${baseUrl}/creativeGroups`;
	const { items: groupItems, nextPageToken: groupNextPageToken } = await paginatedRequest(url, parsedArgs, "GET", "creativeGroups");
	console.error(`Successfully retrieved ${groupItems.length} creative groups`);
	return mcpReturnJSON({
		creativeGroups: groupItems,
		nextPageToken: groupNextPageToken
	});
};