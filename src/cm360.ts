/**
 * CM360 API Module
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

// auth
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

export type ListAdvertisersArgs = z.infer<typeof ListAdvertisersSchema>;

// Define interface for CM360 API response
interface CM360Response {
	advertisers: any[];
	nextPageToken?: string;
}

// Define MCP response type
interface McpResponse {
	content: Array<{
		type: string;
		text: string;
	}>;
	isError?: boolean;
}

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
								default: "acura"
							},
							maxResults: {
								type: "number",
								description: "Maximum number of results",
								default: 10
							}
						},
						required: [],
					},
				}
			]
		};
	},

	handleListAdvertisers: async (args?: Record<string, unknown>): Promise<McpResponse> => {
		// Parse arguments with zod schema
		const parsedArgs = ListAdvertisersSchema.parse(args || {});
		const searchString = parsedArgs.searchString;
		const maxResults = parsedArgs.maxResults;
		
		const url = `${baseUrl}/advertisers`;

		try {
			// set initial values for paging
			let pageToken = '';
			let isLastPage = false;

			const advertisers: any[] = [];

			do {
				// include a pagetoken if this is not the first iteration
				const params: Record<string, any> = (pageToken) ? {
					pageToken, maxResults: maxResults } : { maxResults: maxResults };
				
				// Add search string if provided
				if (searchString) {
					params.searchString = searchString;
				}

				// Add debugging
				console.error(`Sending request to ${url} with params:`, params);
				
				// Send the request to the API with timeout
				const res = await client.request({
					url,
					params,
					timeout: 30000 // 30 second timeout
				});
				const data = res.data as CM360Response;

				// Extract advertisers from the response and add them to the array
				if (data.advertisers && Array.isArray(data.advertisers)) {
					advertisers.push(...data.advertisers);
				}

				// Check for next page
				pageToken = data.nextPageToken || '';

				if (!data.advertisers || data.advertisers.length === 0 || !pageToken) {
					isLastPage = true;
				}
			}
			while (!isLastPage);

			console.error(`Successfully retrieved ${advertisers.length} advertisers`);

			// Return in the format expected by MCP
			return {
				content: [{
					type: "text",
					text: JSON.stringify(advertisers.slice(0, maxResults), null, 2)
				}]
			};
		}
		catch (err) {
			// Log detailed error information
			console.error("Error in handleListAdvertisers:");
			if (err instanceof Error) {
				console.error(`- Message: ${err.message}`);
				console.error(`- Stack: ${err.stack}`);
			} else {
				console.error(`- Non-Error object: ${String(err)}`);
			}
			
			// Return error response
			return {
				content: [{
					type: "text",
					text: `Error fetching advertisers: ${err instanceof Error ? err.message : String(err)}`
				}],
				isError: true
			};
		}
	}
};