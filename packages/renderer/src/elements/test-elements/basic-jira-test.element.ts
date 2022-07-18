import {
    CreateIssueRequest,
    IssueTypesRequest,
    JiraIssue,
    JiraIssueTypesResponse,
    JiraJqlResponse,
    JiraProjectsResponse,
    JiraRequest,
    SearchRequest,
    UpdateIssueRequest,
} from '@packages/common/src/data/jira-data';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {assign, defineFunctionalElement, html, listen} from 'element-vir';
import {css} from 'lit';
import {FibInput} from '../core-elements/fib-input.element';

async function createIssue(
    createIssueRequest: CreateIssueRequest,
    electronApi: ElectronWindowInterface,
): Promise<JiraIssue> {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.CreateIssue,
        data: createIssueRequest,
    });

    if (response.success) {
        console.log(response.data);
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

async function getFields(
    jiraRequest: JiraRequest,
    electronApi: ElectronWindowInterface,
): Promise<Map<string, string>> {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.GetFields,
        data: jiraRequest,
    });

    if (response.success) {
        console.log(response.data);
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

async function getIssueTypes(
    issueTypesRequest: IssueTypesRequest,
    electronApi: ElectronWindowInterface,
): Promise<JiraIssueTypesResponse> {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.GetIssueTypes,
        data: issueTypesRequest,
    });

    if (response.success) {
        console.log(response.data);
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

async function getProjects(
    jiraRequest: JiraRequest,
    electronApi: ElectronWindowInterface,
): Promise<JiraProjectsResponse> {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.GetProjects,
        data: jiraRequest,
    });

    if (response.success) {
        console.log(response.data);
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

async function getUsers(
    jiraRequest: JiraRequest,
    electronApi: ElectronWindowInterface,
): Promise<JiraJqlResponse> {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.GetUsers,
        data: jiraRequest,
    });

    if (response.success) {
        console.log(response.data);
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

async function search(
    searchRequest: SearchRequest,
    electronApi: ElectronWindowInterface,
): Promise<JiraJqlResponse> {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.Search,
        data: searchRequest,
    });

    if (response.success) {
        console.log(response.data);
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

async function searchUsers(
    searchRequest: SearchRequest,
    electronApi: ElectronWindowInterface,
): Promise<JiraJqlResponse> {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.SearchUsers,
        data: searchRequest,
    });

    if (response.success) {
        console.log(response.data);
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

async function updateIssue(
    updateIssueRequest: UpdateIssueRequest,
    electronApi: ElectronWindowInterface,
): Promise<boolean> {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.UpdateIssue,
        data: updateIssueRequest,
    });

    if (response.success) {
        console.log(response.data);
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

const cachedJiraDataKey = 'cached-jira-data';

function setCachedData(data: SearchRequest) {
    window.localStorage.setItem(cachedJiraDataKey, JSON.stringify(data));
}

function getCachedData(): undefined | SearchRequest {
    const cached = window.localStorage.getItem(cachedJiraDataKey);
    if (cached) {
        return JSON.parse(cached);
    } else {
        return undefined;
    }
}

function makeIssueTypesRequestData(props: typeof BasicJiraTest['init']['props']) {
    return {
        projectIdOrKey: props.projectIdOrKey,
        domain: props.domain,
        credentials: {
            apiKey: props.apiKey,
            username: props.username,
        },
    };
}

function makeJiraRequestData(props: typeof BasicJiraTest['init']['props']) {
    return {
        domain: props.domain,
        credentials: {
            apiKey: props.apiKey,
            username: props.username,
        },
    };
}

function makeSearchRequestData(props: typeof BasicJiraTest['init']['props']) {
    return {
        domain: props.domain,
        jql: props.jql,
        credentials: {
            apiKey: props.apiKey,
            username: props.username,
        },
    };
}

function makeUpdateRequestData(props: typeof BasicJiraTest['init']['props']) {
    return {
        domain: props.domain,
        issue: {
            key: props.ticketKey,
            fields: {
                summary: '[FIBTERO TEST] ' + props.updatedSummary,
                description: {
                    type: 'doc',
                    version: 1,
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: props.updatedDescriptionText,
                                },
                            ],
                        },
                    ],
                },
            },
            id: '',
            self: '',
        },
        credentials: {
            apiKey: props.apiKey,
            username: props.username,
        },
    };
}

function makeCreateRequestData(props: typeof BasicJiraTest['init']['props']) {
    return {
        domain: props.domain,
        fields: {
            project: {
                key: props.projectIdOrKey,
            },
            summary: '[FIBTERO TEST] ' + props.createdSummary,
            issuetype: {
                name: props.issueTypeIdOrName,
            },
        },
        credentials: {
            apiKey: props.apiKey,
            username: props.username,
        },
    };
}

