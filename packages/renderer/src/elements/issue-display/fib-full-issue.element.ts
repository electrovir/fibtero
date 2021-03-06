import {FullJiraIssue} from '@packages/common/src/data/jira-data';
import {emptyUserPreferences} from '@packages/common/src/data/user-preferences';
import {css, defineFunctionalElement, html} from 'element-vir';
import {getFieldFormatting, prettify} from '../../field-formatting/field-formatting';
import {ellipsisClasses} from '../../styles/ellipsis-classes';
import {storyPointsClasses} from '../../styles/story-points-classes';

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
            gap: 16px 16px;
        }
        .label {
            font-weight: bold;
        }
        .header {
            font-weight: bold;
            font-size: 115%;
        }
        .left {
            flex-grow: 1;
            padding: 16px 16px 16px 0px;
            border-right: 1px solid black;
        }
        .right {
            flex-grow: 1;
            max-width: 30%;
            padding: 16px 0px 16px 16px;
        }
        .container {
            display: flex;
            border-top: 1px solid black;
        }
        .summary {
            font-weight: bold;
            font-size: 115%;
            padding: 8px 0px 16px 0px;
        }
        a {
            font: inherit;
        }
        .right-field {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .field-value {
            flex-shrink: 1;
            max-width: 50%;
        }
        ${ellipsisClasses}
        ${storyPointsClasses}
    `,
    renderCallback: ({props}) => {
        if (!props.issue) {
            return html``;
        }

        const browseUrl = `${props.issue.self.split('/rest/')[0]}/browse/${props.issue.key}`;

        const fieldsSpecial = [
            'summary',
            'description',
            'Acceptance Criteria',
            'issuetype',
        ];
        const fields = Object.keys(props.issue.fields).filter(
            (f) => fieldsSpecial.indexOf(f) == -1,
        );
        const descriptionTemplate = getFieldFormatting(
            'description',
            props.issue?.fields['description'],
            props.issue!,
        );
        const acTemplate = getFieldFormatting(
            'Acceptance Criteria',
            props.issue?.fields['Acceptance Criteria'],
            props.issue!,
        );
        const issueTypeTemplate = getFieldFormatting(
            'issuetype',
            props.issue?.fields['issuetype'],
            props.issue!,
        );

        return html`
            <div class="header">
                ${issueTypeTemplate}
                <a href=${browseUrl} target="_blank">${props.issue.key}:</a>
            </div>
            <div class="summary">${props.issue?.fields['summary']}</div>
            <div class="container">
                <div class="fields left">
                    <span>
                        <div class="label ellipsis" title="Description">Description:</div>
                        ${descriptionTemplate}
                    </span>
                    <span>
                        <div class="label ellipsis" title="Acceptance Criteria">
                            Acceptance Criteria:
                        </div>
                        ${acTemplate}
                    </span>
                </div>
                <div class="fields right">
                    ${fields.map((fieldName) => {
                        const fieldValue = props.issue?.fields[fieldName];
                        const template = getFieldFormatting(fieldName, fieldValue, props.issue!);
                        const templateTooltip = typeof template === 'string' ? template : '';
                        const formattedKey = fieldName.toLowerCase().replaceAll(' ', '');
                        const isVisible =
                            Object.keys(props.userPreferences.fieldVisibility).length === 0 ||
                            props.userPreferences.fieldVisibility[formattedKey] == undefined ||
                            props.userPreferences.fieldVisibility[formattedKey] == true;
                        const prettyName = prettify(fieldName);

                        if (template && fieldValue && isVisible) {
                            return html`
                                <div class="right-field">
                                    <div class="label ellipsis" title="${prettyName}">
                                        ${prettyName}:
                                    </div>
                                    <div class="field-value ellipsis" title="${templateTooltip}">
                                        ${template}
                                    </div>
                                </div>
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
