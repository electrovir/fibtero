import {
    ApiRequestDetails,
    ApiRequestFunction,
} from '@packages/common/src/electron-renderer-api/api-request';
import {
    apiRequestKey,
    ApiRequestType,
    getGenericApiValidator,
} from '@packages/common/src/electron-renderer-api/api-request-type';
import {
    ApiFullResponse,
    getApiResponseEventName,
} from '@packages/common/src/electron-renderer-api/api-response';
import {randomString} from 'augment-vir';
import {ipcRenderer} from 'electron';
import {expose} from './expose';

expose({
    versions: process.versions,
    apiRequest: (async (
        details: ApiRequestDetails<ApiRequestType>,
    ): Promise<ApiFullResponse<ApiRequestType>> => {
        async function waitForResponse(): Promise<ApiFullResponse<ApiRequestType>> {
            return new Promise((resolve) => {
                ipcRenderer.once(
                    getApiResponseEventName(details.type, requestId),
                    (event, data) => {
                        resolve(data);
                    },
                );
            });
        }

        const data = 'data' in details ? details.data : undefined;
        const requestId = randomString();

        const responseDataValidator = getGenericApiValidator(details.type).response;

        return new Promise((resolve, reject) => {
            waitForResponse().then((response) => {
                if (response.success) {
                    if (responseDataValidator && !responseDataValidator(response.data)) {
                        console.error(response.data);
                        console.error(`Response data validation for ${details.type} failed.`);
                    }
                    resolve(response);
                } else {
                    reject(response.error);
                }
            });
            ipcRenderer.send(apiRequestKey, {type: details.type, data, requestId});
        });
    }) as ApiRequestFunction,
});
