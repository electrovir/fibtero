import {extractMessage} from '@packages/common/src/augments/error';
import {ApiRequestDetails} from '@packages/common/src/electron-renderer-api/api-request';
import {
    apiRequestKey,
    ApiRequestType,
    getGenericApiValidator,
} from '@packages/common/src/electron-renderer-api/api-request-type';
import {
    ApiFullResponse,
    getApiResponseEventName,
} from '@packages/common/src/electron-renderer-api/api-response';
import {isEnumValue} from 'augment-vir';
import {ipcMain} from 'electron';
import {ElectronApp} from '../augments/electron';
import {apiOptionsMap, getGenericApiHandler} from '../renderer-api/api-handlers';

export function setupApiHandlers(devMode: boolean, electronApp: ElectronApp) {
    ipcMain.on(apiRequestKey, async (event, requestDetails: ApiRequestDetails<ApiRequestType>) => {
        function sendReply(response: ApiFullResponse<ApiRequestType>) {
            const responseId = getApiResponseEventName(
                requestDetails.type,
                requestDetails.requestId,
            );
            event.reply(responseId, response);
        }
        const apiOptions = apiOptionsMap[requestDetails.type];

        try {
            const requestType = requestDetails.type;
            if (devMode && apiOptions.allowLogging) {
                console.info('Receiving request:', requestDetails);
            }

            if (!isEnumValue(requestType, ApiRequestType)) {
                throw new Error(`Invalid request type "${requestType}"`);
            }

            const requestDataValidator = getGenericApiValidator(requestType).request;

            if (
                // if there is no validator, don't even try calling it
                requestDataValidator &&
                !requestDataValidator(requestDetails.data)
            ) {
                console.error(requestDetails.data);
                throw new Error(`Validation failed for request data.`);
            }

            const handler = getGenericApiHandler(requestType);
            let response;
            try {
                response = await handler(requestDetails.data, electronApp);
                if (devMode && apiOptions.allowLogging) {
                    console.info(
                        `Responding to request ${requestDetails.type} ${requestDetails.requestId}:`,
                        response,
                    );
                }
            } catch (error) {
                throw new Error(
                    `${requestDetails.type} ${
                        requestDetails.requestId
                    } handler failed: ${extractMessage(error)}`,
                );
            }
            sendReply({
                success: true,
                error: undefined,
                data: response,
            });
            return true;
        } catch (error) {
            const errorString = error instanceof Error ? error.message : String(error);
            console.error(
                `ERROR for request ${requestDetails.type} ${requestDetails.requestId}:`,
                errorString,
            );
            sendReply({
                success: false,
                error: errorString,
                data: undefined,
            });
            return false;
        }
    });
}
