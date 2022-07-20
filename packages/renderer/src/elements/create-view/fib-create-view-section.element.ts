import {
    createEmptyViewSectionFilter,
    JiraViewSection,
} from '@packages/common/src/data/jira-view/jira-view';
import {createEmptyIssueDragging} from '@packages/common/src/data/jira-view/view-issue-dragging';
import {randomString} from 'augment-vir';
import {assign, css, defineElementEvent, defineFunctionalElement, html, listen} from 'element-vir';
import {repeat} from 'lit/directives/repeat.js';
import {FibInput} from '../core-elements/fib-input.element';
import {FibCreateDragOperation} from './fib-create-drag-operation.element';
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

        ${FibCreateViewSectionFilter}, ${FibCreateDragOperation} {
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
                Drag in operations
                <button
                    ${listen('click', () => {
                        setProps({
                            sectionDefinition: {
                                ...props.sectionDefinition,
                                dragIn: [
                                    ...props.sectionDefinition.dragIn,
                                    createEmptyIssueDragging(randomString),
                                ],
                            },
                        });
                        dispatch(new events.sectionChange(props.sectionDefinition));
                    })}
                >
                    + Add operation
                </button>
            </b>
            ${repeat(
                props.sectionDefinition.dragIn,
                (item) => item.id,
                (dragInOperation, index) => {
                    return html`
                        <${FibCreateDragOperation}
                            ${assign(FibCreateDragOperation.props.dragOperation, dragInOperation)}
                            ${listen(FibCreateDragOperation.events.dragOperationChange, (event) => {
                                props.sectionDefinition.dragIn[index] = event.detail;
                                dispatch(new events.sectionChange(props.sectionDefinition));
                            })}
                            ${listen(FibCreateDragOperation.events.deleteDragOperation, () => {
                                // remove it
                                props.sectionDefinition.dragIn.splice(index, 1);

                                // update the dom
                                setProps({
                                    sectionDefinition: {
                                        ...props.sectionDefinition,
                                    },
                                });
                            })}
                        ></${FibCreateDragOperation}>
                    `;
                },
            )}
            <b>
                Drag out operations
                <button
                    ${listen('click', () => {
                        setProps({
                            sectionDefinition: {
                                ...props.sectionDefinition,
                                dragOut: [
                                    ...props.sectionDefinition.dragOut,
                                    createEmptyIssueDragging(randomString),
                                ],
                            },
                        });
                        dispatch(new events.sectionChange(props.sectionDefinition));
                    })}
                >
                    + Add operation
                </button>
            </b>
            ${repeat(
                props.sectionDefinition.dragOut,
                (item) => item.id,
                (dragOutOperation, index) => {
                    return html`
                        <${FibCreateDragOperation}
                            ${assign(FibCreateDragOperation.props.dragOperation, dragOutOperation)}
                            ${listen(FibCreateDragOperation.events.dragOperationChange, (event) => {
                                props.sectionDefinition.dragOut[index] = event.detail;
                                dispatch(new events.sectionChange(props.sectionDefinition));
                            })}
                            ${listen(FibCreateDragOperation.events.deleteDragOperation, () => {
                                // remove it
                                props.sectionDefinition.dragOut.splice(index, 1);

                                // update the dom
                                setProps({
                                    sectionDefinition: {
                                        ...props.sectionDefinition,
                                    },
                                });
                            })}
                        ></${FibCreateDragOperation}>
                    `;
                },
            )}
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
