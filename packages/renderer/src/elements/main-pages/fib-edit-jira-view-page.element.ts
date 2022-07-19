import {JiraView} from '@packages/common/src/data/jira-view';
import {emptyUserPreferences, UserPreferences} from '@packages/common/src/data/user-preferences';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import {ReloadUserPreferences} from '../../global-events/reload-user-preferences.event';
import {FibCreateView} from '../create-view/fib-create-view.element';
import {FibViewSelector} from '../fib-view-selector.element';

export const FibEditJiraViewPage = defineFunctionalElement({
    tagName: 'fib-edit-jira-view-page',
    props: {
        electronApi: undefined as undefined | ElectronWindowInterface,
        userPreferences: emptyUserPreferences,
        selectedViewIndex: 0,
        currentlyEditingView: {
            index: 0,
            view: undefined as undefined | Readonly<JiraView>,
        },
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
        }

        ${FibCreateView} {
            align-self: center;
        }

        .delete {
            align-self: center;
            margin-top: 16px;
            background-color: pink;
            border: 2px solid red;
            border-radius: 4px;
            cursor: pointer;
        }
    `,
    renderCallback: ({props, setProps, genericDispatch}) => {
        if (!props.electronApi) {
            return html`
                loading...
            `;
        }

        const electronApi: ElectronWindowInterface = props.electronApi;

        let currentlyEditing = props.currentlyEditingView;

        if (!currentlyEditing.view || currentlyEditing.index !== props.selectedViewIndex) {
            currentlyEditing = {
                index: props.selectedViewIndex,
                view: props.userPreferences.views[props.selectedViewIndex],
            };
            setProps({currentlyEditingView: currentlyEditing});
        }

        const createViewTemplate = currentlyEditing
            ? html`
                <${FibCreateView}
                    ${assign(FibCreateView.props.viewDefinition, currentlyEditing.view)}
                    ${assign(FibCreateView.props.allowReset, false)}
                    ${listen(FibCreateView.events.viewChange, (event) => {
                        setProps({
                            currentlyEditingView: {
                                index: props.selectedViewIndex,
                                view: event.detail,
                            },
                        });
                    })}
                    ${listen(FibCreateView.events.viewSubmit, async (event) => {
                        const newView = event.detail;
                        const newViewsArray = [
                            ...props.userPreferences.views.slice(0, props.selectedViewIndex),
                            newView,
                            ...props.userPreferences.views.slice(props.selectedViewIndex + 1),
                        ];

                        const newUserPreferences: UserPreferences = {
                            ...props.userPreferences,
                            views: newViewsArray,
                        };

                        await electronApi.apiRequest({
                            type: ApiRequestType.SavePreferences,
                            data: newUserPreferences,
                        });

                        genericDispatch(new ReloadUserPreferences());
                    })}
                ></${FibCreateView}>
                <button 
                    class="delete"
                    ${listen('click', async () => {
                        const newViewsArray = [
                            ...props.userPreferences.views.slice(0, props.selectedViewIndex),
                            ...props.userPreferences.views.slice(props.selectedViewIndex + 1),
                        ];

                        const newUserPreferences: UserPreferences = {
                            ...props.userPreferences,
                            views: newViewsArray,
                        };

                        let newIndex = props.currentlyEditingView.index - 1;
                        if (newIndex < 0) {
                            newIndex = 0;
                        }

                        setProps({
                            currentlyEditingView: {
                                index: newIndex,
                                view: undefined,
                            },
                            selectedViewIndex: newIndex,
                        });

                        await electronApi.apiRequest({
                            type: ApiRequestType.SavePreferences,
                            data: newUserPreferences,
                        });

                        genericDispatch(new ReloadUserPreferences());
                    })}
                >
                    delete
                </button>
            `
            : '';

        return html`
            Select a view to edit:
            <br />
            <br />
            <${FibViewSelector}
                ${assign(FibViewSelector.props.views, props.userPreferences.views)}
                ${assign(FibViewSelector.props.selectedViewIndex, props.selectedViewIndex)}
                ${listen(FibViewSelector.events.selectedViewChange, (event) => {
                    setProps({
                        selectedViewIndex: event.detail,
                    });
                })}
            ></${FibViewSelector}>
            <br />
        
            ${createViewTemplate}
        `;
    },
});