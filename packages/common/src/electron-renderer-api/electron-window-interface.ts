import {ApiRequestFunction} from './api-request';

export type ElectronWindowInterface = {
    versions: NodeJS.ProcessVersions;
    apiRequest: ApiRequestFunction;
};

export const electronWindowInterfaceKey = 'electronWindowInterface' as const;

interface WindowWithInterface extends Window {
    [electronWindowInterfaceKey]: ElectronWindowInterface;
}

export function getElectronWindowInterface(): ElectronWindowInterface {
    if (typeof window === 'undefined') {
        throw new Error('Tried to get electron api from outside of a browser context.');
    } else if (electronWindowInterfaceKey in window) {
        const windowWithApi = window as unknown as WindowWithInterface;
        return windowWithApi[electronWindowInterfaceKey] as ElectronWindowInterface;
    } else {
        throw new Error(`Could not find "${electronWindowInterfaceKey}" key in window.`);
    }
}
