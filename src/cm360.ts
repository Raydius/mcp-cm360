/**
 * CM360 API Module
 * 
 * Interface for CM360 API with only read-only methods to prevent any accidental changes to ad trafficking
 * 
 * @author Ray Dollete <rjdollete@gmail.com>
 */

// auth dependencies
import { JWT } from "google-auth-library";
import { config } from 'dotenv';

// schema definitions
import { envSchema, ListAdvertisersSchema, SelectAdvertiserSchema, ListCampaignsSchema, ListCreativesSchema, ListEventTagsSchema, ListCreativeGroupsSchema } from './schemas';

// load environment variables from .env
config();

// validate environment variables
const env = envSchema.parse(process.env);

// objectify key file
const keys = require(env.GOOGLE_APPLICATION_CREDENTIALS);

// Google API auth
const client = new JWT({
	keyFile: env.GOOGLE_APPLICATION_CREDENTIALS,
	email: keys.client_email,
	key: keys.private_key,
	scopes: ["https://www.googleapis.com/auth/dfatrafficking"],
});

// base URL for CM360 API v4
const baseUrl = `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${env.CM360_PROFILE_ID}`;


// Define types for paginatedRequest function
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Define interface for CM360 API response
interface CM360Response {
	advertisers?: any[];
	campaigns?: any[];
	nextPageToken?: string;
	[key: string]: any; // Allow indexing with string keys
}

// Define MCP response type
interface McpResponse {
	content: Array<{
		type: string;
		text: string;
	}>;
	isError?: boolean;
}

// global vars
let selectedAdvertiserId: number | null = null;

// Main CM360 API module
export const cm360 = {
	tools: async () => {
		return {
			tools: [
				{
					name: "list-advertisers",
					description: "List advertisers associated with this account",
					inputSchema: {
						type: "object",
						properties: {
							searchString: {
								type: "string",
								description: "Search query for advertiser name",
								default: ""
							}
						},
						required: [],
					}
				},
				{
					name: "select-advertiser",
					description: "Select advertiser to use for subsequent interactions",
					inputSchema: {
						type: "object",
						properties: {
							advertiserId: {
								type: "number",
								description: "ID of Advertiser to select",
							}
						},
						required: []
					}
				},
				{
					name: "list-campaigns",
					description: "List campaigns associated with the selected advertiser (or account if no advertiser selected)",
					inputSchema: {
						type: "object",
						properties: {
							advertiserIds: {
								type: "array",
								items: {
									type: "number"
								},
								description: "ID of Advertiser you want to filter campaigns by"
							},
							searchString: {
								type: "string",
								description: "Search query for campaign name"
							}
						},
						required: []
					}
				},
				{
					name: "list-creatives",
					description: "List creatives associated with the selected advertiser and/or campaign",
					inputSchema: {
						type: "object",
						properties: {
							advertiserIds: {
								type: "array",
								items: {
									type: "number"
								},
								description: "IDs of Advertisers to filter creatives by"
							},
							campaignIds: {
								type: "array",
								items: {
									type: "number"
								},
								description: "IDs of Campaigns to filter creatives by"
							},
							searchString: {
								type: "string",
								description: "Search query for creative name"
							}
						},
						required: []
					}
				},
				{
					name: "list-creative-groups",
					description: "List creative groups associated with the selected advertiser and/or campaign",
					inputSchema: {
						type: "object",
						properties: {
							advertiserIds: {
								type: "array",
								items: {
									type: "number"
								},
								description: "IDs of Advertisers to filter creative groups by"
							},
							campaignIds: {
								type: "array",
								items: {
									type: "number"
								},
								description: "IDs of Campaigns to filter creative groups by"
							},
							searchString: {
								type: "string",
								description: "Search query for creative group name"
							}
						},
						required: []
					}
				},
				{
					name: "list-event-tags",
					description: "List event tags associated with the selected advertiser and/or campaign",
					inputSchema: {
						type: "object",
						properties: {
							advertiserIds: {
								type: "array",
								items: {
									type: "number"
								},
								description: "IDs of Advertisers to filter event tags by"
							},
							campaignIds: {
								type: "array",
								items: {
									type: "number"
								},
								description: "IDs of Campaigns to filter event tags by"
							},
							searchString: {
								type: "string",
								description: "Search query for event tag name"
							}
						},
						required: []
					}
				},
				{
					name: "list-placements",
					description: "List placements associated with the selected advertiser and/or campaign",
					inputSchema: {
						type: "object",
						properties: {
							advertiserIds: {
								type: "array",
								items: {
									type: "number"
								},
								description: "IDs of Advertisers to filter placements by"
							},
							campaignIds: {
								type: "array",
								items: {
									type: "number"
								},
								description: "IDs of Campaigns to filter placements by"
							},
							searchString: {
								type: "string",
								description: "Search query for placement name"
							}
						},
						required: []
					}
				}
			]
		};
	}
};

// handler for event tag listing
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

// handler to list all advertisers on the account
export const handleListAdvertisers = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	const parsedArgs = ListAdvertisersSchema.parse(args || {});
	const url = `${baseUrl}/advertisers`;
	const advertisers = await paginatedRequest(url, parsedArgs, "GET", "advertisers");
	console.error(`Successfully retrieved ${advertisers.length} advertisers`);
	return mcpReturnJSON(advertisers);
};

