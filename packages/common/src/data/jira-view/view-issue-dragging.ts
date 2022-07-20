export enum IssueDragOperation {
    Set = 'set',
    Add = 'add',
    Remove = 'remove',
}

export type IssueDragging = {
    operation: IssueDragOperation;
    fieldName: string;
    value: string;
    id: string;
};

export function createEmptyIssueDragging(randomString: () => string): IssueDragging {
    return {
        operation: IssueDragOperation.Set,
        fieldName: '',
        value: '',
        id: randomString(),
    };
}
