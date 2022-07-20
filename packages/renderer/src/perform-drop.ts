import {FullJiraIssue, JiraAuth, UpdateIssueRequest} from '@packages/common/src/data/jira-data';
import {
    createFieldValue,
    getFieldValue,
    JiraViewSection,
} from '@packages/common/src/data/jira-view/jira-view';
import {
    IssueDragging,
    IssueDragOperation,
} from '@packages/common/src/data/jira-view/view-issue-dragging';
import {ApiRequestType} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';

async function updateIssue(
    updateIssueRequest: UpdateIssueRequest,
    electronApi: ElectronWindowInterface,
): Promise<boolean> {
    const response = await electronApi.apiRequest({
        type: ApiRequestType.UpdateIssue,
        data: updateIssueRequest,
    });

    if (response.success) {
        console.log(response.data);
        return response.data;
    } else {
        throw new Error(`Jira request failed: ${response.error}`);
    }
}

export async function performDrop(
    originalIssue: FullJiraIssue,
    fromSection: JiraViewSection | undefined,
    toSection: JiraViewSection,
    fromSectionName: string,
    toSectionName: string,
    electronApi: ElectronWindowInterface,
    jiraAuth: JiraAuth,
    updateDomCallback: () => void,
) {
    // make sure we have a fully updated issue before performing operations on it
    const issue: FullJiraIssue = (
        await electronApi.apiRequest({
            type: ApiRequestType.JiraRestApiCall,
            data: {
                ...jiraAuth,
                relativeUrl: `issue/${originalIssue.key}`,
            },
        })
    ).data as FullJiraIssue;
    let changes: any = {};
    if (fromSection) {
        fromSection.dragOut.forEach((dragOut) => {
            changes = {
                ...changes,
                ...performOperation(originalIssue, dragOut, issue, fromSectionName),
            };
        });
    }
    toSection.dragIn.forEach((dragIn) => {
        changes = {...changes, ...performOperation(originalIssue, dragIn, issue, toSectionName)};
    });
    updateDomCallback();

    const dropResult = await updateIssue(
        {
            ...jiraAuth,
            issue: changes,
        },
        electronApi,
    );
    console.log({dropResult});
}

function performOperation(
    originalIssue: FullJiraIssue,
    dragging: IssueDragging,
    issue: FullJiraIssue,
    sectionName: string,
) {
    let somethingChanged = false;

    const currentValue = getFieldValue(issue, dragging.fieldName);
    const valueToAdd = dragging.value.replace(/\$\{value\}/g, sectionName);
    let newValue;
    if (Array.isArray(currentValue)) {
        switch (dragging.operation) {
            case IssueDragOperation.Add: {
                if (!currentValue.includes(valueToAdd)) {
                    newValue = currentValue.concat(valueToAdd);
                    somethingChanged = true;
                }
                break;
            }
            case IssueDragOperation.Remove: {
                if (currentValue.includes(valueToAdd)) {
                    newValue = currentValue.filter(
                        (item) =>
                            item !== valueToAdd && item.toLowerCase() !== valueToAdd.toLowerCase(),
                    );
                    somethingChanged = true;
                }
                break;
            }
            case IssueDragOperation.Set: {
                if (currentValue.length !== 1 || currentValue[0] !== valueToAdd) {
                    newValue = [valueToAdd];
                    somethingChanged = true;
                }
                break;
            }
        }
    } else if (typeof currentValue === 'string') {
        switch (dragging.operation) {
            case IssueDragOperation.Add: {
                if (!currentValue.includes(valueToAdd)) {
                    newValue = currentValue.concat(valueToAdd);
                    somethingChanged = true;
                }
                break;
            }
            case IssueDragOperation.Remove: {
                if (currentValue.includes(valueToAdd)) {
                    newValue = currentValue
                        .replace(valueToAdd, '')
                        .replace(valueToAdd.toLowerCase(), '');
                    somethingChanged = true;
                }
                break;
            }
            case IssueDragOperation.Set: {
                if (currentValue !== valueToAdd) {
                    newValue = valueToAdd;
                    somethingChanged = true;
                }
                break;
            }
        }
    }

    if (somethingChanged) {
        const newFields = createFieldValue(issue, newValue, dragging.fieldName);

        const changes = {id: issue.id, key: issue.key, fields: newFields};
        // mutate the issue for the next call
        issue.fields = {...issue.fields, ...newFields};
        originalIssue.fields = issue.fields;

        return changes;
    }
    return {};
}
