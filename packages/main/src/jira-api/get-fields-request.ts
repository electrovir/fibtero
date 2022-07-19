import {JiraAuth} from '@packages/common/src/data/jira-data';
import {JiraSimplifiedField} from '../../../common/src/data/jira-data';
import {get} from '../axios-wrapper';
import {apiRoute} from './jira-routing';

export async function getFields(request: JiraAuth): Promise<JiraSimplifiedField[]> {
    const url = `https://${request.domain}${apiRoute}field`;

    return (
        await get(url, {
            auth: {
                password: request.credentials.apiKey,
                username: request.credentials.username,
            },
        })
    ).data as JiraSimplifiedField[];
}
