import {createEmptyViewSectionFilter, JiraViewSection} from '@packages/common/src/data/jira-view';
import {randomString} from 'augment-vir';
import {assign, css, defineElementEvent, defineFunctionalElement, html, listen} from 'element-vir';
import {repeat} from 'lit/directives/repeat.js';
import {FibInput} from '../core-elements/fib-input.element';
import {FibCreateViewSectionFilter} from './fib-create-section-filter.element';

export const FibCreateViewSection = defineFunctionalElement({
    tagName: 'fib-create-view-section',
    props: {
        sectionDefinition: {} as JiraViewSection,
    },
    events: {
        sectionChange: defineElementEvent<JiraViewSection>(),
        deleteSection: defineElementEvent<void>(),
    },
    styles: css`
        :host {
            border: 1px solid #ccc;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            padding: 16px;
            gap: 8px;
        }

        ${FibCreateViewSectionFilter} {
            margin-left: 16px;
        }

        button {
            align-self: flex-end;
        }

        .delete-button {
            margin-top: 8px;
            background-color: #ffebee;
            border: 2px solid red;
            cursor: pointer;
            border-radius: 4px;
        }
    `,
    renderCallback: ({props, setProps, dispatch, events}) => {
        return html`
            <${FibInput}
                ${assign(FibInput.props.value, props.sectionDefinition.name)}
                ${assign(FibInput.props.label, 'Section name')}
                ${listen(FibInput.events.valueChange, (event) => {
                    const name = event.detail;
                    const newSection = {
                        ...props.sectionDefinition,
                        name,
                    };
                    setProps({
                        sectionDefinition: newSection,
                    });
                    dispatch(new events.sectionChange(newSection));
                })}
                class="name-input"
            ></${FibInput}>
            <b>
                Filters
                <button
                    ${listen('click', () => {
                        setProps({
                            sectionDefinition: {
                                ...props.sectionDefinition,
                                requirements: [
                                    ...props.sectionDefinition.requirements,
                                    createEmptyViewSectionFilter(randomString),
                                ],
                            },
                        });
                        dispatch(new events.sectionChange(props.sectionDefinition));
                    })}
                >
                    + Add filter
                </button>
            </b>
            ${repeat(
                props.sectionDefinition.requirements,
                (item) => item.id,
                (sectionFilter, index) => {
                    return html`
                        <${FibCreateViewSectionFilter}
                            ${assign(
                                FibCreateViewSectionFilter.props.filterDefinition,
                                sectionFilter,
                            )}
                            ${listen(FibCreateViewSectionFilter.events.filterChange, (event) => {
                                props.sectionDefinition.requirements[index] = event.detail;
                                dispatch(new events.sectionChange(props.sectionDefinition));
                            })}
                            ${listen(FibCreateViewSectionFilter.events.deleteFilter, () => {
                                // remove it
                                props.sectionDefinition.requirements.splice(index, 1);

                                // update the dom
                                setProps({
                                    sectionDefinition: {
                                        ...props.sectionDefinition,
                                    },
                                });
                            })}
                        ></${FibCreateViewSectionFilter}>
                    `;
                },
            )}
            <button
                class="delete-button"
                ${listen('click', () => {
                    dispatch(new events.deleteSection());
                })}
            >
                delete section
            </button>
        `;
    },
});
