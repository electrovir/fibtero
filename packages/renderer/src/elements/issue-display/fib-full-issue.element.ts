import {JiraIssue} from '@packages/common/src/data/jira-data';
import {css, defineFunctionalElement, html} from 'element-vir';
import {getFieldFormatting} from '../../formatting/field-formatting';

export const FibFullIssue = defineFunctionalElement({
    tagName: 'fib-full-issue',
    props: {
        issue: undefined as undefined | JiraIssue,
    },
    styles: css`
        .fields {
            display: flex;
            flex-direction: column;
        }
    `,
    renderCallback: ({props}) => {
        if (!props.issue) {
            return html``;
        }

        console.log({fullIssue: props.issue});

        const browseUrl = `${props.issue.self.split('/rest/')[0]}/browse/${props.issue.key}`;

        return html`
            <div>
                ${props.issue.key}
                <a href=${browseUrl} target="_blank">view in browser</a>
            </div>
            <div class="fields">
                ${Object.keys(props.issue.fields).map((fieldName) => {
                    const fieldValue = props.issue?.fields[fieldName];
                    const template = getFieldFormatting(fieldName, fieldValue);

                    if (template) {
                        return html`
                            <span>${fieldName}: ${template}</span>
                        `;
                    } else {
                        return '';
                    }
                })}
            </div>
        `;
    },
});
