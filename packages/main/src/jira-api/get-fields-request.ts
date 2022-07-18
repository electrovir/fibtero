import {JiraRequest} from '@packages/common/src/data/jira-data';
import {get} from '../axios-wrapper';
import {apiRoute} from './shared';

const customFieldKey = 'customfield';

export async function getFields(request: JiraRequest): Promise<Map<string, string>> {
    const url = `https://${request.domain}${apiRoute}field`;

    const result = await get(url, {
        auth: {
            password: request.credentials.apiKey,
            username: request.credentials.username,
        },
    });

    const mapping = result.data.reduce(
        (map: {[x: string]: any}, field: {key: string | number; name: any}) => {
            if (isCustomFieldKey(field.key) && typeof field.name == 'string') {
                map[field.key] = field.name;
            }
            return map;
        },
    );
    return mapping;
}

function isCustomFieldKey(key: any) {
    return typeof key === 'string' && key.includes(customFieldKey);
}
