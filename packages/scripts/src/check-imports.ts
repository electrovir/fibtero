import {filterMap} from '@packages/common/src/augments/array';
import {extractMessage} from '@packages/common/src/augments/error';
import {Package} from '@packages/common/src/environment';
import {packageConfigPaths, packagesDir} from '@packages/common/src/file-paths';
import {getEnumTypedValues, safeMatch} from 'augment-vir';
import {
    interpolationSafeWindowsPath,
    replaceWithWindowsPathIfNeeded,
    runShellCommand,
} from 'augment-vir/dist/cjs/node-only';
import chalk from 'chalk';
import {existsSync} from 'fs';

const ignoredFiles: string[] = [packageConfigPaths[Package.Renderer]];

async function cleanTsGrep(searchFor: string): Promise<string[]> {
    /**
     * -i = case insensitive
     *
     * -r = recursive
     *
     * -n = include line number
     */
    const command = `grep -irn --include \\*.ts "${searchFor}" ${interpolationSafeWindowsPath(
        packagesDir,
    )}`;
    const output = await runShellCommand(command);

    if (output.exitCode === 1) {
        return [];
    } else if (output.exitCode !== 0) {
        throw new Error(`Grep for ${searchFor} failed: ${extractMessage(output.error)}`);
    }
    const splitLines = output.stdout.trim().split('\n');
    return splitLines;
}

/** Don't import from sub-paths in augment-vir unless strictly necessary. */
async function checkAugmentVirImports(): Promise<void> {
    const augmentVirLines = await cleanTsGrep("from \\'augment-vir");

    augmentVirLines.forEach((line) => {
        const [
            filePath,
            fileLine,
        ] = line.split(/:\d+:/);
        if (!filePath || !existsSync(filePath)) {
            throw new Error(`Invalid file path returned by grep output: ${line}`);
        }
        if (!fileLine) {
            throw new Error(`Extracted no file line from grep output on ${line}`);
        }

        const [
            ,
            importPath,
        ] = safeMatch(fileLine, /'(augment-vir.*?)'/);
        if (
            // allow the base import
            importPath !== 'augment-vir' &&
            // allow the node import for some node-specific imports
            importPath !== 'augment-vir/dist/cjs/node-only'
        ) {
            throw new Error(`${chalk.red.bold('Invalid augment-vir import')} at ${line}`);
        }
    });
}

/** Cross-package imports should not be relative, they should use the @packages alias. */
async function checkPackageImports() {
    const crossPackageLines = (
        await Promise.all(
            getEnumTypedValues(Package).map(async (packageName) =>
                cleanTsGrep(`\\.\\./${packageName}`),
            ),
        )
    ).flat();

    const actualBadImports = crossPackageLines.filter((line) => {
        if (line.match(/from\s+'(?:\.\.\/)+/)) {
            const fileName = safeMatch(line, /(^.+\.ts):\d+:/)[1];
            if (!fileName) {
                throw new Error(`Could not extract file name from ${line}`);
            }
            if (ignoredFiles.includes(replaceWithWindowsPathIfNeeded(fileName))) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    });

    if (actualBadImports.length) {
        throw new Error(
            `${chalk.red.bold(
                'Illegal cross-package relative import(s)',
            )}. Use '@packages/':\n${actualBadImports.join('\n')}`,
        );
    }
}

async function runAllChecks() {
    const importChecks: (() => void | Promise<void>)[] = [
        checkAugmentVirImports,
        checkPackageImports,
    ];

    const successes: boolean[] = await Promise.all(
        importChecks.map(async (importCheck) => {
            try {
                await importCheck();
                return true;
            } catch (error) {
                console.error(extractMessage(error));
                return false;
            }
        }),
    );

    const failures = filterMap(successes, (success, index) => {
        if (success) {
            // don't care about functions that succeeded
            return undefined;
        } else {
            const checkFunction = importChecks[index];
            if (!checkFunction) {
                throw new Error(`Check function did not exist at index ${index}`);
            }
            return checkFunction.name;
        }
    });

    if (failures.length) {
        console.info('\n');
        throw new Error(`${chalk.red.bold('Checks failed')}:\n${failures.join('\n')}`);
    }
}

runAllChecks()
    .then(() => {
        console.info(chalk.green.bold('check imports succeeded.'));
        process.exit(0);
    })
    .catch((error) => {
        console.error(extractMessage(error));
        process.exit(1);
    });
