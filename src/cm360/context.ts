import { JWT } from "google-auth-library";
import { config } from 'dotenv';
import { envSchema } from '../schemas';

// load environment variables from .env
config();

// validate environment variables
const env = envSchema.parse(process.env);

// objectify key file
const keys = require(env.GOOGLE_APPLICATION_CREDENTIALS);

// Google API auth
export const client = new JWT({
	keyFile: env.GOOGLE_APPLICATION_CREDENTIALS,
	email: keys.client_email,
	key: keys.private_key,
	scopes: ["https://www.googleapis.com/auth/dfatrafficking"],
});

// base URL for CM360 API v4
export const baseUrl = `https://dfareporting.googleapis.com/dfareporting/v4/userprofiles/${env.CM360_PROFILE_ID}`;

// global vars
export let selectedAdvertiserId: number | null = null;