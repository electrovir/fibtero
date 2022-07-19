export function isValidDate(dateInput: unknown): dateInput is Date {
    return dateInput instanceof Date && !isNaN(dateInput.getTime());
}

export function formatDate(input: Date): string {
    const isoSplit = input.toISOString().split('T');
    const date = isoSplit[0];
    const time = isoSplit[1]?.split('.')[0];
    return `${date} ${time}`;
}
