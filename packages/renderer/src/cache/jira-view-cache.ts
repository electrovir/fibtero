import {
    FullJiraIssue,
    JiraAuth,
    JiraCustomFieldDefinitions,
    JiraIssueFields,
} from '@packages/common/src/data/jira-data';
import {JiraView} from '@packages/common/src/data/jira-view/jira-view';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {getMaybeCached, updateCacheValue} from './generic-cache-helpers';
import {getMaybeCachedFields} from './jira-fields-cache';

function generateViewKey(jiraView: JiraView) {
    const jiraViewCacheKey = 'jira-view-cache';

    return `${jiraViewCacheKey}-${jiraView.id}`;
}

function combineCustomFieldsAndIssues(
    customFields: JiraCustomFieldDefinitions,
    issues: Readonly<Readonly<FullJiraIssue>[]>,
): Readonly<Readonly<FullJiraIssue>[]> {
    return issues.map((issue) => {
        const fields: JiraIssueFields = Object.keys(issue.fields ?? {}).reduce(
            (accum, fieldKey) => {
                const customFieldName = customFields[fieldKey];
                const fieldValue = issue.fields?.[fieldKey];

                if (customFieldName) {
                    accum[customFieldName] = fieldValue;
                } else {
                    accum[fieldKey] = fieldValue;
                }
                return accum;
            },
            {} as JiraIssueFields,
        );

        return {
            ...issue,
            fields,
        };
    });
}

export function updateCache(jiraView: JiraView, issues: FullJiraIssue[]) {
    console.log({cacheValuesToUpdate: issues});
    updateCacheValue(generateViewKey(jiraView), JSON.stringify(issues));
}

export async function getMaybeCachedView(
    jiraView: JiraView,
    electronApi: ElectronWindowInterface,
    jiraAuth: JiraAuth,
    // this is called when the cache is updated in case it's out of date
    cacheUpdateCallback: (issues: Readonly<Readonly<FullJiraIssue>[]>) => void,
): Promise<Readonly<Readonly<FullJiraIssue>[]>> {
    let issues: FullJiraIssue[] = [];
    let fields: JiraCustomFieldDefinitions = {};
    const updated: string[] = [];

    function triggerUpdateCallbackMaybe(newlyUpdated: string) {
        updated.push(newlyUpdated);
        if (updated.length === 2) {
            const combined = combineCustomFieldsAndIssues(fields, issues);
            console.log({updatedCombined: combined});
            cacheUpdateCallback(combined);
        }
    }

    const cachedSimplifiedFields = await getMaybeCachedFields(electronApi, jiraAuth, () => {
        triggerUpdateCallbackMaybe('fields');
    });

    fields = cachedSimplifiedFields.reduce((map, entry) => {
        if (entry.key.startsWith('customfield')) {
            map[entry.key] = entry.name;
        }
        return map;
    }, {} as JiraCustomFieldDefinitions);

    issues = await getMaybeCached({
        cacheKey: generateViewKey(jiraView),
        cacheUpdateCallback: async (newIssues) => {
            issues = await Promise.all(
                (newIssues as FullJiraIssue[]).map(async (newIssue) => {
                    const response = await electronApi.apiRequest({
                        type: ApiRequestType.JiraRestApiCall,
                        data: {
                            ...jiraAuth,
                            relativeUrl: `issue/${newIssue.id}`,
                        },
                    });
                    return response.data as FullJiraIssue;
                }),
            );
            triggerUpdateCallbackMaybe('issues');
        },
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

    const combined = combineCustomFieldsAndIssues(fields, issues);

    console.log({cachedCombined: combined});
    return combined;
}
