import {JiraAuth, JiraSimplifiedField} from '@packages/common/src/data/jira-data';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {CacheUpdateCallback, getMaybeCached} from './generic-cache-helpers';

export async function getMaybeCachedFields(
    electronApi: ElectronWindowInterface,
    jiraAuth: JiraAuth,
    // this is called when the cache is updated in case it's out of date
    cacheUpdateCallback: (fields: JiraSimplifiedField[]) => void,
): Promise<JiraSimplifiedField[]> {
    return getMaybeCached({
        cacheKey: `jira-fields`,
        cacheUpdateCallback: cacheUpdateCallback as CacheUpdateCallback,
        electronApi,
        jiraAuth,
        makeRequestCallback: async () => {
            const response = await electronApi.apiRequest({
                type: ApiRequestType.GetFields,
                data: jiraAuth,
            });

            return response;
        },
    });
}
