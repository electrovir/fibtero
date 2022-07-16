import {BrowserWindow} from 'electron';

export enum AppWindow {
    Main = 'Fibtero',
    Preferences = 'Fibtero Preferences',
}

/**
 * This app only have one window at a time but getFocusedWindow isn't reliable because it triggers
 * modals at times which causes the main window to be unfocused.
 */
export function getBrowserWindow(
    windowTitle: AppWindow = AppWindow.Main,
): BrowserWindow | undefined {
    const windowMatches = BrowserWindow.getAllWindows().filter(
        (browserWindow) => browserWindow.getTitle() === windowTitle,
    );

    if (windowMatches.length > 1) {
        console.error(`Multiple ${windowTitle} windows detected.`);
    }

    return windowMatches[0];
}
