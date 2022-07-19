import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {emptyUserPreferences} from '@packages/common/src/data/user-preferences';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {GetPathType} from '@packages/common/src/electron-renderer-api/get-path-type';
import {ResetType} from '@packages/common/src/electron-renderer-api/reset';
import {css, defineFunctionalElement, html, listen} from 'element-vir';
import {ChangePageEvent} from '../../global-events/change-page.event';
import {ReloadUserPreferencesEvent} from '../../global-events/reload-user-preferences.event';
import {isValidImportablePreferences, serializeForExport} from '../../preferences-import';

export const FibSettingsPage = defineFunctionalElement({
    tagName: 'fib-settings-page',
    props: {
        electronApi: undefined as undefined | ElectronWindowInterface,
        preferencesImport: '',
        userPreferences: emptyUserPreferences,
    },
    styles: css`
        .preferences-section {
            max-width: 100%;
            overflow: hidden;
            box-sizing: border-box;
            display: flex;
            flex-wrap: wrap;
            gap: 32px;
        }

        .preferences-section > div {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            max-width: 100%;
            box-sizing: border-box;
            overflow: hidden;
        }

        textarea {
            height: 200px;
            width: 300px;
            box-sizing: border-box;
            max-width: 100%;
        }
    `,
    renderCallback: ({props, setProps, dispatch, genericDispatch, events}) => {
        if (!props.electronApi) {
            return html`
                Loading...
            `;
        }
        const electronApi = props.electronApi;

        const isValidImportPreferences = isValidImportablePreferences(props.preferencesImport);

        return html`
            <h1>Settings</h1>

            <section>
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
            </section>
            <h2>Preferences</h2>
            <section class="preferences-section">
                <div>
                    <h3>Import</h3>
                    <textarea
                        .value=${props.preferencesImport}
                        ${listen('input', (event) => {
                            const target = event.target;
                            if (target instanceof HTMLTextAreaElement) {
                                setProps({
                                    preferencesImport: target.value,
                                });
                            }
                        })}
                    ></textarea>
                    <button
                        ?disabled=${!isValidImportPreferences}
                        ${listen('click', async () => {
                            await electronApi.apiRequest({
                                type: ApiRequestType.SavePreferences,
                                data: {
                                    ...props.userPreferences,
                                    ...JSON.parse(props.preferencesImport),
                                },
                            });
                            setProps({
                                preferencesImport: '',
                            });
                            genericDispatch(new ReloadUserPreferencesEvent());
                        })}
                    >
                        Import
                    </button>
                </div>
                <div>
                    <h3>Export</h3>
                    <textarea
                        readonly
                        .value=${serializeForExport(props.userPreferences)}
                    ></textarea>
                </div>
            </section>
        `;
    },
});
