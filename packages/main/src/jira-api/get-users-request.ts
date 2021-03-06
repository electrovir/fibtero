import {JiraAuth, JiraJqlSearchRequest, JiraUser} from '@packages/common/src/data/jira-data';
import {get} from '../axios-wrapper';
import {apiRoute} from './jira-routing';

export async function getUsers(request: JiraAuth): Promise<JiraUser[]> {
    const url = `https://${request.domain}${apiRoute}users`;

    const result = await get(url, {
        auth: {
            password: request.credentials.apiKey,
            username: request.credentials.username,
        },
    });

    return result.data;
}

export async function searchUsers(request: JiraJqlSearchRequest): Promise<JiraUser[]> {
    if (request.jql) {
        const url = `https://${request.domain}${apiRoute}user/picker?query=${request.jql}`;

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
