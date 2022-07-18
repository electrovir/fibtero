import {
    CreateIssueRequest,
    JiraIssueResponse,
    JiraJqlResponse,
    JiraRequest,
    SearchRequest,
    UpdateIssueRequest,
} from '@packages/common/src/data/jira-data';
import {get, post, put} from '../axios-wrapper';

const apiRoute = '/rest/api/3/';
const customFieldKey = 'customfield';

export async function createIssue(request: CreateIssueRequest): Promise<JiraIssueResponse> {
    const url = `https://${request.domain}${apiRoute}issue`;

    const result = await post(
        url,
        {
            fields: request.fields,
        },
        {
            auth: {
                password: request.credentials.apiKey,
                username: request.credentials.username,
            },
        },
    );

    return result.data;
}

export async function getField(request: JiraRequest): Promise<Map<string, string>> {
    const url = `https://${request.domain}${apiRoute}field`;

    const result = await get(url, {
        auth: {
            password: request.credentials.apiKey,
            username: request.credentials.username,
        },
    });

    const mapping = result.data.reduce(
        (map: {[x: string]: any}, field: {key: string | number; name: any}) => {
            if (isCustomFieldKey(field.key) && typeof field.name == 'string') {
                map[field.key] = field.name;
            }
            return map;
        },
    );
    return mapping;
}

function isCustomFieldKey(key: any) {
    return typeof key === 'string' && key.includes(customFieldKey);
}

export async function search(request: SearchRequest): Promise<JiraJqlResponse> {
    if (request.jql) {
        const url = `https://${request.domain}${apiRoute}search?jql=${request.jql}`;

        const result = await get(url, {
            auth: {
                password: request.credentials.apiKey,
                username: request.credentials.username,
            },
        });
        return result.data;
    } else {
        throw new Error(`jql is required, other requests are not supported at this time.`);
    }
}

export async function updateIssue(request: UpdateIssueRequest): Promise<boolean> {
    const url = `https://${request.domain}${apiRoute}issue/${request.issue.key}`;

    const result = await put(
        url,
        {
            fields: request.issue.fields,
        },
        {
            auth: {
                password: request.credentials.apiKey,
                username: request.credentials.username,
            },
        },
    );

    return result.status === 204;
}
