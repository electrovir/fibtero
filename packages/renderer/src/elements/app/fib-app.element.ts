import {FullJiraIssue, JiraAuth} from '@packages/common/src/data/jira-data';
import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {emptyUserPreferences, UserPreferences} from '@packages/common/src/data/user-preferences';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {
    ElectronWindowInterface,
    getElectronWindowInterface,
} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {isEnumValue, isPromiseLike, wait} from 'augment-vir';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import {ChangeCurrentViewIndexEvent} from '../../global-events/change-current-view-index.event';
import {ChangePageEvent} from '../../global-events/change-page.event';
import {ReloadUserPreferencesEvent} from '../../global-events/reload-user-preferences.event';
import {ShowFullIssueEvent} from '../../global-events/show-full-issue.event';
import {FibFullIssue} from '../issue-display/fib-full-issue.element';
import {FibAuthPage} from '../main-pages/fib-auth-page.element';
import {FibCreateJiraViewPage} from '../main-pages/fib-create-jira-view-page.element';
import {FibEditJiraViewPage} from '../main-pages/fib-edit-jira-view-page.element';
import {FibExportJiraViewPage} from '../main-pages/fib-export-jira-view-page.element';
import {FibFieldMappingPage} from '../main-pages/fib-field-mapping-page.element';
import {FibImportJiraViewPage} from '../main-pages/fib-import-jira-view-page.element';
import {FibMyViews} from '../main-pages/fib-my-views.element';
import {FibSettingsPage} from '../main-pages/fib-settings-page.element';
import {FibTestPage} from '../main-pages/fib-test-page.element';
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

function shouldLockToFieldMappingPage(
    currentPage: MainRendererPage,
    currentUserPreferences: UserPreferences,
): boolean {
    const hasFieldMappings: boolean = !!Object.keys(currentUserPreferences.fieldMapping).length;
    return (
        !hasFieldMappings &&
        // allow these pages to show when locked to field mapping
        ![
            MainRendererPage.Settings,
            MainRendererPage.Test,
            MainRendererPage.Auth,
        ].includes(currentPage)
    );
}

