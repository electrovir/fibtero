import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {GetPathType} from '@packages/common/src/electron-renderer-api/get-path-type';
import {ResetType} from '@packages/common/src/electron-renderer-api/reset';
import {defineFunctionalElement, html, listen} from 'element-vir';
import {ChangePageEvent} from '../../global-events/change-page.event';

export const FibSettingsPage = defineFunctionalElement({
    tagName: 'fib-settings-page',
    props: {
        electronApi: undefined as undefined | ElectronWindowInterface,
    },
    renderCallback: ({props, dispatch, genericDispatch, events}) => {
        if (!props.electronApi) {
            return html`
                Loading...
            `;
        }
        const electronApi = props.electronApi;

        return html`
            <h1>Settings</h1>

            <button
                ${listen('click', () => {
                    genericDispatch(new ChangePageEvent(MainRendererPage.Auth));
                })}
            >
                Logout
            </button>

            <button
                ${listen('click', async () => {
                    const configPath = await electronApi.apiRequest({
                        type: ApiRequestType.GetConfigPath,
                        data: GetPathType.ConfigDir,
                    });
                    if (!configPath.success) {
                        throw new Error(`Failed to get config dir.`);
                    }
                    await electronApi.apiRequest({
                        type: ApiRequestType.ViewFilePath,
                        data: configPath.data,
                    });
                })}
            >
                Show Configs Dir
            </button>
            <button
                ${listen('click', async () => {
                    await electronApi.apiRequest({
                        type: ApiRequestType.ResetConfig,
                        data: ResetType.All,
                    });
                })}
            >
                Reset All Configs
            </button>
        `;
    },
});
