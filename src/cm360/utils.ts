import type { HttpMethod, CM360Response } from '../cm360';
import { client } from './context';
import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE_PATH = path.join(__dirname, '../../mcp-debug.log');
let logFileInitialized = false;

export function mcpFileLog(...args: any[]) {
  try {
    // Overwrite the log file on first log of the process
    if (!logFileInitialized) {
      fs.writeFileSync(LOG_FILE_PATH, `[MCP DEBUG LOG - ${new Date().toISOString()}]\n`, { encoding: 'utf8' });
      logFileInitialized = true;
    }
    const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a, null, 2))).join(' ');
    fs.appendFileSync(LOG_FILE_PATH, `[${new Date().toISOString()}] ${msg}\n`, { encoding: 'utf8' });
  } catch (err) {
    // fallback to console if file write fails
    // eslint-disable-next-line no-console
    console.error('[MCP FILE LOG ERROR]', err);
  }
}

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
		mcpFileLog(`Sending request to ${url} with params:`, params);
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
		mcpFileLog("Error in paginatedRequest:", err);
		if (err instanceof Error) {
			console.error(`- Message: ${err.message}`);
			console.error(`- Stack: ${err.stack}`);
			mcpFileLog(`- Message: ${err.message}`);
			mcpFileLog(`- Stack: ${err.stack}`);
		} else {
			console.error(`- Non-Error object: ${String(err)}`);
			mcpFileLog(`- Non-Error object: ${String(err)}`);
		}
		throw err;
	}
};

// mcpReturnJSON: Return in the format expected by MCP
export const mcpReturnJSON = (data: any) => {
	return {
		...data
	};
};