import {createNewView} from '@packages/common/src/data/jira-view/jira-view';
import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {emptyUserPreferences, UserPreferences} from '@packages/common/src/data/user-preferences';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {randomString} from 'augment-vir';
import {assign, css, defineFunctionalElement, html, listen} from 'element-vir';
import {ChangePageEvent} from '../../global-events/change-page.event';
import {ReloadUserPreferencesEvent} from '../../global-events/reload-user-preferences.event';
import {FibCreateView} from '../create-view/fib-create-view.element';

export const FibCreateJiraViewPage = defineFunctionalElement({
    tagName: 'fib-create-jira-view-page',
    props: {
        electronApi: undefined as undefined | ElectronWindowInterface,
        currentPreferences: emptyUserPreferences,
        currentlyCreatedView: createNewView(randomString),
        error: '',
    },
    styles: css`
        :host {
            display: flex;
            justify-content: center;
        }
    `,
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

                    const result = await electronApi.apiRequest({
                        type: ApiRequestType.SavePreferences,
                        data: newUserPreferences,
                    });

                    if (result.success) {
                        setProps({
                            currentlyCreatedView: createNewView(randomString),
                        });
                        genericDispatch(new ReloadUserPreferencesEvent());
                        genericDispatch(new ChangePageEvent(MainRendererPage.MyViews));
                    } else {
                        setProps({error: result.error});
                    }
                })}
            ></${FibCreateView}>
            <span>${props.error}</span>
        `;
    },
});
