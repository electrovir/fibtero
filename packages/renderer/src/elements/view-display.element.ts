import {JiraIssue} from '@packages/common/src/data/jira-data';
import {defineFunctionalElement, html} from 'element-vir';
import {css} from 'lit';

export enum ViewDirection {
    Vertical = 'vertical',
    Horizontal = 'horizontal',
}

export type ViewSection = {
    issues: JiraIssue[];
    name: string;
};

export const ViewDisplay = defineFunctionalElement({
    tagName: 'fib-view-display',
    props: {
        direction: ViewDirection.Horizontal,
        sections: [] as ViewSection[],
    },
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            padding: 16px;
        }
    `,
    renderCallback: ({props, setProps}) => {
        return html`
            hello
        `;
    },
});
