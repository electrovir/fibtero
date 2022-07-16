import {copy} from 'fs-extra';
import {HasGetPath} from '../augments/electron';
import {getConfigDir, getCurrentConfigBackupDir} from './config-path';

export async function backupConfig(appPaths: HasGetPath): Promise<string> {
    const newBackupDirPath = getCurrentConfigBackupDir(appPaths);
    const configDir = getConfigDir(appPaths);

    await copy(configDir, newBackupDirPath);
    return newBackupDirPath;
}
