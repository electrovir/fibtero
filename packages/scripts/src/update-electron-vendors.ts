import {execSync, ExecSyncOptionsWithStringEncoding} from 'child_process';
import electron from 'electron';
import {writeFile} from 'fs/promises';

/**
 * Returns versions of electron vendors.
 *
 * The performance of this feature is very poor and can be improved.
 *
 * @see https://github.com/electron/electron/issues/28006
 */
function getVendors(): NodeJS.ProcessVersions {
    const shellCommand = `${electron} -p "JSON.stringify(process.versions)"`;
    const shellConfig: ExecSyncOptionsWithStringEncoding = {
        env: {ELECTRON_RUN_AS_NODE: '1'},
        encoding: 'utf-8',
    };
    const output = execSync(shellCommand, shellConfig);
    try {
        const parsedOutput: NodeJS.ProcessVersions = JSON.parse(output);
        return parsedOutput;
    } catch (error) {
        console.error(`returned version information: ${output}`);
        throw new Error(`Failed to parsed version information from electron.`);
    }
}

async function updateVendors() {
    const versionInformation = getVendors();
    console.dir(versionInformation);

    const nodeMajorVersion = versionInformation.node.split('.')[0];

    if (!nodeMajorVersion) {
        throw new Error(`Failed to parse Node.js version.`);
    }

    const v8Split = versionInformation.v8.split('.');
    if (v8Split[1] === undefined) {
        throw new Error(
            `Failed to parsed first two digits from v8 version: ${versionInformation.v8}`,
        );
    }
    const chromeMajorVersion = v8Split[0] + v8Split[1];

    const versions: {chrome: string; node: string} = {
        chrome: chromeMajorVersion,
        node: nodeMajorVersion,
    };
    const outputString = `${JSON.stringify(versions, null, 4)}\n`;

    return writeFile('./.electron-vendors.cache.json', outputString);
}

updateVendors().catch((error) => {
    console.error(error);
    process.exit(1);
});
