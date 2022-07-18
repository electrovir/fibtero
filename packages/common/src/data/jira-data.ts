import {matchesShallowObjectSignature} from './object-validator';

export type JiraCredentials = {
    username: string;
    apiKey: string;
};

export type JiraRequest = {
    domain: string;
    credentials: JiraCredentials;
};

export type CreateIssueRequest = {
    fields: JiraIssueFields;
} & JiraRequest;

export type SearchRequest = {
    jql: string;
} & JiraRequest;

export type UpdateIssueRequest = {
    issue: JiraIssue;
} & JiraRequest;

const jiraRequestValidationChecker: JiraRequest = {
    domain: '',
    credentials: {
        apiKey: '',
        username: '',
    },
};

export function jiraRequestValidator(request: unknown): request is JiraRequest {
    return (
        matchesShallowObjectSignature(request, jiraRequestValidationChecker) &&
        matchesShallowObjectSignature(
            request.credentials,
            jiraRequestValidationChecker.credentials,
        ) &&
        !!request.credentials.apiKey &&
        !!request.credentials.username &&
        !!request.domain
    );
}

export function createIssueRequestValidator(request: unknown): request is CreateIssueRequest {
    return true;
}

const searchRequestValidationChecker: SearchRequest = {
    jql: '',
    domain: '',
    credentials: {
        apiKey: '',
        username: '',
    },
};

export function searchRequestValidator(request: unknown): request is SearchRequest {
    return (
        matchesShallowObjectSignature(request, searchRequestValidationChecker) &&
        matchesShallowObjectSignature(
            request.credentials,
            searchRequestValidationChecker.credentials,
        ) &&
        !!request.credentials.apiKey &&
        !!request.credentials.username &&
        !!request.domain &&
        !!request.jql
    );
}

export function updateIssueRequestValidator(request: unknown): request is UpdateIssueRequest {
    return true;
}

export type JiraDocument = {
    type: string;
    version?: number;
    content?: JiraDocument[];
    text?: string;
};

export type JiraDescription = JiraDocument;

export type JiraProject = {
    id?: string;
    key?: string;
    name?: string;
};

export type JiraIssueType = {
    name?: string;
    id?: string;
};

export type JiraIssueFields = Record<string, unknown> & {
    assignee?: unknown;
    creator?: unknown;
    description?: JiraDescription;
    issuetype?: JiraIssueType;
    parent?: unknown;
    priority?: unknown;
    project?: JiraProject;
    reporter?: unknown;
    status?: unknown;
    summary?: unknown;
    watches?: unknown;
};

export type JiraIssue = {
    /** Jira key. Like "THING-1234" */
    key: string;
    fields?: JiraIssueFields;
    id: string;
    /** URL to request just this issue from the API */
    self: string;
};

export type JiraIssueResponse = JiraIssue;

export type JiraJqlResponse = {
    expand: string;
    issues: JiraIssue[];
    maxResults: number;
    startAt: number;
    total: number;
};

export function jiraIssueResponseValidator(response: unknown): response is JiraIssueResponse {
    // just pass on whatever Jira gives us
    return true;
}

export function jiraJqlResponseValidator(response: unknown): response is JiraJqlResponse {
    // just pass on whatever Jira gives us
    return true;
}
