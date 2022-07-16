import {dirname} from 'path';
import {findConfigFile, parseJsonConfigFileContent, readConfigFile, sys as tsSys} from 'typescript';

export function getTsconfigPathAliases() {
    const configFileName = findConfigFile(__dirname, tsSys.fileExists, 'tsconfig.json');

    if (!configFileName) {
        throw new Error(`Failed to find tsconfig.`);
    }

    const configFile = readConfigFile(configFileName, tsSys.readFile);
    const tsConfig = parseJsonConfigFileContent(configFile.config, tsSys, dirname(configFileName));
    const tsConfigPaths = tsConfig.options.paths;

    if (!tsConfigPaths) {
        throw new Error(`Failed to find tsconfig paths for module mapping.`);
    }

    return tsConfigPaths;
}
