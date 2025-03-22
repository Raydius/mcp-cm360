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
	CM360_PROFILE_ID: z.number().int(),
	NODE_ENV: z.enum(["development", "production"]).optional().default("production"),
});

// validate environment variables
const env = envSchema.parse(process.env);

// objectify key file
const keys = require(env.GOOGLE_APPLICATION_CREDENTIALS);

// auth
const client = new JWT({
	keyFile: env.GOOGLE_APPLICATION_CREDENTIALS,
	email: keys.client.email,
	key: keys.private_key,
	scopes: ["https://www.googleapis.com/auth/dfatrafficking"],
});

// base URL for CM360 API v4
const baseUrl = `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${env.CM360_PROFILE_ID}`;


export type ListAdvertisersArgs = z.infer<typeof this.ListAdvertisersSchema>;

export const cm360 = {
	// type definitions
	ListAdvertisersSchema: z.object({
		searchString: z.string(),
		maxResults: z.number()
	}),


	// tool definitions
	tools: async () => {
		return {
			tools: [
				{
					name: "list-advertisers",
					description: "List advertisers associated with this account",
					// todo: do we really need to init empty objects for a no-arg tool?
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
								description: "Maximum number of results"
							}
						},
						required: [],
					},
				}
			]
		};
	},
	handleListAdvertisers: async (args: ListAdvertisersArgs) => {
		
		const url = `${baseUrl}/advertisers`;

		try {
			// set initial values for paging
			let pageToken = '';
			let isLastPage = false;

			const advertisers = [];

			do {
				// include a pagetoken if this is not the first iteration
				const params = (pageToken) ? { 
					pageToken, maxResults:3 } : {};

				// placeholder
				//params.maxResults = 3;

				// Send the request to the API
				const res = await client.request({url, params});

				// Extract advertisers from the response and add them to the array
				advertisers.push(res.data.advertisers);

				// Check for next page
				pageToken = res.data.nextPageToken;

				if (res.data.advertisers.length == 0) {
					isLastPage = true;
				}
			}
			while (!isLastPage);

			return advertisers[0];
		}
		catch (err) {
			console.error(err);
		}
	}
};