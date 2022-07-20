import {FullJiraIssue, JiraAuth} from '@packages/common/src/data/jira-data';
import {
    FilterType,
    getFieldValue,
    JiraView,
    JiraViewSection,
    ViewDirection,
} from '@packages/common/src/data/jira-view/jira-view';
import {matchesSectionFilters} from '@packages/common/src/data/jira-view/match-jira-issues';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {isPromiseLike} from 'augment-vir';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import {getMaybeCachedView, updateCache} from '../../cache/jira-view-cache';
import {ShowFullIssueEvent} from '../../global-events/show-full-issue.event';
import {performDrop} from '../../perform-drop';
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
            | LoadedIssues<Readonly<Readonly<FullJiraIssue>[]>>
            | LoadedIssues<Promise<Readonly<Readonly<FullJiraIssue>[]>>>,
        error: '',
        currentlyDraggingFrom: undefined as
            | undefined
            | {
                  issue: FullJiraIssue;
                  sectionName: string;
                  section: JiraViewSection | undefined;
              },
        currentDraggingTo: '' as string,
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            align-items: stretch;
        }

        .sections {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
        }

        .horizontal {
            flex-direction: row;
        }

        .horizontal .issue-category {
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
            flex-basis: 0;
            display: flex;
            position: relative;
            flex-direction: column;
        }

        .issues {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .dragging-hover::after,
        .dragging-to-allowed::after {
            content: '';
            position: absolute;
            width: 100%;
            height: calc(100% - 40px);
            top: 0;
            left: 0;
            margin: 0;
            margin-top: 40px;
            pointer-events: none;
            box-sizing: border-box;
            background: rgba(30, 144, 255, 0.05);
            z-index: 100;
            border-radius: 8px;
            transition: 80ms;
            border: 2px solid dodgerblue;
        }
        .dragging-hover::after {
            background: rgba(30, 144, 255, 0.2);
            border-width: 4px;
        }
        .dragging-to-blocked {
            background-color: red;
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

        type FilteredIssueSections = Record<
            string,
            {issues: FullJiraIssue[]; sectionIndex: number}
        >;

        const sectionNamesMapping = props.view.sections.reduce((accum, section, sectionIndex) => {
            const requirementSections = section.requirements.reduce(
                (requirementAccum, requirement) => {
                    if (requirement.filterType == FilterType.Unique) {
                        const unique = <string[]>[
                            ...new Set(
                                issues.map((issue) => {
                                    const fieldValue = getFieldValue(issue, requirement.fieldName);
                                    return fieldValue;
                                }),
                            ),
                        ];

                        const newFields = unique.reduce((fieldAccum, field) => {
                            if (field) {
                                fieldAccum[field] = {issues: [], sectionIndex};
                            }
                            return fieldAccum;
                        }, requirementAccum);
                        return newFields;
                    }
                    requirementAccum[section.name] = {issues: [], sectionIndex};
                    return requirementAccum;
                },
                accum,
            );
            return requirementSections;
        }, {} as FilteredIssueSections);

        const issueSections = props.loadedViewIssues.issues.reduce(
            (accum, currentIssue) => {
                let matchesASection = false;
                const priorities =
                    props.view?.sections
                        .map((section) => {
                            return matchesSectionFilters(currentIssue, section);
                        })
                        .filter((priority) => priority.length)
                        .flat() ?? [];

                if (priorities.length) {
                    matchesASection = true;
                    // lowest = best
                    const lowestPriority = priorities.reduce((lowest, current) => {
                        if (!lowest) {
                            return current;
                        }

                        if (current.priority < lowest.priority) {
                            return current;
                        }
                        return lowest;
                    });
                    accum[lowestPriority.sectionName]?.issues.push(currentIssue);
                }

                if (!matchesASection) {
                    accum[unMatchedSectionName]!.issues.push(currentIssue);
                }
                return accum;
            },
            {
                ...sectionNamesMapping,
                [unMatchedSectionName]: {
                    issues: [],
                    sectionIndex: -1,
                },
            } as FilteredIssueSections,
        );

        return html`
            ${issues.length} total issues
            <div
                class="sections ${props.view?.direction === ViewDirection.Horizontal
                    ? 'horizontal'
                    : ''}"
            >
                ${Object.keys(issueSections).map((sectionName) => {
                    const sectionData = issueSections[sectionName]!;
                    const issues = sectionData.issues;
                    if (!issues.length && sectionName === unMatchedSectionName) {
                        // ignore unmatched issues if there are none
                        return '';
                    }
                    const section = jiraView.sections[sectionData.sectionIndex];
                    const allowsDraggingTo = !!section?.dragIn.length;

                    const canCurrentlyDropHere =
                        props.currentlyDraggingFrom &&
                        props.currentlyDraggingFrom.sectionName !== sectionName;

                    const draggingClass = canCurrentlyDropHere
                        ? props.currentDraggingTo === sectionName
                            ? 'dragging-hover'
                            : allowsDraggingTo
                            ? 'dragging-to-allowed'
                            : 'dragging-to-blocked'
                        : '';

                    return html`
                        <section
                            class="issue-category ${draggingClass}"
                            ${listen('dragover', (event) => {
                                if (canCurrentlyDropHere) {
                                    event.preventDefault();
                                    if (event.dataTransfer) {
                                        event.dataTransfer.dropEffect = 'move';
                                    }
                                    setProps({currentDraggingTo: sectionName});
                                }
                            })}
                            ${listen('drop', async (event) => {
                                if (canCurrentlyDropHere) {
                                    event.preventDefault();
                                }
                                if (section && props.currentlyDraggingFrom) {
                                    console.log('performing drop');
                                    await performDrop(
                                        props.currentlyDraggingFrom.issue,
                                        props.currentlyDraggingFrom.section,
                                        section,
                                        props.currentlyDraggingFrom.sectionName,
                                        sectionName,
                                        electronApi,
                                        jiraAuth,
                                        () => {
                                            console.log('doing this');
                                            if (Array.isArray(props.loadedViewIssues?.issues)) {
                                                updateCache(
                                                    jiraView,
                                                    props.loadedViewIssues!.issues,
                                                );
                                            }
                                            setProps({
                                                currentDraggingTo: '',
                                                currentlyDraggingFrom: undefined,
                                            });
                                        },
                                    );
                                }
                            })}
                        >
                            <h4>${sectionName} (${issues.length})</h4>
                            <div class="issues">
                                ${issues.map((issue) => {
                                    return html`
                                        <${FibIssueCard}
                                            draggable="true"
                                            ${listen('dragstart', () => {
                                                setProps({
                                                    currentlyDraggingFrom: {
                                                        issue,
                                                        sectionName,
                                                        section,
                                                    },
                                                });
                                            })}
                                            ${listen('dragend', (event) => {
                                                setProps({currentlyDraggingFrom: undefined});
                                            })}
                                            ${listen('click', () => {
                                                genericDispatch(new ShowFullIssueEvent(issue));
                                            })}
                                            ${assign(FibIssueCard.props.issue, issue)}electronApi)}
                                        ></${FibIssueCard}>
                                    `;
                                })}
                            </div>
                        </section>
                    `;
                })}
            </div>
        `;
    },
});
