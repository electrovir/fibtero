import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {getElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {GetPathType} from '@packages/common/src/electron-renderer-api/get-path-type';
import {ResetType} from '@packages/common/src/electron-renderer-api/reset';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import {MainPage} from '../page';
import {BasicJiraTest} from './basic-jira-test.element';
import {FibAppPageNav} from './fib-app-page-nav.element';
import {ViewDisplay} from './view-display.element';

const electronApi = getElectronWindowInterface();
console.info(electronApi.versions);
electronApi.apiRequest({type: ApiRequestType.GetPreferences}).then((event) => {
    const preferences = event.data;
    console.log(preferences);
});

const testConfigTemplate = html`
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

const jiraTestTemplate = html`
    <${BasicJiraTest}
        ${assign(BasicJiraTest.props.electronApi, electronApi)}
        ${assign(BasicJiraTest.props.useCachedData, true)}
    ></${BasicJiraTest}>
    <${ViewDisplay}></${ViewDisplay}>
`;

export const FibAppElement = defineFunctionalElement({
    tagName: 'fib-app',
    props: {
        currentPage: MainPage.Home,
        currentView: [],
    },
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

        ${FibAppPageNav} {
            align-self: stretch;
        }
    `,
    renderCallback: ({props, setProps}) => {
        return html`
            <${FibAppPageNav}
                ${assign(FibAppPageNav.props.currentPage, props.currentPage)}
                ${listen(FibAppPageNav.events.pageChange, (event) => {
                    setProps({currentPage: event.detail});
                })}
            ></${FibAppPageNav}>
        `;
    },
});
