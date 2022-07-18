import {JiraJqlResponse, SearchRequest} from '@packages/common/src/data/jira-data';
import {get} from '../axios-wrapper';
import {apiRoute} from './shared';

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
