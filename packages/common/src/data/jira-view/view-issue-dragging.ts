export enum IssueDragOperation {
    Set = 'set',
    Add = 'add',
    Remove = 'remove',
}

export type IssueDragging = {
    operation: IssueDragOperation;
    fieldName: string;
    value: string;
};
