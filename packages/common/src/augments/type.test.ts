import {getObjectTypedKeys} from 'augment-vir';
import {TypeofReturnToTypeMapping, TypeofReturnValue} from './type';

describe('TypeofReturnValue', () => {
    it('should be assignable to from typeof operator', async () => {
        const input: any = {};
        const actualTypeResult = typeof input;
        const typeResult: TypeofReturnValue = actualTypeResult;
        // @ts-expect-error
        const anotherTypeResult: TypeofReturnValue = 'derp';
    });

    it('should match all actual typeof results', () => {
        const values: {[P in TypeofReturnValue]: TypeofReturnToTypeMapping[P]} = {
            bigint: BigInt(4),
            boolean: true,
            function: () => {},
            number: 2,
            object: {},
            string: 'hello',
            symbol: Symbol('there'),
            undefined: undefined,
        };

        getObjectTypedKeys(values).forEach((typeKey) => {
            expect(typeof values[typeKey]).toBe(TypeofReturnValue[typeKey]);
        });
    });
});
