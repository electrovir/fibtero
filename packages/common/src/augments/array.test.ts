import {asyncFilter, asyncInOrderMap, filterMap} from './array';

describe(asyncFilter.name, () => {
    it('works on async filters', async () => {
        const numbers = [
            0,
            1,
            2,
            3,
            4,
        ];
        const filteredEven = await asyncFilter(numbers, async (number) => {
            return new Promise((resolve) => {
                resolve(!(number % 2));
            });
        });

        expect(filteredEven).toEqual([
            0,
            2,
            4,
        ]);
    });
});

describe(filterMap.name, () => {
    const originalArray: Readonly<number[]> = [
        0,
        1,
        2,
        3,
        4,
    ] as const;

    it('filters out undefined values', () => {
        const filtered = filterMap(originalArray, (entry) => {
            return entry === 3 ? 'three' : undefined;
        });

        expect(filtered).toEqual(['three']);
    });

    it('filters out null values', () => {
        const filtered = filterMap(originalArray, (entry) => {
            return entry === 3 ? 'three' : null;
        });

        expect(filtered).toEqual(['three']);
    });

    it('filters out null and undefined values', () => {
        const filtered = filterMap(originalArray, (entry) => {
            if (entry === 3) {
                return 'three';
            } else if (entry === 1) {
                return null;
            } else {
                return undefined;
            }
        });

        expect(filtered).toEqual(['three']);
    });

    it('should not filter out non-null falsy values', () => {
        const filtered = filterMap(originalArray, (entry) => {
            return entry;
        });

        expect(filtered).toEqual(originalArray);
    });
});

describe(asyncInOrderMap.name, () => {
    it('should map and preserve order', async () => {
        const inputArray = [
            1,
            2,
            3,
            4,
            5,
        ];
        const outputArray = await asyncInOrderMap(inputArray, (element) => {
            return Promise.resolve(element.toString());
        });

        expect(outputArray).toEqual(inputArray.map((element) => element.toString()));
    });
});
