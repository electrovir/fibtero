import {JiraProjectsResponse, JiraRequest} from '@packages/common/src/data/jira-data';
import {get} from '../axios-wrapper';
import {apiRoute} from './shared';

export async function getProjects(request: JiraRequest): Promise<JiraProjectsResponse> {
    const url = `https://${request.domain}${apiRoute}project`;

    const result = await get(url, {
        auth: {
            password: request.credentials.apiKey,
            username: request.credentials.username,
        },
    });

    return result.data;
}
