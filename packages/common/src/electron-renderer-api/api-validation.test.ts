import {getObjectTypedKeys} from 'augment-vir';
import {TypeofReturnToTypeMapping, TypeofReturnValue} from '../augments/type';
import {createArrayValidator, isValidArray, typeofValidators} from './api-validation';

describe('typeof validators', () => {
    const values: Readonly<{[P in TypeofReturnValue]: TypeofReturnToTypeMapping[P]}> = {
        bigint: BigInt(4),
        boolean: true,
        function: () => {},
        number: 2,
        object: {},
        string: 'hello',
        symbol: Symbol('there'),
        undefined: undefined,
    } as const;

    const valuesKeys = getObjectTypedKeys(values);

    it('should work for all supported types', () => {
        valuesKeys.forEach((typedKey) => {
            expect(typeofValidators[typedKey](values[typedKey])).toBe(true);
        });
    });

    it('should fail when the types are mismatched', () => {
        valuesKeys.forEach((testValueKey) => {
            valuesKeys
                .filter((valueKey) => valueKey !== testValueKey)
                .forEach((testValidatorKey) => {
                    expect(typeofValidators[testValidatorKey](values[testValueKey])).toBe(false);
                });
        });
    });

    it('should work on valid booleans', () => {
        const validBooleans: boolean[] = [
            true,
            false,
        ];

        validBooleans.forEach((validBoolean) => {
            expect(typeofValidators.boolean(validBoolean)).toBe(true);
        });
    });

    it('should fail on invalid booleans', () => {
        const invalidBooleans: any[] = [
            {},
            [],
            5,
            'hello there',
        ];

        invalidBooleans.forEach((validBoolean) => {
            expect(typeofValidators.boolean(validBoolean)).toBe(false);
        });
    });
});

describe(isValidArray.name, () => {
    it('should work on empty arrays', () => {
        expect(isValidArray([], typeofValidators.boolean)).toBe(true);
    });

    it('should work on arrays with contents', () => {
        expect(isValidArray([true], typeofValidators.boolean)).toBe(true);
        expect(
            isValidArray(
                [
                    true,
                    false,
                ],
                typeofValidators.boolean,
            ),
        ).toBe(true);
        expect(
            isValidArray(
                [
                    true,
                    false,
                    true,
                    false,
                ],
                typeofValidators.boolean,
            ),
        ).toBe(true);
    });

    it('should fail on invalid arrays', () => {
        expect(isValidArray(['what'], typeofValidators.boolean)).toBe(false);
        expect(
            isValidArray(
                [
                    3,
                    4,
                ],
                typeofValidators.boolean,
            ),
        ).toBe(false);
        expect(
            isValidArray(
                [
                    true,
                    'true',
                    'false',
                ],
                typeofValidators.boolean,
            ),
        ).toBe(false);
    });
});

describe(createArrayValidator.name, () => {
    it('should have identical results to isValidArray tests', () => {
        expect(createArrayValidator(typeofValidators.boolean)([])).toBe(true);
        expect(createArrayValidator(typeofValidators.boolean)([true])).toBe(true);
        expect(
            createArrayValidator(typeofValidators.boolean)([
                true,
                false,
            ]),
        ).toBe(true);
        expect(
            createArrayValidator(typeofValidators.boolean)([
                true,
                false,
                true,
                false,
            ]),
        ).toBe(true);
        expect(createArrayValidator(typeofValidators.boolean)(['what'])).toBe(false);
        expect(
            createArrayValidator(typeofValidators.boolean)([
                3,
                4,
            ]),
        ).toBe(false);
        expect(
            createArrayValidator(typeofValidators.boolean)([
                true,
                'true',
                'false',
            ]),
        ).toBe(false);
    });
});
