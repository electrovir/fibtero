import {JiraAuth} from '@packages/common/src/data/jira-data';
import {ApiFullResponse} from '@packages/common/src/electron-renderer-api/api-response';
import {ElectronWindowInterface} from '@packages/common/src/electron-renderer-api/electron-window-interface';

const requestsInProgress: Record<string, Promise<any>> = {};

function getStoredValue<T>(cacheKey: string): T | undefined {
    const stored = window.localStorage.getItem(cacheKey);

    if (stored) {
        try {
            const data = JSON.parse(stored);
            return data as T;
        } catch (error) {
            console.error(`Failed to parse stored view cache for ${cacheKey}`);
            return undefined;
        }
    } else {
        return undefined;
    }
}

export type MakeRequestCallback = () => Promise<ApiFullResponse<any>>;

async function makeCacheUpdate(inputs: GetMaybeCachedInputs) {
    try {
        const response: ApiFullResponse<any> = await inputs.makeRequestCallback();

        if (response.success) {
            window.localStorage.setItem(inputs.cacheKey, JSON.stringify(response.data));

            console.log({[inputs.cacheKey]: response.data});

            return response.data;
        } else {
            throw new Error(`Failed to update cached: ${response.error}`);
        }
    } catch (error) {
        throw new Error(`Failed to fetch to update cache for ${inputs.cacheKey}: ${error}`);
    }
}

async function updateCache(inputs: GetMaybeCachedInputs) {
    if (requestsInProgress[inputs.cacheKey]) {
        console.log(`Request already in progress for ${inputs.cacheKey}`);
    } else {
        requestsInProgress[inputs.cacheKey] = makeCacheUpdate(inputs).then((data) => {
            delete requestsInProgress[inputs.cacheKey];
            return data;
        });
    }
    return requestsInProgress[inputs.cacheKey];
}

export type CacheUpdateCallback = (data: unknown) => void;

export type GetMaybeCachedInputs = {
    cacheKey: string;
    electronApi: ElectronWindowInterface;
    jiraAuth: JiraAuth;
    makeRequestCallback: MakeRequestCallback;
    cacheUpdateCallback: CacheUpdateCallback;
};

export async function getMaybeCached(inputs: GetMaybeCachedInputs) {
    const cached = getStoredValue(inputs.cacheKey);

    if (cached) {
        updateCache(inputs).then((data) => {
            inputs.cacheUpdateCallback(data);
        });
        return cached;
    } else {
        return await updateCache(inputs);
    }
}
