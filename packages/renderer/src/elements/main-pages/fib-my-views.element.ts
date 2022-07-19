import {JiraAuth} from '@packages/common/src/data/jira-data';
import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {emptyUserPreferences} from '@packages/common/src/data/user-preferences';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import {ChangeCurrentViewIndexEvent} from '../../global-events/change-current-view-index.event';
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
            padding-top: 24px;
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
        if (props.selectedViewIndex === undefined && props.userPreferences.lastViewId) {
            const foundById = props.userPreferences.views.findIndex(
                (view) => view.id === props.userPreferences.lastViewId,
            );
            if (foundById !== -1) {
                genericDispatch(new ChangeCurrentViewIndexEvent(foundById));
            }
        }
        const selectedView =
            props.selectedViewIndex == undefined
                ? undefined
                : props.userPreferences.views[props.selectedViewIndex];

        return html`
            <${FibViewSelector}
                ${assign(FibViewSelector.props.views, props.userPreferences.views)}
                ${assign(FibViewSelector.props.selectedViewIndex, props.selectedViewIndex)}
                ${assign(FibViewSelector.props.extraCommands, [
                    {text: 'edit'},
                    {text: 'new'},
                    {text: 'export'},
                    {text: 'import'},
                ])}
                ${listen(FibViewSelector.events.extraCommandClicked, (event) => {
                    const index = event.detail;
                    const pages = [
                        MainRendererPage.EditJiraView,
                        MainRendererPage.CreateJiraView,
                        MainRendererPage.ExportJiraView,
                        MainRendererPage.ImportJiraView,
                    ];

                    const newPage = pages[index];
                    if (newPage) {
                        genericDispatch(new ChangePageEvent(newPage));
                    }
                })}
                ${listen(ChangeCurrentViewIndexEvent, (event) => {
                    const view = props.userPreferences.views[event.detail];
                    if (view) {
                        props.electronApi?.apiRequest({
                            type: ApiRequestType.SavePreferences,
                            data: {
                                ...props.userPreferences,
                                lastViewId: view.id,
                            },
                        });
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
