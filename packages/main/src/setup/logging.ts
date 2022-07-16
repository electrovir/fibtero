import {appendFileSync} from 'fs';
import {inspect} from 'util';
import {HasGetPath} from '../augments/electron';
import {getCurrentLogFilePath} from '../config/config-path';

const consolePropertiesToHighJack = [
    'log',
    'info',
    'error',
    'dir',
] as const;

export function setupLogging(appPaths: HasGetPath) {
    consolePropertiesToHighJack.forEach((consoleProp) => {
        const oldProp = console[consoleProp];
        console[consoleProp] = (...args) => {
            oldProp(...args);
            const logPath = getCurrentLogFilePath(appPaths);
            const logString = `${Date.now()} ${consoleProp.toUpperCase()}: ${inspect(args)}\n`;
            appendFileSync(logPath, logString);
        };
    });
}
