import {defineFunctionalElement, html} from 'element-vir';

export const FibExportJiraViewPage = defineFunctionalElement({
    tagName: 'fib-export-jira-view-page',
    props: {},
    renderCallback: () => {
        return html`
            Export Jira View
        `;
    },
});
