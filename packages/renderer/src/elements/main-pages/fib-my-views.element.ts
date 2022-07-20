import {JiraAuth} from '@packages/common/src/data/jira-data';
import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {emptyUserPreferences} from '@packages/common/src/data/user-preferences';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {isTruthy} from 'augment-vir';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import {ChangePageEvent} from '../../global-events/change-page.event';
import {FibViewSelector} from '../fib-view-selector.element';
import {FibViewDisplay} from '../issue-display/fib-view-display.element';

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
            box-sizing: border-box;
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

        .view-display {
            flex-grow: 1;
        }
    `,
    renderCallback: ({props, setProps, genericDispatch}) => {
        const selectedView =
            props.selectedViewIndex == undefined
                ? undefined
                : props.userPreferences.views[props.selectedViewIndex];

        const extraCommands = [
            props.userPreferences.views.length
                ? {text: 'edit', page: MainRendererPage.EditJiraView}
                : undefined,
            {text: 'new', page: MainRendererPage.CreateJiraView},
            {text: 'export', page: MainRendererPage.ExportJiraView},
            {text: 'import', page: MainRendererPage.ImportJiraView},
        ].filter(isTruthy);

        return html`
            <${FibViewSelector}
                ${assign(FibViewSelector.props.views, props.userPreferences.views)}
                ${assign(FibViewSelector.props.selectedViewIndex, props.selectedViewIndex)}
                ${assign(FibViewSelector.props.extraCommands, extraCommands)}
                ${listen(FibViewSelector.events.extraCommandClicked, (event) => {
                    const index = event.detail;

                    const newPage = extraCommands[index]!.page;
                    if (newPage) {
                        genericDispatch(new ChangePageEvent(newPage));
                    }
                })}
            ></${FibViewSelector}>
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
