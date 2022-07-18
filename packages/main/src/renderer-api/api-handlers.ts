import {
    ApiRequestData,
    ApiRequestType,
    ApiResponseData,
} from '@packages/common/src/electron-renderer-api/api-request-type';
import {ElectronApp} from '../augments/electron';
import {getPath} from '../config/config-path';
import {resetConfig} from '../config/config-reset';
import {readUserPreferences, saveUserPreferences} from '../config/user-preferences';
import {getField, search} from '../jira-api/make-jira-request';
import {selectFiles} from './dialogs';
import {viewPath} from './view-file';

export type ApiHandlerFunction<RequestTypeGeneric extends ApiRequestType> = (
    requestInput: ApiRequestData[RequestTypeGeneric],
    electronApp: ElectronApp,
) => Promise<ApiResponseData[RequestTypeGeneric]> | ApiResponseData[RequestTypeGeneric];

const apiHandlers: {
    [RequestTypeGeneric in ApiRequestType]: ApiHandlerFunction<RequestTypeGeneric>;
} = {
    [ApiRequestType.SavePreferences]: saveUserPreferences,
    [ApiRequestType.GetPreferences]: (input, app) => readUserPreferences(app),
    [ApiRequestType.SelectFiles]: selectFiles,
    [ApiRequestType.GetConfigPath]: (input, app) => getPath(input, app),
    [ApiRequestType.ViewFilePath]: (input) => viewPath(input),
    [ApiRequestType.ResetConfig]: resetConfig,
    [ApiRequestType.JiraRequest]: search,
    [ApiRequestType.GetField]: getField,
};

export type ApiOptions = {
    allowLogging: boolean;
};

export const apiOptionsMap: Record<ApiRequestType, ApiOptions> = {
    [ApiRequestType.SavePreferences]: {
        allowLogging: true,
    },
    [ApiRequestType.GetPreferences]: {
        allowLogging: true,
    },
    [ApiRequestType.SelectFiles]: {
        allowLogging: true,
    },
    [ApiRequestType.GetConfigPath]: {
        allowLogging: true,
    },
    [ApiRequestType.ViewFilePath]: {
        allowLogging: true,
    },
    [ApiRequestType.ResetConfig]: {
        allowLogging: true,
    },
    [ApiRequestType.JiraRequest]: {
        // turn logging off here so we don't log api keys (which are sensitive data) all over
        allowLogging: false,
    },
    [ApiRequestType.GetField]: {
        allowLogging: false,
    }
};

export function getGenericApiHandler(
    requestType: ApiRequestType,
): ApiHandlerFunction<ApiRequestType> {
    const handler = apiHandlers[requestType];
    if (!handler) {
        throw new Error(`No handler defined for request type "${requestType}"`);
    }
    return handler as ApiHandlerFunction<ApiRequestType>;
}
