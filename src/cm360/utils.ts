import type { HttpMethod, CM360Response } from '../cm360';
import { client } from './context';

// paginatedRequest: Handles serial API requests due to paginated results
export const paginatedRequest = async (
  url: string,
  baseParams: Record<string, any>,
  method: HttpMethod,
  valueArrayKey: string
): Promise<any[]> => {
	try {
		let pageToken = '';
		let pageNumber = 1;
		let isLastPage = false;
		const valueArray: any[] = [];
		do {
			const params: Record<string, any> = (pageToken) ? {
				pageToken, ...baseParams } : { ...baseParams };
			console.error(`Sending request to ${url} with params:`, params);
			const res = await client.request({
				url,
				method,
				params,
				timeout: 5000
			});
			const data = res.data as CM360Response;
			if (data[valueArrayKey] && Array.isArray(data[valueArrayKey])) {
				valueArray.push(...data[valueArrayKey]);
			}
			pageNumber++;
			pageToken = data.nextPageToken || '';
			if (!data[valueArrayKey] || data[valueArrayKey].length === 0 || !pageToken || pageNumber >= 10) {
				isLastPage = true;
			}
		} while (!isLastPage);
		return valueArray;
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