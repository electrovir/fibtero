export const TypeofReturnValue = {
    bigint: 'bigint',
    boolean: 'boolean',
    function: 'function',
    number: 'number',
    object: 'object',
    string: 'string',
    symbol: 'symbol',
    undefined: 'undefined',
} as const;
export type TypeofReturnValue = typeof TypeofReturnValue[keyof typeof TypeofReturnValue];

export type TypeofReturnToTypeMapping = {
    bigint: bigint;
    boolean: boolean;
    function: Function;
    number: number;
    object: object;
    string: string;
    symbol: symbol;
    undefined: undefined;
};
