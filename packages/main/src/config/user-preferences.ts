import {extractMessage} from '@packages/common/src/augments/error';
import {
    emptyUserPreferences,
    isValidUserPreferences,
    UserPreferences,
} from '@packages/common/src/data/user-preferences';
import {ensureDir, ensureFile} from 'fs-extra';
import {dirname} from 'path';
import {HasGetPath} from '../augments/electron';
import {readPackedJson, writePackedJson} from '../augments/file-system';
import {getUserPreferencesFilePath} from './config-path';

function getDefaultUserPreferences(appPaths: HasGetPath): UserPreferences {
    return {
        startupWindowPosition: emptyUserPreferences.startupWindowPosition,
    };
}

async function getUpdatedUserPreferences(appPaths: HasGetPath): Promise<UserPreferences> {
    const preferencesPath = getUserPreferencesFilePath(appPaths);
    await ensureFile(preferencesPath);
    const defaultPreferences = getDefaultUserPreferences(appPaths);

    const rawFromFile = await readPackedJson(preferencesPath);
    const preferencesFromFile: object =
        rawFromFile && typeof rawFromFile === 'object' ? rawFromFile : {};

    const parsedPreferences = {
        ...defaultPreferences,
        ...preferencesFromFile,
    };

    if (!isValidUserPreferences(parsedPreferences)) {
        throw new Error(`Updated user preferences file contents failed validation.`);
    }

    return parsedPreferences;
}

/**
 * Save and read user preferences. Insert all default values to make sure the file is up to date to
 * the latest user preferences format.
 */
export async function updateUserPreferences(appPaths: HasGetPath): Promise<UserPreferences> {
    await saveUserPreferences(await getUpdatedUserPreferences(appPaths), appPaths);
    return await getUpdatedUserPreferences(appPaths);
}

/** Just read the preferences file as is. */
export async function readUserPreferences(appPaths: HasGetPath): Promise<UserPreferences> {
    const preferencesPath = getUserPreferencesFilePath(appPaths);
    const fromFile = await readPackedJson(preferencesPath);

    if (!isValidUserPreferences(fromFile)) {
        throw new Error(`Read user preferences from file contents failed validation.`);
    }
    return fromFile;
}

/** Combine a part of the user preferences object with what is already saved on disk. */
export async function insertUserPreferences(
    partialPreferences: Partial<UserPreferences>,
    appPaths: HasGetPath,
): Promise<boolean> {
    return await saveUserPreferences(
        {...(await getUpdatedUserPreferences(appPaths)), ...partialPreferences},
        appPaths,
    );
}

export async function saveUserPreferences(
    newUserPreferences: UserPreferences,
    appPaths: HasGetPath,
): Promise<boolean> {
    const userPreferencesPath = getUserPreferencesFilePath(appPaths);
    await ensureDir(dirname(userPreferencesPath));

    await writePackedJson(userPreferencesPath, newUserPreferences);

    // check that valid preferences was written
    // todo: deep equality check to make sure written data was identical to data that was intended to be written
    let writtenUserPreferences;

    try {
        writtenUserPreferences = await readUserPreferences(appPaths);
    } catch (error) {
        throw new Error(`Failed to save preferences: ${extractMessage(error)}`);
    }

    if (!writtenUserPreferences) {
        throw new Error(`Saved preferences but file is empty`);
    }

    return true;
}
