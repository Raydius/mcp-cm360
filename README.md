# MCP CM360 Server

MCP Server that implements read-only API endpoints for Google Campaign Manager 360 (CM360).

## Overview

This MCP server provides tools for interacting with the CM360 API, allowing you to:

- List advertisers in your CM360 account
- Select an advertiser to work with
- List campaigns associated with an advertiser

## Debug Logging

**New in April 2025:**  
A file-based debug logging system is now implemented for all major MCP tool handlers. This system writes detailed invocation and debug information to a file named `mcp-debug.log` in the project root.

- The log file is overwritten each time the MCP server process starts, so it only contains logs for the current session.
- All tool invocations, parsed arguments, and key debug information are recorded.
- This is especially useful when the MCP server is managed by a chat application (such as Claude Desktop) and console output is not visible.

**How to use:**
- After running tool invocations (via chat agent or Inspector), open `mcp-debug.log` in the project root to review the logs.
- The log includes timestamps, tool names, arguments, and results for each handler.

**Example log entry:**
```
[MCP DEBUG LOG - 2025-04-12T21:00:00.000Z]
[2025-04-12T21:01:23.456Z] [MCP TOOL INVOCATION] handleListCampaigns called with args: { ... }
[2025-04-12T21:01:23.457Z] [MCP TOOL INVOCATION] handleListCampaigns parsedArgs: { ... }
[2025-04-12T21:01:23.500Z] [MCP TOOL INVOCATION] handleListCampaigns response: 2 campaigns, nextPageToken: null
```

**Log file location:**  
`./mcp-debug.log` (relative to the project root)

**Note:**  
The log file is reset on each server start to prevent unbounded growth and to focus on the current debugging session.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
# Google Campaign Manager 360 API Configuration
GOOGLE_APPLICATION_CREDENTIALS=./path/to/your/service-account-key.json
CM360_PROFILE_ID=your_profile_id_here
```

Note: You can use either absolute paths (starting with `/`) or relative paths (starting with `./`) for the `GOOGLE_APPLICATION_CREDENTIALS` variable. Relative paths will be resolved relative to the project root directory.

### Google Service Account Setup

1. Create a service account in the Google Cloud Console
2. Download the service account key file (JSON)
3. Enable the Campaign Manager API for your project
4. Grant the service account access to your CM360 account

## Usage

Build the server:

```bash
npm run build
```

Start the server:

```bash
npm start
```

## Testing

### Unit Tests

Run the unit tests:

```bash
npm test
# or
npm run test:unit
```

These tests use mocked responses and don't make actual API calls.

### Integration Tests

To run integration tests that make actual API calls to the CM360 API:

1. Ensure your `.env` file is properly configured with valid credentials
2. Run the integration tests:

```bash
npm run test:integration
```

To see detailed output from the API calls, run:

```bash
npm run test:integration:verbose
```

This will show the actual API requests being made, including:
- The URL being called
- The HTTP method
- The parameters being sent

Example output:
```
===== API REQUEST =====
URL: https://dfareporting.googleapis.com/v4/userprofiles/12345/advertisers
Method: GET
Parameters:
{
  "searchString": "",
  "maxResults": 5
}
======================
```

Note: Integration tests will be skipped if valid credentials are not available. When tests are skipped, you'll see output like:

```
Skipping CM360 API Integration Tests: [reason]
```

Where `[reason]` will be one of:
- "Missing .env file"
- "GOOGLE_APPLICATION_CREDENTIALS not set in .env file"
- "Credentials file not found at path: [path]"
- "CM360_PROFILE_ID not set in .env file"

The test summary will also show how many tests were skipped:

```
Test Suites: 1 skipped, 5 passed, 5 of 6 total
Tests:       4 skipped, 21 passed, 25 total
```

### Running Specific Tests

You can run specific test files or test patterns:

```bash
# Run a specific test file
npm test -- tests/cm360.test.ts

# Run tests matching a pattern
npm test -- -t "should handle pagination"

# Run tests with increased verbosity
npm test -- --verbose
```

### Running Real API Tests

```bash
npm run api:test
```

This script:
1. Builds the project first to ensure the latest code is used
2. Makes real API calls to the CM360 API using your credentials
3. Displays the actual API responses in a formatted JSON output
4. Doesn't require any test mocks or frameworks

Example output:
```
===== CM360 REAL API TEST =====
GOOGLE_APPLICATION_CREDENTIALS: /path/to/your/service-account-key.json
CM360_PROFILE_ID: 9661777
===============================

Fetching advertisers...

===== ADVERTISERS =====
[
  {
    "id": 123456,
    "name": "Example Advertiser",
    "status": "APPROVED"
  },
  ...
]
======================

Fetching campaigns...

===== CAMPAIGNS =====
[
  {
    "id": 789012,
    "name": "Example Campaign",
    "advertiserId": 123456
  },
  ...
]
======================

All tests completed successfully!
```

## Available Tools

### list-advertisers

Lists advertisers associated with your CM360 account.

Parameters:
- `searchString` (optional): Search query for advertiser name
- `maxResults` (optional): Maximum number of results (default: 10)

### select-advertiser

Selects an advertiser to use for subsequent interactions.

Parameters:
- `advertiserId`: ID of the advertiser to select

### list-campaigns

Lists campaigns associated with the selected advertiser (or account if no advertiser selected).

Parameters:
- `advertiserIds` (optional): Array of advertiser IDs to filter campaigns by
- `searchString` (optional): Search query for campaign name
- `maxResults` (optional): Maximum number of results (default: 2)