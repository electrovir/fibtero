import {UpdateIssueLabelsRequest, UpdateIssueRequest} from '@packages/common/src/data/jira-data';
import {put} from '../axios-wrapper';
import {apiRoute} from './jira-routing';

export async function updateIssueLabels(request: UpdateIssueLabelsRequest): Promise<boolean> {
    const url = `https://${request.domain}${apiRoute}issue/${request.issueKey}`;

    const formattedLabels = formatLabels(request.labelsToAdd, request.labelsToRemove);

    const result = await put(
        url,
        {
            update: {
                labels: formattedLabels,
            },
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

type FormattedLabel = {
    add?: string;
    remove?: string;
};

function formatLabels(labelsToAdd: string[], labelsToRemove: string[]) {
    return formatLabelsToAdd(labelsToAdd).concat(formatLabelsToRemove(labelsToRemove));
}

function formatLabelsToAdd(labels: string[]) {
    let results: FormattedLabel[] = [];
    labels.forEach((label) => {
        results.push({add: label});
    });
    return results;
}

function formatLabelsToRemove(labels: string[]) {
    let results: FormattedLabel[] = [];
    labels.forEach((label) => {
        results.push({remove: label});
    });
    return results;
}

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
