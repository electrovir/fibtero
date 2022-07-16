export function formatDateForPath(date: Date = new Date()) {
    const dateWithTimeString = formatDateWithTimeForPath(date);

    return dateWithTimeString.replace(/T\d.+/, '');
}

export function formatDateWithTimeForPath(date: Date = new Date()) {
    return date.toISOString().replace(/[:\.]/g, '-');
}
