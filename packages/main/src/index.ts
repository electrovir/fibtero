import {isDevMode} from '@packages/common/src/environment';
import {app} from 'electron';
import {ElectronApp} from './augments/electron';
import {initConfig} from './config/config-init';
import {addAppListeners} from './setup/add-app-listeners';
import {checkForUpdates} from './setup/auto-updates';
import {setupLogging} from './setup/logging';
import {setSecurityRestrictions} from './setup/security-restrictions';
import {setupApiHandlers} from './setup/setup-api-handlers';
import {startupWindow} from './setup/setup-main-window';

async function setupApp(devMode: boolean) {
    const electronApp: ElectronApp = app;

    setupLogging(electronApp);

    /** Disable Hardware Acceleration for power savings */
    electronApp.disableHardwareAcceleration();

    await initConfig(electronApp);
    await addAppListeners(electronApp);

    setupApiHandlers(devMode, electronApp);
    setSecurityRestrictions(electronApp, devMode);

    await startupWindow(electronApp, devMode);
    await checkForUpdates(devMode);
}

setupApp(isDevMode).catch((error) => {
    console.error(`Failed to startup app`);
    console.error(error);
    process.exit(1);
});
