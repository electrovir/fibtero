import {JiraAuth, JiraIssue} from '@packages/common/src/data/jira-data';
import {JiraView} from '@packages/common/src/data/jira-view';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';

function generateViewKey(jiraView: JiraView) {
    const jiraViewCacheKey = 'jira-view-cache';

    return `${jiraViewCacheKey}-${jiraView.id}`;
}

function getStoredViewCache(jiraView: JiraView): JiraIssue[] | undefined {
    const viewId = jiraView.id;
    const stored = window.localStorage.getItem(generateViewKey(jiraView));
    if (stored) {
        try {
            const data = JSON.parse(stored);
            return data as JiraIssue[];
        } catch (error) {
            console.error(`Failed to parse stored view cache for ${viewId}: ${error}`);
            return undefined;
        }
    } else {
        return undefined;
    }
}

async function updateCache(
    jiraView: JiraView,
    electronApi: ElectronWindowInterface,
    jiraRequest: JiraAuth,
): Promise<JiraIssue[]> {
    try {
        const response = await electronApi.apiRequest({
            type: ApiRequestType.JqlSearch,
            data: {
                ...jiraRequest,
                jql: jiraView.allIssuesJql,
            },
        });

        if (response.success) {
            const issues = response.data.sort((a, b) => a.id.localeCompare(b.id));

            window.localStorage.setItem(generateViewKey(jiraView), JSON.stringify(issues));

            return issues;
        } else {
            throw new Error(`Failed to update cached: ${response.error}`);
        }
    } catch (error) {
        throw new Error(`Failed to fetch to update cached: ${error}`);
    }
}

export async function getMaybeCachedView(
    jiraView: JiraView,
    electronApi: ElectronWindowInterface,
    jiraRequest: JiraAuth,
    // this is called when the cache is updated in case it's out of date
    cacheUpdateCallback: (issues: JiraIssue[]) => void,
): Promise<JiraIssue[]> {
    const cached = getStoredViewCache(jiraView);

    if (cached) {
        // don't await this so that it'll update in the background
        updateCache(jiraView, electronApi, jiraRequest).then((newIssues) => {
            cacheUpdateCallback(newIssues);
        });
        return cached;
    } else {
        return await updateCache(jiraView, electronApi, jiraRequest);
    }
}
