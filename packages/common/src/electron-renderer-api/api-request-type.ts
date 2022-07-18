import {OpenDialogProperty} from '@packages/common/src/electron-renderer-api/electron-types';
import {
    CreateIssueRequest,
    createIssueRequestValidator,
    issueTypeRequestValidator,
    IssueTypesRequest,
    JiraIssueResponse,
    jiraIssueResponseValidator,
    JiraIssueTypesResponse,
    jiraIssueTypesResponseValidator,
    JiraJqlResponse,
    jiraJqlResponseValidator,
    JiraProjectsResponse,
    jiraProjectsResponseValidator,
    JiraRequest,
    jiraRequestValidator,
    SearchRequest,
    searchRequestValidator,
    UpdateIssueRequest,
    updateIssueRequestValidator,
} from '../data/jira-data';
import {isValidUserPreferences, UserPreferences} from '../data/user-preferences';
import {
    createAllowUndefinedValidator,
    createArrayValidator,
    createEnumValidator,
    createMapValidator,
    typeofValidators,
} from './api-validation';
import {GetPathType} from './get-path-type';
import {ResetType} from './reset';

export const apiRequestKey = 'api-request-key' as const;

export enum ApiRequestType {
    /** Get the current user preferences saved on disk. */
    GetPreferences = 'get-preferences',
    /** Overwrite user preferences */
    SavePreferences = 'save-preferences',
    /** Trigger a native file selection popup. */
    SelectFiles = 'select-files',
    /** Get the path to the config directory. */
    GetConfigPath = 'get-config-path',
    /** Open a given file path in the system's default file browser. */
    ViewFilePath = 'view-file-path',
    ResetConfig = 'reset-config',
    CreateIssue = 'jira-create-issue',
    GetFields = 'jira-get-fields',
    GetIssueTypes = 'jira-get-issue-types',
    GetProjects = 'jira-get-projects',
    Search = 'jira-search',
    UpdateIssue = 'jira-update-issue',
    GetUser = 'jira-get-user',
    SearchUser = 'jira-search-user',
}

export type ApiRequestData = {
    [ApiRequestType.GetPreferences]: undefined;
    [ApiRequestType.SavePreferences]: UserPreferences;
    [ApiRequestType.SelectFiles]: OpenDialogProperty[] | undefined;
    [ApiRequestType.GetConfigPath]: GetPathType;
    [ApiRequestType.ViewFilePath]: string;
    [ApiRequestType.ResetConfig]: ResetType;
    [ApiRequestType.CreateIssue]: CreateIssueRequest;
    [ApiRequestType.GetFields]: JiraRequest;
    [ApiRequestType.GetIssueTypes]: IssueTypesRequest;
    [ApiRequestType.GetProjects]: JiraRequest;
    [ApiRequestType.Search]: SearchRequest;
    [ApiRequestType.UpdateIssue]: UpdateIssueRequest;
    [ApiRequestType.GetUser]: JiraRequest;
    [ApiRequestType.SearchUser]: SearchRequest;
};

export type ApiResponseData = {
    [ApiRequestType.GetPreferences]: UserPreferences | undefined;
    [ApiRequestType.SavePreferences]: boolean;
    [ApiRequestType.SelectFiles]: string[] | undefined;
    [ApiRequestType.GetConfigPath]: string;
    [ApiRequestType.ViewFilePath]: void;
    [ApiRequestType.ResetConfig]: boolean;
    [ApiRequestType.CreateIssue]: JiraIssueResponse;
    [ApiRequestType.GetFields]: Map<string, string>;
    [ApiRequestType.GetIssueTypes]: JiraIssueTypesResponse;
    [ApiRequestType.GetProjects]: JiraProjectsResponse;
    [ApiRequestType.Search]: JiraJqlResponse;
    [ApiRequestType.UpdateIssue]: boolean;
    [ApiRequestType.GetUser]: JiraJqlResponse;
    [ApiRequestType.SearchUser]: JiraJqlResponse;
};

export const apiValidators: {
    [RequestTypeGeneric in ApiRequestType]: ApiValidation<RequestTypeGeneric>;
} = {
    [ApiRequestType.GetPreferences]: {
        request: undefined,
        response: (data): data is UserPreferences | undefined => {
            return data === undefined || isValidUserPreferences(data);
        },
    },
    [ApiRequestType.SavePreferences]: {
        request: isValidUserPreferences,
        response: typeofValidators.boolean,
    },
    [ApiRequestType.SelectFiles]: {
        request: createAllowUndefinedValidator(
            createArrayValidator(createEnumValidator(OpenDialogProperty)),
        ),
        response: createAllowUndefinedValidator(createArrayValidator(typeofValidators.string)),
    },
    [ApiRequestType.GetConfigPath]: {
        request: createEnumValidator(GetPathType),
        response: typeofValidators.string,
    },
    [ApiRequestType.ViewFilePath]: {
        request: typeofValidators.string,
        response: undefined,
    },
    [ApiRequestType.ResetConfig]: {
        request: createEnumValidator(ResetType),
        response: typeofValidators.boolean,
    },
    [ApiRequestType.GetFields]: {
        request: jiraRequestValidator,
        response: createMapValidator,
    },
    [ApiRequestType.GetIssueTypes]: {
        request: issueTypeRequestValidator,
        response: jiraIssueTypesResponseValidator,
    },
    [ApiRequestType.GetProjects]: {
        request: jiraRequestValidator,
        response: jiraProjectsResponseValidator,
    },
    [ApiRequestType.CreateIssue]: {
        request: createIssueRequestValidator,
        response: jiraIssueResponseValidator,
    },
    [ApiRequestType.Search]: {
        request: searchRequestValidator,
        response: jiraJqlResponseValidator,
    },
    [ApiRequestType.UpdateIssue]: {
        request: updateIssueRequestValidator,
        response: typeofValidators.boolean,
    },
    [ApiRequestType.GetUser]: {
        request: jiraRequestValidator,
        response: jiraJqlResponseValidator,
    },
    [ApiRequestType.SearchUser]: {
        request: searchRequestValidator,
        response: jiraJqlResponseValidator,
    },
};

export type ApiValidator<
    RequestTypeGeneric extends ApiRequestType,
    ResponseOrRequestData extends ApiRequestData | ApiResponseData,
> = (input: any) => input is ResponseOrRequestData[RequestTypeGeneric];

export type ApiValidation<RequestTypeGeneric extends ApiRequestType> = {
    request: ApiRequestData[RequestTypeGeneric] extends undefined | void
        ? undefined
        : ApiValidator<RequestTypeGeneric, ApiRequestData>;
    response: ApiResponseData[RequestTypeGeneric] extends undefined | void
        ? undefined
        : ApiValidator<RequestTypeGeneric, ApiResponseData>;
};

export function getGenericApiValidator(requestType: ApiRequestType): ApiValidation<ApiRequestType> {
    const validator = apiValidators[requestType];
    if (!validator) {
        throw new Error(`No validators defined for request type "${requestType}".`);
    }
    return validator;
}
