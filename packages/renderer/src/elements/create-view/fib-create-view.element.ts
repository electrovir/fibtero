import {
    createEmptyViewSection,
    createNewView,
    JiraView,
    ViewDirection,
} from '@packages/common/src/data/jira-view/jira-view';
import {validateView} from '@packages/common/src/data/jira-view/jira-view-validation';
import {getEnumTypedValues, isEnumValue, isTruthy, randomString} from 'augment-vir';
import {assign, css, defineElementEvent, defineFunctionalElement, html, listen} from 'element-vir';
import {repeat} from 'lit/directives/repeat.js';
import {FibInput} from '../core-elements/fib-input.element';
import {FibCreateViewSection} from './fib-create-view-section.element';

export const FibCreateView = defineFunctionalElement({
    tagName: 'fib-create-view',
    props: {
        viewDefinition: createNewView(randomString),
        error: {} as {[viewId: string]: string},
        allowReset: true,
    },
    events: {
        viewChange: defineElementEvent<JiraView>(),
        viewSubmit: defineElementEvent<JiraView>(),
    },
    styles: css`
        :host {
            width: 700px;
            max-width: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        label {
            display: flex;
            flex-direction: column;
        }

        form {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        button {
            align-self: center;
        }

        ${FibInput}, select, label {
            font-size: 1.2em;
        }

        ${FibCreateViewSection} {
            margin-left: 16px;
        }

        .error-message {
            color: red;
        }
    `,
    renderCallback: ({props, setProps, dispatch, events}) => {
        if (
            Object.keys(props.error).length &&
            Object.keys(props.error)[0] !== props.viewDefinition.id
        ) {
            setProps({error: {}});
        }

        function updateCreatedView(newView: JiraView) {
            setProps({viewDefinition: newView});
            dispatch(new events.viewChange(newView));
        }

        return html`
            <form
                ${listen('submit', async (event) => {
                    // prevent page navigation
                    event.preventDefault();
                })}
            >
                <${FibInput}
                    ${assign(FibInput.props.label, 'View name')}
                    ${assign(FibInput.props.value, props.viewDefinition.name)}
                    ${listen(FibInput.events.valueChange, (event) => {
                        updateCreatedView({
                            ...props.viewDefinition,
                            name: event.detail,
                        });
                    })}
                    class="name-input"
                ></${FibInput}>
                <label>
                    Direction
                    <select
                        ${listen('change', (event) => {
                            const target = event.target as HTMLSelectElement;
                            const viewDirection = target.value;
                            if (!isEnumValue(viewDirection, ViewDirection)) {
                                throw new Error(`Invalid view direction selected.`);
                            }
                            updateCreatedView({
                                ...props.viewDefinition,
                                direction: viewDirection,
                            });
                        })}
                        .value=${props.viewDefinition.direction} class="direction-select"
                    >
                        ${getEnumTypedValues(ViewDirection).map(
                            (viewDirectionValue) =>
                                html`
                                    <option
                                        ?selected=${viewDirectionValue ===
                                        props.viewDefinition.direction}
                                        value=${viewDirectionValue}
                                    >
                                        ${viewDirectionValue}
                                    </option>
                                `,
                        )}
                    </select>
                </label>
                <${FibInput}
                    ${assign(FibInput.props.value, props.viewDefinition.allIssuesJql)}
                    ${listen(FibInput.events.valueChange, (event) => {
                        updateCreatedView({
                            ...props.viewDefinition,
                            allIssuesJql: event.detail,
                        });
                    })}
                    ${assign(FibInput.props.label, 'JQL')}
                    class="jql-input"
                ></${FibInput}>
                <b>
                    Sections <button
                    ${listen('click', () => {
                        updateCreatedView({
                            ...props.viewDefinition,
                            sections: [
                                ...props.viewDefinition.sections,
                                createEmptyViewSection(randomString),
                            ],
                        });
                    })}
                >
                    + Add Section
                </button>
                </b>
                ${repeat(
                    props.viewDefinition.sections,
                    (item) => {
                        item.id;
                    },
                    (viewSection, index) => {
                        return html`
                            <${FibCreateViewSection}
                                ${assign(FibCreateViewSection.props.sectionDefinition, viewSection)}
                                ${listen(FibCreateViewSection.events.sectionChange, (event) => {
                                    props.viewDefinition.sections[index] = event.detail;
                                })}
                                ${listen(FibCreateViewSection.events.deleteSection, () => {
                                    // remove it
                                    props.viewDefinition.sections.splice(index, 1);

                                    // update the dom
                                    updateCreatedView({
                                        ...props.viewDefinition,
                                    });
                                })}
                                ${listen(FibCreateViewSection.events.duplicateSection, () => {
                                    props.viewDefinition.sections.splice(index + 1, 0, {
                                        ...JSON.parse(JSON.stringify(viewSection)),
                                        id: randomString(),
                                    });

                                    // update the dom
                                    updateCreatedView({
                                        ...props.viewDefinition,
                                    });
                                })}
                            ></${FibCreateViewSection}>
                        `;
                    },
                )}
                
                <div class="error-message">${(props.error[props.viewDefinition.id] ?? '')
                    .split('\n')
                    .filter(isTruthy)
                    .map(
                        (line) =>
                            html`
                                • ${line}
                                <br />
                            `,
                    )}</div>
                <button
                    type="submit"
                    ${listen('click', () => {
                        setProps({error: {}});
                        const error = validateView(props.viewDefinition);
                        if (error) {
                            setProps({
                                error: {
                                    [props.viewDefinition.id]: error,
                                },
                            });
                        } else {
                            dispatch(new events.viewSubmit(props.viewDefinition));
                        }
                    })}
                >
                    Save view
                </button>
            </form>
            ${
                props.allowReset
                    ? html`
                          <button
                              ${listen('click', () => {
                                  updateCreatedView(createNewView(randomString));
                              })}
                          >
                              Reset
                          </button>
                      `
                    : ''
            }
        `;
    },
});
