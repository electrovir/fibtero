import {ApiRequestData, ApiRequestType} from './api-request-type';
import {ApiFullResponse} from './api-response';

export type ApiRequestDetails<RequestTypeGeneric extends ApiRequestType> = {
    type: RequestTypeGeneric;
    requestId: string;
} & (undefined extends ApiRequestData[RequestTypeGeneric]
    ? {data?: ApiRequestData[RequestTypeGeneric]}
    : {data: ApiRequestData[RequestTypeGeneric]});

export type ApiRequestInit<RequestTypeGeneric extends ApiRequestType> = Omit<
    ApiRequestDetails<RequestTypeGeneric>,
    // requestId is generated within the api request, not by the code making the api request
    'requestId'
>;

export type ApiRequestFunction = <RequestTypeGeneric extends ApiRequestType>(
    details: ApiRequestInit<RequestTypeGeneric>,
) => Promise<ApiFullResponse<RequestTypeGeneric>>;
