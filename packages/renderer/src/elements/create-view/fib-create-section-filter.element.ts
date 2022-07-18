import {
    createEmptyViewSectionFilter,
    JiraViewSectionFilter,
} from '@packages/common/src/data/jira-view';
import {randomString} from 'augment-vir';
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
    `,
    renderCallback: ({props, setProps, dispatch, events}) => {
        return html`
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
            <${FibInput}
                ${assign(FibInput.props.value, props.filterDefinition.filterRegExpString)}
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
            <button
                ${listen('click', () => {
                    dispatch(new events.deleteFilter());
                })}
            >
                X
            </button>
        `;
    },
});
