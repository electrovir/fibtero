import {
    ElectronWindowInterface,
    electronWindowInterfaceKey,
} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {contextBridge} from 'electron';

export function expose(api: ElectronWindowInterface) {
    contextBridge.exposeInMainWorld(electronWindowInterfaceKey, api);
}
