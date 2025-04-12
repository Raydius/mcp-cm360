/**
 * Schema Definitions for Type Inference
 * 
 * 
 */

import { z } from "zod";

export const envSchema = z.object({
	GOOGLE_APPLICATION_CREDENTIALS: z.string(),
	CM360_PROFILE_ID: z.string(),
	NODE_ENV: z.enum(["development", "production"]).optional().default("production"),
});

export const ListAdvertisersSchema = z.object({
	searchString: z.string().optional().default("")
});

export const SelectAdvertiserSchema = z.object({
	advertiserId: z.number()
});

export const ListCampaignsSchema = z.object({
	advertiserIds: z.number().array().optional().default([]),
	searchString: z.string().optional().default("")
});

export const ListCreativesSchema = z.object({
	advertiserIds: z.number().array().optional().default([]),
	campaignIds: z.number().array().optional().default([]),
	searchString: z.string().optional().default("")
});

export const ListCreativeGroupsSchema = z.object({
	advertiserIds: z.number().array().optional().default([]),
	campaignIds: z.number().array().optional().default([]),
	searchString: z.string().optional().default("")
});

export const ListEventTagsSchema = z.object({
	advertiserIds: z.number().array().optional().default([]),
	campaignIds: z.number().array().optional().default([]),
	searchString: z.string().optional().default("")
});

export const ListPlacementsSchema = z.object({
	advertiserIds: z.number().array().optional().default([]),
	campaignIds: z.number().array().optional().default([]),
	searchString: z.string().optional().default("")
});