import {Overwrite} from 'augment-vir';
import {matchesShallowObjectSignature} from './object-validator';

export type JiraCredentials = {
    username: string;
    apiKey: string;
};

export type JiraUser = {
    accountId: string;
    accountType: string;
    active: boolean;
    avatarUrls: {
        '16x16': string;
        '24x24': string;
        '32x32': string;
        '48x48': string;
    };
    displayName: string;
    emailAddress: string;
    self: string;
    timeZone: string;
};

// this isn't an exhaustive type but it's simple enough for our purposes
// the actual data includes other types that we don't understand or need
export type JiraCustomFieldDefinitions = Record<string, string>;

export type JiraAuth = {
    domain: string;
    credentials: JiraCredentials;
};

export type CreateIssueRequest = JiraAuth & {
    fields: Overwrite<
        JiraIssueFields,
        {
            issuetype: {name: string};
            assignee: {id: string};
        }
    >;
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
    issue: Overwrite<JiraIssue, {fields: Overwrite<JiraIssueFields, {assignee: {id: string}}>}>;
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

export function searchByLabelRequestValidator(
    request: unknown,
): request is JiraSearchIssuesByLabelRequest {
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
    name: string;
    id: string;
    iconUrl: string;
    self: string;
};

export type JiraPriority = JiraIssueType;

export type JiraIssueFields = Record<string, unknown> & {
    assignee?: JiraUser;
    creator?: unknown;
    description?: JiraDescription;
    issuetype?: JiraIssueType;
    parent?: unknown;
    priority?: JiraPriority;
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
