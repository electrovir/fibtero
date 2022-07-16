import {buildMode} from '@packages/common/src/environment';
import {packageConfigPaths} from '@packages/common/src/file-paths';
import {dirname} from 'path';
import {build} from 'vite';

async function buildAll() {
    const totalTimeLabel = 'Total bundling time';
    console.time(totalTimeLabel);

    for (const packageConfigPath of Object.values(packageConfigPaths)) {
        const consoleGroupName = `${dirname(packageConfigPath)}/`;
        console.group(consoleGroupName);

        const timeLabel = 'Bundling time';
        console.time(timeLabel);

        await build({
            configFile: packageConfigPath,
            mode: buildMode,
        });

        console.timeEnd(timeLabel);
        console.groupEnd();
        console.info('\n'); // Just for pretty print
    }
    console.timeEnd(totalTimeLabel);
}

buildAll().catch((error) => {
    console.error(error);
    process.exit(1);
});
