import {JiraIssue} from '@packages/common/src/data/jira-data';
import {css, defineFunctionalElement, html} from 'element-vir';

export const FibIssueDisplay = defineFunctionalElement({
    tagName: 'fib-issue-display',
    props: {
        issue: undefined as undefined | JiraIssue,
    },
    styles: css``,
    renderCallback: ({props}) => {
        if (!props.issue) {
            return html`
                no issue given
            `;
        }
        return html`
            ${props.issue.key}
        `;
    },
});
