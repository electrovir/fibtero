import {JiraAuth, JiraIssue} from '@packages/common/src/data/jira-data';
import {JiraView} from '@packages/common/src/data/jira-view';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {CacheUpdateCallback, getMaybeCached} from './generic-cache-helpers';

function generateViewKey(jiraView: JiraView) {
    const jiraViewCacheKey = 'jira-view-cache';

    return `${jiraViewCacheKey}-${jiraView.id}`;
}

export async function getMaybeCachedView(
    jiraView: JiraView,
    electronApi: ElectronWindowInterface,
    jiraAuth: JiraAuth,
    // this is called when the cache is updated in case it's out of date
    cacheUpdateCallback: (issues: JiraIssue[]) => void,
): Promise<JiraIssue[]> {
    return getMaybeCached({
        cacheKey: generateViewKey(jiraView),
        cacheUpdateCallback: cacheUpdateCallback as CacheUpdateCallback,
        electronApi,
        jiraAuth,
        makeRequestCallback: async () => {
            const response = await electronApi.apiRequest({
                type: ApiRequestType.JqlSearch,
                data: {
                    ...jiraAuth,
                    jql: jiraView.allIssuesJql,
                },
            });

            return response;
        },
    });
}