// handler to select an advertiser
export const handleSelectAdvertiser = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	try {
		const parsedArgs = SelectAdvertiserSchema.parse(args || {});
		selectedAdvertiserId = parsedArgs.advertiserId;
		return {
			content: [{
				type: "text",
				text: "Advertiser selected successfully"
			}]
		};
	}
	catch (error) {
		console.error('Failed to select advertiser', error);
		selectedAdvertiserId = null;
		throw error;
	}
};

export const handleListCreativeGroups = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	const parsedArgs = ListCreativeGroupsSchema.parse(args || {});

	if (parsedArgs.advertiserIds.length === 0 && selectedAdvertiserId) {
		parsedArgs.advertiserIds.push(selectedAdvertiserId);
	}

	const url = `${baseUrl}/creativeGroups`;
	const creativeGroups = await paginatedRequest(url, parsedArgs, "GET", "creativeGroups");
	console.error(`Successfully retrieved ${creativeGroups.length} creative groups`);
	return mcpReturnJSON(creativeGroups);
};

import { ListPlacementsSchema } from './schemas';

// handler for placements listing
export const handleListPlacements = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	const parsedArgs = ListPlacementsSchema.parse(args || {});

	// use the selected advertiser ID (if there is one)
	if (parsedArgs.advertiserIds.length === 0 && selectedAdvertiserId) {
		parsedArgs.advertiserIds.push(selectedAdvertiserId);
	}

	const url = `${baseUrl}/placements`;
	const placements = await paginatedRequest(url, parsedArgs, "GET", "placements");
	console.error(`Successfully retrieved ${placements.length} placements`);
	return mcpReturnJSON(placements);
};

// handler for campaign listing
export const handleListCampaigns = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	const parsedArgs = ListCampaignsSchema.parse(args || {});

	// use the selected advertiser ID (if there is one)
	if(parsedArgs.advertiserIds.length == 0 && selectedAdvertiserId) {
		parsedArgs.advertiserIds.push(selectedAdvertiserId);
	}

	const url = `${baseUrl}/campaigns`;
	const campaigns = await paginatedRequest(url, parsedArgs, "GET", "campaigns");
	console.error(`Successfully retrieved ${campaigns.length} campaigns`);
	return mcpReturnJSON(campaigns);
};

// handler for creative listing
export const handleListCreatives = async (args?: Record<string, unknown>): Promise<McpResponse> => {
	const parsedArgs = ListCreativesSchema.parse(args || {});

	// use the selected advertiser ID (if there is one)
	if (parsedArgs.advertiserIds.length === 0 && selectedAdvertiserId) {
		parsedArgs.advertiserIds.push(selectedAdvertiserId);
	}

	const url = `${baseUrl}/creatives`;
	const creatives = await paginatedRequest(url, parsedArgs, "GET", "creatives");
	console.error(`Successfully retrieved ${creatives.length} creatives`);
	return mcpReturnJSON(creatives);
};


// handler for serial API requests due to paginated results
const paginatedRequest = async (
  url: string,
  baseParams: Record<string, any>,
  method: HttpMethod,
  valueArrayKey: string
): Promise<any[]> => {

	try {
		// set initial values for paging
		let pageToken = '';
		let pageNumber = 1;
		let isLastPage = false;

		// init array for return values
		const valueArray: any[] = [];

		do {
			// include a pagetoken (if this is not the first iteration) in addition to the other base parameters
			const params: Record<string, any> = (pageToken) ? {
				pageToken, ...baseParams } : { ...baseParams };
			
			// Add debugging
			console.error(`Sending request to ${url} with params:`, params);

			// Send the request to the API with timeout
			const res = await client.request({
				url,
				method,
				params,
				timeout: 5000 // 5 second timeout per page
			});
			const data = res.data as CM360Response;

			// Extract values from the response and add them to the array
			if (data[valueArrayKey] && Array.isArray(data[valueArrayKey])) {
				valueArray.push(...data[valueArrayKey]);
			}

			// increment page count
			pageNumber++;

			// Check for next page
			pageToken = data.nextPageToken || '';

			// stop if this is either the last page of results or the 10th page (whichever comes first)
			if (!data[valueArrayKey] || data[valueArrayKey].length === 0 || !pageToken || pageNumber >= 10) {
				isLastPage = true;
			}			
		}
		while (!isLastPage);

		return valueArray;
	}
	catch (err) {
		// Log detailed error information
		console.error("Error in paginatedRequest:");
		if (err instanceof Error) {
			console.error(`- Message: ${err.message}`);
			console.error(`- Stack: ${err.stack}`);
		} else {
			console.error(`- Non-Error object: ${String(err)}`);
		}
		
		// Rethrow the error to be handled by the calling function
		throw err;
	}
};

// Return in the format expected by MCP
const mcpReturnJSON = (data: any) => {
	return {
		content: [{
			type: "text",
			text: JSON.stringify(data, null, 2)
		}]
	};
};