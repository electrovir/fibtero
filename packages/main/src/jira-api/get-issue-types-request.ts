import {IssueTypesRequest, JiraIssueTypesResponse} from '@packages/common/src/data/jira-data';
import {get} from '../axios-wrapper';
import {apiRoute} from './jira-routing';

export async function getIssueTypes(request: IssueTypesRequest): Promise<JiraIssueTypesResponse> {
    const url = `https://${request.domain}${apiRoute}project/${request.projectIdOrKey}`;

    const result = await get(url, {
        auth: {
            password: request.credentials.apiKey,
            username: request.credentials.username,
        },
    });

    return result.data.issueTypes;
}
