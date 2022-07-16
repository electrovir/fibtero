import {App} from 'electron';

/**
 * This is usually just the electron app but since we are ONLY using it in many places just for this
 * one method, might as well not require the entire app.
 */
export type HasGetPath = {
    getPath: App['getPath'];
};

export type ElectronApp = App;
