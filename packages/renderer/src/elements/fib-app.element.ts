import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {getElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {GetPathType} from '@packages/common/src/electron-renderer-api/get-path-type';
import {ResetType} from '@packages/common/src/electron-renderer-api/reset';
import {assign, defineFunctionalElement, html, listen} from 'element-vir';
import {css} from 'lit';
import {BasicJiraTest} from './basic-jira-test.element';

const electronApi = getElectronWindowInterface();
console.info(electronApi.versions);

export const FibAppElement = defineFunctionalElement({
    tagName: 'fib-app',
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            padding: 16px;
        }
    `,
    renderCallback: () => {
        return html`
            <${BasicJiraTest}
                ${assign(BasicJiraTest.props.electronApi, electronApi)}
                ${assign(BasicJiraTest.props.useCachedData, true)}
            ></${BasicJiraTest}>
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
