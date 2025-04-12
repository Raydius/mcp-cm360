import type { HttpMethod, CM360Response } from '../cm360';
import { client } from './context';

// paginatedRequest: Exposes API pagination to the user (single page per request)
export const paginatedRequest = async (
  url: string,
  baseParams: Record<string, any>,
  method: HttpMethod,
  valueArrayKey: string
): Promise<{ items: any[]; nextPageToken?: string; }> => {
	try {
		const params: Record<string, any> = { ...baseParams };
		console.error(`Sending request to ${url} with params:`, params);
		const res = await client.request({
			url,
			method,
			params,
			timeout: 5000
		});
		const data = res.data as CM360Response;
		const items = (data[valueArrayKey] && Array.isArray(data[valueArrayKey]))
			? data[valueArrayKey]
			: [];
		const nextPageToken = data.nextPageToken || undefined;
		return { items, nextPageToken };
	} catch (err) {
		console.error("Error in paginatedRequest:");
		if (err instanceof Error) {
			console.error(`- Message: ${err.message}`);
			console.error(`- Stack: ${err.stack}`);
		} else {
			console.error(`- Non-Error object: ${String(err)}`);
		}
		throw err;
	}
};

// mcpReturnJSON: Return in the format expected by MCP
export const mcpReturnJSON = (data: any) => {
	return {
		content: [{
			type: "text",
			text: JSON.stringify(data, null, 2)
		}]
	};
};