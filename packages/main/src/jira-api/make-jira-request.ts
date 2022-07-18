import {
    JiraJqlResponse,
    JiraRequest,
    SearchRequest,
    UpdateRequest,
} from '@packages/common/src/data/jira-data';
import {makeRequest} from '../axios-wrapper';

const apiRoute = '/rest/api/3/';

export async function search(request: SearchRequest): Promise<JiraJqlResponse> {
    if (request.jql) {
        const exampleUrl = `https://${request.domain}${apiRoute}search?jql=${request.jql}`;

        const result = await makeRequest(exampleUrl, {
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

export async function getField(request: JiraRequest): Promise<Map<string, string>> {
    const exampleUrl = `https://${request.domain}${apiRoute}field`;

    const result = await makeRequest(exampleUrl, {
        auth: {
            password: request.credentials.apiKey,
            username: request.credentials.username,
        },
    });
    const mapping = result.data.reduce(
        (map: {[x: string]: any}, field: {key: string | number; name: any}) => {
            if (typeof field.key == 'string' && typeof field.name == 'string') {
                map[field.key] = field.name;
            }
            return map;
        },
    );
    return mapping;
}

export async function update(request: UpdateRequest): Promise<boolean> {
    const exampleUrl = `https://${request.domain}${apiRoute}issue/${request.issue.key}`;

    const result = await makeRequest(exampleUrl, {
        auth: {
            password: request.credentials.apiKey,
            username: request.credentials.username,
        },
        data: {
            fields: request.issue.fields,
        },
    });

    console.log(result);
    return true;
}
