import {HasGetPath} from '../augments/electron';
import {updateUserPreferences} from './user-preferences-file';

export async function initConfig(appPaths: HasGetPath): Promise<void> {
    await updateUserPreferences(appPaths);
}
