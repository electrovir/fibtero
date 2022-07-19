import {JiraDocument} from '@packages/common/src/data/jira-data';

// very bad formatting so far
export function formatDescription(input?: JiraDocument): string {
    if (!input) {
        return '';
    }
    if (input.text) {
        return input.text;
    } else if (input.content) {
        return input.content.map(formatDescription).join('\n');
    } else if (input.attrs) {
        return input.attrs.url;
    } else {
        return '';
    }
}
