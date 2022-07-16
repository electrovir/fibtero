import {shell} from 'electron';

export function viewPath(path: string) {
    shell.showItemInFolder(path);
}
