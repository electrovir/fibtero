import {JiraAuth, JiraCustomFieldDefinitions} from '@packages/common/src/data/jira-data';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {defineFunctionalElement, html} from 'element-vir';

export const FibCustomFieldsLoader = defineFunctionalElement({
    tagName: 'fib-custom-fields-loader',
    props: {
        jiraAuth: undefined as undefined | JiraAuth,
        electronApi: undefined as undefined | ElectronWindowInterface,
        fieldsRequest: undefined as
            | undefined
            | Promise<JiraCustomFieldDefinitions>
            | JiraCustomFieldDefinitions,
    },
    renderCallback: ({props}) => {
        return html`
            yo
        `;
    },
});