export const FibAppElement = defineFunctionalElement({
    tagName: 'fib-app',
    props: {
        currentPage: MainRendererPage.Auth,
        currentViewIndex: 0,
        electronApi: getElectronWindowInterface(),
        currentFullIssue: undefined as undefined | FullJiraIssue,
        currentUserPreferences: Promise.resolve(emptyUserPreferences) as
            | Promise<UserPreferences>
            | UserPreferences,
        loaded: false,
        authLoaded: false,
        jiraAuth: undefined as undefined | JiraAuth,
    },
    styles: css`
        :host {
            overflow: hidden;
        }

        :host,
        .top-div {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
        }

        .no-select ${FibAppPageNav}, .no-select main {
            user-select: none;
        }

        ${FibAppPageNav} {
            align-self: stretch;
            padding: 16px;
            padding-bottom: 0;
        }

        main {
            flex-grow: 1;
            padding: 16px;
            overflow-y: auto;
            box-sizing: border-box;
        }

        main > * {
            box-sizing: border-box;
            min-width: 100%;
            min-height: 100%;
        }

        .modal-overlay {
            /* improves blur performance */
            backface-visibility: hidden;

            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            backdrop-filter: blur(3px);
            background-color: rgba(0, 0, 0, 0.3);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 16px;
            box-sizing: border-box;
        }

        .modal-overlay > .modal-content-wrapper {
            box-sizing: border-box;
            background-color: white;
            border-radius: 32px;
            padding: 32px;
            position: relative;
            min-height: 100px;
            min-width: 100px;
            max-height: 100%;
            max-width: 100%;
            overflow-y: auto;
        }

        .modal-overlay.hidden {
            display: none;
        }

        .close-x {
            cursor: pointer;
            background: none;
            border: none;
            font-size: 1.2em;
            position: absolute;
            top: 8px;
            right: 8px;
            border-radius: 50%;
            user-select: none;
        }

        .close-x:hover {
            background-color: #f0f0f0;
        }

        footer {
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding: 16px;
        }
    `,
    initCallback: ({props, setProps}) => {
        setProps({
            currentUserPreferences:
                // wait time so we can actually see the loading screen
                wait(500).then(async () => {
                    const result = await loadUserPreferences(props.electronApi);
                    setProps({currentUserPreferences: result});
                    console.log({userPreferences: result});
                    return result;
                }),
        });

        window.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'escape') {
                if (props.currentFullIssue) {
                    setProps({
                        currentFullIssue: undefined,
                    });
                }
            }
        });
    },
    renderCallback: ({props, setProps}) => {
        if (isPromiseLike(props.currentUserPreferences)) {
            return html`
                Loading...
            `;
        }

        const userPreferences: UserPreferences = props.currentUserPreferences;

        let lockToFieldMapping: boolean = shouldLockToFieldMappingPage(
            props.currentPage,
            userPreferences,
        );

        if (props.authLoaded) {
            if (!props.loaded) {
                setProps({loaded: true});
                setProps({
                    currentPage: userPreferences.lastPage,
                });
            }

            // default to home if an invalid page is given
            if (!isEnumValue(props.currentPage, MainRendererPage)) {
                console.log(`Invalid page name: ${props.currentPage}`);
                setProps({currentPage: MainRendererPage.MyViews});
            }
            lockToFieldMapping = shouldLockToFieldMappingPage(props.currentPage, userPreferences);

            if (!props.jiraAuth) {
                console.log('going to auth cause no jira auth');
                setProps({currentPage: MainRendererPage.Auth});
            } else if (lockToFieldMapping) {
                console.log('going to field mapping cause no field mappings');
                setProps({currentPage: MainRendererPage.FieldMappingView});
            }
        }

        const pageTemplate =
            props.currentPage === MainRendererPage.Auth
                ? html`
                    <${FibAuthPage}
                        ${assign(FibAuthPage.props.loginOnLoad, !props.authLoaded)}
                        ${assign(FibAuthPage.props.authLoaded, props.authLoaded)}
                        ${listen(FibAuthPage.events.jiraAuthLoad, (event) => {
                            const auth = event.detail;
                            console.log('auth loaded');
                            setProps({
                                jiraAuth: auth,
                                authLoaded: true,
                            });
                            if (props.loaded) {
                                setProps({jiraAuth: auth, currentPage: MainRendererPage.MyViews});
                            }
                        })}
                        ${assign(FibAuthPage.props.useCachedData, true)}
                        ${assign(FibAuthPage.props.electronApi, electronApi)}
                    ></${FibAuthPage}>`
                : props.currentPage === MainRendererPage.Test
                ? html`
                      <${FibTestPage}
                        ${assign(FibTestPage.props.electronApi, props.electronApi)}
                      ></${FibTestPage}>
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
                        ${assign(
                            FibExportJiraViewPage.props.selectedViewIndex,
                            props.currentViewIndex,
                        )}
                    ></${FibExportJiraViewPage}>
                  `
                : props.currentPage === MainRendererPage.EditJiraView
                ? html`
                    <${FibEditJiraViewPage}
                        ${assign(FibEditJiraViewPage.props.userPreferences, userPreferences)}
                        ${assign(FibEditJiraViewPage.props.electronApi, electronApi)}
                        ${assign(
                            FibEditJiraViewPage.props.selectedViewIndex,
                            props.currentViewIndex,
                        )}
                    ></${FibEditJiraViewPage}>
                  `
                : props.currentPage === MainRendererPage.MyViews
                ? html`
                    <${FibMyViews}
                        ${assign(FibMyViews.props.userPreferences, userPreferences)}
                        ${assign(FibMyViews.props.jiraAuth, props.jiraAuth)}
                        ${assign(FibMyViews.props.selectedViewIndex, props.currentViewIndex)}
                        ${assign(FibMyViews.props.electronApi, props.electronApi)}
                    ></${FibMyViews}>
                  `
                : props.currentPage === MainRendererPage.FieldMappingView
                ? html`
                    <${FibFieldMappingPage}
                        ${assign(FibFieldMappingPage.props.currentPreferences, userPreferences)}
                        ${assign(FibMyViews.props.jiraAuth, props.jiraAuth)}
                        ${assign(FibMyViews.props.electronApi, props.electronApi)}
                    ></${FibFieldMappingPage}>
                  `
                : props.currentPage === MainRendererPage.Settings
                ? html`
                    <${FibSettingsPage}
                            ${assign(FibSettingsPage.props.electronApi, electronApi)}
                            ${assign(FibSettingsPage.props.userPreferences, userPreferences)}
                    ></${FibSettingsPage}>
                `
                : html`
                      ERROR: Current page not supported: ${props.currentPage}
                  `;

        const showModalOverlay = !!props.currentFullIssue;

        return html`
            <div
                class="top-div ${showModalOverlay ? 'no-select' : ''}"
                ${listen(ReloadUserPreferencesEvent, async () => {
                    const result = await loadUserPreferences(props.electronApi);
                    setProps({currentUserPreferences: result});
                })}
                ${listen(ShowFullIssueEvent, async (event) => {
                    setProps({currentFullIssue: event.detail});
                })}
                ${listen(ChangeCurrentViewIndexEvent, async (event) => {
                    setProps({currentViewIndex: event.detail});
                })}
                ${listen(ChangePageEvent, (event) => {
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
            >
                <div
                    class="modal-overlay ${showModalOverlay ? '' : 'hidden'}"
                    ${listen('mousedown', () => {
                        setProps({
                            currentFullIssue: undefined,
                        });
                    })}
                >
                    <div
                        class="modal-content-wrapper"
                        ${listen('mousedown', (event) => {
                            event.stopPropagation();
                        })}
                    >
                        <button
                            class="close-x"
                            ${listen('click', () => {
                                setProps({
                                    currentFullIssue: undefined,
                                });
                            })}
                        >
                            x
                        </button>
                        <${FibFullIssue}
                            ${assign(FibFullIssue.props.issue, props.currentFullIssue)}
                            ${assign(FibFullIssue.props.userPreferences, userPreferences)}
                        ></${FibFullIssue}>
                    </div>
                </div>
                <${FibAppPageNav}
                    ${assign(FibAppPageNav.props.currentPage, props.currentPage)}
                    ${assign(FibAppPageNav.props.showBackButton, !lockToFieldMapping)}
                ></${FibAppPageNav}>
                <main>
                    ${pageTemplate}
                </main>
            </div>
        `;
    },
});
