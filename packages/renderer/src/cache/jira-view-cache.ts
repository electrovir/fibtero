import {
    JiraAuth,
    JiraCustomFieldDefinitions,
    JiraIssue,
    JiraIssueFields,
} from '@packages/common/src/data/jira-data';
import {JiraView} from '@packages/common/src/data/jira-view';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';
import {getMaybeCached} from './generic-cache-helpers';
import {getMaybeCachedFields} from './jira-fields-cache';

function generateViewKey(jiraView: JiraView) {
    const jiraViewCacheKey = 'jira-view-cache';

    return `${jiraViewCacheKey}-${jiraView.id}`;
}

function combineCustomFieldsAndIssues(
    customFields: JiraCustomFieldDefinitions,
    issues: Readonly<Readonly<JiraIssue>[]>,
): Readonly<Readonly<JiraIssue>[]> {
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

export async function getMaybeCachedView(
    jiraView: JiraView,
    electronApi: ElectronWindowInterface,
    jiraAuth: JiraAuth,
    // this is called when the cache is updated in case it's out of date
    cacheUpdateCallback: (issues: Readonly<Readonly<JiraIssue>[]>) => void,
): Promise<Readonly<Readonly<JiraIssue>[]>> {
    let issues: JiraIssue[] = [];
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

    fields = await getMaybeCachedFields(electronApi, jiraAuth, (newFields) => {
        fields = newFields;
        triggerUpdateCallbackMaybe('fields');
    });

    issues = await getMaybeCached({
        cacheKey: generateViewKey(jiraView),
        cacheUpdateCallback: (newIssues) => {
            issues = newIssues as JiraIssue[];
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
