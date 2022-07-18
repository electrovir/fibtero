import {matchesShallowObjectSignature} from './object-validator';

export type JiraCredentials = {
    username: string;
    apiKey: string;
};

export type JiraRequest = {
    jql: string;
    domain: string;
    credentials: JiraCredentials;
};

const requestValidationChecker: JiraRequest = {
    jql: '',
    domain: '',
    credentials: {
        apiKey: '',
        username: '',
    },
};

export function jiraRequestValidator(request: unknown): request is JiraRequest {
    return (
        matchesShallowObjectSignature(request, requestValidationChecker) &&
        matchesShallowObjectSignature(request.credentials, requestValidationChecker.credentials) &&
        !!request.credentials.apiKey &&
        !!request.credentials.username &&
        !!request.domain
    );
}

export type JiraIssueFields = Record<string, unknown> & {
    status: unknown;
    parent: unknown;
    priority: unknown;
    project: unknown;
    reporter: unknown;
    watches: unknown;
    creator: unknown;
    assignee: unknown;
};

export type JiraIssue = {
    /** Jira key. Like "THING-1234" */
    key: string;
    fields: JiraIssueFields;
    id: string;
    /** URL to request just this issue from the API */
    self: string;
};

export type JiraJqlResponse = {
    expand: string;
    issues: JiraIssue[];
    maxResults: number;
    startAt: number;
    total: number;
};

export function jiraResponseValidator(response: unknown): response is JiraJqlResponse {
    // just pass on whatever Jira gives us
    return true;
}
