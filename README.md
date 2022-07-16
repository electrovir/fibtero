# Fibtero

Roadkill beaver. A custom Jira reader.

Based on [`vite-electron-skeleton`](https://github.com/electrovir/vite-electron-skeleton).

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
