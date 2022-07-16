/** Checks (at run time) that an object has the specified key and type narrows the given object. */
export function hasProperty<ObjectGeneric extends object, KeyGeneric extends PropertyKey>(
    inputObject: ObjectGeneric,
    inputKey: KeyGeneric,
    // @ts-ignore this type signature is actually exactly what I want
): inputObject is ObjectGeneric extends Record<KeyGeneric, any>
    ? Extract<ObjectGeneric, {[SubProperty in KeyGeneric]: unknown}>
    : Record<KeyGeneric, unknown> {
    return inputKey in inputObject;
}

/**
 * Typeof doesn't automatically type narrow sufficiently, so this wraps that and the return value
 * causes it to type narrow sufficiently.
 */
export function isObject(input: any): input is NonNullable<object> {
    return input != null && typeof input === 'object';
}
