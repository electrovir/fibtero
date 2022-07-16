import {WindowPosition} from '@packages/common/src/data/user-preferences';
import {HasGetPath} from '../augments/electron';
import {getBrowserWindow} from '../setup/window-management';
import {insertUserPreferences, readUserPreferences} from './user-preferences';

export async function saveWindowPosition(
    appPaths: HasGetPath,
): Promise<WindowPosition | undefined> {
    const browserWindow = getBrowserWindow();

    if (!browserWindow) {
        throw new Error(`No browser window to save position from.`);
    }

    if (browserWindow && (await readUserPreferences(appPaths)).startupWindowPosition.useLast) {
        const [
            x,
            y,
        ] = browserWindow.getPosition() as [number, number];
        const [
            width,
            height,
        ] = browserWindow.getSize() as [number, number];

        const position = {x, y, width, height};

        await insertUserPreferences(
            {
                startupWindowPosition: {
                    ...position,
                    useLast: true,
                },
            },
            appPaths,
        );

        return position;
    }

    return undefined;
}

export function shouldUseWindowPosition(
    input: WindowPosition | undefined | {},
): input is WindowPosition {
    if (!input) {
        return false;
    }

    if (!('x' in input) || !('y' in input) || !('width' in input) || !('height' in input)) {
        return false;
    }

    if (input.x === -1 || input.y === -1 || input.width === -1 || input.height === -1) {
        return false;
    }

    return true;
}
