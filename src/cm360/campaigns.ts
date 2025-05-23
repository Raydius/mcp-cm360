import { ListCampaignsSchema, ListCampaignCreativeAssociationsSchema } from '../schemas';
import { paginatedRequest, mcpReturnJSON } from './utils';
import type { McpResponse } from '../cm360';
import { baseUrl, selectedAdvertiserId } from './context';

// Handler for campaign listing
import { mcpFileLog } from './utils';

export const handleListCampaigns = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	console.error("[MCP TOOL INVOCATION] handleListCampaigns called with args:", args);
	mcpFileLog("[MCP TOOL INVOCATION] handleListCampaigns called with args:", args);
	const parsedArgs = ListCampaignsSchema.parse(args || {});
	console.error("[MCP TOOL INVOCATION] handleListCampaigns parsedArgs:", parsedArgs);
	mcpFileLog("[MCP TOOL INVOCATION] handleListCampaigns parsedArgs:", parsedArgs);

	// use the selected advertiser ID (if there is one)
	if(parsedArgs.advertiserIds && parsedArgs.advertiserIds.length == 0 && selectedAdvertiserId) {
		console.error("[MCP TOOL INVOCATION] handleListCampaigns using selectedAdvertiserId:", selectedAdvertiserId);
		mcpFileLog("[MCP TOOL INVOCATION] handleListCampaigns using selectedAdvertiserId:", selectedAdvertiserId);
		parsedArgs.advertiserIds.push(selectedAdvertiserId);
	}

	const url = `${baseUrl}/campaigns`;
	const { items, nextPageToken } = await paginatedRequest(url, parsedArgs, "GET", "campaigns");
	console.error(`[MCP TOOL INVOCATION] handleListCampaigns response: ${items.length} campaigns, nextPageToken: ${nextPageToken}`);
	mcpFileLog(`[MCP TOOL INVOCATION] handleListCampaigns response: ${items.length} campaigns, nextPageToken: ${nextPageToken}`);
	return mcpReturnJSON({
		campaigns: items,
		nextPageToken
	});
};

// Handler for campaign creative associations listing
export const handleListCampaignCreativeAssociations = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	const parsedArgs = ListCampaignCreativeAssociationsSchema.parse(args || {});
	const { campaignId, maxResults, pageToken } = parsedArgs;

	const url = `${baseUrl}/campaigns/${campaignId}/campaignCreativeAssociations`;

	const params: Record<string, any> = {};
	if (maxResults !== undefined) params.maxResults = maxResults;
	if (pageToken !== undefined) params.pageToken = pageToken;

	const { items, nextPageToken } = await paginatedRequest(url, params, "GET", "campaignCreativeAssociations");
	console.error(`Successfully retrieved ${items.length} campaignCreativeAssociations`);
	return mcpReturnJSON({
		campaignCreativeAssociations: items,
		nextPageToken
	});
};