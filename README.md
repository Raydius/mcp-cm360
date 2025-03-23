# MCP CM360 Server

MCP Server that implements read-only API endpoints for Google Campaign Manager 360 (CM360).

## Overview

This MCP server provides tools for interacting with the CM360 API, allowing you to:

- List advertisers in your CM360 account
- Select an advertiser to work with
- List campaigns associated with an advertiser

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