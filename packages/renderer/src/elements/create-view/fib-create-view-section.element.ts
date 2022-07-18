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
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        ${FibCreateViewSectionFilter} {
            margin-left: 16px;
        }

        button {
            align-self: flex-end;
        }
    `,
    renderCallback: ({props, setProps, dispatch, events}) => {
        console.log({sectionDefinition: props.sectionDefinition});

        return html`
            <${FibInput}
                ${assign(FibInput.props.value, props.sectionDefinition.name)}
                ${assign(FibInput.props.label, 'name')}
                ${listen(FibInput.events.valueChange, (event) => {
                    const name = event.detail;
                    const newSection = {
                        ...props.sectionDefinition,
                        name,
                    };
                    setProps({
                        sectionDefinition: newSection,
                    });
                    console.log({name, section: props.sectionDefinition});
                    dispatch(new events.sectionChange(newSection));
                })}
                class="name-input"
            ></${FibInput}>
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
                Add filter
            </button>
            <button
                ${listen('click', () => {
                    dispatch(new events.deleteSection());
                })}
            >
                delete section
            </button>
        `;
    },
});
