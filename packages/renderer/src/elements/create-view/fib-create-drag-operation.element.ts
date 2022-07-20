import {
    createEmptyIssueDragging,
    IssueDragging,
    IssueDragOperation,
} from '@packages/common/src/data/jira-view/view-issue-dragging';
import {getEnumTypedValues, isEnumValue, randomString} from 'augment-vir';
import {assign, defineElementEvent, defineFunctionalElement, html, listen} from 'element-vir';
import {css} from 'lit';
import {FibInput} from '../core-elements/fib-input.element';

export const FibCreateDragOperation = defineFunctionalElement({
    tagName: 'fib-create-drag-operation',
    props: {
        dragOperation: createEmptyIssueDragging(randomString),
    },
    events: {
        dragOperationChange: defineElementEvent<IssueDragging>(),
        deleteDragOperation: defineElementEvent<void>(),
    },
    styles: css`
        :host {
            display: flex;
            align-items: flex-end;
            border: 1px solid #aaa;
            border-radius: 8px;
            padding: 8px;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: space-between;
        }

        label {
            display: flex;
            flex-direction: column;
        }

        .delete {
            background-color: #ffebee;
            border: 2px solid red;
            cursor: pointer;
            border-radius: 4px;
        }
    `,
    renderCallback: ({props, setProps, dispatch, events}) => {
        return html`
            <label>
                Operation type
                <select
                    ${listen('change', (event) => {
                        const target = event.target as HTMLSelectElement;
                        const operation = target.value;
                        if (!isEnumValue(operation, IssueDragOperation)) {
                            throw new Error(`Invalid operation selected: ${operation}.`);
                        }
                        const newDragOperation = {
                            ...props.dragOperation,
                            operation,
                        };
                        setProps({
                            dragOperation: newDragOperation,
                        });
                        dispatch(new events.dragOperationChange(newDragOperation));
                    })}
                    .value=${props.dragOperation.operation} class="direction-select"
                >
                    ${getEnumTypedValues(IssueDragOperation).map(
                        (operationValue) =>
                            html`
                                <option
                                    ?selected=${operationValue === props.dragOperation.operation}
                                    value=${operationValue}
                                >
                                    ${operationValue}
                                </option>
                            `,
                    )}
                </select>
            </label>
            <${FibInput}
                ${assign(FibInput.props.value, props.dragOperation.fieldName)}
                ${assign(FibInput.props.label, 'Field name')}
                ${listen(FibInput.events.valueChange, (event) => {
                    const fieldName = event.detail;
                    const newOperation = {
                        ...props.dragOperation,
                        fieldName,
                    };
                    setProps({
                        dragOperation: newOperation,
                    });

                    dispatch(new events.dragOperationChange(newOperation));
                })}
                class="name-input"
            ></${FibInput}>
            
            <${FibInput}
                ${assign(FibInput.props.value, props.dragOperation.value)}
                ${assign(FibInput.props.label, 'Value')}
                ${listen(FibInput.events.valueChange, (event) => {
                    const value = event.detail;
                    const newOperation = {
                        ...props.dragOperation,
                        value,
                    };
                    setProps({
                        dragOperation: newOperation,
                    });

                    dispatch(new events.dragOperationChange(newOperation));
                })}
            ></${FibInput}>
            <button
                class="delete"
                ${listen('click', () => {
                    dispatch(new events.deleteDragOperation());
                })}
            >
                delete operation
            </button>
        `;
    },
});
