import {asyncFilter} from '@packages/common/src/augments/array';
import {packagesDir} from '@packages/common/src/file-paths';
import {
    interpolationSafeWindowsPath,
    printShellCommandOutput,
    runShellCommand,
} from 'augment-vir/dist/cjs/node-only';
import chalk from 'chalk';
import {lstat, readdir} from 'fs/promises';
import {basename, join} from 'path';

async function typeCheckPackage(path: string): Promise<boolean> {
    const shellCommand = `tsc --noEmit -p ${interpolationSafeWindowsPath(
        join(path, 'tsconfig.json'),
    )}`;

    const shellOutput = await runShellCommand(shellCommand);

    printShellCommandOutput({
        ...shellOutput,
        // don't log the follow properties
        error: undefined,
        exitCode: undefined,
    });
    return shellOutput.exitCode === 0;
}

async function typeCheckAllPackages(): Promise<boolean> {
    const packageNames = await readdir(packagesDir);

    const packageDirs = await asyncFilter(
        packageNames.map((packageName) => join(packagesDir, packageName)),
        async (packagePath) => {
            const stats = await lstat(packagePath);
            const isDir = stats.isDirectory();
            return isDir;
        },
    );

    const results = await Promise.all(
        packageDirs.map((packageDir) => typeCheckPackage(packageDir)),
    );

    const failed = results.some((result) => !result);

    if (failed) {
        const resultString = results
            .map((passed, index) => {
                const packageName = basename(packageDirs[index] ?? '');

                if (!packageName) {
                    throw new Error(`No package name found at index ${index}`);
                }

                const color = passed ? chalk.green : chalk.red;
                const resultCheck = passed ? '✔' : '✘';
                const resultString = passed ? 'pass' : 'fail';
                const resultMarker = `${resultCheck} ${resultString}`;

                return `${color.bold(resultMarker)} ${packageName}`;
            })
            .join('\n');

        console.info(`Package type checks:`);
        console.info(resultString);
        console.error(chalk.red.bold(`\ntype checks failed.`));
    } else {
        console.info(chalk.green.bold('type checks succeeded.'));
    }

    return !failed;
}

typeCheckAllPackages()
    .then((passed) => {
        if (!passed) {
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
