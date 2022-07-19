import {matchesShallowObjectSignature} from './object-validator';

export type JiraCredentials = {
    username: string;
    apiKey: string;
};

export type JiraUser = any;

export type JiraAuth = {
    domain: string;
    credentials: JiraCredentials;
};

export type CreateIssueRequest = JiraAuth & {
    fields: JiraIssueFields;
};

export type IssueTypesRequest = JiraAuth & {
    projectIdOrKey: string;
};

export type JiraJqlSearchRequest = JiraAuth & {
    jql: string;
};

export type JiraSearchIssuesByLabelRequest = JiraAuth & {
    project: string;
    label: string;
};

export type UpdateIssueRequest = JiraAuth & {
    issue: JiraIssue;
};

export type UpdateIssueLabelsRequest = JiraAuth & {
    issueKey: string;
    labelsToAdd: string[];
    labelsToRemove: string[];
};

const jiraRequestValidationChecker: JiraAuth = {
    domain: '',
    credentials: {
        apiKey: '',
        username: '',
    },
};

export function jiraRequestValidator(request: unknown): request is JiraAuth {
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

export function issueTypeRequestValidator(request: unknown): request is IssueTypesRequest {
    return true;
}

const searchRequestValidationChecker: JiraJqlSearchRequest = {
    jql: '',
    domain: '',
    credentials: {
        apiKey: '',
        username: '',
    },
};

const searchByLabelValidationChecker: JiraSearchIssuesByLabelRequest = {
    project: '',
    label: '',
    domain: '',
    credentials: {
        apiKey: '',
        username: '',
    },
};

export function searchRequestValidator(request: unknown): request is JiraJqlSearchRequest {
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

export function searchByLabelRequestValidator(request: unknown): request is JiraSearchIssuesByLabelRequest {
    return (
        matchesShallowObjectSignature(request, searchByLabelValidationChecker) &&
        matchesShallowObjectSignature(
            request.credentials,
            searchRequestValidationChecker.credentials,
        ) &&
        !!request.credentials.apiKey &&
        !!request.credentials.username &&
        !!request.domain &&
        !!request.project &&
        !!request.label
    );
}

export function updateIssueRequestValidator(request: unknown): request is UpdateIssueRequest {
    return true;
}

export function updateIssueLabelsRequestValidator(
    request: unknown,
): request is UpdateIssueLabelsRequest {
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
    assignee?: JiraUser;
    creator?: unknown;
    description?: JiraDescription;
    issuetype?: JiraIssueType;
    parent?: unknown;
    priority?: unknown;
    project?: JiraProject;
    reporter?: JiraUser;
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

export type JiraIssueTypesResponse = {
    issueTypes: JiraIssueType[];
};

export type JiraProjectsResponse = {
    projects: JiraProject[];
};

export type JiraIssueResponse = JiraIssue;

export function jiraIssueTypesResponseValidator(
    response: unknown,
): response is JiraIssueTypesResponse {
    // just pass on whatever Jira gives us
    return true;
}

export function jiraIssueResponseValidator(response: unknown): response is JiraIssueResponse {
    // just pass on whatever Jira gives us
    return true;
}

export function jiraProjectsResponseValidator(response: unknown): response is JiraProjectsResponse {
    // just pass on whatever Jira gives us
    return true;
}
