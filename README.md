# Fibtero

Roadkill beaver. A custom Jira reader.

Based on [`vite-electron-skeleton`](https://github.com/electrovir/vite-electron-skeleton).

# Setup

1. clone the repo
2. `npm install`
3. Generate a Jira API key: https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account
4. Figure out the domain name for your Jira Cloud instance. Example: `<company-name>.atlassian.net`
5. Get your username (should be a full email)
6. Run `npm start`, fill in the fields.

# Code arrangement

All source code is in `packages`.

-   `packages/common`: code shared between all packages
-   `packages/jest`: jest (testing) config
-   `packages/main`: backend for the Electron app.
-   `packages/preload`: part of the backend for the Electron app.
-   `packages/renderer`: frontend for the Electron app.
-   `packages/scripts`: collection of scripts that can be run directly.

# Dev

-   `npm run start`: startup developer Electron app that auto-refreshes when changes are detected.
-   `npm run compile`: output an executable/app for the current system into the `/dist` directory.
-   `npm run type-check`: run TypeScript type checking for all packages.
-   `npm test`: run tests.
-   `npm run test:full`: run all configured tests (including spellchecking, type checking, etc.).
-   `npm run format`: format all code.

Tested on Node.js `16`.
