import {OpenDialogProperty} from '@packages/common/src/electron-renderer-api/electron-types';
import {
    CreateIssueRequest,
    createIssueRequestValidator,
    issueTypeRequestValidator,
    IssueTypesRequest,
    JiraAuth,
    JiraIssue,
    JiraIssueResponse,
    JiraIssueTypesResponse,
    JiraJqlSearchRequest,
    JiraProjectsResponse,
    jiraRequestValidator,
    JiraRestApiCallRequest,
    JiraSearchIssuesByLabelRequest,
    JiraSimplifiedField,
    JiraUser,
    searchByLabelRequestValidator,
    searchRequestValidator,
    UpdateIssueLabelsRequest,
    updateIssueLabelsRequestValidator,
    UpdateIssueRequest,
    updateIssueRequestValidator,
} from '../data/jira-data';
import {restApiCallValidator} from '../data/jira-validators';
import {isValidUserPreferences, UserPreferences} from '../data/user-preferences';
import {
    createAllowUndefinedValidator,
    createArrayValidator,
    createEnumValidator,
    dummyValidator,
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
    JiraRestApiCall = 'jira-rest',
    ResetConfig = 'reset-config',
    CreateIssue = 'jira-create-issue',
    GetFields = 'jira-get-fields',
    GetIssueTypes = 'jira-get-issue-types',
    GetProjects = 'jira-get-projects',
    JqlSearch = 'jira-search',
    UpdateIssue = 'jira-update-issue',
    UpdateIssueLabels = 'jira-update-issue-labels',
    GetUsers = 'jira-get-user',
    SearchUsers = 'jira-search-user',
    GetIssuesByLabel = 'jira-get-issues-by-label',
}

export type ApiRequestData = {
    [ApiRequestType.GetPreferences]: undefined;
    [ApiRequestType.SavePreferences]: UserPreferences;
    [ApiRequestType.SelectFiles]: OpenDialogProperty[] | undefined;
    [ApiRequestType.GetConfigPath]: GetPathType;
    [ApiRequestType.ViewFilePath]: string;
    [ApiRequestType.ResetConfig]: ResetType;
    [ApiRequestType.CreateIssue]: CreateIssueRequest;
    [ApiRequestType.GetFields]: JiraAuth;
    [ApiRequestType.GetIssueTypes]: IssueTypesRequest;
    [ApiRequestType.GetProjects]: JiraAuth;
    [ApiRequestType.JqlSearch]: JiraJqlSearchRequest;
    [ApiRequestType.UpdateIssue]: UpdateIssueRequest;
    [ApiRequestType.UpdateIssueLabels]: UpdateIssueLabelsRequest;
    [ApiRequestType.GetUsers]: JiraAuth;
    [ApiRequestType.SearchUsers]: JiraJqlSearchRequest;
    [ApiRequestType.GetIssuesByLabel]: JiraSearchIssuesByLabelRequest;
    [ApiRequestType.JiraRestApiCall]: JiraRestApiCallRequest;
};

export type ApiResponseData = {
    [ApiRequestType.GetPreferences]: UserPreferences | undefined;
    [ApiRequestType.SavePreferences]: boolean;
    [ApiRequestType.SelectFiles]: string[] | undefined;
    [ApiRequestType.GetConfigPath]: string;
    [ApiRequestType.ViewFilePath]: void;
    [ApiRequestType.ResetConfig]: boolean;
    [ApiRequestType.CreateIssue]: JiraIssueResponse;
    [ApiRequestType.GetFields]: JiraSimplifiedField[];
    [ApiRequestType.GetIssueTypes]: JiraIssueTypesResponse;
    [ApiRequestType.GetProjects]: JiraProjectsResponse;
    [ApiRequestType.JqlSearch]: JiraIssue[];
    [ApiRequestType.UpdateIssue]: boolean;
    [ApiRequestType.UpdateIssueLabels]: boolean;
    [ApiRequestType.GetUsers]: JiraUser[];
    [ApiRequestType.SearchUsers]: JiraUser[];
    [ApiRequestType.GetIssuesByLabel]: JiraIssue[];
    [ApiRequestType.JiraRestApiCall]: unknown;
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
        response: dummyValidator,
    },
    [ApiRequestType.GetIssueTypes]: {
        request: issueTypeRequestValidator,
        response: dummyValidator,
    },
    [ApiRequestType.GetProjects]: {
        request: jiraRequestValidator,
        response: dummyValidator,
    },
    [ApiRequestType.CreateIssue]: {
        request: createIssueRequestValidator,
        response: dummyValidator,
    },
    [ApiRequestType.JqlSearch]: {
        request: searchRequestValidator,
        response: createArrayValidator(dummyValidator),
    },
    [ApiRequestType.UpdateIssue]: {
        request: updateIssueRequestValidator,
        response: typeofValidators.boolean,
    },
    [ApiRequestType.UpdateIssueLabels]: {
        request: updateIssueLabelsRequestValidator,
        response: typeofValidators.boolean,
    },
    [ApiRequestType.GetUsers]: {
        request: jiraRequestValidator,
        response: createArrayValidator(dummyValidator),
    },
    [ApiRequestType.SearchUsers]: {
        request: searchRequestValidator,
        response: createArrayValidator(dummyValidator),
    },
    [ApiRequestType.GetIssuesByLabel]: {
        request: searchByLabelRequestValidator,
        response: createArrayValidator(dummyValidator),
    },
    [ApiRequestType.JiraRestApiCall]: {
        request: restApiCallValidator,
        response: dummyValidator,
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
