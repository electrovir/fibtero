import {JiraRestApiCallRequest} from '@packages/common/src/data/jira-data';
import {get} from '../axios-wrapper';
import {apiRoute} from './jira-routing';

export async function makeJiraRestApi(request: JiraRestApiCallRequest) {
    const url = `https://${request.domain}${apiRoute}${request.relativeUrl}`;

    const result = await get(url, {
        auth: {
            password: request.credentials.apiKey,
            username: request.credentials.username,
        },
    });

    return result.data;
}
