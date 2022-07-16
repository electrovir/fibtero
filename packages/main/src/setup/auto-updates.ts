import {autoUpdater, UpdateCheckResult} from 'electron-updater';

export async function checkForUpdates(devMode: boolean): Promise<UpdateCheckResult | undefined> {
    if (!devMode) {
        try {
            return (await autoUpdater.checkForUpdatesAndNotify()) ?? undefined;
        } catch (updateError) {
            console.error(`Failed to check for updates: ${updateError}`);
        }
    }

    return undefined;
}
