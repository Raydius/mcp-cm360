# activeContext.md

## Current Session Context

- The codebase has been refactored to use named exports for all handler functions (e.g., handleListAdvertisers, handleListCampaigns) in src/cm360.ts.
- All test files have been updated to import and use these named exports directly.
- The MCP server exposes five tools: list-advertisers, select-advertiser, list-campaigns, list-creatives, and list-event-tags, each with a well-defined input schema.
- The test suite is fully synchronized with the codebase and all tests are passing (6/6 suites, 25/25 tests).

## Recent Changes

- Refactored src/cm360.ts to use named exports for handler functions.
- Updated all test files to use named exports for handler functions.
- Updated the tools test to match the current implementation (five tools).
- Corrected jest.mock usage in index.test.ts to mock named exports.
- Verified that all tests pass after these updates.

## Current Goals

- Maintain alignment between code and test suite as new features or refactors are introduced.
- Continue to enforce read-only access and auditability for all CM360 API operations.
- Ensure that all new tools and handlers are documented and tested.

## Open Questions

- Are there any additional CM360 API endpoints or workflows that should be prioritized for implementation?
- Are there integration or compliance requirements beyond the CM360 API documentation?