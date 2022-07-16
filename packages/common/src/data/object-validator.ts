import {getObjectTypedKeys} from 'augment-vir';
import {hasProperty, isObject} from '../augments/object';

/**
 * This function is used for run-type type checking. It checks that each property in a "testing"
 * object matches the types of a given "defaultComparison" object. This does not recursively check
 * properties, thus it is shallow.
 */
export function matchesShallowObjectSignature<T extends object>(
    testing: unknown,
    defaultComparison: T,
    allowExtraKeys = false,
): testing is T {
    if (!isObject(testing)) {
        return false;
    }

    if (!allowExtraKeys && Object.keys(testing).length !== Object.keys(defaultComparison).length) {
        return false;
    }

    return getObjectTypedKeys(defaultComparison).every((requiredKey) => {
        if (!hasProperty(testing, requiredKey)) {
            return false;
        }

        const testingValue = testing[requiredKey];
        const compareValue = defaultComparison[requiredKey];

        if (typeof testingValue !== typeof compareValue) {
            return false;
        }

        if (isObject(compareValue) && hasProperty(compareValue, 'constructor')) {
            return (testingValue as object) instanceof compareValue.constructor;
        }

        return true;
    });
}
