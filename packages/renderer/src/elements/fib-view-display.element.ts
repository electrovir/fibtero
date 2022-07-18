import {JiraAuth, JiraIssue} from '@packages/common/src/data/jira-data';
import {JiraView} from '@packages/common/src/data/jira-view';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {isPromiseLike} from 'augment-vir';
import {css, defineFunctionalElement, html} from 'element-vir';
import {getMaybeCachedView} from '../jira-view-cache';

type LoadedIssues<IssuesType> = {
    viewId: string;
    issues: IssuesType;
};

export const FibViewDisplay = defineFunctionalElement({
    tagName: 'fib-view-display',
    props: {
        view: undefined as undefined | JiraView,
        jiraAuth: undefined as undefined | JiraAuth,
        electronApi: undefined as undefined | ElectronWindowInterface,
        loadedViewIssues: undefined as
            | undefined
            | LoadedIssues<JiraIssue[]>
            | LoadedIssues<Promise<JiraIssue[]>>,
        error: '',
    },
    styles: css`
        label {
            display: flex;
            flex-direction: column;
            cursor: pointer;
        }

        .focus-border {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 8px;
            pointer-events: none;
        }
    `,
    renderCallback: ({props, setProps, dispatch, events}) => {
        if (!props.view) {
            return html`
                Select a view
            `;
        }
        const jiraView = props.view;

        if (
            props.loadedViewIssues &&
            !isPromiseLike(props.loadedViewIssues) &&
            jiraView.id !== props.loadedViewIssues.viewId
        ) {
            setProps({
                loadedViewIssues: undefined,
                error: '',
            });
        }

        if (props.error) {
            return html`
                ERROR: ${props.error}
            `;
        }

        if (!props.jiraAuth) {
            return html`
                need jira auth input
            `;
        }
        const jiraAuth = props.jiraAuth;
        if (!props.electronApi) {
            return html`
                need electron api input
            `;
        }
        const electronApi = props.electronApi;

        if (props.loadedViewIssues === undefined) {
            setProps({
                loadedViewIssues: {
                    viewId: jiraView.id,
                    issues: getMaybeCachedView(jiraView, electronApi, jiraAuth, (updatedIssues) => {
                        setProps({
                            loadedViewIssues: {
                                issues: updatedIssues,
                                viewId: jiraView.id,
                            },
                        });
                    })
                        .then((issues) => {
                            if (jiraView.id !== props.view?.id) {
                                // if the id has changed by the time this request finishes, abort
                                return [];
                            }

                            setProps({
                                loadedViewIssues: {
                                    viewId: jiraView.id,
                                    issues: issues,
                                },
                            });
                            return issues;
                        })
                        .catch((error) => {
                            setProps({
                                error,
                                loadedViewIssues: {
                                    viewId: jiraView.id,
                                    issues: [],
                                },
                            });

                            return [];
                        }),
                },
            });
            return html`
                Loading issues...
            `;
        } else if (isPromiseLike(props.loadedViewIssues.issues)) {
            return html`
                Loading issues...
            `;
        }

        return html`
            ${props.loadedViewIssues.issues.map((issue) => {
                return html`
                    ${issue.key}
                    <br />
                `;
            })}
        `;
    },
});
