import {JiraJqlResponse, JiraRequest, SearchRequest} from '@packages/common/src/data/jira-data';
import {get} from '../axios-wrapper';

const apiRoute = '/rest/api/3/';

export async function getUser(request: JiraRequest): Promise<JiraJqlResponse> {
    const url = `https://${request.domain}${apiRoute}users`;

    const result = await get(url, {
        auth: {
            password: request.credentials.apiKey,
            username: request.credentials.username,
        },
    });
    console.log(result);
    return result.data;
}

export async function searchUser(request: SearchRequest): Promise<JiraJqlResponse> {
    if (request.jql) {
        const url = `https://${request.domain}${apiRoute}user/picker?query=${request.jql}`;
        console.log(url);
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
