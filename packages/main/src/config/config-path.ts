import {GetPathType} from '@packages/common/src/electron-renderer-api/get-path-type';
import {appName} from '@packages/common/src/environment';
import {join} from 'path';
import {HasGetPath} from '../augments/electron';
import {checkDir} from '../augments/file-system';
import {formatDateForPath, formatDateWithTimeForPath} from '../augments/path';

export async function getPath(pathType: GetPathType, appPaths: HasGetPath): Promise<string> {
    switch (pathType) {
        case GetPathType.Backups:
            return getBackupsDir(appPaths);
        case GetPathType.ConfigDir:
            return getConfigDir(appPaths);
        case GetPathType.Logs:
            return getLogsDir(appPaths);
    }
}

export function getConfigDir(appPaths: HasGetPath): string {
    const configDir = join(appPaths.getPath('userData'), `${appName}-config`);
    checkDir(configDir);

    return configDir;
}

function getBackupsDir(appPaths: HasGetPath): string {
    const defaultConfigDir = getConfigDir(appPaths);
    const backupsDir = defaultConfigDir.replace(/(?:\/|\\)$|$/, '-backups');
    checkDir(backupsDir);

    return backupsDir;
}

/**
 * Gets the directory path for where a new backup should be located. Ensures that the backups
 * directory is created but does not ensure that the directory for the latest back (which is what
 * this returns) is created.
 */
export function getCurrentConfigBackupDir(appPaths: HasGetPath): string {
    const backupsDir = getBackupsDir(appPaths);

    const timestamp = formatDateWithTimeForPath();
    const backupName = `backup-${timestamp}`;

    return join(backupsDir, backupName);
}

export function getUserPreferencesFilePath(appPaths: HasGetPath): string {
    const configDir = getConfigDir(appPaths);

    return join(configDir, 'user-preferences.json');
}

function getLogsDir(appPaths: HasGetPath): string {
    const logsDir = appPaths.getPath('logs');
    checkDir(logsDir);

    return logsDir;
}

export function getCurrentLogFilePath(appPaths: HasGetPath): string {
    const logsDir = getLogsDir(appPaths);

    const logFilePath = join(logsDir, `${formatDateForPath()}.txt`);

    return logFilePath;
}
