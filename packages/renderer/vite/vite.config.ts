import {join} from 'path';
/** This file is sometimes run through vite directly, which doesn't know about tsconfig paths. */
import {generateViteConfig} from '../../common/src/vite-config';
import {alwaysReloadPlugin} from './always-reload-plugin';

const viteConfig = generateViteConfig({
    rootDir: join(__dirname, '../'),
    target: 'chrome',
    libraryMode: false,
    plugins: [alwaysReloadPlugin()],
    sourceMap: true,
});

export default viteConfig;
