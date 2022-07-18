import {
    createEmptyViewSection,
    createNewView,
    JiraView,
    ViewDirection,
} from '@packages/common/src/data/jira-view';
import {getEnumTypedValues, isEnumValue, isTruthy, randomString} from 'augment-vir';
import {
    assign,
    css,
    defineElementEvent,
    defineFunctionalElement,
    html,
    listen,
    onDomCreated,
} from 'element-vir';
import {repeat} from 'lit/directives/repeat.js';
import {FibInput} from '../core-elements/fib-input.element';
import {FibCreateViewSection} from './fib-create-view-section.element';

function validateCreateView(view: JiraView): string {
    const errors: string[] = [];
    if (!view.allIssuesJql) {
        errors.push('missing JQL input');
    }
    if (!isEnumValue(view.direction, ViewDirection)) {
        errors.push(`invalid direction: ${view.direction}`);
    }
    if (view.icon) {
        errors.push('icon field is not supported yet');
    }
    if (!view.id) {
        errors.push('view id is missing');
    }
    if (!view.name) {
        errors.push('view name is missing');
    }
    view.sections.forEach((section, sectionIndex) => {
        if (!section.id) {
            errors.push(`missing id on section at index ${sectionIndex}`);
        }
        if (!section.name) {
            errors.push(`missing name on section at index ${sectionIndex}`);
        }
        section.requirements.forEach((filter, filterIndex) => {
            const onFilter = `on filter at index ${filterIndex} in section at index ${sectionIndex}`;
            if (!filter.fieldName) {
                errors.push(`Missing field name ${onFilter}`);
            }
            if (!filter.id) {
                errors.push(`Missing id ${onFilter}`);
            }
            if (!filter.filterRegExpString) {
                errors.push(`Missing RegExp string ${onFilter}`);
            }
        });
    });

    return errors.join('\n');
}

export const FibCreateView = defineFunctionalElement({
    tagName: 'fib-create-view',
    props: {
        viewDefinition: createNewView(randomString),
        innerSelectElement: undefined as undefined | HTMLSelectElement,
        error: '',
    },
    events: {
        viewChange: defineElementEvent<JiraView>(),
        viewSubmit: defineElementEvent<JiraView>(),
    },
    styles: css`
        label {
            display: flex;
            flex-direction: column;
        }

        form {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        ${FibCreateViewSection} {
            margin-left: 16px;
        }

        .error-message {
            color: red;
        }
    `,
    renderCallback: ({props, setProps, dispatch, events}) => {
        console.log(props.viewDefinition);

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
                        ${onDomCreated((element) => {
                            if (element instanceof HTMLSelectElement) {
                                element.value = props.viewDefinition.direction;
                                setProps({innerSelectElement: element});
                            } else {
                                throw new Error(`Failed to get select element.`);
                            }
                        })}
                        ${listen('change', (event) => {
                            const viewDirection = props.innerSelectElement?.value;
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
                                    <option value=${viewDirectionValue}>
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
                    Sections
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
                            ></${FibCreateViewSection}>
                        `;
                    },
                )}
                <button
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
                    Add Section
                </button>
                <div class="error-message">${props.error
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
                        const error = validateCreateView(props.viewDefinition);
                        if (error) {
                            setProps({error: error});
                        } else {
                            dispatch(new events.viewSubmit(props.viewDefinition));
                        }
                    })}
                >
                    Save
                </button>
            </form>
            <button
                ${listen('click', () => {
                    updateCreatedView(createNewView(randomString));
                })}
            >
                Reset
            </button>
        `;
    },
});
