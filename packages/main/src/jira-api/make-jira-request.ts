import {JiraJqlResponse, JiraRequest} from '@packages/common/src/data/jira-data';
import {makeRequest} from '../axios-wrapper';

export async function makeJiraRequest(request: JiraRequest): Promise<JiraJqlResponse> {
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
