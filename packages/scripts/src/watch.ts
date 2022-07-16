import {buildMode, Package, viteDevServerEnvKey} from '@packages/common/src/environment';
import {packageConfigPaths} from '@packages/common/src/file-paths';
import {ChildProcessWithoutNullStreams, spawn} from 'child_process';
import electronPath from 'electron';
import {RollupOutput, RollupWatcher} from 'rollup';
import {build, createLogger, createServer, InlineConfig, Plugin, ViteDevServer} from 'vite';

const sharedConfig: InlineConfig = {
    mode: buildMode,
    build: {
        watch: {},
    },
    logLevel: 'info',
};

/** Messages on stderr that match any of the contained patterns will be stripped from output */
const stderrFilterPatterns = [
    // warning about devtools extension
    // https://github.com/cawa-93/vite-electron-builder/issues/492
    // https://github.com/MarshallOfSound/electron-devtools-installer/issues/143
    /ExtensionLoadWarning/,
];

function isWatcher(input: RollupOutput | RollupOutput[] | RollupWatcher): input is RollupWatcher {
    // RollupOutput[]
    if (Array.isArray(input)) {
        return false;
    }
    // RollupOutput
    if ('output' in input) {
        return false;
    }

    return true;
}

async function getWatcher({
    name,
    configFile,
    writeBundle,
}: {
    name: string;
    configFile: string;
    writeBundle: NonNullable<Plugin['writeBundle']>;
}): Promise<RollupWatcher> {
    const plugin: Plugin = {
        name,
        writeBundle,
    };

    const buildOutput = await build({
        ...sharedConfig,
        configFile,
        plugins: [plugin],
    });

    if (isWatcher(buildOutput)) {
        return buildOutput;
    } else {
        console.dir(buildOutput);
        throw new Error(`Received build output was not a watcher.`);
    }
}

/** Start or restart App when source files are changed */
function setupMainPackageWatcher(
    viteDevServer: ViteDevServer,
): Promise<RollupOutput | RollupOutput[] | RollupWatcher> {
    // Write a value to an environment variable to pass it to the main process.
    {
        const protocol = `http${viteDevServer.config.server.https ? 's' : ''}:`;
        const host = viteDevServer.config.server.host || 'localhost';
        const port = viteDevServer.config.server.port; // Vite searches for and occupies the first free port: 3000, 3001, 3002 and so on
        const path = '/';
        process.env[viteDevServerEnvKey] = `${protocol}//${host}:${port}${path}`;
    }

    const logger = createLogger(sharedConfig.logLevel, {
        prefix: '[main]',
    });

    let spawnProcess: ChildProcessWithoutNullStreams | null = null;

    return getWatcher({
        name: 'reload-app-on-main-package-change',
        configFile: packageConfigPaths[Package.Main],
        writeBundle() {
            if (spawnProcess !== null) {
                spawnProcess.kill('SIGINT');
                spawnProcess = null;
            }

            spawnProcess = spawn(String(electronPath), ['.']);

            spawnProcess.stdout.on(
                'data',
                (stdout) =>
                    stdout.toString().trim() && logger.warn(stdout.toString(), {timestamp: true}),
            );
            spawnProcess.stderr.on('data', (stderr) => {
                const data = stderr.toString().trim();
                if (!data) return;
                const mayIgnore = stderrFilterPatterns.some((patternRegex) =>
                    patternRegex.test(data),
                );
                if (mayIgnore) return;
                logger.error(data, {timestamp: true});
            });
        },
    });
}

/** Start or restart App when source files are changed */
function setupPreloadPackageWatcher(
    viteDevServer: ViteDevServer,
): Promise<RollupOutput | RollupOutput[] | RollupWatcher> {
    return getWatcher({
        name: 'reload-page-on-preload-package-change',
        configFile: packageConfigPaths[Package.Preload],
        writeBundle() {
            viteDevServer.ws.send({
                type: 'full-reload',
            });
        },
    });
}

async function startup() {
    const viteDevServer = await createServer({
        ...sharedConfig,
        configFile: packageConfigPaths[Package.Renderer],
    });

    await viteDevServer.listen();

    await setupPreloadPackageWatcher(viteDevServer);
    await setupMainPackageWatcher(viteDevServer);
}

startup().catch((error) => {
    console.error(error);
    process.exit(1);
});
