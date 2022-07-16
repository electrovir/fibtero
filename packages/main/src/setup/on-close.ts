import {extractMessage} from '@packages/common/src/augments/error';
import {ElectronApp} from '../augments/electron';
import {saveWindowPosition} from '../config/window-position';
import {closeAllDialogs} from '../renderer-api/dialogs';

const alreadyPrevented: Record<string, boolean> = {};

export async function handleClosing(electronApp: ElectronApp, event: Event): Promise<void> {
    if (alreadyPrevented[event.type]) {
        return;
    } else {
        alreadyPrevented[event.type] = true;
    }

    event.preventDefault();

    try {
        closeAllDialogs();
        console.info(
            `Saved window position for ${event.type}:`,
            await saveWindowPosition(electronApp),
        );
    } catch (error) {
        console.error(`Errored when saving window position: ${extractMessage(error)}`);
        // at this point just ignore errors, we're trying to quit!
    }
}
