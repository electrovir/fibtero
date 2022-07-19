import {JiraView} from '@packages/common/src/data/jira-view';
import {emptyUserPreferences, UserPreferences} from '@packages/common/src/data/user-preferences';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import {ReloadUserPreferencesEvent} from '../../global-events/reload-user-preferences.event';
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
            align-items: stretch;
        }

        .delete {
            margin-top: 16px;
            background-color: #ffebee;
            border: 2px solid red;
            border-radius: 4px;
            cursor: pointer;
        }

        .edit-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex-grow: 1;
            overflow: hidden;
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

        if (!props.userPreferences.views.length) {
            return html`
                No views to edit. Create one!
            `;
        }

        const createViewTemplate = currentlyEditing
            ? html`
                <section class="edit-section">
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

                            genericDispatch(new ReloadUserPreferencesEvent());
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

                            genericDispatch(new ReloadUserPreferencesEvent());
                        })}
                    >
                        Delete view
                    </button>
                </section>
            `
            : '';

        return html`
            <${FibViewSelector}
                ${assign(FibViewSelector.props.views, props.userPreferences.views)}
                ${assign(FibViewSelector.props.selectedViewIndex, props.selectedViewIndex)}
            ></${FibViewSelector}>        
            ${createViewTemplate}
        `;
    },
});
