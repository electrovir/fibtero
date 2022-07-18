import {JiraAuth} from '@packages/common/src/data/jira-data';
import {emptyUserPreferences} from '@packages/common/src/data/user-preferences';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import {FibButton} from '../core-elements/fib-button.element';
import {FibViewDisplay} from '../fib-view-display.element';

export const FibMyViews = defineFunctionalElement({
    tagName: 'fib-my-views',
    props: {
        electronApi: undefined as undefined | ElectronWindowInterface,
        userPreferences: emptyUserPreferences,
        selectedViewIndex: undefined as undefined | number,
        jiraAuth: undefined as undefined | JiraAuth,
    },
    styles: css`
        :host {
            margin-top: 24px;
            display: flex;
        }

        .view-select {
            border-right: 1px solid grey;
            padding-right: 16px;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
        }
    `,
    renderCallback: ({props, setProps}) => {
        const selectedView =
            props.selectedViewIndex == undefined
                ? undefined
                : props.userPreferences.views[props.selectedViewIndex];

        return html`
            <div class="view-select">
                ${props.userPreferences.views.map((viewDefinition, index) => {
                    return html`
                        <${FibButton}
                            ${assign(FibButton.props.label, viewDefinition.name)}
                            ${assign(FibButton.props.disabled, index === props.selectedViewIndex)}
                            ${listen('click', () => {
                                setProps({
                                    selectedViewIndex: index,
                                });
                            })}
                        ></${FibButton}>
                    `;
                })}
            </div>
            <div class="view-display">
                <${FibViewDisplay}
                    ${assign(FibViewDisplay.props.view, selectedView)}
                    ${assign(FibViewDisplay.props.jiraAuth, props.jiraAuth)}
                    ${assign(FibViewDisplay.props.electronApi, props.electronApi)}
                ></${FibViewDisplay}>
            </div>
        `;
    },
});
