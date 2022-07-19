import {FullJiraIssue} from '@packages/common/src/data/jira-data';
import {emptyUserPreferences} from '@packages/common/src/data/user-preferences';
import {css, defineFunctionalElement, html} from 'element-vir';
import {getFieldFormatting, prettify} from '../../field-formatting/field-formatting';

export const FibFullIssue = defineFunctionalElement({
    tagName: 'fib-full-issue',
    props: {
        issue: undefined as undefined | FullJiraIssue,
        userPreferences: emptyUserPreferences,
    },
    styles: css`
        .fields {
            display: flex;
            flex-direction: column;
            gap: 20px 20px;
        }
        .label {
            font-weight: bold;
        }
        .header {
            font-weight: bold;
            font-size: 125%;
        }
        .link {
            font-size: 75%;
        }
        .left {
            flex: 75%;
        }
        .right {
            flex: 25%;
        }
        .container {
            display: flex;
        }
    `,
    renderCallback: ({props}) => {
        if (!props.issue) {
            return html``;
        }

        const browseUrl = `${props.issue.self.split('/rest/')[0]}/browse/${props.issue.key}`;

        const fieldsSpecial = ['summary','description','Acceptance Criteria']
        const fields = Object.keys(props.issue.fields).filter((f) => fieldsSpecial.indexOf(f) == -1);

        return html`
            <div>
                <span class="header">${props.issue.key}</span>
                <a href=${browseUrl} target="_blank" class="link">view in browser</a>
            </div>
            <hr />
            <div class="container">
            <div class="fields left">
                ${fieldsSpecial.map((fieldName) => {
                    const fieldValue = props.issue?.fields[fieldName];
                    const template = getFieldFormatting(fieldName, fieldValue, props.issue!);
                    const prettyName = prettify(fieldName);

                    if (template) {
                        return html`
                            <span><span class="label">${prettyName}</span>: ${template}</span>
                        `;
                    } else {
                        return '';
                    }
                })}
            </div>
            <div class="fields right">
                ${fields.map((fieldName) => {
                    const fieldValue = props.issue?.fields[fieldName];
                    const template = getFieldFormatting(fieldName, fieldValue, props.issue!);
                    const prettyName = prettify(fieldName);

                    if (template) {
                        return html`
                            <span><span class="label">${prettyName}</span>: ${template}</span>
                        `;
                    } else {
                        return '';
                    }
                })}
            </div>
            </div>
        `;
    },
});
