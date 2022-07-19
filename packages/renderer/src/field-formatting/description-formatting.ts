import {FullJiraIssue} from '@packages/common/src/data/jira-data';
import {JiraDocument} from '@packages/common/src/data/jira-document';
import {html} from 'element-vir';
import {TemplateResult} from 'lit';

export function formatDescription(
    fullIssue: FullJiraIssue,
    input: JiraDocument | undefined,
): TemplateResult | string {
    if (!input) {
        return '';
    }

    if (input.type === 'text') {
        let isCode;
        let link = '';

        input.marks?.forEach((mark) => {
            if (mark.type === 'code') {
                isCode = true;
            } else if (mark.type === 'link') {
                link = mark.attrs.href;
            }
        });

        let template: TemplateResult = html`
            ${input.text}
        `;

        if (isCode) {
            template = html`
                <code>${template}</code>
            `;
        }

        if (link) {
            template = html`
                <a href=${link} target="_blank">${template}</a>
            `;
        }

        return template;
    }

    const children =
        'content' in input ? input.content.map((doc) => formatDescription(fullIssue, doc)) : [];

    if (input.type === 'doc') {
        return html`
            ${children}
        `;
    } else if (input.type === 'paragraph') {
        return html`
            <p>${children}</p>
        `;
    } else if (input.type === 'bulletList') {
        return html`
            <ul>
                ${children}
                <ul></ul>
            </ul>
        `;
    } else if (input.type === 'listItem') {
        return html`
            <li>${children}</li>
        `;
    } else if (input.type === 'orderedList') {
        return html`
            <ol>
                ${children}
            </ol>
        `;
    } else if (input.type === 'inlineCard') {
        return html`
            <a href=${input.attrs.url}>${input.attrs.url}</a>
        `;
    } else if (input.type === 'media') {
        return html``;
    } else if (input.type === 'mediaSingle') {
        return html`
            ${children}
        `;
    }

    return '';
}
