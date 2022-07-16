import {OpenDialogProperty} from '@packages/common/src/electron-renderer-api/electron-types';
import {dialog, MessageBoxOptions, MessageBoxReturnValue} from 'electron';
import {getBrowserWindow} from '../setup/window-management';

const currentDialogAbortControllers = new Set<AbortController>();

export function closeAllDialogs() {
    currentDialogAbortControllers.forEach((abortController) => {
        abortController.abort();
    });
    currentDialogAbortControllers.clear();
}

export async function selectFiles(
    inputProperties: OpenDialogProperty[] = [
        OpenDialogProperty.multiSelections,
        OpenDialogProperty.openFile,
        OpenDialogProperty.openDirectory,
    ],
): Promise<undefined | string[]> {
    const abortController = new AbortController();
    currentDialogAbortControllers.add(abortController);

    const dialogResult = await dialog.showOpenDialog({
        properties: inputProperties,
    });

    currentDialogAbortControllers.delete(abortController);

    if (dialogResult.canceled) {
        return undefined;
    } else {
        return dialogResult.filePaths;
    }
}

export async function showMessageBox(
    title: string,
    message: string,
    options: Omit<MessageBoxOptions, 'message'> = {},
): Promise<MessageBoxReturnValue> {
    const window = getBrowserWindow();
    if (!window) {
        throw new Error(`No browser window to attach confirm dialog to.`);
    }
    const abortController = new AbortController();
    currentDialogAbortControllers.add(abortController);

    const dialogResult = await dialog.showMessageBox(window, {
        ...options,
        message: title,
        detail: message,
        signal: abortController.signal,
    });

    currentDialogAbortControllers.delete(abortController);

    return dialogResult;
}
