import {UpdateIssueRequest} from '@packages/common/src/data/jira-data';
import {put} from '../axios-wrapper';
import {apiRoute} from './shared';

export async function updateIssue(request: UpdateIssueRequest): Promise<boolean> {
    const url = `https://${request.domain}${apiRoute}issue/${request.issue.key}`;

    const result = await put(
        url,
        {
            fields: request.issue.fields,
        },
        {
            auth: {
                password: request.credentials.apiKey,
                username: request.credentials.username,
            },
        },
    );

    return result.status === 204;
}
