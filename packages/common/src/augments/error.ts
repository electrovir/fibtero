export function extractMessage(error: unknown): string {
    if (error == undefined) {
        return '';
    }
    if (error instanceof Error) {
        return error.message;
    } else {
        return String(error);
    }
}

/**
 * Not sure if "code" and "syscall" properties are reliably always there so marking them as optional
 * since what I'm really interested in is the "errno" property.
 */
export type SystemError = {
    errno: number;
    code?: string;
    syscall?: string;
};

export function hasErrno(error: unknown): error is SystemError {
    if (!!error && typeof error === 'object' && 'errno' in error) {
        return true;
    }

    return false;
}
