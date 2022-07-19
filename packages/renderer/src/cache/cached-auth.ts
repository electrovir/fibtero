import {JiraAuth} from '@packages/common/src/data/jira-data';

const cachedAuthKey = 'cached-jira-auth';

export function setCachedData(auth: JiraAuth) {
    window.localStorage.setItem(cachedAuthKey, JSON.stringify(auth));
}

export function getCachedAuth(): undefined | JiraAuth {
    const cached = window.localStorage.getItem(cachedAuthKey);
    if (cached) {
        return JSON.parse(cached);
    } else {
        return undefined;
    }
}
