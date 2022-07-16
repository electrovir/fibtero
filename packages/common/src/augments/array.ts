/** Same as array.prototype.filter but works with async filter callbacks. */
export async function asyncFilter<ArrayContents>(
    arrayToFilter: Readonly<ArrayContents[]>,
    callback: (
        arrayEntry: ArrayContents,
        index: number,
        array: Readonly<ArrayContents[]>,
    ) => boolean | Promise<boolean>,
): Promise<ArrayContents[]> {
    const mappedOutput = await Promise.all(arrayToFilter.map(callback));
    return arrayToFilter.filter((entry, index) => {
        const mappedEntry = mappedOutput[index];
        return !!mappedEntry;
    });
}

/** Maps the given array with the given callback and then filters out null and undefined mapped values. */
export function filterMap<ArrayContents, MappedValue>(
    arrayToFilterMap: Readonly<ArrayContents[]>,
    callback: (
        arrayEntry: ArrayContents,
        index: number,
        array: Readonly<ArrayContents[]>,
    ) => MappedValue | undefined | null,
): NonNullable<MappedValue>[] {
    return arrayToFilterMap.reduce(
        (accum: NonNullable<MappedValue>[], currentValue, index, array) => {
            const mappedValue: MappedValue | null | undefined = callback(
                currentValue,
                index,
                array,
            );
            if (mappedValue != undefined) {
                accum.push(mappedValue as NonNullable<MappedValue>);
            }
            return accum;
        },
        [],
    );
}

export async function asyncInOrderMap<InArrayElementType, OutArrayElementType>(
    inputArray: Readonly<InArrayElementType[]>,
    callback: (
        element: InArrayElementType,
        index: number,
        array: Readonly<InArrayElementType[]>,
    ) => Promise<OutArrayElementType> | OutArrayElementType,
): Promise<OutArrayElementType[]> {
    return await inputArray.reduce(async (lastPromise, currentElement, index, array) => {
        const accum = await lastPromise;
        return accum.concat(await callback(currentElement, index, array));
    }, Promise.resolve([] as OutArrayElementType[]));
}
