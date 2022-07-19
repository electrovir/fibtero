import {
    createEmptyViewSectionFilter,
    FilterType,
    JiraViewSectionFilter,
} from '@packages/common/src/data/jira-view';
import {getEnumTypedValues, isEnumValue, randomString} from 'augment-vir';
import {assign, defineElementEvent, defineFunctionalElement, html, listen} from 'element-vir';
import {css} from 'lit';
import {FibInput} from '../core-elements/fib-input.element';

export const FibCreateViewSectionFilter = defineFunctionalElement({
    tagName: 'fib-create-view-section-filter',
    props: {
        filterDefinition: createEmptyViewSectionFilter(randomString),
    },
    events: {
        filterChange: defineElementEvent<JiraViewSectionFilter>(),
        deleteFilter: defineElementEvent<void>(),
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
                Filter Type
                <select
                    ${listen('change', (event) => {
                        const target = event.target as HTMLSelectElement;
                        const filterType = target.value;
                        if (!isEnumValue(filterType, FilterType)) {
                            throw new Error(`Invalid view direction selected.`);
                        }
                        const newFilter = {
                            ...props.filterDefinition,
                            filterType,
                        };
                        setProps({
                            filterDefinition: newFilter,
                        });
                        dispatch(new events.filterChange(newFilter));
                    })}
                    .value=${props.filterDefinition.filterType} class="direction-select"
                >
                    ${getEnumTypedValues(FilterType).map(
                        (filterTypeValue) =>
                            html`
                                <option value=${filterTypeValue}>${filterTypeValue}</option>
                            `,
                    )}
                </select>
            </label>
            <${FibInput}
                ${assign(FibInput.props.value, props.filterDefinition.fieldName)}
                ${assign(FibInput.props.label, 'Field name')}
                ${listen(FibInput.events.valueChange, (event) => {
                    const fieldName = event.detail;
                    const newFilter = {
                        ...props.filterDefinition,
                        fieldName,
                    };
                    setProps({
                        filterDefinition: newFilter,
                    });

                    dispatch(new events.filterChange(newFilter));
                })}
                class="name-input"
            ></${FibInput}>
            ${
                props.filterDefinition.filterType === FilterType.Regex
                    ? html`
                        <${FibInput}
                            ${assign(
                                FibInput.props.value,
                                props.filterDefinition.filterRegExpString,
                            )}
                            ${assign(FibInput.props.label, 'RegExp string')}
                            ${listen(FibInput.events.valueChange, (event) => {
                                const filterRegExpString = event.detail;
                                const newFilter = {
                                    ...props.filterDefinition,
                                    filterRegExpString,
                                };
                                setProps({
                                    filterDefinition: newFilter,
                                });

                                dispatch(new events.filterChange(newFilter));
                            })}
                            class="name-input"
                        ></${FibInput}>
                    `
                    : ''
            }
            <button
                class="delete"
                ${listen('click', () => {
                    dispatch(new events.deleteFilter());
                })}
            >
                delete filter
            </button>
        `;
    },
});
