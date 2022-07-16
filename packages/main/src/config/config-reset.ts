import {ResetType} from '@packages/common/src/electron-renderer-api/reset';
import {displayAppName} from '@packages/common/src/environment';
import {remove} from 'fs-extra';
import {ElectronApp} from '../augments/electron';
import {showMessageBox} from '../renderer-api/dialogs';
import {backupConfig} from './config-backup';
import {getConfigDir} from './config-path';

export async function resetConfig(
    resetType: ResetType,
    electronApp: ElectronApp,
): Promise<boolean> {
    const backupLocation = await backupConfig(electronApp);

    switch (resetType) {
        case ResetType.All: {
            const result = await showMessageBox(
                'WARNING: Are you sure you want to reset all preferences?',
                `This will reset all your ${displayAppName} preferences.

A backup of your data is stored in ${backupLocation}.`,
                {
                    type: 'error',
                    cancelId: 0,
                    defaultId: 1,
                    noLink: true,
                    buttons: [
                        'Cancel',
                        'Delete Everything',
                    ],
                },
            );
            if (result.response) {
                try {
                    await remove(getConfigDir(electronApp));

                    return true;
                } catch (error) {
                    console.error(error);
                    return false;
                } finally {
                    // restart to init and load new configs
                    electronApp.relaunch();
                    electronApp.quit();
                }
            } else {
                return false;
            }
        }
        case ResetType.UserPreferences: {
            throw new Error(`Reset not implemented yet for ${resetType}`);
            return false;
        }
    }
}