async function submitForm(props: typeof BasicJiraTest['init']['props']) {
    if (props.electronApi) {
        const results = await search(makeSearchRequestData(props), props.electronApi);
        console.log('Search Results');
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
        ticketKey: '',
        updatedSummary: '',
        updatedDescriptionText: '',
        projectIdOrKey: '',
        issueTypeIdOrName: '',
        createdSummary: '',
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
        if (props.electronApi) {
            getFields(makeJiraRequestData(props), props.electronApi);
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
                        setCachedData(makeSearchRequestData(props));
                    })}
                    ${assign(FibInput.props.label, 'Jira Cloud domain')}
                    ${assign(FibInput.props.value, props.domain)}
                ></${FibInput}>
                <${FibInput}
                    ${listen(FibInput.events.valueChange, (event) => {
                        setProps({username: event.detail});
                        setCachedData(makeSearchRequestData(props));
                    })}
                    ${assign(FibInput.props.label, 'Jira username')}
                    ${assign(FibInput.props.value, props.username)}
                ></${FibInput}>
                <${FibInput}
                    ${listen(FibInput.events.valueChange, (event) => {
                        setProps({apiKey: event.detail});
                        setCachedData(makeSearchRequestData(props));
                    })}
                    ${assign(FibInput.props.label, 'Jira API key')}
                    ${assign(FibInput.props.value, props.apiKey)}
                    ${assign(FibInput.props.inputType, 'password')}
                ></${FibInput}>
                <${FibInput}
                    ${listen(FibInput.events.valueChange, (event) => {
                        setProps({jql: event.detail});
                        setCachedData(makeSearchRequestData(props));
                    })}
                    ${assign(FibInput.props.label, 'JQL query')}
                    ${assign(FibInput.props.value, props.jql)}
                ></${FibInput}>
                <br>
                <input class="submit" type="submit" value="Trigger Jira Query" />
            </form>
            <h2>
                Basic Update Issue Test
            </h2>
            <${FibInput}
                ${listen(FibInput.events.valueChange, (event) => {
                    setProps({ticketKey: event.detail});
                })}
                ${assign(FibInput.props.label, 'Ticket key')}
                ${assign(FibInput.props.value, props.ticketKey)}
            ></${FibInput}>
            <${FibInput}
                ${listen(FibInput.events.valueChange, (event) => {
                    setProps({updatedSummary: event.detail});
                })}
                ${assign(FibInput.props.label, 'Summary')}
                ${assign(FibInput.props.value, props.updatedSummary)}
            ></${FibInput}>
            <${FibInput}
                ${listen(FibInput.events.valueChange, (event) => {
                    setProps({updatedDescriptionText: event.detail});
                })}
                ${assign(FibInput.props.label, 'Description text')}
                ${assign(FibInput.props.value, props.updatedDescriptionText)}
            ></${FibInput}>
            <button
                ${listen('click', async () => {
                    if (props.electronApi) {
                        await updateIssue(makeUpdateRequestData(props), props.electronApi);
                    }
                })}
            >
                Run Test
            </button>
            <h2>
                Basic Create Issue Test
            </h2>
            <${FibInput}
                ${listen(FibInput.events.valueChange, (event) => {
                    setProps({projectIdOrKey: event.detail});
                })}
                ${assign(FibInput.props.label, 'Project id or key')}
                ${assign(FibInput.props.value, props.projectIdOrKey)}
            ></${FibInput}>
            <${FibInput}
                ${listen(FibInput.events.valueChange, (event) => {
                    setProps({issueTypeIdOrName: event.detail});
                })}
                ${assign(FibInput.props.label, 'Issue type id or name')}
                ${assign(FibInput.props.value, props.issueTypeIdOrName)}
            ></${FibInput}>
            <${FibInput}
                ${listen(FibInput.events.valueChange, (event) => {
                    setProps({createdSummary: event.detail});
                })}
                ${assign(FibInput.props.label, 'Summary')}
                ${assign(FibInput.props.value, props.createdSummary)}
            ></${FibInput}>
            <button
                ${listen('click', async () => {
                    if (props.electronApi) {
                        await createIssue(makeCreateRequestData(props), props.electronApi);
                    }
                })}
            >
                Run Test
            </button>
            <h2>
                Get Users
            </h2>
            <button
                ${listen('click', async () => {
                    if (props.electronApi) {
                        await getUsers(makeJiraRequestData(props), props.electronApi);
                    }
                })}
            >
                Run Test
            </button>
            <h2>
                Search Users
            </h2>
            <button
                ${listen('click', async () => {
                    if (props.electronApi) {
                        await searchUsers(makeSearchRequestData(props), props.electronApi);
                    }
                })}
            >
                Run Test
            </button>
            <h2>
                Basic Get Issue Types for Project Test
            </h2>
            <${FibInput}
                ${listen(FibInput.events.valueChange, (event) => {
                    setProps({projectIdOrKey: event.detail});
                })}
                ${assign(FibInput.props.label, 'Project id or key')}
                ${assign(FibInput.props.value, props.projectIdOrKey)}
            ></${FibInput}>
            <button
                ${listen('click', async () => {
                    if (props.electronApi) {
                        await getIssueTypes(makeIssueTypesRequestData(props), props.electronApi);
                    }
                })}
            >
                Run Test
            </button>
            <h2>
                Basic Get Projects Test
            </h2>
            <button
                ${listen('click', async () => {
                    if (props.electronApi) {
                        await getProjects(makeJiraRequestData(props), props.electronApi);
                    }
                })}
            >
                Run Test
            </button>
        `;
    },
});
