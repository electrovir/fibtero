import {JiraIssue} from '@packages/common/src/data/jira-data';
import {defineFunctionalElement, html} from 'element-vir';

export const FibShowFullIssue = defineFunctionalElement({
    tagName: 'fib-show-full-issue',
    props: {
        issue: undefined as undefined | JiraIssue,
    },
    renderCallback: ({props}) => {
        if (!props.issue) {
            return html``;
        }

        return html`
            ${props.issue.key}
        `;
    },
});
