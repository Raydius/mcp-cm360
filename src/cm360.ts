/**
 * CM360 API Module
 * 
 * I have so far focused on read-only tools to prevent any accidental changes to ad trafficking
 * 
 * @author Ray Dollete <rjdollete@gmail.com>
 */

// auth dependencies
import { JWT } from "google-auth-library";
import { config } from 'dotenv';
import { z } from 'zod';

// load environment variables from .env
config();

// environment variables validation schema
const envSchema = z.object({
	GOOGLE_APPLICATION_CREDENTIALS: z.string(),
	CM360_PROFILE_ID: z.string(),
	NODE_ENV: z.enum(["development", "production"]).optional().default("production"),
});

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

// Define schema outside the object for proper type inference
const ListAdvertisersSchema = z.object({
	searchString: z.string().optional().default(""),
	maxResults: z.number().optional().default(10)
});

// Define types for paginatedRequest function
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Define types for cm360 method arguments
export type ListAdvertisersArgs = z.infer<typeof ListAdvertisersSchema>;

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

// Main CM360 API module
export const cm360 = {
	// type definitions
	ListAdvertisersSchema,

	// tool definitions
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
							},
							maxResults: {
								type: "number",
								description: "Maximum number of results",
								default: 10
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
							advertiserId: {
								type: "number",
								description: "ID of Advertiser you want to filter campaigns by
							}
						},
						required: []
					}
				}
			]
		};
	},

	// handler to list all advertisers on the account
	handleListAdvertisers: async (args?: Record<string, unknown>): Promise<McpResponse> => {
		// Parse arguments with zod schema
		const parsedArgs = ListAdvertisersSchema.parse(args || {});
		const searchString = parsedArgs.searchString;
		const maxResults = parsedArgs.maxResults;
		
		const url = `${baseUrl}/advertisers`;
		const advertisers = await paginatedRequest ( url, parsedArgs, "GET", "advertisers" );

		console.error(`Successfully retrieved ${advertisers.length} advertisers`);

		// Return in the format expected by MCP
		return {
			content: [{
				type: "text",
				text: JSON.stringify(advertisers.slice(0, maxResults), null, 2)
			}]
		};

	}, // end handleListAdvertisers



	/*
	handleSelectAdvertiser: async (args?: Record<string, unknown>): Promise<McpResponse> => {

	}, // end handleSelectAdvertiser*/
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

			// Check for next page
			pageToken = data.nextPageToken || '';

			if (!data[valueArrayKey] || data[valueArrayKey].length === 0 || !pageToken) {
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