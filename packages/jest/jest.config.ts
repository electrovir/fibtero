import {dirname, join} from 'path';
import {pathsToModuleNameMapper} from 'ts-jest';
import {InitialOptionsTsJest} from 'ts-jest/dist/types';
import {getTsconfigPathAliases} from './read-tsconfig';

const config: InitialOptionsTsJest = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: false,

    /** Can't import from the common package to use repoDir so we have to redefine the path manually here */
    rootDir: dirname(dirname(__dirname)),
    silent: false,
    moduleNameMapper: pathsToModuleNameMapper(getTsconfigPathAliases(), {
        prefix: '<rootDir>/',
    }) as Record<string, string | string[]>,
    roots: [dirname(__dirname)],
    setupFilesAfterEnv: [join(__dirname, 'jest.setup.ts')],
    globals: {
        'ts-jest': {
            tsconfig: join(__dirname, 'tsconfig.json'),
            diagnostics: {
                warnOnly: true,
                ignoreCodes: ['TS151001'],
            },
        },
    },
};

export default config;
