import {JiraView} from '@packages/common/src/data/jira-view';
import {assign, css, defineElementEvent, defineFunctionalElement, html, listen} from 'element-vir';
import {ChangeCurrentViewIndexEvent} from '../global-events/change-current-view-index.event';
import {FibButton} from './core-elements/fib-button.element';

export type ExtraFibViewSelectorCommand = {
    text: string;
};

export const FibViewSelector = defineFunctionalElement({
    tagName: 'fib-view-selector',
    props: {
        views: [] as JiraView[],
        extraCommands: [] as ExtraFibViewSelectorCommand[],
        selectedViewIndex: undefined as undefined | number,
    },
    styles: css`
        :host {
            align-self: stretch;
            flex-shrink: 0;
            flex-direction: column;
            padding-right: 16px;
            border-right: 1px solid grey;
            margin-right: 16px;
            gap: 8px;
            display: flex;
        }

        button {
            align-self: center;
            padding: 2px 12px;
            cursor: pointer;
        }
    `,
    events: {
        extraCommandClicked: defineElementEvent<number>(),
    },
    renderCallback: ({props, dispatch, events, genericDispatch}) => {
        return html`
            ${props.views.map((viewDefinition, index) => {
                return html`
                    <${FibButton}
                        ${assign(FibButton.props.label, viewDefinition.name)}
                        ${assign(FibButton.props.disabled, index === props.selectedViewIndex)}
                        ${listen('click', () => {
                            genericDispatch(new ChangeCurrentViewIndexEvent(index));
                        })}
                    ></${FibButton}>
                `;
            })}
            ${props.extraCommands.map((extraCommand, index) => {
                return html`
                    <button
                        ${listen('click', () => {
                            dispatch(new events.extraCommandClicked(index));
                        })}
                    >
                        ${extraCommand.text}
                    </button>
                `;
            })}
        `;
    },
});
