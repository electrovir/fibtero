import {ApiRequestInit} from './api-request';
import {ApiRequestData, ApiRequestType} from './api-request-type';
import {OpenDialogProperty} from './electron-types';

describe('ApiRequestDetails', () => {
    it('should allow undefined when undefined is an option', () => {
        const allowsUndefined = ApiRequestType.SelectFiles;
        const onlyAcceptsUndefined = ApiRequestType.GetPreferences;
        const onlyAcceptsDefined = ApiRequestType.GetConfigPath;

        // ensure this type still allows undefined
        const requestDataMaybeUndefined1: ApiRequestData[typeof allowsUndefined] = undefined;
        // ensure this type still allows at least one defined value
        const requestDataMaybeUndefined2: ApiRequestData[typeof allowsUndefined] = [];

        // ensure this type still allows undefined
        const requestDataMustBeUndefined1: ApiRequestData[typeof onlyAcceptsUndefined] = undefined;
        // ensure this type still allows no other types
        // @ts-expect-error
        const requestDataMustBeUndefined2: ApiRequestData[typeof onlyAcceptsUndefined] = [];

        const requestDetailsMaybeUndefined: ApiRequestInit<typeof allowsUndefined> = {
            type: allowsUndefined,
        };

        const requestDetailsMaybeDefined: ApiRequestInit<typeof allowsUndefined> = {
            type: allowsUndefined,
            data: [OpenDialogProperty.multiSelections],
        };

        const requestDetailsMaybeDefinedPoorly: ApiRequestInit<typeof allowsUndefined> = {
            type: allowsUndefined,
            // @ts-expect-error
            data: [5],
        };

        const requestDetailsMustBeUndefined: ApiRequestInit<typeof onlyAcceptsUndefined> = {
            type: onlyAcceptsUndefined,
        };

        // @ts-expect-error
        const requestDetailsMustBeDefined: ApiRequestInit<typeof onlyAcceptsDefined> = {
            type: onlyAcceptsDefined,
        };
    });
});
