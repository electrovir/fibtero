import {JiraView} from '@packages/common/src/data/jira-view';
import {assign, css, defineElementEvent, defineFunctionalElement, html, listen} from 'element-vir';
import {FibButton} from './core-elements/fib-button.element';

export const FibViewSelector = defineFunctionalElement({
    tagName: 'fib-view-selector',
    props: {
        views: [] as JiraView[],
        selectedViewIndex: undefined as undefined | number,
    },
    styles: css`
        :host {
            gap: 8px;
            display: flex;
        }
    `,
    events: {
        selectedViewChange: defineElementEvent<number>(),
    },
    renderCallback: ({props, dispatch, events}) => {
        return html`
            ${props.views.map((viewDefinition, index) => {
                return html`
                    <${FibButton}
                        ${assign(FibButton.props.label, viewDefinition.name)}
                        ${assign(FibButton.props.disabled, index === props.selectedViewIndex)}
                        ${listen('click', () => {
                            dispatch(new events.selectedViewChange(index));
                        })}
                    ></${FibButton}>
                `;
            })}
        `;
    },
});
