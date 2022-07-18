import {CreateIssueRequest, JiraIssueResponse} from '@packages/common/src/data/jira-data';
import {post} from '../axios-wrapper';
import {apiRoute} from './shared';

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
