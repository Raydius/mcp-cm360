# activeContext.md

## Current Session Context

- The codebase has been refactored to use a modular handler structure for all CM360 API operations.
- Each handler function (e.g., handleListAdvertisers, handleListCampaigns) is implemented in its own domain file under `src/cm360/` and re-exported via `src/cm360/index.ts`.
- The MCP server exposes tools such as: list-advertisers, select-advertiser, list-campaigns, list-creatives, list-creative-groups, list-event-tags, and list-placements, each with a well-defined input schema.
- The test suite is fully synchronized with the codebase and all tests are passing (6/6 suites, 25/25 tests).

## Recent Changes

- Refactored CM360 API handler functions into separate domain files under `src/cm360/`.
- Updated `src/cm360/index.ts` to re-export all handler functions for unified access.
- Updated all test files to use the new modular handler exports.
- Updated the tools test to match the current implementation (including new tools).
- Corrected jest.mock usage in index.test.ts to mock modular handler exports.
- Verified that all tests pass after these updates.

## Current Goals

- Maintain alignment between code and test suite as new features or refactors are introduced.
- Continue to enforce read-only access and auditability for all CM360 API operations.
- Ensure that all new tools and handlers are documented and tested.

## Open Questions

- Are there any additional CM360 API endpoints or workflows that should be prioritized for implementation?
- Are there integration or compliance requirements beyond the CM360 API documentation?