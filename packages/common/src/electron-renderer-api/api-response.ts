import {apiRequestKey, ApiRequestType, ApiResponseData} from './api-request-type';

export type ApiResponseEventName = `${typeof apiRequestKey}:${ApiRequestType}:${string}`;

export function getApiResponseEventName(
    requestType: ApiRequestType,
    requestId: string,
): ApiResponseEventName {
    return `${apiRequestKey}:${requestType}:${requestId}`;
}

export type ApiFullResponse<RequestTypeGeneric extends ApiRequestType> =
    | {
          success: true;
          error: undefined;
          data: ApiResponseData[RequestTypeGeneric];
      }
    | {
          success: false;
          error: string;
          data: undefined;
      };
