import {JiraAuth, JiraIssue} from '@packages/common/src/data/jira-data';
import {FilterType, getFieldValue, JiraView, matchesSectionFilters, ViewDirection,} from '@packages/common/src/data/jira-view';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {isPromiseLike} from 'augment-vir';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import { isTemplateExpression } from 'typescript';
import {getMaybeCachedView} from '../../cache/jira-view-cache';
import {ShowFullIssueEvent} from '../../global-events/show-full-issue.event';
import {FibIssueCard} from './fib-issue-card.element';

type LoadedIssues<IssuesType> = {
    viewId: string;
    issues: IssuesType;
};

const unMatchedSectionName = 'Not categorized';

export const FibViewDisplay = defineFunctionalElement({
    tagName: 'fib-view-display',
    props: {
        view: undefined as undefined | JiraView,
        jiraAuth: undefined as undefined | JiraAuth,
        electronApi: undefined as undefined | ElectronWindowInterface,
        loadedViewIssues: undefined as
            | undefined
            | LoadedIssues<Readonly<Readonly<JiraIssue>[]>>
            | LoadedIssues<Promise<Readonly<Readonly<JiraIssue>[]>>>,
        error: '',
    },
    hostClasses: {
        horizontal: ({props}) => props.view?.direction === ViewDirection.Horizontal,
    },
    styles: ({hostClass}) => css`
        :host {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
        }

        :host(${hostClass.horizontal}) {
            flex-direction: row;
        }

        :host(${hostClass.horizontal}) .issue-category {
            flex-grow: 1;
        }

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

        .issue-category {
            display: flex;
            flex-direction: column;
        }

        .issues {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
    `,
    renderCallback: ({props, setProps, dispatch, genericDispatch, events}) => {
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

        const issues = props.loadedViewIssues.issues;
    
        const sectionMap = props.view.sections.reduce((accum, section) => {
            const requirementSections = section.requirements.reduce((requirementAccum, requirement) => {
                if(requirement.filterType == FilterType.Unique){
                    const unique = <string[]>[...new Set(issues.map(issue => {
                        const fieldValue = getFieldValue(issue, requirement.fieldName);
                        return fieldValue;
                    }))];

                    const newFields = unique.reduce((fieldAccum,field) => {
                        fieldAccum[field] = [];
                        return fieldAccum;
                    }, requirementAccum);
                    return newFields;
                }
                return requirementAccum;
            }, accum);
            requirementSections[section.name] = [];
            return requirementSections;
        }, {} as Record<string, string[]>);

        const issueSections = props.loadedViewIssues.issues.reduce(
            (accum, currentIssue) => {
                let matchesASection = false;
                props.view?.sections.forEach((section) => {
                    const sections = matchesSectionFilters(currentIssue, section);
                    if (sections.length) {
                        matchesASection = true;
                        sections.map(s =>{
                            accum[s]?.push(currentIssue);
                        })
                    }
                });
                if (!matchesASection) {
                    accum[unMatchedSectionName]!.push(currentIssue);
                }
                return accum;
            },
            {...sectionMap, [unMatchedSectionName]: []} as Record<string, JiraIssue[]>,
        );

        return html`
            ${Object.keys(issueSections).map((sectionName) => {
                const issues = issueSections[sectionName]!;
                if (!issues.length && sectionName === unMatchedSectionName) {
                    // ignore unmatched issues if there are none
                    return '';
                }
                return html`
                    <section class="issue-category">
                        <h4>${sectionName} (${issues.length})</h4>
                        <div class="issues">
                            ${issues.map((issue) => {
                                return html`
                                    <${FibIssueCard}
                                        ${listen('click', () => {
                                            genericDispatch(new ShowFullIssueEvent(issue));
                                        })}
                                        ${assign(FibIssueCard.props.issue, issue)}
                                    ></${FibIssueCard}>
                                `;
                            })}
                        </div>
                    </section>
                `;
            })}
        `;
    },
});
