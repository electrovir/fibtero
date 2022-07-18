import {JiraJqlResponse, JiraRequest} from '@packages/common/src/data/jira-data';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {assign, defineFunctionalElement, html, listen} from 'element-vir';
import {css} from 'lit';
import {FibInput} from './input.element';

async function makeJiraRequest(
    jiraRequest: JiraRequest,
    electronApi: ElectronWindowInterface,
): Promise<JiraJqlResponse> {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.JiraRequest,
        data: jiraRequest,
    });

    if (response.success) {
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

async function getFields(
    jiraRequest: JiraRequest,
    electronApi: ElectronWindowInterface,
): Promise<Map<string,string>> {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.GetField,
        data: jiraRequest,
    });

    if (response.success) {
        console.log(response.data);
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

const cachedJiraDataKey = 'cached-jira-data';

function setCachedData(data: JiraRequest) {
    window.localStorage.setItem(cachedJiraDataKey, JSON.stringify(data));
}

function getCachedData(): undefined | JiraRequest {
    const cached = window.localStorage.getItem(cachedJiraDataKey);
    if (cached) {
        return JSON.parse(cached);
    } else {
        return undefined;
    }
}

function makeRequestData(props: typeof BasicJiraTest['init']['props']) {
    return {
        domain: props.domain,
        jql: props.jql,
        credentials: {
            apiKey: props.apiKey,
            username: props.username,
        },
    };
}

async function submitForm(props: typeof BasicJiraTest['init']['props']) {
    if (props.electronApi) {
        const results = await makeJiraRequest(makeRequestData(props), props.electronApi);
        console.log(results);

        results.issues[0]!.fields;
    } else {
        throw new Error(`Electron api is undefined.`);
    }
}

export const BasicJiraTest = defineFunctionalElement({
    tagName: 'fib-basic-jira-test',
    props: {
        useCachedData: false,
        username: getCachedData()?.credentials.username ?? '',
        apiKey: getCachedData()?.credentials.apiKey ?? '',
        jql: getCachedData()?.jql ?? '',
        domain: getCachedData()?.domain ?? '',
        electronApi: undefined as undefined | ElectronWindowInterface,
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            padding: 16px;
        }
    `,
    initCallback({props, setProps}) {
        if (props.useCachedData && props.apiKey && props.domain && props.jql && props.username) {
            // fire a request if all the data is cached already
            submitForm(props);
        }
        if (!props.useCachedData) {
            setProps({
                apiKey: '',
                domain: '',
                jql: '',
                username: '',
            });
        }
        if(props.electronApi){
            getFields(makeRequestData(props),props.electronApi);
        }
    },
    renderCallback: ({props, setProps}) => {
        return html`
            <h2>
                Basic Jira Test
            </h2>
            <form
                ${listen('submit', async (event) => {
                    // prevent page navigation
                    event.preventDefault();
                    await submitForm(props);
                })}
            >
                <${FibInput}
                    ${listen(FibInput.events.valueChange, (event) => {
                        setProps({domain: event.detail});
                        setCachedData(makeRequestData(props));
                    })}
                    ${assign(FibInput.props.label, 'Jira Cloud domain')}
                    ${assign(FibInput.props.value, props.domain)}
                ></${FibInput}>
                <${FibInput}
                    ${listen(FibInput.events.valueChange, (event) => {
                        setProps({username: event.detail});
                        setCachedData(makeRequestData(props));
                    })}
                    ${assign(FibInput.props.label, 'Jira username')}
                    ${assign(FibInput.props.value, props.username)}
                ></${FibInput}>
                <${FibInput}
                    ${listen(FibInput.events.valueChange, (event) => {
                        setProps({apiKey: event.detail});
                        setCachedData(makeRequestData(props));
                    })}
                    ${assign(FibInput.props.label, 'Jira API key')}
                    ${assign(FibInput.props.value, props.apiKey)}
                    ${assign(FibInput.props.inputType, 'password')}
                ></${FibInput}>
                <${FibInput}
                    ${listen(FibInput.events.valueChange, (event) => {
                        setProps({jql: event.detail});
                        setCachedData(makeRequestData(props));
                    })}
                    ${assign(FibInput.props.label, 'JQL query')}
                    ${assign(FibInput.props.value, props.jql)}
                ></${FibInput}>
                <br>
                <input class="submit" type="submit" value="Trigger Jira Query" />
            </form>
        `;
    },
});
