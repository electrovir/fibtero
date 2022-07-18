import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {emptyUserPreferences, UserPreferences} from '@packages/common/src/data/user-preferences';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {getElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {GetPathType} from '@packages/common/src/electron-renderer-api/get-path-type';
import {ResetType} from '@packages/common/src/electron-renderer-api/reset';
import {isEnumValue, isPromiseLike, wait} from 'augment-vir';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import {ReloadUserPreferences} from '../../global-events/reload-user-preferences.event';
import {FibCreateJiraViewPage} from '../main-pages/fib-create-jira-view-page.element';
import {FibExportJiraViewPage} from '../main-pages/fib-export-jira-view-page.element';
import {FibHomePage} from '../main-pages/fib-home-page.element';
import {FibImportJiraViewPage} from '../main-pages/fib-import-jira-view-page.element';
import {BasicJiraTest} from '../test-elements/basic-jira-test.element';
import {ViewDisplay} from '../view-display.element';
import {FibAppPageNav} from './fib-app-page-nav.element';

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

function loadUserPreferences(
    props: typeof FibAppElement['init']['props'],
    setProps: (input: Partial<typeof FibAppElement['init']['props']>) => void,
) {
    setProps({
        loaded: false,
        currentUserPreferences:
            // wait time so we can actually see the loading screen
            wait(500).then(() =>
                props.electronApi
                    .apiRequest({
                        type: ApiRequestType.GetPreferences,
                    })
                    .then((response) => {
                        const preferences = response.data ?? emptyUserPreferences;
                        setProps({currentUserPreferences: preferences});
                        return preferences;
                    }),
            ),
    });
}

export const FibAppElement = defineFunctionalElement({
    tagName: 'fib-app',
    props: {
        currentPage: MainRendererPage.Home,
        currentView: [],
        electronApi: getElectronWindowInterface(),
        currentUserPreferences: Promise.resolve(emptyUserPreferences) as
            | Promise<UserPreferences>
            | UserPreferences,
        loaded: false,
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
    initCallback: ({props, setProps}) => {
        loadUserPreferences(props, setProps);
    },
    renderCallback: ({props, setProps}) => {
        if (isPromiseLike(props.currentUserPreferences)) {
            return html`
                Loading...
            `;
        }

        const userPreferences: UserPreferences = props.currentUserPreferences;
        console.log({userPreferences});

        if (!props.loaded) {
            setProps({loaded: true});
            setProps({
                currentPage: userPreferences.lastPage,
            });
        }

        // default to home if an invalid page is given
        if (!isEnumValue(props.currentPage, MainRendererPage)) {
            setProps({currentPage: MainRendererPage.Home});
        }

        const pageTemplate =
            props.currentPage === MainRendererPage.Home
                ? html`
                      <${FibHomePage}></${FibHomePage}>
                  `
                : props.currentPage === MainRendererPage.CreateJiraView
                ? html`
                      <${FibCreateJiraViewPage}
                        ${assign(FibCreateJiraViewPage.props.electronApi, props.electronApi)}
                        ${assign(FibCreateJiraViewPage.props.currentPreferences, userPreferences)}
                      ></${FibCreateJiraViewPage}>
                      `
                : props.currentPage === MainRendererPage.ImportJiraView
                ? html`
                    <${FibImportJiraViewPage}></${FibImportJiraViewPage}>
                    `
                : props.currentPage === MainRendererPage.ExportJiraView
                ? html`
                    <${FibExportJiraViewPage}></${FibExportJiraViewPage}>
                  `
                : html`
                      ERROR: Current page not supported: ${props.currentPage}
                  `;

        return html`
            <${FibAppPageNav}
                ${assign(FibAppPageNav.props.currentPage, props.currentPage)}
                ${listen(FibAppPageNav.events.pageChange, (event) => {
                    const newPage = event.detail;
                    setProps({currentPage: newPage});
                    electronApi.apiRequest({
                        type: ApiRequestType.SavePreferences,
                        data: {
                            ...userPreferences,
                            lastPage: newPage,
                        },
                    });
                })}
            ></${FibAppPageNav}>
            <main
                ${listen(ReloadUserPreferences, () => {
                    loadUserPreferences(props, setProps);
                })}
            >
                ${pageTemplate}
            </main>
        `;
    },
});
