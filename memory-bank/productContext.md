# productContext.md

## Project Vision
This project is an MCP server that interfaces with the CM360 API v4, designed for advanced marketers who leverage MCP servers to inquire about their Campaign Manager 360 account.

## Main Goals
- Provide a clean and auditable codebase.
- Restrict all functionality to read-only operations using the CM360 v4 API.
- Ensure all code is easily maintainable and extensible.
- Facilitate advanced, programmatic access to CM360 data for marketing professionals.

## Key Constraints
- Only read-only functions from the CM360 v4 API are permitted.
- All API usage must comply with the documentation: https://developers.google.com/doubleclick-advertisers/rest/v4/

## System Architecture

- The CM360 API integration is implemented using a modular handler pattern:
  - Each API domain (advertisers, campaigns, creatives, eventTags, placements, etc.) is implemented as a separate module in the `src/cm360/` directory.
  - Handler functions for each domain are exported from their respective files and re-exported via `src/cm360/index.ts` for unified access.
  - The legacy approach of implementing all handlers in `src/cm360.ts` has been replaced by this modular structure.
  - The `src/cm360.ts` file now serves as an entry point and compatibility layer, delegating to the modularized handlers.
- This architecture improves maintainability, separation of concerns, and extensibility for future development.

## Core Memory Bank Files
- **productContext.md**: Project vision, goals, and constraints (this file).
- **activeContext.md**: Current session state and goals.
- **progress.md**: Work completed and next steps.
- **decisionLog.md**: Key architectural and technical decisions, with rationale.

Additional files may be created as needed to support project documentation and architectural clarity.