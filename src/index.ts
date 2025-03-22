/**
 * MCP Server that implements CM360 Rest API
 * 
 * @author Ray Dollete <rjdollete@gmail.com>
 */


// MCP dependencies
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from "@modelcontextprotocol/sdk/types.js";

// CM360 API 
import { ListAdvertisersArgs, cm360 } from "./cm360";

// Add error handlers for uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
	console.error('Uncaught Exception:', error);
	process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
	process.exit(1);
});

// text output handler
const createTextResponse = (text: string) => ({
	content: [{ type: "text", text }],
});

// init server object - todo: do we really need to init a blank tools object here?
const server = new Server({
	name: "cm360",
	version: "1.0.0"
}, { capabilities: { tools: {} }});

// tool definitions
server.setRequestHandler(ListToolsRequestSchema, cm360.tools);

// primary tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {


	try {
		switch (request.params.name) {
			case "list-advertisers": 
				return cm360.handleListAdvertisers(request.params.arguments);
			default:
				return {
					content: [{
						type: "text",
						text: `Unknown tool: ${name}`
					}],
					isError: true
				};
		}
	}

	// big catch all 
	catch (error: any) {
		console.error("Error: ", error);
		return createTextResponse(`Error: ${error.message}`);
	}

});



// initialize transport
const transport = new StdioServerTransport();

const startServer = async () => {
	try {
		await server.connect(transport);
		console.error("CM360 MCP Server running on stdio");
	}
	catch (err) {
		console.error("Failed to start CM360 MCP Server:", err);
		process.exit(1);
	}
};

// start the server
startServer();