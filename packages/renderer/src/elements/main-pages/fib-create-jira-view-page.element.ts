import {createNewView} from '@packages/common/src/data/jira-view';
import {emptyUserPreferences, UserPreferences} from '@packages/common/src/data/user-preferences';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {randomString} from 'augment-vir';
import {assign, defineFunctionalElement, html, listen} from 'element-vir';
import {ReloadUserPreferencesEvent} from '../../global-events/reload-user-preferences.event';
import {FibCreateView} from '../create-view/fib-create-view.element';

export const FibCreateJiraViewPage = defineFunctionalElement({
    tagName: 'fib-create-jira-view-page',
    props: {
        electronApi: undefined as undefined | ElectronWindowInterface,
        currentPreferences: emptyUserPreferences,
        currentlyCreatedView: createNewView(randomString),
    },
    renderCallback: ({props, setProps, genericDispatch}) => {
        if (!props.electronApi) {
            return html`
                loading...
            `;
        }

        const electronApi: ElectronWindowInterface = props.electronApi;

        return html`
            <${FibCreateView}
                ${assign(FibCreateView.props.viewDefinition, props.currentlyCreatedView)}
                ${listen(FibCreateView.events.viewChange, (event) => {
                    setProps({
                        currentlyCreatedView: event.detail,
                    });
                })}
                ${listen(FibCreateView.events.viewSubmit, async (event) => {
                    const newView = event.detail;
                    const newUserPreferences: UserPreferences = {
                        ...props.currentPreferences,
                        views: [
                            ...props.currentPreferences.views,
                            newView,
                        ],
                    };

                    await electronApi.apiRequest({
                        type: ApiRequestType.SavePreferences,
                        data: newUserPreferences,
                    });

                    setProps({
                        currentlyCreatedView: createNewView(randomString),
                    });
                    genericDispatch(new ReloadUserPreferencesEvent());
                })}
            ></${FibCreateView}>
        `;
    },
});
