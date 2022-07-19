import {JiraAuth} from '@packages/common/src/data/jira-data';
import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {emptyUserPreferences, UserPreferences} from '@packages/common/src/data/user-preferences';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {
    ElectronWindowInterface,
    getElectronWindowInterface,
} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {isEnumValue, isPromiseLike, wait} from 'augment-vir';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import {ReloadUserPreferences} from '../../global-events/reload-user-preferences.event';
import {FibCreateJiraViewPage} from '../main-pages/fib-create-jira-view-page.element';
import {FibEditJiraViewPage} from '../main-pages/fib-edit-jira-view-page.element';
import {FibExportJiraViewPage} from '../main-pages/fib-export-jira-view-page.element';
import {FibHomePage} from '../main-pages/fib-home-page.element';
import {FibImportJiraViewPage} from '../main-pages/fib-import-jira-view-page.element';
import {FibMyViews} from '../main-pages/fib-my-views.element';
import {BasicJiraTest} from '../test-elements/basic-jira-test.element';
import {FibAppPageNav} from './fib-app-page-nav.element';

const electronApi = getElectronWindowInterface();
console.info(electronApi.versions);

async function loadUserPreferences(electronApi: ElectronWindowInterface) {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.GetPreferences,
    });

    const preferences = response.data ?? emptyUserPreferences;
    return preferences;
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
        authLoaded: false,
        jiraAuth: undefined as undefined | JiraAuth,
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
        }

        ${FibAppPageNav} {
            align-self: stretch;
            border-bottom: 1px solid grey;
            padding: 16px;
        }

        main {
            flex-grow: 1;
            padding: 16px;
        }

        main > * {
            min-width: 100%;
            min-height: 100%;
        }
    `,
    initCallback: ({props, setProps}) => {
        setProps({
            currentUserPreferences:
                // wait time so we can actually see the loading screen
                wait(500).then(async () => {
                    const result = await loadUserPreferences(props.electronApi);
                    setProps({currentUserPreferences: result});
                    return result;
                }),
        });
    },
    renderCallback: ({props, setProps}) => {
        if (isPromiseLike(props.currentUserPreferences)) {
            return html`
                Loading...
            `;
        }

        const userPreferences: UserPreferences = props.currentUserPreferences;

        if (props.authLoaded) {
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

            if (!props.jiraAuth) {
                setProps({currentPage: MainRendererPage.Home});
            }
        }

        const pageTemplate =
            props.currentPage === MainRendererPage.Home
                ? html`
                      <${FibHomePage}
                        ${assign(FibHomePage.props.electronApi, props.electronApi)}
                        ${listen(BasicJiraTest.events.jiraAuthInput, (event) => {
                            setProps({jiraAuth: event.detail});
                        })}
                        ${listen(BasicJiraTest.events.authLoaded, (event) => {
                            setProps({authLoaded: true});
                        })}
                      ></${FibHomePage}>
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
                    <${FibImportJiraViewPage}
                        ${assign(FibImportJiraViewPage.props.userPreferences, userPreferences)}
                        ${assign(FibImportJiraViewPage.props.electronApi, electronApi)}
                    ></${FibImportJiraViewPage}>
                    `
                : props.currentPage === MainRendererPage.ExportJiraView
                ? html`
                    <${FibExportJiraViewPage}
                        ${assign(FibExportJiraViewPage.props.userPreferences, userPreferences)}
                    ></${FibExportJiraViewPage}>
                  `
                : props.currentPage === MainRendererPage.EditJiraView
                ? html`
                    <${FibEditJiraViewPage}
                        ${assign(FibEditJiraViewPage.props.userPreferences, userPreferences)}
                        ${assign(FibEditJiraViewPage.props.electronApi, electronApi)}
                    ></${FibEditJiraViewPage}>
                  `
                : props.currentPage === MainRendererPage.MyViews
                ? html`
                    <${FibMyViews}
                        ${assign(FibMyViews.props.userPreferences, userPreferences)}
                        ${assign(FibMyViews.props.jiraAuth, props.jiraAuth)}
                        ${assign(FibMyViews.props.electronApi, props.electronApi)}
                    ></${FibMyViews}>
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
                ${listen(ReloadUserPreferences, async () => {
                    const result = await loadUserPreferences(props.electronApi);
                    setProps({currentUserPreferences: result});
                })}
            >
                ${pageTemplate}
            </main>
        `;
    },
});
