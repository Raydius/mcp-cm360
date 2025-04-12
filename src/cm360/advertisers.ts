import { ListAdvertisersSchema, SelectAdvertiserSchema } from '../schemas';
import { paginatedRequest, mcpReturnJSON } from './utils';
import type { McpResponse } from '../cm360';
import { baseUrl, selectedAdvertiserId } from './context';

// Handler to list all advertisers on the account
export const handleListAdvertisers = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	const parsedArgs = ListAdvertisersSchema.parse(args || {});
	const url = `${baseUrl}/advertisers`;
	const { items, nextPageToken } = await paginatedRequest(url, parsedArgs, "GET", "advertisers");
	console.error(`Successfully retrieved ${items.length} advertisers`);
	return mcpReturnJSON({
		advertisers: items,
		nextPageToken
	});
};

// Handler to select an advertiser
export const handleSelectAdvertiser = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	try {
		const parsedArgs = SelectAdvertiserSchema.parse(args || {});
		// @ts-ignore
		require('./context').selectedAdvertiserId = parsedArgs.advertiserId;
		return {
			content: [{
				type: "text",
				text: "Advertiser selected successfully"
			}]
		};
	}
	catch (error) {
		console.error('Failed to select advertiser', error);
		// @ts-ignore
		require('./context').selectedAdvertiserId = null;
		throw error;
	}
};