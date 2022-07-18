import {defineFunctionalElement, html} from 'element-vir';

export const FibImportJiraViewPage = defineFunctionalElement({
    tagName: 'fib-import-jira-view-page',
    props: {},
    renderCallback: () => {
        return html`
            Import Jira View
        `;
    },
});
