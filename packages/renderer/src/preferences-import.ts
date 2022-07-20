import {filterObject} from '@packages/common/src/augments/object';
import {matchesShallowObjectSignature} from '@packages/common/src/data/object-validator';
import {emptyUserPreferences, UserPreferences} from '@packages/common/src/data/user-preferences';

const ignoreFields: Readonly<(keyof UserPreferences)[]> = [
    'lastPage',
    'lastViewIndex',
    'startupWindowPosition',
] as const;

export function serializeForExport(preferences: UserPreferences): string {
    const filtered = filterObject(preferences, (value, key) => {
        return !ignoreFields.includes(key);
    });
    return JSON.stringify(filtered);
}

export function isValidImportablePreferences(input: string): boolean {
    try {
        const parsed = JSON.parse(input);
        if (!matchesShallowObjectSignature(parsed, emptyUserPreferences, false, true)) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}
