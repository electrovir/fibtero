import {ElectronApp} from '../augments/electron';
import {handleClosing} from './on-close';

export async function addAppListeners(electronApp: ElectronApp) {
    saveWindowPositionBeforeQuit(electronApp);
}

function saveWindowPositionBeforeQuit(electronApp: ElectronApp): void {
    electronApp.on('before-quit', async (event) => {
        await handleClosing(electronApp, event);
        electronApp.quit();
    });
}
