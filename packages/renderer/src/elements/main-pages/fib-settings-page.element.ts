import {MainRendererPage} from '@packages/common/src/data/main-renderer-page';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {defineFunctionalElement, html, listen} from 'element-vir';
import {ChangePageEvent} from '../../global-events/change-page.event';

export const FibSettingsPage = defineFunctionalElement({
    tagName: 'fib-settings-page',
    props: {
        electronApi: undefined as undefined | ElectronWindowInterface,
    },
    renderCallback: ({props, dispatch, genericDispatch, events}) => {
        return html`
            <h1>Settings</h1>

            <button
                ${listen('click', () => {
                    genericDispatch(new ChangePageEvent(MainRendererPage.Auth));
                })}
            >
                Logout
            </button>
        `;
    },
});
