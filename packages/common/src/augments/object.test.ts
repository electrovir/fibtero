import {hasProperty, isObject} from './object';

describe(hasProperty.name, () => {
    it('should return true and type narrow when property exists', async () => {
        const thingie: object = {a: 4};
        // due to the broad type this should be an error
        // @ts-expect-error
        thingie.a;
        expect(hasProperty(thingie, 'a')).toBe(true);

        if (hasProperty(thingie, 'a')) {
            // accessing a should not throw an error
            thingie.a;
            // accessing an unchecked property should be an error
            // @ts-expect-error
            thingie.b;
            // a is actually a number
            (thingie.a as Number).toString();
            // but the type shouldn't be able to know that
            // @ts-expect-error
            thingie.a.toString();
        } else {
            throw new Error('property was invalid');
        }
    });
});

describe(isObject.name, () => {
    it('should return true on valid objects', () => {
        const validObjects: any[] = [
            {},
            {a: 'hello', b: 'there'},
            new Date(),
            [],
        ];

        validObjects.forEach((validObject) => {
            expect(isObject(validObject)).toBe(true);
        });
    });

    it('should fail on non-objects', () => {
        const invalidObjects: any[] = [
            'a',
            3,
            true,
            BigInt(4),
        ];

        invalidObjects.forEach((invalidObject) => {
            expect(isObject(invalidObject)).toBe(false);
        });
    });
});
