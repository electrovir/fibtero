import {dirname, join} from 'path';
import {Package} from './environment';

/** This still generates the correct URL when the app is deployed. */
export const repoDir = dirname(dirname(dirname(__dirname)));
export const packagesDir = join(repoDir, 'packages');

const viteFileName = 'vite.config.ts';

export const packageConfigPaths = {
    [Package.Main]: join(packagesDir, Package.Main, viteFileName),
    [Package.Preload]: join(packagesDir, Package.Preload, viteFileName),
    [Package.Renderer]: join(packagesDir, Package.Renderer, 'vite', viteFileName),
} as const;

export const prodPreloadScriptIndex = join(packagesDir, Package.Preload, 'dist', 'index.cjs');
