import {JiraJqlResponse, JiraRequest} from '@packages/common/src/data/jira-data';
import { stringify } from 'querystring';
import {makeRequest} from '../axios-wrapper';

export async function search(request: JiraRequest): Promise<JiraJqlResponse> {
    if (request.jql) {
        const exampleUrl = `https://${request.domain}/rest/api/3/search?jql=${request.jql}`;

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
    const exampleUrl = `https://${request.domain}/rest/api/3/field`;

    const result = await makeRequest(exampleUrl, {
        auth: {
            password: request.credentials.apiKey,
            username: request.credentials.username,
        },
    });
    const mapping = result.data.reduce((map: { [x: string]: any; }, field: { key: string | number; name: any; }) => {
        if((typeof(field.key) == 'string') && (typeof(field.name) == 'string')){
            map[field.key] = field.name;
        }
        return map;
    });
    return mapping;
}
