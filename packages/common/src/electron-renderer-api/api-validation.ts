import {getObjectTypedKeys, isEnumValue} from 'augment-vir';
import {TypeofReturnToTypeMapping, TypeofReturnValue} from '../augments/type';
import {matchesShallowObjectSignature} from '../data/object-validator';

export function isValidArray<SpecificType>(
    testArray: unknown,
    elementValidator: (element: any) => element is SpecificType,
): testArray is SpecificType[] {
    if (!Array.isArray(testArray)) {
        return false;
    }

    return testArray.every((entry) => elementValidator(entry));
}

export function createObjectValidator<T extends object>(comparison: T) {
    return (input: any): input is T => {
        return matchesShallowObjectSignature(input, comparison);
    };
}

export function createEnumValidator<SpecificEnum extends object>(
    enumToCheck: SpecificEnum,
): (input: any) => input is SpecificEnum[keyof SpecificEnum] {
    return (input: any): input is SpecificEnum[keyof SpecificEnum] => {
        return isEnumValue(input, enumToCheck);
    };
}

export function createAllowUndefinedValidator<SpecificType>(
    validator: (input: any) => input is SpecificType,
): (input: any) => input is SpecificType | undefined {
    return (input: any): input is SpecificType | undefined => {
        if (input === undefined) {
            return true;
        } else {
            return validator(input);
        }
    };
}

export function createArrayValidator<SpecificType>(
    elementValidator: (element: any) => element is SpecificType,
) {
    return (testArray: any[]): testArray is SpecificType[] =>
        isValidArray(testArray, elementValidator);
}

export function assertIsValidArray<SpecificType>(
    testArray: unknown,
    elementValidator: (element: any) => element is SpecificType,
): asserts testArray is SpecificType[] {
    if (!isValidArray(testArray, elementValidator)) {
        throw new Error(`Invalid array given: ${testArray}`);
    }
}

function typeofValidator<SpecificType extends TypeofReturnValue>(
    input: any,
    type: SpecificType,
): input is TypeofReturnToTypeMapping[SpecificType] {
    return typeof input === type;
}

function createTypeofValidator<SpecificType extends TypeofReturnValue>(type: SpecificType) {
    return (input: any): input is TypeofReturnToTypeMapping[SpecificType] =>
        typeofValidator(input, type);
}

export const typeofValidators: {
    [SpecificType in TypeofReturnValue]: (
        input: any,
    ) => input is TypeofReturnToTypeMapping[SpecificType];
} = getObjectTypedKeys(TypeofReturnValue).reduce((accum, typeofKey) => {
    accum[typeofKey] = createTypeofValidator(typeofKey);
    return accum;
}, {} as any);

export function createMapValidator(response: unknown): response is Map<string, string> {
    // just pass it on
    return true;
}

export function dummyValidator(response: unknown): response is any {
    return true;
}
