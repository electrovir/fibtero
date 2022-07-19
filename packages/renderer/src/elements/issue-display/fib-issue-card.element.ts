import {FullJiraIssue} from '@packages/common/src/data/jira-data';
import {css, defineFunctionalElement, html} from 'element-vir';
import {getFieldFormatting} from '../../field-formatting/field-formatting';

export const FibIssueCard = defineFunctionalElement({
    tagName: 'fib-issue-card',
    props: {
        issue: undefined as undefined | FullJiraIssue,
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            padding: 8px;
            gap: 4px;
            border-radius: 8px;
            border: 1px solid #ccc;
            background: white;
            cursor: pointer;
        }

        :host(:hover) {
            background: #f0f0f0;
        }

        .faded {
            color: #999;
        }

        :host > div {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .small-icon {
            max-width: 16px;
            max-height: 16px;
        }

        .title {
            font-size: 1.1em;
        }

        .assignee-avatar.blank {
            background-color: grey;
            color: white;
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 0.8em;
        }

        .blank span {
            display: inline-block;
            height: 13px;
            width: 8px;
        }

        .assignee-avatar {
            height: 32px;
            border-radius: 50%;
            width: 32px;
        }

        .points {
            background: #ddd;
            font-weight: bold;
            color: #333;
            border-radius: 8px;
            padding: 1px;
            font-size: 0.8em;
            min-width: 24px;
            text-align: center;
        }
    `,
    renderCallback: ({props}) => {
        if (!props.issue) {
            return html``;
        }

        const typeIconUrl = props.issue.fields.issuetype?.iconUrl ?? '';
        const priorityIconUrl = props.issue.fields.priority?.iconUrl ?? '';
        const title = props.issue.fields.summary;
        const storyPoints = props.issue.fields['Story Points'] ?? '-';

        return html`
            <div class="faded">
                ${typeIconUrl
                    ? html`
                          <img class="small-icon" src=${typeIconUrl} />
                      `
                    : ''}
                ${priorityIconUrl
                    ? html`
                          <img class="small-icon" src=${priorityIconUrl} />
                      `
                    : ''}
                ${props.issue.key}
                <div class="points">${storyPoints}</div>
            </div>
            <div class="title">${title}</div>
            <div class="faded">
                ${getFieldFormatting('assignee', props.issue.fields.assignee, props.issue)}
            </div>
        `;
    },
});
