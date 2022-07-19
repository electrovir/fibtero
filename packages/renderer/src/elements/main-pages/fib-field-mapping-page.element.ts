import {
    JiraAuth,
    JiraCustomFieldDefinitions,
    JiraIssue,
    JiraJqlSearchRequest,
} from '@packages/common/src/data/jira-data';
import {emptyUserPreferences} from '@packages/common/src/data/user-preferences';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {css, defineFunctionalElement, html} from 'element-vir';

async function getFields(
    jiraAuth: JiraAuth,
    electronApi: ElectronWindowInterface,
): Promise<JiraCustomFieldDefinitions> {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.GetCustomFieldNames,
        data: jiraAuth,
    });

    if (response.success) {
        console.log({fields: response.data});
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

async function search(
    searchRequest: JiraJqlSearchRequest,
    electronApi: ElectronWindowInterface,
): Promise<JiraIssue[]> {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.JqlSearch,
        data: searchRequest,
    });

    if (response.success) {
        console.log(response.data);
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

function makeJiraRequestData(props: typeof FibFieldMappingPage['init']['props']) {
    return {
        domain: props.jiraAuth?.domain || '',
        credentials: props.jiraAuth?.credentials || {
            apiKey: '',
            username: '',
        },
    };
}

function makeSearchRequestData(props: typeof FibFieldMappingPage['init']['props']) {
    return {
        domain: props.jiraAuth?.domain || '',
        jql: 'project = "UX Engineering"',
        credentials: props.jiraAuth?.credentials || {
            apiKey: '',
            username: '',
        },
    };
}

export const FibFieldMappingPage = defineFunctionalElement({
    tagName: 'fib-field-mapping-page',
    props: {
        electronApi: undefined as undefined | ElectronWindowInterface,
        currentPreferences: emptyUserPreferences,
        jiraAuth: undefined as undefined | JiraAuth,
    },
    styles: css`
        :host {
            display: flex;
            align-items: center;
            flex-direction: column;
        }
    `,
    initCallback: ({props}) => {
        console.log('hello there');
        if (props.electronApi) {
            getFields(makeJiraRequestData(props), props.electronApi);
            search(makeSearchRequestData(props), props.electronApi);
        }
    },
    renderCallback: ({props, setProps, genericDispatch}) => {
        if (!props.electronApi) {
            return html`
                loading...
            `;
        }

        const electronApi: ElectronWindowInterface = props.electronApi;

        return html`
            <h2>Jira Field Mappings</h2>
            <p>
                Please review the auto-generated field type mappings. If there are any corrections
                you would like to make, feel free to make them now. There will be the option to
                return and edit these mappings later.
            </p>
        `;
    },
});
