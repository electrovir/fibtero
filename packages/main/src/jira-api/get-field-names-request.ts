import {JiraAuth, JiraCustomFieldDefinitions} from '@packages/common/src/data/jira-data';
import {get} from '../axios-wrapper';
import {apiRoute} from './jira-routing';

export async function getCustomFieldNames(request: JiraAuth): Promise<JiraCustomFieldDefinitions> {
    const url = `https://${request.domain}${apiRoute}field`;

    const result = (
        await get(url, {
            auth: {
                password: request.credentials.apiKey,
                username: request.credentials.username,
            },
        })
    ).data as {
        // other fields are present but this is sufficient
        id: string;
        key: string;
        name: string;
    }[];

    const mapping = result.reduce((map, entry) => {
        if (entry.key.startsWith('customfield')) {
            map[entry.key] = entry.name;
        }
        return map;
    }, {} as JiraCustomFieldDefinitions);
    return mapping;
}
