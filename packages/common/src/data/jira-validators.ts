import {isObject} from 'augment-vir';
import {hasProperty} from '../augments/object';
import {JiraRestApiCallRequest} from './jira-data';

export function restApiCallValidator(input: unknown): input is JiraRestApiCallRequest {
    if (!input || !isObject(input)) {
        return false;
    }

    if (!hasProperty(input, 'relativeUrl') || typeof input.relativeUrl !== 'string') {
        return false;
    }

    if (input.relativeUrl.includes('javascript')) {
        return false;
    }

    return true;
}
