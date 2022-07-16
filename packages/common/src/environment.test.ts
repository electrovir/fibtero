import {getEnumTypedValues} from 'augment-vir';
import {readdir} from 'fs/promises';
import {Package} from './environment';
import {packagesDir} from './file-paths';

describe('Package enum', () => {
    it('should have an entry for each package directory', async () => {
        const packageDirs = (await readdir(packagesDir)).sort();
        const packageEnumValues = getEnumTypedValues(Package).sort();

        expect(packageDirs).toEqual(packageEnumValues);
    });
});
