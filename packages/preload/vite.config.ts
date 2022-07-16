import {generateViteConfig} from '@packages/common/src/vite-config';
import {UserConfig} from 'vite';

const config: UserConfig = generateViteConfig({
    rootDir: __dirname,
    target: 'chrome',
    rollupOptions: {
        external: ['electron'],
        output: {
            entryFileNames: '[name].cjs',
        },
    },
    sourceMap: 'inline',
});

export default config;
