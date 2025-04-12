import { ListCampaignsSchema, ListCampaignCreativeAssociationsSchema } from '../schemas';
import { paginatedRequest, mcpReturnJSON } from './utils';
import type { McpResponse } from '../cm360';
import { baseUrl, selectedAdvertiserId } from './context';

// Handler for campaign listing
export const handleListCampaigns = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	const parsedArgs = ListCampaignsSchema.parse(args || {});

	// use the selected advertiser ID (if there is one)
	if(parsedArgs.advertiserIds && parsedArgs.advertiserIds.length == 0 && selectedAdvertiserId) {
		parsedArgs.advertiserIds.push(selectedAdvertiserId);
	}

	const url = `${baseUrl}/campaigns`;
	const campaigns = await paginatedRequest(url, parsedArgs, "GET", "campaigns");
	console.error(`Successfully retrieved ${campaigns.length} campaigns`);
	return mcpReturnJSON(campaigns);
};

// Handler for campaign creative associations listing
export const handleListCampaignCreativeAssociations = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	const parsedArgs = ListCampaignCreativeAssociationsSchema.parse(args || {});
	const { campaignId, maxResults, pageToken } = parsedArgs;

	const url = `${baseUrl}/campaigns/${campaignId}/campaignCreativeAssociations`;

	const params: Record<string, any> = {};
	if (maxResults !== undefined) params.maxResults = maxResults;
	if (pageToken !== undefined) params.pageToken = pageToken;

	const associations = await paginatedRequest(url, params, "GET", "campaignCreativeAssociations");
	console.error(`Successfully retrieved ${associations.length} campaignCreativeAssociations`);
	return mcpReturnJSON(associations);
};